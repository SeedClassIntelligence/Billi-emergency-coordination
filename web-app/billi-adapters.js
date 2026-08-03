/* ==========================================================================
   BILLI CAPABILITY ADAPTER LAYER
   --------------------------------------------------------------------------
   Normalizes real device capabilities (browser/WebView APIs today, native
   APIs behind the same event shape later) into the canonical event format:

     { event_type, source_device_id, timestamp, ...payload,
       permission_state, execution_state }

   Route: Native API → Adapter → Billi.pushTelemetry → Gateway shared
   incident → telemetry-processor → all authorized clients.

   Honesty rules: every adapter reports its real permission/availability
   state; nothing is shown as active unless the underlying API delivered.
   ========================================================================== */

(function () {
  if (!localStorage.getItem('billi_device_id')) {
    localStorage.setItem('billi_device_id', 'dev_' + Math.random().toString(36).slice(2, 10));
  }
  const DEVICE_ID = localStorage.getItem('billi_device_id');

  const execState = () => (document.visibilityState === 'visible' ? 'FOREGROUND' : 'BACKGROUND');

  function normalize(event_type, payload, permission_state) {
    return {
      event_type,
      source_device_id: DEVICE_ID,
      timestamp: new Date().toISOString(),
      ...payload,
      permission_state: permission_state || 'AUTHORIZED',
      execution_state: execState()
    };
  }

  function emit(evt) {
    if (window.Billi) Billi.pushTelemetry(evt);
    document.dispatchEvent(new CustomEvent('billi:adapter', { detail: evt }));
    return evt;
  }

  /* ------------------------- LocationAdapter -------------------------
     Two modes per the execution directive:
       ARMED_LOW_POWER      — single fix when arming (no continuous GPS)
       INCIDENT_HIGH_ACCURACY — continuous watch during an active incident */
  const LocationAdapter = {
    status: 'IDLE', mode: null, watchId: null, lastFix: null,
    _handle(pos) {
      const c = pos.coords;
      LocationAdapter.status = 'ACQUIRED';
      LocationAdapter.lastFix = emit(normalize('LOCATION_UPDATED', {
        latitude: c.latitude, longitude: c.longitude,
        accuracy_meters: c.accuracy,
        altitude_meters: c.altitude,
        speed_mps: c.speed, heading_degrees: c.heading,
        mode: LocationAdapter.mode
      }));
    },
    _fail(err) {
      LocationAdapter.status = err.code === 1 ? 'PERMISSION_DENIED' : 'UNAVAILABLE';
      emit(normalize('LOCATION_ERROR', { reason: err.message, code: err.code },
        err.code === 1 ? 'DENIED' : 'AUTHORIZED'));
    },
    armLowPower() {
      if (!navigator.geolocation) { this.status = 'UNSUPPORTED'; return false; }
      this.mode = 'ARMED_LOW_POWER'; this.status = 'ACQUIRING';
      navigator.geolocation.getCurrentPosition(this._handle, this._fail,
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 });
      return true;
    },
    startIncident() {
      if (!navigator.geolocation) { this.status = 'UNSUPPORTED'; return false; }
      this.stop();
      this.mode = 'INCIDENT_HIGH_ACCURACY'; this.status = 'ACQUIRING';
      this.watchId = navigator.geolocation.watchPosition(this._handle, this._fail,
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
      return true;
    },
    stop() {
      if (this.watchId !== null) { navigator.geolocation.clearWatch(this.watchId); this.watchId = null; }
      if (this.status !== 'PERMISSION_DENIED') this.status = 'IDLE';
    }
  };

  /* ------------------------- MotionAdapter -------------------------
     Accelerometer/gyroscope. Classifies HARD_IMPACT, SUDDEN_MOVEMENT,
     MOTIONLESS windows, and emits periodic MOTION_SAMPLE readings.
     One reading never "proves" a fall or crash — classification is
     context for the scenario rules, per the directive. */
  const MotionAdapter = {
    status: 'IDLE', _buf: [], _lastSample: 0, _stillSince: null, _bound: null,
    async start() {
      if (typeof DeviceMotionEvent === 'undefined') { this.status = 'UNSUPPORTED'; return false; }
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const p = await DeviceMotionEvent.requestPermission();
          if (p !== 'granted') { this.status = 'PERMISSION_DENIED'; emit(normalize('MOTION_ERROR', { reason: 'permission denied' }, 'DENIED')); return false; }
        } catch (e) { this.status = 'PERMISSION_DENIED'; return false; }
      }
      this._bound = this._handle.bind(this);
      window.addEventListener('devicemotion', this._bound);
      this.status = 'ACTIVE';
      emit(normalize('MOTION_MONITORING_STARTED', {}));
      return true;
    },
    _handle(e) {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x === null) return;
      const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      const dyn = Math.abs(mag - 9.81);
      const now = Date.now();
      this._buf.push({ t: now, dyn });
      this._buf = this._buf.filter(s => now - s.t < 15000);

      if (dyn > 24) emit(normalize('HARD_IMPACT', { magnitude_ms2: +dyn.toFixed(1) }));
      else if (dyn > 12) emit(normalize('SUDDEN_MOVEMENT', { magnitude_ms2: +dyn.toFixed(1) }));

      const recent = this._buf.filter(s => now - s.t < 5000);
      const avg = recent.reduce((s, x) => s + x.dyn, 0) / (recent.length || 1);
      if (avg < 0.4) {
        if (!this._stillSince) this._stillSince = now;
        else if (now - this._stillSince > 15000) {
          emit(normalize('MOTIONLESS_PERIOD', { seconds: Math.round((now - this._stillSince) / 1000) }));
          this._stillSince = now; // re-arm window
        }
      } else this._stillSince = null;

      if (now - this._lastSample > 5000) {
        this._lastSample = now;
        emit(normalize('MOTION_SAMPLE', { avg_dynamic_ms2: +avg.toFixed(2), samples: recent.length }));
      }
    },
    stop() {
      if (this._bound) window.removeEventListener('devicemotion', this._bound);
      this._bound = null; this.status = 'IDLE';
    }
  };

  /* ------------------------- AudioEvidenceAdapter -------------------------
     INCIDENT_AUDIO_RECORDING only — the evidence action after activation.
     (VOICE_TRIGGER_LISTENING is a separate, not-yet-built path; the two
     are never blurred into one permission, per the directive.) */
  const AudioEvidenceAdapter = {
    status: 'IDLE', recorder: null, stream: null, segment: 0, segments: [],
    async start() {
      if (!navigator.mediaDevices || !window.MediaRecorder) { this.status = 'UNSUPPORTED'; return false; }
      try {
        this.status = 'STARTING';
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.recorder = new MediaRecorder(this.stream);
        this.segment = 0; this.segments = [];
        this.recorder.ondataavailable = (e) => {
          if (!e.data || !e.data.size) return;
          this.segment++;
          this.segments.push({ n: this.segment, bytes: e.data.size, url: URL.createObjectURL(e.data), at: Date.now() });
          emit(normalize('AUDIO_SEGMENT_SEALED', { segment: this.segment, bytes: e.data.size, mime: e.data.type }));
        };
        this.recorder.start(10000); // seal a segment every 10 s
        this.status = 'RECORDING';
        emit(normalize('AUDIO_RECORDING_STARTED', { chunk_seconds: 10 }));
        return true;
      } catch (err) {
        this.status = err.name === 'NotAllowedError' ? 'PERMISSION_DENIED' : 'FAILED';
        emit(normalize('AUDIO_ERROR', { reason: err.message }, err.name === 'NotAllowedError' ? 'DENIED' : 'AUTHORIZED'));
        return false;
      }
    },
    stop() {
      try { if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop(); } catch (e) {}
      try { if (this.stream) this.stream.getTracks().forEach(t => t.stop()); } catch (e) {}
      if (this.status === 'RECORDING') emit(normalize('AUDIO_RECORDING_STOPPED', { segments: this.segment }));
      this.recorder = null; this.stream = null;
      if (this.status !== 'PERMISSION_DENIED') this.status = 'IDLE';
    }
  };

  /* ------------------------- SpeechOutputAdapter -------------------------
     Speaks ONLY confirmed state (QUEUED ≠ DELIVERED — callers must pass
     text derived from confirmed incident state). Honors silent mode. */
  const SpeechOutputAdapter = {
    status: (typeof speechSynthesis !== 'undefined') ? 'READY' : 'UNSUPPORTED',
    lastSpoken: null,
    speak(text, mode) {
      if (mode === 'silent') { this.lastSpoken = { text: '[suppressed — silent mode]', at: Date.now() }; return false; }
      if (typeof speechSynthesis === 'undefined') return false;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0; u.pitch = 1.0;
      speechSynthesis.speak(u);
      this.lastSpoken = { text, at: Date.now() };
      emit(normalize('SPOKEN_OUTPUT', { text, mode: mode || 'reassurance' }));
      return true;
    }
  };

  /* ------------------------- NetworkAdapter ------------------------- */
  const NetworkAdapter = {
    status: navigator.onLine ? 'ONLINE' : 'OFFLINE', started: false,
    start() {
      if (this.started) return true;
      this.started = true;
      window.addEventListener('online', () => { this.status = 'ONLINE'; emit(normalize('NETWORK_CHANGED', { online: true })); });
      window.addEventListener('offline', () => { this.status = 'OFFLINE'; emit(normalize('NETWORK_CHANGED', { online: false })); });
      const conn = navigator.connection;
      if (conn) emit(normalize('NETWORK_STATE', { type: conn.effectiveType, downlink_mbps: conn.downlink }));
      return true;
    }
  };

  window.BilliAdapters = {
    DEVICE_ID,
    Location: LocationAdapter,
    Motion: MotionAdapter,
    AudioEvidence: AudioEvidenceAdapter,
    Speech: SpeechOutputAdapter,
    Network: NetworkAdapter,
    /* Start everything appropriate for an active incident (user gesture required for mic/motion). */
    async startIncidentCapture(contract) {
      const results = { location: LocationAdapter.startIncident(), network: NetworkAdapter.start() };
      results.motion = await MotionAdapter.start();
      results.audio = (contract && contract.audio) ? await AudioEvidenceAdapter.start() : false;
      return results;
    },
    stopAll() { LocationAdapter.stop(); MotionAdapter.stop(); AudioEvidenceAdapter.stop(); }
  };
})();
