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

  /* ------------------------- PhotoEvidenceAdapter -------------------------
     Real (not simulated) periodic photo capture — same getUserMedia pattern
     as AudioEvidence, one video track instead of audio. A single stream is
     opened once and reused for every snapshot (drawn to a canvas, sealed as
     a JPEG blob) rather than re-requesting the camera each interval, which
     would re-prompt and flicker. Like audio, only the sealed metadata
     (bytes, mime, timestamp) is pushed to the shared incident — the actual
     image stays local to this browser tab (object URL), same honest
     local-only-evidence limitation the audio adapter already has. */
  const PhotoEvidenceAdapter = {
    status: 'IDLE', stream: null, video: null, canvas: null, timer: null,
    count: 0, photos: [],
    async start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !document.createElement('canvas').getContext) {
        this.status = 'UNSUPPORTED'; return false;
      }
      try {
        this.status = 'STARTING';
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        this.video = document.createElement('video');
        this.video.muted = true; this.video.playsInline = true; this.video.srcObject = this.stream;
        await this.video.play().catch(() => {});
        await new Promise((resolve) => {
          if (this.video.readyState >= 2) return resolve();
          this.video.onloadeddata = () => resolve();
        });
        this.canvas = document.createElement('canvas');
        this.count = 0; this.photos = [];
        this._capture(); // seal one immediately, then every 15s
        this.timer = setInterval(() => this._capture(), 15000);
        this.status = 'ACTIVE';
        emit(normalize('PHOTO_CAPTURE_STARTED', { interval_seconds: 15 }));
        return true;
      } catch (err) {
        this.status = err.name === 'NotAllowedError' ? 'PERMISSION_DENIED' : 'FAILED';
        emit(normalize('PHOTO_ERROR', { reason: err.message }, err.name === 'NotAllowedError' ? 'DENIED' : 'AUTHORIZED'));
        return false;
      }
    },
    _capture() {
      if (!this.video || !this.canvas) return;
      const vw = this.video.videoWidth, vh = this.video.videoHeight;
      if (!vw || !vh) return; // frame not ready yet — skip this tick, next one will catch it
      /* Downscale to a max 768px edge — evidence thumbnails, not photography,
         and it keeps the payload small for the (optional) Gemini vision call. */
      const scale = Math.min(1, 768 / Math.max(vw, vh));
      const w = Math.round(vw * scale), h = Math.round(vh * scale);
      this.canvas.width = w; this.canvas.height = h;
      const ctx = this.canvas.getContext('2d');
      ctx.drawImage(this.video, 0, 0, w, h);
      const dataUrl = this.canvas.toDataURL('image/jpeg', 0.7);
      this.canvas.toBlob((blob) => {
        if (!blob) return;
        this.count++;
        this.photos.push({ n: this.count, bytes: blob.size, url: URL.createObjectURL(blob), dataUrl, at: Date.now() });
        emit(normalize('PHOTO_SEALED', { n: this.count, bytes: blob.size, mime: blob.type }));
      }, 'image/jpeg', 0.7);
    },
    /* {base64, mimeType} for the most recent sealed photo, or null if none yet —
       used for the on-demand Gemini vision analysis call. */
    getLatestForAnalysis() {
      const last = this.photos[this.photos.length - 1];
      if (!last || !last.dataUrl) return null;
      const m = /^data:([^;]+);base64,(.*)$/.exec(last.dataUrl);
      if (!m) return null;
      return { n: last.n, mimeType: m[1], base64: m[2] };
    },
    stop() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      try { if (this.stream) this.stream.getTracks().forEach(t => t.stop()); } catch (e) {}
      if (this.status === 'ACTIVE') emit(normalize('PHOTO_CAPTURE_STOPPED', { photos: this.count }));
      this.stream = null; this.video = null; this.canvas = null;
      if (this.status !== 'PERMISSION_DENIED') this.status = 'IDLE';
    }
  };

  /* ------------------------- SpeechOutputAdapter -------------------------
     Speaks ONLY confirmed state (QUEUED ≠ DELIVERED — callers must pass
     text derived from confirmed incident state). Honors silent mode. */
  const BCP47 = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', zh: 'zh-CN', ar: 'ar-SA', hi: 'hi-IN', pt: 'pt-BR', vi: 'vi-VN', tl: 'fil-PH' };
  const SpeechOutputAdapter = {
    status: (typeof speechSynthesis !== 'undefined') ? 'READY' : 'UNSUPPORTED',
    lastSpoken: null,
    /* lang: short code ('es','fr',...) — Gemini-translated text needs the
       matching BCP-47 tag or the browser's TTS engine mispronounces it in
       an English voice regardless of the text's actual language. */
    speak(text, mode, lang, stage) {
      if (mode === 'silent') { this.lastSpoken = { text: '[suppressed — silent mode]', at: Date.now() }; return false; }
      if (typeof speechSynthesis === 'undefined') return false;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0; u.pitch = 1.0;
      if (lang && lang !== 'en') u.lang = BCP47[lang] || lang;
      speechSynthesis.speak(u);
      this.lastSpoken = { text, at: Date.now(), lang: lang || 'en' };
      emit(normalize('SPOKEN_OUTPUT', { text, mode: mode || 'reassurance', lang: lang || 'en', stage: stage || null }));
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
    Photo: PhotoEvidenceAdapter,
    Speech: SpeechOutputAdapter,
    Network: NetworkAdapter,
    /* Start everything appropriate for an active incident (user gesture required for mic/motion/camera). */
    async startIncidentCapture(contract) {
      const results = { location: LocationAdapter.startIncident(), network: NetworkAdapter.start() };
      results.motion = await MotionAdapter.start();
      results.audio = (contract && contract.audio) ? await AudioEvidenceAdapter.start() : false;
      results.photo = (contract && contract.video) ? await PhotoEvidenceAdapter.start() : false;
      return results;
    },
    stopAll() { LocationAdapter.stop(); MotionAdapter.stop(); AudioEvidenceAdapter.stop(); PhotoEvidenceAdapter.stop(); }
  };
})();
