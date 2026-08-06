/* ==========================================================================
   BILLI PLATFORM CORE — LOCAL STATE ENGINE (Design-Build Phase)
   --------------------------------------------------------------------------
   Classification of everything in this file: LOCAL INTERACTIVE / SIMULATED.
   No call in this file claims a connected backend action. Backend wiring
   happens after design approval.
   ========================================================================== */

(function () {
  const STORE_KEY = 'billi_platform_v1';

  /* ---------------------------------------------------------------------
     CANONICAL FIXTURE — the Maya Johnson family (single source of truth)
     Used ONLY for demo prefill and evaluator demonstrations. A brand-new
     account starts empty and builds this data through the setup journey.
     --------------------------------------------------------------------- */
  const FIXTURE = {
    entityType: 'Family',
    owner: { name: 'Evelyn Johnson', role: 'Primary Guardian', relationship: 'Mother', phone: '+1 (555) 987-6543' },
    protectedPerson: { name: 'Maya Johnson', age: 11, facility: 'Pine Middle School' },
    medical: {
      conditions: 'Mild asthma',
      allergies: 'Peanuts',
      medications: 'Albuterol rescue inhaler (in backpack)',
      equipment: 'Albuterol inhaler',
      instructions: 'Keep calm. Locate rescue inhaler in backpack. Call Mother immediately, then Campus Safety.',
      physician: 'Dr. Patel — Bayview Pediatrics, +1 (555) 210-8890'
    },
    contacts: [
      { id: 'c_mom',     name: 'Evelyn Johnson', role: 'Primary Guardian', relationship: 'Mother',  priority: 1, phone: '+1 (555) 987-6543', channels: ['Push', 'SMS', 'Call'], canAcknowledge: true, canResolve: true,  medicalAccess: true,  evidenceAccess: true,  locationAccess: true,  duressVisibility: true,  availability: 'Available' },
      { id: 'c_dad',     name: 'Marcus Johnson', role: 'Secondary Guardian', relationship: 'Father', priority: 2, phone: '+1 (555) 876-5432', channels: ['SMS', 'Call'], canAcknowledge: true, canResolve: true,  medicalAccess: true,  evidenceAccess: true,  locationAccess: true,  duressVisibility: true,  availability: 'Available' },
      { id: 'c_officer', name: 'Officer Davis',  role: 'Campus Safety', relationship: 'Campus Officer · Badge #402', priority: 3, phone: '+1 (555) 432-1098', channels: ['SMS'], canAcknowledge: true, canResolve: false, medicalAccess: true,  evidenceAccess: false, locationAccess: true,  duressVisibility: true,  availability: 'On duty 7a–4p' },
      { id: 'c_grandma', name: 'Grandma Clara',  role: 'Extended Circle', relationship: 'Maternal Grandmother', priority: 4, phone: '+1 (555) 234-5678', channels: ['Call'], canAcknowledge: false, canResolve: false, medicalAccess: false, evidenceAccess: false, locationAccess: false, duressVisibility: false, availability: 'Fallback only' }
    ],
    contract: {
      gps: true, audio: true, video: false, notifyNetwork: true,
      silentActivation: true, spokenMode: 'reassurance', spokenLanguage: 'en', deterrent: false,
      shareMedical: true, escalation: true, nearbyRelay: true,
      bleScanning: true, safeZoneMonitoring: true, wearables: true,
      evidenceRetention: true, aiProcessing: true, responderAccess: true
    },
    voice: { state: 'Enrolled', safeWords: ['Blue Folder', 'Billi Now'] },
    pins: { normal: '1234', duress: '9999' },
    zones: [
      { id: 'z_school', name: 'Pine Middle School', address: '1155 Pine St, San Francisco, CA', lat: 37.7753, lng: -122.4201, radius: 100, active: true },
      { id: 'z_home',   name: 'Home', address: '1254 Pine St, San Francisco, CA', lat: 37.7749, lng: -122.4194, radius: 150, active: true },
      { id: 'z_grandma', name: "Grandma Clara's House", address: '2210 Larkin St, San Francisco, CA', lat: 37.7792, lng: -122.4208, radius: 120, active: true }
    ],
    devices: [
      { id: 'd_phone',   name: 'iPhone 15 Pro',            type: 'Phone (Primary Hub)', state: 'SIMULATED', battery: 82, capabilities: ['GPS', 'Cellular', 'Wi-Fi', 'BLE', 'Mic', 'Camera', 'Accelerometer', 'Voice input'], triggers: ['Hold-to-SOS', 'Accessibility shortcut', 'Safe word'], lastSeen: 'now' },
      { id: 'd_watch',   name: 'Apple Watch Ultra 2',      type: 'Watch',   state: 'SIMULATED', battery: 64, capabilities: ['Fall detection', 'Double-tap', 'Heart rate', 'Secondary GPS', 'BLE'], triggers: ['Fall detection', 'Double-tap gesture'], lastSeen: 'now' },
      { id: 'd_garmin',  name: 'Garmin Fenix 7 Pro',       type: 'Watch',   state: 'REGISTERED', battery: 78, capabilities: ['Button trigger', 'HR spike', 'Crash deceleration', 'BLE'], triggers: ['Button trigger'], lastSeen: '12 min ago' },
      { id: 'd_ring',    name: 'Samsung Galaxy Ring',      type: 'Ring',    state: 'STANDBY', battery: 47, capabilities: ['Pinch gesture', 'Heart rate', 'BLE proximity'], triggers: ['Double-pinch (discreet)'], lastSeen: '2 min ago' },
      { id: 'd_pixelw',  name: 'Pixel Watch 3 LTE',        type: 'Watch',   state: 'OFFLINE', battery: 18, capabilities: ['High-G deceleration', 'LTE backup', 'Secondary location'], triggers: ['Wearable gesture'], lastSeen: '3 hr ago' },
      { id: 'd_glasses', name: 'Ray-Ban Meta Glasses',     type: 'Glasses', state: 'SIMULATED', battery: 55, capabilities: ['Voice phrase listener', 'Ambient mic', 'Photo capture'], triggers: ['Spoken safe word'], lastSeen: '4 min ago' },
      { id: 'd_phones',  name: 'Sennheiser Accentum',      type: 'Headphones', state: 'STANDBY', battery: 71, capabilities: ['Voice wake-up', 'Noise suppression', 'Acoustic trigger'], triggers: ['Acoustic distress'], lastSeen: '25 min ago' },
      { id: 'd_tag',     name: 'Billi Smart Tag',          type: 'Smart Tag', state: 'SIMULATED', battery: 91, capabilities: ['Tactile panic button', 'BLE beacon', 'Crash accelerometer', 'Relay'], triggers: ['Button squeeze'], lastSeen: 'now' },
      { id: 'd_vehicle', name: 'Family Vehicle Unit',      type: 'Vehicle', state: 'FUTURE ADAPTER', battery: null, capabilities: ['High-G crash detection', 'Airbag signal', 'Seat occupancy'], triggers: ['Crash impact'], lastSeen: '—' }
    ]
  };

  /* Simulated movement path (ported from the legacy incident engine). */
  const SIM_PATH = [
    { lat: 37.7749, lng: -122.4194, speed: 0,  label: 'East Entrance of Pine Middle School' },
    { lat: 37.7753, lng: -122.4201, speed: 8,  label: 'Moving west on Pine Street' },
    { lat: 37.7758, lng: -122.4212, speed: 18, label: 'Speed increased · Pine St & Polk St' },
    { lat: 37.7765, lng: -122.4218, speed: 22, label: 'Headed north on Van Ness Ave' },
    { lat: 37.7774, lng: -122.4221, speed: 25, label: 'Headed north near Civic Center' },
    { lat: 37.7785, lng: -122.4215, speed: 12, label: 'Slowing near Golden Gate Avenue' },
    { lat: 37.7792, lng: -122.4208, speed: 5,  label: 'Entering parking facility off Larkin' }
  ];

  const SIM_TRANSCRIPTS = [
    'Environment quiet. Ambient monitoring active.',
    'Maya: [Heavy breathing] Wait... why are you following me?',
    'Unidentified voice: Hey, stop! Get over here!',
    'Maya: No! Let me go! [Screaming] Help me!',
    '[Sounds of physical scuffle, keys clattering]',
    '[Door slam, engine acceleration, road noise]',
    '[Low murmuring, continuous vehicle rumble]'
  ];

  /* Incident lifecycle (canonical order). */
  const LIFECYCLE = [
    'EMERGENCY_TRIGGERED',
    'TRUSTED_NETWORK_NOTIFIED',
    'GUARDIAN_ACKNOWLEDGED',
    'HELP_RESPONDING',
    'INCIDENT_STABILIZED',
    'RESOLVED'
  ];

  const TRIGGER_METHODS = {
    safe_word:      { device: 'Ray-Ban Meta Glasses', method: 'Spoken safe word "Blue Folder"' },
    sos_hold:       { device: 'iPhone 15 Pro', method: 'Hold-to-activate SOS' },
    fall:           { device: 'Apple Watch Ultra 2', method: 'Hard fall detection' },
    crash:          { device: 'Family Vehicle Unit', method: '8.5g crash impact (simulated adapter)' },
    geofence:       { device: 'iPhone 15 Pro (Geofence Engine)', method: 'Safe-zone exit breach' },
    tag:            { device: 'Billi Smart Tag', method: 'Tactile button squeeze' },
    accessibility:  { device: 'iPhone 15 Pro', method: 'Accessibility shortcut' },
    wearable:       { device: 'Apple Watch Ultra 2', method: 'Wearable gesture (double tap)' },
    acoustic:       { device: 'Sennheiser Accentum', method: 'Acoustic distress event (>80 dB spike)' }
  };

  /* Sensor-inferred triggers can false-positive (a bag drop reads as a fall,
     bag rustling reads as acoustic distress, a forgotten geofence edit reads
     as a breach). Deliberate triggers (hold-to-SOS, spoken safe word, tactile
     button, accessibility shortcut, wearable gesture) require a volitional
     human action and fire with zero delay — this set is intentionally only
     the four ambiguous, sensor-only signals. */
  const PASSIVE_TRIGGERS = new Set(['fall', 'crash', 'geofence', 'acoustic']);
  const CONFIRM_WINDOW_MS = 10000;

  /* ---------------------------------------------------------------------
     NINE-SCENARIO OUTCOME PACKS (demonstration blueprint)
     Each pack answers: how activated, what Billi did immediately, what it
     kept gathering, how the network coordinated, and the safety outcome.
     Personas other than the Maya fixture exist ONLY inside demonstrations.
     --------------------------------------------------------------------- */
  const SCENARIO_PACKS = {
    1: {
      name: 'Scenario 01 — Protect a Child', trigger: 'safe_word',
      preEvents: [{ dt: 0, actor: 'Ray-Ban Meta Glasses', label: 'Phrase matched: "Blue Folder" (enrolled voiceprint verified)' }]
    },
    2: {
      name: 'Scenario 02 — Help After a Fall', trigger: 'fall',
      persona: { name: 'Robert Ellis', age: 78, facility: 'Lives alone — 48 Cedar Ave' },
      medical: { conditions: 'Hypertension · prior fall (2025)', allergies: 'Penicillin', medications: 'Lisinopril 10 mg daily', equipment: 'Medical alert wristband', physician: 'Dr. Chen — Cedar Medical', instructions: "Spare key with neighbor Tom (46 Cedar Ave). Preferred hospital: St. Mary's. Check for head injury after falls." },
      contacts: [
        { id: 'c_susan', name: 'Susan Ellis', role: 'Primary Guardian', relationship: 'Daughter', priority: 1, phone: '+1 (555) 301-4478', channels: ['Push', 'SMS', 'Call'], canAcknowledge: true, canResolve: true, medicalAccess: true, evidenceAccess: true, locationAccess: true, duressVisibility: true, availability: 'Available' },
        { id: 'c_tom', name: 'Tom Alvarez', role: 'Caregiver', relationship: 'Neighbor (46 Cedar Ave)', priority: 2, phone: '+1 (555) 302-9910', channels: ['Call'], canAcknowledge: true, canResolve: false, medicalAccess: false, evidenceAccess: false, locationAccess: true, duressVisibility: false, availability: 'Usually home' },
        { id: 'c_nurse', name: 'CareLine Nurse Desk', role: 'Caregiver', relationship: '24/7 nurse triage line', priority: 3, phone: '+1 (555) 700-2200', channels: ['Call'], canAcknowledge: true, canResolve: false, medicalAccess: true, evidenceAccess: false, locationAccess: true, duressVisibility: false, availability: '24/7' }
      ],
      path: [{ lat: 37.7701, lng: -122.4310, speed: 0, label: 'Home — living room (inside Home safe zone)' }],
      transcripts: [
        'Fall impact recorded. Monitoring for response…',
        'Prompt played: "Robert, Billi detected a fall. Say I\'m okay or enter your PIN."',
        'No voice response. Faint breathing sounds detected.',
        'No movement detected since impact.'
      ],
      preEvents: [
        { dt: -15, actor: 'Apple Watch Ultra 2', label: 'HARD FALL detected — impact 2.4g, body motion stopped' },
        { dt: -15, actor: 'Billi', label: '15-second unresponsive countdown started on watch' },
        { dt: 0, actor: 'Billi', label: 'No response within countdown — emergency activation' }
      ]
    },
    3: {
      name: 'Scenario 03 — Vehicle Crash', trigger: 'crash',
      persona: { name: 'David Reyes', age: 41, facility: 'Vehicle — Interstate 80 East' },
      medical: { conditions: 'Type 1 diabetes', allergies: 'None documented', medications: 'Insulin pump (abdomen)', equipment: 'Blood glucose kit in glovebox', physician: 'Dr. Okafor — Bayside Endocrinology', instructions: 'Check insulin pump after impact. Glucose kit in glovebox. Notify spouse Anna immediately.' },
      contacts: [
        { id: 'c_anna', name: 'Anna Reyes', role: 'Primary Guardian', relationship: 'Spouse', priority: 1, phone: '+1 (555) 410-8821', channels: ['Push', 'SMS', 'Call'], canAcknowledge: true, canResolve: true, medicalAccess: true, evidenceAccess: true, locationAccess: true, duressVisibility: true, availability: 'Available' },
        { id: 'c_mike', name: 'Michael Reyes', role: 'Secondary Guardian', relationship: 'Brother', priority: 2, phone: '+1 (555) 411-3305', channels: ['SMS', 'Call'], canAcknowledge: true, canResolve: false, medicalAccess: true, evidenceAccess: false, locationAccess: true, duressVisibility: true, availability: 'Available' },
        { id: 'c_road', name: 'Roadside Response Liaison', role: 'Campus Safety', relationship: 'Partner responder desk', priority: 3, phone: '+1 (555) 800-4141', channels: ['SMS'], canAcknowledge: true, canResolve: false, medicalAccess: true, evidenceAccess: false, locationAccess: true, duressVisibility: false, availability: '24/7' }
      ],
      path: [{ lat: 38.0146, lng: -122.1341, speed: 0, label: 'Vehicle stopped — I-80 E shoulder near Exit 14' }],
      transcripts: [
        'Vehicle alarm and airbag deployment sounds recorded.',
        'No voice response from driver seat.',
        'Traffic noise. Second voice outside: "Hey — are you okay in there?"'
      ],
      preEvents: [
        { dt: -2, actor: 'Vehicle Unit', label: 'HIGH_G_IMPACT — 8.5g deceleration recorded' },
        { dt: -2, actor: 'Vehicle Unit', label: 'AIRBAG_DEPLOYED · DRIVER_SEAT_OCCUPIED' },
        { dt: -1, actor: 'Vehicle Unit', label: 'VEHICLE_STOPPED — sudden deceleration 47 → 0 mph' },
        { dt: 0, actor: 'Billi', label: 'Automatic emergency activation — no manual phone interaction required' }
      ]
    },
    4: {
      name: 'Scenario 04 — Medical Emergency', trigger: 'acoustic',
      persona: { name: 'Lisa Tran', age: 29, facility: 'Office — 400 Mission St, 4th floor' },
      medical: { conditions: 'Severe asthma', allergies: 'Aspirin', medications: 'Rescue inhaler — handbag, front pocket', equipment: 'Rescue inhaler', physician: 'Dr. Novak — Mission Pulmonology', instructions: 'Help her sit upright. Inhaler in handbag front pocket — 4 puffs. Call emergency services if no improvement within 5 minutes.' },
      contacts: [
        { id: 'c_grace', name: 'Grace Tran', role: 'Primary Guardian', relationship: 'Sister', priority: 1, phone: '+1 (555) 512-7734', channels: ['Push', 'SMS', 'Call'], canAcknowledge: true, canResolve: true, medicalAccess: true, evidenceAccess: true, locationAccess: true, duressVisibility: true, availability: 'Available' },
        { id: 'c_ben', name: 'Ben Ortiz', role: 'Secondary Guardian', relationship: 'Partner', priority: 2, phone: '+1 (555) 513-2280', channels: ['SMS', 'Call'], canAcknowledge: true, canResolve: true, medicalAccess: true, evidenceAccess: false, locationAccess: true, duressVisibility: true, availability: 'Available' },
        { id: 'c_aid', name: 'Office First-Aid Desk', role: 'Caregiver', relationship: 'Building floor 1 — trained first aider', priority: 3, phone: '+1 (555) 900-1000', channels: ['Call'], canAcknowledge: true, canResolve: false, medicalAccess: true, evidenceAccess: false, locationAccess: true, duressVisibility: false, availability: 'Business hours' }
      ],
      path: [{ lat: 37.7897, lng: -122.3972, speed: 0, label: 'Office 4th floor — stationary' }],
      transcripts: [
        'Acoustic spike >80 dB — labored breathing pattern detected.',
        'Wheezing and fragmented speech: "…can\'t… breathe…"',
        'Second person present: "Where is your inhaler?"'
      ],
      preEvents: [{ dt: -1, actor: 'Sennheiser Accentum', label: 'Acoustic distress pattern matched — breathing distress indicators' }]
    },
    5: {
      name: 'Scenario 05 — Campus Emergency (Silent)', trigger: 'tag',
      persona: { name: 'Jasmine Cole', age: 20, facility: 'Riverside University — North Quad' },
      medical: { conditions: 'None documented', allergies: 'None documented', medications: '—', equipment: '—', physician: 'Student Health Center', instructions: 'SILENT RESPONSE REQUESTED — do not call her device openly. Approach discreetly.' },
      contacts: [
        { id: 'c_denise', name: 'Denise Cole', role: 'Primary Guardian', relationship: 'Mother', priority: 1, phone: '+1 (555) 620-8812', channels: ['Push', 'SMS'], canAcknowledge: true, canResolve: true, medicalAccess: true, evidenceAccess: true, locationAccess: true, duressVisibility: true, availability: 'Available' },
        { id: 'c_davis5', name: 'Officer Davis', role: 'Campus Safety', relationship: 'Campus Officer · Badge #402', priority: 2, phone: '+1 (555) 432-1098', channels: ['SMS'], canAcknowledge: true, canResolve: false, medicalAccess: true, evidenceAccess: false, locationAccess: true, duressVisibility: true, availability: 'On duty' },
        { id: 'c_admin', name: 'Campus Admin Desk', role: 'Extended Circle', relationship: 'University administration', priority: 3, phone: '+1 (555) 621-0000', channels: ['SMS'], canAcknowledge: false, canResolve: false, medicalAccess: false, evidenceAccess: false, locationAccess: false, duressVisibility: false, availability: 'Business hours' }
      ],
      path: [
        { lat: 37.8044, lng: -122.2708, speed: 3, label: 'North Quad — walking pace' },
        { lat: 37.8049, lng: -122.2714, speed: 4, label: 'Passing library — pace increased' },
        { lat: 37.8055, lng: -122.2719, speed: 3, label: 'Near science hall — south entrance' }
      ],
      transcripts: [
        'Silent activation — no outward announcement made.',
        'Two voices detected, one raised. Footsteps closing.',
        'Door sound. Ambient noise level increased.'
      ],
      preEvents: [{ dt: 0, actor: 'Billi Smart Tag', label: 'SILENT activation — device shows neutral screen, no spoken output, haptic-only confirmation' }]
    },
    6: {
      name: 'Scenario 06 — Coercive Duress Defense', trigger: 'safe_word',
      effects: { duressAfter: 12 },
      preEvents: [{ dt: 0, actor: 'Ray-Ban Meta Glasses', label: 'Phrase matched: "Blue Folder" — aggressor unaware activation occurred' }]
    },
    7: {
      name: 'Scenario 07 — Signal Loss Failover', trigger: 'safe_word',
      effects: { degradeAfter: 15, degradeMode: 'cellLost' },
      preEvents: [{ dt: 0, actor: 'Billi', label: 'Active incident will enter a cellular dead zone (tunnel) — watch the communication path' }]
    },
    8: {
      name: 'Scenario 08 — Phone Power-Off Fallback', trigger: 'tag',
      effects: { degradeAfter: 15, degradeMode: 'phoneOff' },
      preEvents: [{ dt: 0, actor: 'Billi', label: 'Primary phone will go offline mid-incident — fallback devices take over' }]
    },
    9: {
      name: 'Scenario 09 — 45s Progressive Escalation', trigger: 'sos_hold',
      preEvents: [{ dt: 0, actor: 'Billi', label: 'Demonstration: do NOT acknowledge — watch the full escalation ladder fire at T-30 / T-15 / T-0' }]
    }
  };

  /* --------------------------- STORE --------------------------- */
  function blankState() {
    return {
      session: { authed: false },
      setup: { step: 1, complete: false },
      entityType: null,
      owner: null,
      protectedPerson: null,
      medical: null,
      contacts: [],
      contract: null,
      voice: { state: 'Not enrolled', safeWords: [] },
      pins: { normal: '', duress: '' },
      zones: [],
      devices: [],
      armed: false,
      incidents: [],
      activeIncidentId: null,
      audit: [{ t: Date.now(), actor: 'System', action: 'ACCOUNT_CREATED', details: 'New Billi account initialized. Setup journey started.' }]
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* corrupted store falls back to blank */ }
    return blankState();
  }

  function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  /* Evaluator demos (and viewing someone else's incident as a guardian)
     must never permanently clobber a real account. Before either overwrites
     `state`, the caller's real account — if one exists — is preserved here
     so "Log In" always returns to it, never to leftover borrowed data. */
  const BACKUP_KEY = 'billi_platform_v1_realbackup';
  function backupRealAccountIfNeeded() {
    if (!state.isDemo && !state.isViewingOther && state.setup && state.setup.complete) {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(state));
    }
  }
  function restoreRealAccount() {
    try {
      const raw = localStorage.getItem(BACKUP_KEY);
      if (raw) { state = JSON.parse(raw); save(); return true; }
    } catch (e) { /* corrupted backup — fall through to blank */ }
    state = blankState();
    save();
    return false;
  }

  function audit(actor, action, details) {
    state.audit.unshift({ t: Date.now(), actor, action, details });
    if (state.audit.length > 200) state.audit.pop();
    save();
  }

  /* --------------------------- HELPERS --------------------------- */
  const uid = (p) => `${p}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
  const initials = (n) => (n || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const fmtClock = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtAgo = (ts) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 5) return 'just now';
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    return `${Math.floor(s / 3600)} hr ago`;
  };

  /* Toast notifications (replaces blocking alert() calls). */
  function toast(msg, kind) {
    let holder = document.getElementById('billi-toasts');
    if (!holder) {
      holder = document.createElement('div');
      holder.id = 'billi-toasts';
      document.body.appendChild(holder);
    }
    const el = document.createElement('div');
    el.className = `billi-toast ${kind || ''}`;
    el.innerText = msg;
    holder.appendChild(el);
    setTimeout(() => el.classList.add('show'), 20);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 350); }, 3600);
  }

  /* --------------------------- SETUP JOURNEY --------------------------- */
  function applyFixturePrefill() {
    state.entityType = FIXTURE.entityType;
    state.owner = { ...FIXTURE.owner };
    state.protectedPerson = { ...FIXTURE.protectedPerson };
    state.medical = { ...FIXTURE.medical };
    state.contacts = FIXTURE.contacts.map(c => ({ ...c }));
    state.contract = { ...FIXTURE.contract };
    state.voice = { state: 'Enrolled', safeWords: [...FIXTURE.voice.safeWords] };
    state.pins = { ...FIXTURE.pins };
    state.zones = FIXTURE.zones.map(z => ({ ...z }));
    state.devices = FIXTURE.devices.map(d => ({ ...d }));
    save();
  }

  /* required: true blocks activation — the bare minimum for Billi to
     function at all. required: false is presented clearly during onboarding
     and is always completable later from Settings/Network/Devices, but
     never locks someone out of arming basic protection over it. Real users
     testing this flagged that safe words / voice enrollment felt mandatory
     when they shouldn't be — a family should be able to arm GPS + Trusted
     Network today and finish the rest when they have five quiet minutes. */
  function readiness() {
    return [
      { label: 'Protected person created',        ok: !!(state.protectedPerson && state.protectedPerson.name), required: true },
      { label: 'Trusted Network established',     ok: state.contacts.length >= 1, required: true },
      { label: 'Safety Contract authorized',      ok: !!state.contract, required: true },
      { label: 'Emergency permissions reviewed',  ok: !!(state.contract && state.contract.gps && state.contract.notifyNetwork), required: true },
      { label: 'Medical dossier complete',        ok: !!(state.medical && state.medical.conditions !== undefined && state.medical.instructions), required: false },
      { label: 'Voice trigger enrolled',          ok: state.voice.state === 'Enrolled', required: false },
      { label: 'Duress protection active',        ok: !!(state.pins.duress && state.pins.duress.length >= 4 && state.pins.duress !== state.pins.normal), required: false },
      { label: 'Safe zones configured',           ok: state.zones.length >= 1, required: false },
      { label: 'Devices registered',              ok: state.devices.length >= 1, required: false }
    ];
  }

  function activatePlatform() {
    state.setup.complete = true;
    state.armed = true;
    audit(state.owner ? state.owner.name : 'Owner', 'PLATFORM_ACTIVATED', `Safety ecosystem armed for ${state.protectedPerson ? state.protectedPerson.name : 'protected person'}. All setup decisions recorded in the Safety Contract.`);
  }

  /* --------------------------- BACKEND LINK (CONNECTED layer) ------------
     The web-app talks ONLY to the gateway (:8080). Every call is optional,
     non-blocking, and time-boxed: if the backend is down the platform keeps
     running in LOCAL/SIMULATED mode and the UI says so honestly.
     ----------------------------------------------------------------------- */
  /* Over HTTPS the page is served by tools/https-server.js, which proxies
     /api/* to the gateway on the same origin (secure context for phones,
     no mixed content). Over plain HTTP we talk to the gateway directly. */
  const GATEWAY = (location.protocol === 'https:') ? '' : 'http://localhost:8080';
  const link = { connected: false, count: 0, total: 13, checkedAt: 0 };

  async function gfetch(path, method, body, timeoutMs) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs || 1800);
    try {
      const opts = { method: method || 'GET', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal };
      if (body) opts.body = JSON.stringify(body);
      const resp = await fetch(`${GATEWAY}${path}`, opts);
      clearTimeout(t);
      if (resp.ok) return await resp.json();
    } catch (e) { clearTimeout(t); }
    return null;
  }

  async function probeBackend() {
    const h = await gfetch('/api/v1/health/all', 'GET', null, 2500);
    const was = link.connected;
    if (h) { link.connected = true; link.count = h.connectedCount; link.total = h.total; }
    else { link.connected = false; link.count = 0; }
    link.checkedAt = Date.now();
    if (was !== link.connected) {
      const nav = document.getElementById('billi-nav');
      if (nav && nav.dataset.current) renderNav(nav.dataset.current);
    }
    return link;
  }

  /* Mirror a UI action onto the backend incident timeline (fire-and-forget). */
  function mirrorTimeline(inc, eventType, source, summary) {
    if (!link.connected) return;
    gfetch('/api/v1/timeline', 'POST', {
      incidentId: (inc.backend && inc.backend.incidentId) || inc.id,
      eventType, source, summary
    });
  }

  /* Real emergency activation through the gateway vertical slice. This chain
     includes a live Gemini call (context-engine) bounded server-side at 10s,
     so the client budget needs real headroom above that — a short timeout
     here would falsely report LOCAL MODE while the backend was still
     genuinely working. */
  async function activateRemote(inc) {
    const p = state.protectedPerson || FIXTURE.protectedPerson;
    const res = await gfetch('/api/v1/incidents', 'POST', {
      protected_user_id: state.userIdRemote || 'usr_maya_johnson_01',
      activation_source: inc.triggerKey.toUpperCase(),
      location: { latitude: SIM_PATH[0].lat, longitude: SIM_PATH[0].lng, accuracy_meters: 6 },
      device_id: inc.triggerDevice,
      sensor_data: { trigger_method: inc.triggerMethod, protected_name: p.name }
    }, 15000);
    if (res && res.incident_id) {
      inc.backend = {
        incidentId: res.incident_id, packetId: res.packet_id,
        severity: res.severity, connectedAt: Date.now()
      };
      audit('Gateway', 'BACKEND_CONNECTED', `CONNECTED: gateway accepted activation — incident ${res.incident_id}, packet ${res.packet_id}, severity ${res.severity}.`);
      save();
    }
    return res;
  }

  /* Fetch the real CAD serialization from the emergency-packet service. */
  async function fetchRemoteCad(inc) {
    if (!inc || !inc.backend || !inc.backend.packetId) return null;
    return await gfetch(`/api/v1/packet/${inc.backend.packetId}/cad`, 'GET', null, 3000);
  }

  /* --------------------------- SHARED INCIDENT STATE ---------------------
     One canonical incident lives in the gateway. Every role surface reads
     and mutates that record; SSE pushes changes to all sessions. The local
     store remains the offline fallback — remote wins while connected.
     ----------------------------------------------------------------------- */
  const actionKey = (a) => `${a.t}|${a.type}|${a.actor}`;
  let sse = null;
  let namedAlert = null;

  function sharedSnapshot(inc) {
    return {
      ...inc,
      context: {
        protectedPerson: state.protectedPerson,
        medical: state.medical,
        contacts: state.contacts,
        owner: state.owner,
        spokenMode: (state.contract || {}).spokenMode || 'reassurance'
      }
    };
  }

  async function sharedCreate(inc) {
    const res = await gfetch('/api/v1/shared/incidents', 'POST', sharedSnapshot(inc), 3000);
    if (res) { inc.shared = true; save(); }
    return res;
  }

  function mergeShared(remote, opts) {
    if (!remote || !remote.id) return;
    opts = opts || {};
    /* Adopting another account's identity/context must be intentional
       (Billi.joinLive) or genuinely this account's own incident — never a
       side effect of merely having an SSE connection open. Without this
       guard, any active incident anywhere on the gateway would silently
       overwrite whichever account happens to load a page next. */
    const isOwnIncident = state.incidents.some(i => i.id === remote.id) || state.activeIncidentId === remote.id;
    if (remote.context && (opts.adoptContext || isOwnIncident)) {
      if (remote.context.protectedPerson) state.protectedPerson = remote.context.protectedPerson;
      if (remote.context.medical) state.medical = remote.context.medical;
      if (remote.context.contacts && remote.context.contacts.length) state.contacts = remote.context.contacts;
      if (remote.context.owner) state.owner = remote.context.owner;
    }
    if (!opts.adoptContext && !isOwnIncident) return; // not this account's incident — ignore entirely
    let inc = state.incidents.find(i => i.id === remote.id);
    if (!inc) {
      inc = { ...remote };
      state.incidents.unshift(inc);
    } else {
      const localActions = inc.actions || [];
      const seen = new Set((remote.actions || []).map(actionKey));
      Object.assign(inc, remote);
      inc.actions = [...(remote.actions || [])];
      for (const a of localActions) if (!seen.has(actionKey(a))) inc.actions.push(a);
      inc.actions.sort((a, b) => a.t - b.t);
    }
    state.activeIncidentId = inc.resolved ? null : inc.id;
    save();
    document.dispatchEvent(new CustomEvent('billi:shared', { detail: inc }));
  }

  function subscribeShared() {
    if (sse || typeof EventSource === 'undefined') return;
    try {
      sse = new EventSource(`${GATEWAY}/api/v1/shared/stream`);
      sse.addEventListener('incident', (e) => {
        try { mergeShared(JSON.parse(e.data)); } catch (err) { /* malformed frame */ }
      });
      sse.onerror = () => { try { sse.close(); } catch (e) {} sse = null; setTimeout(subscribeShared, 5000); };
    } catch (e) { sse = null; }
  }

  async function adoptActiveShared(opts) {
    const r = await gfetch('/api/v1/shared/incidents/active', 'GET', null, 2500);
    if (r && r.incident) mergeShared(r.incident, opts);
    return r ? r.incident : null;
  }

  /* There is no real push-notification channel (no APNS/FCM) — this is the
     mitigation: any session belonging to a Trusted Network member passively
     polls for a live incident naming them as a contact, without adopting
     its identity, so a "join" banner can surface without the member already
     knowing to click Join as Guardian. */
  async function checkNamedAlerts() {
    if (state.isDemo || state.isViewingOther) { namedAlert = null; return null; }
    const r = await gfetch('/api/v1/shared/incidents/active', 'GET', null, 2500);
    const remote = r ? r.incident : null;
    const myPhone = state.owner && state.owner.phone;
    const isOwnIncident = remote && state.incidents.some(i => i.id === remote.id);
    if (!remote || remote.resolved || !myPhone || isOwnIncident) { namedAlert = null; return null; }
    const contacts = (remote.context && remote.context.contacts) || [];
    const match = contacts.find(c => c.phone === myPhone);
    const person = (remote.context && remote.context.protectedPerson) || {};
    namedAlert = match ? { id: remote.id, name: person.name || 'A protected person', contactName: match.name } : null;
    return namedAlert;
  }

  /* Backs up this account, borrows the remote incident's context read-only
     (isViewingOther, not isDemo) so this session can see and act as the
     Trusted Network member it actually is, then opens the command center. */
  async function viewNamedAlert() {
    if (!namedAlert) return false;
    backupRealAccountIfNeeded();
    state.isViewingOther = true;
    save();
    await adoptActiveShared({ adoptContext: true });
    namedAlert = null;
    location.href = 'incident.html';
    return true;
  }

  function postSharedEvent(inc, action) {
    if (!inc || !inc.shared || !link.connected) return;
    gfetch(`/api/v1/shared/incidents/${inc.id}/events`, 'POST', action);
  }

  function patchShared(inc, patch) {
    if (!inc || !inc.shared || !link.connected) return;
    gfetch(`/api/v1/shared/incidents/${inc.id}`, 'PATCH', patch);
  }

  /* Capability adapters push normalized events here. */
  function pushTelemetry(evt) {
    const inc = getActiveIncident();
    if (!inc) return false;
    inc.telemetry = inc.telemetry || [];
    inc.telemetry.push(evt);
    if (inc.telemetry.length > 300) inc.telemetry.splice(0, inc.telemetry.length - 300);
    if (evt.event_type === 'LOCATION_UPDATED') inc.realLocation = evt;
    save();
    if (inc.shared && link.connected) gfetch(`/api/v1/shared/incidents/${inc.id}/telemetry`, 'POST', evt);
    return true;
  }

  /* --------------------------- INCIDENT ENGINE ---------------------------
     Derived-timeline model: milestones are computed from elapsed time since
     trigger, so the simulation survives page navigation and refresh. Manual
     guardian/responder actions are recorded and override derived state.
     ----------------------------------------------------------------------- */
  function triggerIncident(triggerKey, opts) {
    opts = opts || {};
    if (getActiveIncident()) return getActiveIncident();
    const trig = TRIGGER_METHODS[triggerKey] || TRIGGER_METHODS.sos_hold;
    /* Demos always fire live instantly — evaluators should never sit through
       a confirmation window. Real passive triggers get one. */
    const needsConfirm = PASSIVE_TRIGGERS.has(triggerKey) && !state.isDemo && !opts.scenario;
    const now = Date.now();
    const inc = {
      id: `BIL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      correlationId: uid('cor'),
      triggeredAt: now,
      confirmedAt: needsConfirm ? null : now,
      confirmWindowMs: CONFIRM_WINDOW_MS,
      triggerKey,
      triggerDevice: trig.device,
      triggerMethod: trig.method,
      scenario: opts.scenario || null,
      duress: false,
      duressAt: null,
      actions: [],           // {t, actor, type, details}
      resolved: false,
      resolvedAt: null,
      resolution: null
    };
    state.incidents.unshift(inc);
    state.activeIncidentId = inc.id;
    if (needsConfirm) {
      audit(state.protectedPerson ? state.protectedPerson.name : 'Protected person', 'EMERGENCY_TRIGGERED', `${trig.method} on ${trig.device} — sensor-inferred, confirming before the Trusted Network is alerted. Incident ${inc.id} opened.`);
    } else {
      audit(state.protectedPerson ? state.protectedPerson.name : 'Protected person', 'EMERGENCY_TRIGGERED', `${trig.method} on ${trig.device}. Incident ${inc.id} opened.`);
    }
    save();
    /* CONNECTED path: shared incident + gateway vertical slice (non-blocking).
       Deferred entirely while a passive trigger awaits confirmation — nobody
       on the Trusted Network is told anything until it's either confirmed by
       the protected person or the window silently elapses (fail-safe). */
    if (!needsConfirm) {
      sharedCreate(inc);
      activateRemote(inc).then(r => { if (r && inc.shared) patchShared(inc, { backend: inc.backend }); });
    }
    return inc;
  }

  /* Protected person confirms a pending passive-trigger incident is real —
     proceeds exactly like an immediate trigger from this point on. */
  function confirmEmergency() {
    const inc = getActiveIncident();
    if (!inc || inc.confirmedAt) return inc;
    inc.confirmedAt = Date.now();
    const a = { t: inc.confirmedAt, actor: state.protectedPerson ? state.protectedPerson.name : 'Protected person', type: 'EMERGENCY_CONFIRMED', details: 'Confirmed real — Trusted Network alert proceeding.' };
    inc.actions.push(a);
    audit(a.actor, a.type, a.details);
    save();
    sharedCreate(inc);
    activateRemote(inc).then(r => { if (r && inc.shared) patchShared(inc, { backend: inc.backend }); });
    return inc;
  }

  /* Dismiss a still-pending passive trigger as a false alarm. Safe to do
     with no PIN: the Trusted Network was never notified, so there is
     nothing for an adversary to gain by forcing this — unlike cancelling a
     live, already-shared incident, which still requires enterDuress(). */
  function dismissFalseAlarm() {
    const inc = getActiveIncident();
    if (!inc || inc.confirmedAt) return { ok: false };
    inc.resolved = true;
    inc.resolvedAt = Date.now();
    const by = state.protectedPerson ? state.protectedPerson.name : 'Protected person';
    inc.resolution = { by, notes: 'Dismissed inside the confirmation window — the Trusted Network was never notified.', reason: 'False alarm — dismissed before confirmation' };
    state.activeIncidentId = null;
    audit(by, 'FALSE_ALARM_DISMISSED', `${inc.triggerMethod} on ${inc.triggerDevice} dismissed as a false alarm before the Trusted Network was alerted.`);
    save();
    return { ok: true };
  }

  function getActiveIncident() {
    if (!state.activeIncidentId) return null;
    const inc = state.incidents.find(i => i.id === state.activeIncidentId);
    return (inc && !inc.resolved) ? inc : null;
  }

  function recordAction(type, actor, details) {
    const inc = getActiveIncident();
    if (!inc) return null;
    const action = { t: Date.now(), actor, type, details };
    inc.actions.push(action);
    audit(actor, type, details);
    save();
    if (inc.shared) postSharedEvent(inc, action);
    else mirrorTimeline(inc, type, actor, details);
    return inc;
  }

  function enterDuress(pinEntered) {
    const inc = getActiveIncident();
    if (!inc) return { ok: false, mode: 'none' };
    if (pinEntered === state.pins.duress && state.pins.duress) {
      inc.duress = true;
      inc.duressAt = Date.now();
      const a = { t: Date.now(), actor: 'System', type: 'DURESS_CANCELLATION', details: 'Duress PIN entered. Protected-person screen feigns cancellation. Silent escalation active for guardians and responders.' };
      inc.actions.push(a);
      audit('System', 'DURESS_CANCELLATION', 'Coerced cancellation suspected. Covert escalation engaged.');
      save();
      patchShared(inc, { duress: true, duressAt: inc.duressAt, actions: [a] });
      return { ok: true, mode: 'duress' };
    }
    if (pinEntered === state.pins.normal && state.pins.normal) {
      resolveIncident(state.protectedPerson ? state.protectedPerson.name : 'Protected person', 'Cancelled with normal PIN by protected person.', 'Safe cancellation');
      return { ok: true, mode: 'normal' };
    }
    return { ok: false, mode: 'invalid' };
  }

  /* PINs are optional at setup time (see readiness()) — but cancellation
     must never be blocked just because a PIN was never configured. Without
     this, a genuine false alarm would sit "unfixably" active for anyone who
     skipped the optional PIN step, which is a real safety regression, not
     just an inconvenience. Duress protection specifically still requires a
     configured duress PIN to exist — that covert-cancel capability is a
     deliberate upgrade, not a baseline requirement. */
  function cancelWithoutPin() {
    const inc = getActiveIncident();
    if (!inc) return { ok: false };
    resolveIncident(state.protectedPerson ? state.protectedPerson.name : 'Protected person', 'Cancelled — no PIN was configured for this account.', 'Safe cancellation');
    return { ok: true };
  }

  function resolveIncident(by, notes, reason) {
    const inc = getActiveIncident();
    if (!inc) return null;
    inc.resolved = true;
    inc.resolvedAt = Date.now();
    inc.resolution = { by, notes, reason };
    state.activeIncidentId = null;
    audit(by, 'INCIDENT_RESOLVED', `${reason}. ${notes}`);
    save();
    patchShared(inc, { resolved: true, resolvedAt: inc.resolvedAt, resolution: inc.resolution });
    return inc;
  }

  /* Compute the full derived view of an incident at this moment. */
  function incidentView(inc) {
    if (!inc) return null;
    const now = Date.now();
    const el = Math.floor((now - inc.triggeredAt) / 1000); // elapsed seconds
    const acts = inc.actions || [];
    const has = (type) => acts.find(a => a.type === type);

    /* Fail-safe: if a passive-trigger confirmation window elapses with no
       response, treat it as real and proceed — silence escalates, it never
       cancels. Lazy-applied like the scenario effects below so it fires
       exactly once, on whichever render happens to cross the deadline. */
    if (!inc.confirmedAt && now >= inc.triggeredAt + (inc.confirmWindowMs || CONFIRM_WINDOW_MS)) {
      inc.confirmedAt = inc.triggeredAt + (inc.confirmWindowMs || CONFIRM_WINDOW_MS);
      acts.push({ t: inc.confirmedAt, actor: 'System', type: 'EMERGENCY_AUTO_CONFIRMED', details: 'No response during the confirmation window — treated as real and the Trusted Network is being alerted (fail-safe).' });
      save();
      sharedCreate(inc);
      activateRemote(inc).then(r => { if (r && inc.shared) patchShared(inc, { backend: inc.backend }); });
    }
    const pending = !inc.confirmedAt;
    const confirmSecondsLeft = pending ? Math.max(0, Math.ceil((inc.triggeredAt + (inc.confirmWindowMs || CONFIRM_WINDOW_MS) - now) / 1000)) : 0;
    /* elN: seconds since the Trusted Network was actually allowed to be told
       anything. While pending, nothing downstream of "notify the network"
       has happened yet, so it's held at 0 rather than tracking real time. */
    const elN = pending ? 0 : Math.floor((now - inc.confirmedAt) / 1000);

    /* Scheduled scenario effects (lazy-applied so they survive reloads). */
    if (inc.autoDuressAt && now >= inc.autoDuressAt && !inc.duress) {
      inc.duress = true; inc.duressAt = inc.autoDuressAt;
      acts.push({ t: inc.autoDuressAt, actor: 'System', type: 'DURESS_CANCELLATION', details: 'Duress PIN entered under coercion (scenario). Protected screen feigns cancellation; silent escalation active.' });
      save();
    }
    if (inc.degradeAt && now >= inc.degradeAt && !acts.find(a => a.type === 'COMM_PATH_CHANGED')) {
      const detail = inc.degradeMode === 'phoneOff'
        ? 'Primary phone offline. Fallback: Apple Watch Ultra 2 + Billi Smart Tag telemetry (SIMULATED). Protection degraded.'
        : 'Cellular signal lost. Communication path changed: CELLULAR → BLE NEARBY-RELAY (SIMULATED). Last confirmed location preserved.';
      acts.push({ t: inc.degradeAt, actor: 'Communication Engine', type: 'COMM_PATH_CHANGED', details: detail });
      save();
    }
    const degraded = !!(inc.degradeAt && now >= inc.degradeAt);

    /* DEMO-ONLY auto-progression. inc.scenario is set exclusively by
       runDemo() — never by a real trigger — so this can never fire for an
       actual emergency; a real incident must always wait for an actual
       human guardian to acknowledge/respond/stabilize/resolve. Without
       this, a demo scenario watched passively gets stuck after the first
       (automatic, time-based) lifecycle hop: every stage past
       TRUSTED_NETWORK_NOTIFIED normally requires a manually-recorded
       action, and the compact demo-live.html view only exposes one of the
       four buttons that record them (the full Command Center has the rest).
       This walks a demo through the whole lifecycle on a fixed schedule so
       watching it actually shows the story end to end. */
    if (inc.scenario && !inc.resolved) {
      const t0 = inc.confirmedAt || inc.triggeredAt;
      const lead = (state.contacts[0] || {}).name || 'Trusted Contact';
      if (!has('GUARDIAN_ACKNOWLEDGED') && now >= t0 + 8000) {
        acts.push({ t: t0 + 8000, actor: lead, type: 'GUARDIAN_ACKNOWLEDGED', details: 'Acknowledged — responding now. ETA 3 minutes (SIMULATED route).' });
        save();
      }
      if (!has('RESPONDER_STATUS') && now >= t0 + 15000) {
        acts.push({ t: t0 + 15000, actor: lead, type: 'RESPONDER_STATUS', details: 'Responding — ETA 3 min' });
        save();
      }
      if (!has('INCIDENT_STABILIZED') && now >= t0 + 30000) {
        acts.push({ t: t0 + 30000, actor: lead, type: 'INCIDENT_STABILIZED', details: 'Situation stabilized — protected person in guardian contact.' });
        save();
      }
      if (now >= t0 + 40000 && state.activeIncidentId === inc.id) {
        resolveIncident(lead, 'Reunited safely — demo scenario complete.', 'Protected person confirmed safe');
      }
    }

    /* Communication path + protection tier (legacy 5-tier model). */
    const commPath = degraded
      ? (inc.degradeMode === 'phoneOff' ? 'WATCH + SMART TAG FALLBACK (SIMULATED)' : 'BLE NEARBY-RELAY (SIMULATED)')
      : 'CELLULAR DATA';
    let protection = { tier: 'High', pct: 92 };
    if (degraded && inc.degradeMode === 'phoneOff') protection = { tier: 'Limited', pct: 32 };
    else if (degraded) protection = { tier: 'Reduced', pct: 60 };

    /* Scenario packs may override the movement path and evidence stream. */
    const PATH = (inc.path && inc.path.length) ? inc.path : SIM_PATH;
    const TRANS = (inc.transcripts && inc.transcripts.length) ? inc.transcripts : SIM_TRANSCRIPTS;

    /* Location trail: advances one path point every 8 seconds. */
    const steps = Math.min(Math.floor(el / 8) + 1, PATH.length);
    const trail = PATH.slice(0, steps);
    const loc = trail[trail.length - 1];

    /* Real outbound SMS - fires exactly once per incident, only when
       running inside the native Android shell (window.BilliNative present,
       see mobile-native/) and only for a genuine trigger, never a demo
       (inc.scenario is set exclusively by runDemo() - a demo must never
       text a real phone number). Fires the moment the network leg reaches
       SENT (elN>=3), matching the alertState ladder below. Lazy-applied
       like the scenario effects elsewhere in this function so it survives
       reloads and fires on whichever render tick crosses the threshold. */
    if (!pending && !inc.scenario && elN >= 3 && !inc.realSmsSentAt &&
        typeof window !== 'undefined' && window.BilliNative && window.BilliNative.sendSms) {
      inc.realSmsSentAt = now;
      const who = (state.protectedPerson && state.protectedPerson.name) || 'A Billi user';
      const coords = loc ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : 'location acquiring';
      const msg = `Billi Emergency Alert: ${who} has triggered an SOS. Location: ${coords}. Open Billi for live updates.`;
      (state.contacts.length ? state.contacts : FIXTURE.contacts).forEach(c => {
        if (c.notifyEnabled === false || !c.channels || c.channels.indexOf('SMS') === -1 || !c.phone) return;
        let sent = false, err = null;
        try { sent = window.BilliNative.sendSms(c.phone, msg); } catch (e) { err = e.message; }
        acts.push({
          t: now, actor: 'Communication Engine', type: 'REAL_SMS_SENT', contactId: c.id,
          details: sent ? `Real SMS dispatched to ${c.name} (${c.phone})`
                         : `SMS not sent to ${c.name}${err ? ' - ' + err : ' - SEND_SMS permission not granted'}`
        });
      });
      save();
    }

    /* Evidence: one audio segment every 10 seconds. */
    const evCount = Math.min(Math.floor(el / 10) + 1, TRANS.length);
    const evidence = TRANS.slice(0, evCount).map((txt, i) => ({
      id: `seg_${i}`, type: i === 0 ? 'metadata' : 'audio',
      t: inc.triggeredAt + i * 10000, transcript: txt
    }));

    /* Four core actions — truth states. Location and audio are local-only
       capture and start immediately regardless of confirmation status; only
       the network leg waits, since that's the one an accidental trigger
       can't take back once it's out the door. */
    const videoAuthorized = !!(state.contract && state.contract.video);
    const core = {
      gps:     el < 2 ? 'ACQUIRING' : 'ACQUIRED',
      audio:   el < 3 ? 'STARTING' : 'ACTIVE',
      video:   !videoAuthorized ? 'NOT AUTHORIZED' : (el < 4 ? 'STARTING' : 'PHOTO EVIDENCE ACTIVE'),
      network: pending ? 'AWAITING CONFIRMATION' : (elN < 3 ? 'QUEUED' : (elN < 6 ? 'SENT' : 'DELIVERED'))
    };

    /* Contact response matrix — full notification truth-state ladder:
       PREPARING → QUEUED → SENT → DELIVERED → ACKNOWLEDGED.
       Every contact the guardian has opted in (notifyEnabled !== false) is
       alerted on the SAME timeline, all at once — priority determines who
       is expected to lead the response and where the escalation ladder
       turns next, not who gets told an emergency is happening. A contact
       explicitly toggled off is never contacted, and that is shown plainly
       rather than faked as an alert. */
    const contacts = (state.contacts.length ? state.contacts : FIXTURE.contacts).map(c => {
      const notify = c.notifyEnabled !== false;
      let alertState = !notify ? 'NOT_NOTIFIED' : pending ? 'AWAITING_CONFIRMATION' : (elN < 1 ? 'PREPARING' : elN < 3 ? 'QUEUED' : elN < 6 ? 'SENT' : 'DELIVERED');
      const resp = acts.filter(a => a.contactId === c.id).pop();
      const ack = acts.find(a => a.type === 'GUARDIAN_ACKNOWLEDGED' && a.actor === c.name);
      const responding = acts.filter(a => a.type === 'RESPONDER_STATUS' && a.actor === c.name).pop();
      let status = !notify ? 'Not notified — opted out by guardian' : pending ? 'Not yet notified — confirming with protected person' : 'Alert ' + alertState.toLowerCase();
      if (ack) { alertState = 'ACKNOWLEDGED'; status = 'Acknowledged'; }
      if (responding) status = responding.details;
      if (resp && resp.type === 'CONTACT_STATUS') status = resp.details;
      return { ...c, alertState, status, notifyEnabled: notify };
    });

    /* Progressive escalation: 45s window with staged ladder.
       Countdown 45s→ primary window · 30s→ secondary escalation ·
       15s→ campus responder · 0s→ emergency-services escalation (SIMULATED).
       Based on confirmedAt, not triggeredAt — the response clock can't
       start before the Trusted Network even knows anything happened. While
       still pending, escalBase tracks "now" each render, which pins the
       countdown at a full 45s and keeps every stage unfired. */
    const acked = has('GUARDIAN_ACKNOWLEDGED');
    const ackAt = acked ? acked.t : null;
    const escalBase = inc.confirmedAt || now;
    const escalationDue = escalBase + 45000;
    const remaining = Math.max(0, Math.ceil((escalationDue - now) / 1000));
    const cutoff = ackAt || now;
    const stageReached = (offsetMs) => cutoff > escalBase + offsetMs;
    const p3name = ((state.contacts.find(c => c.priority === 3) || {}).name) || 'Authorized responder';
    const stages = [
      { at: 45, label: 'Primary guardian response window opened', fired: true },
      { at: 30, label: 'Secondary guardian escalation (SIMULATED delivery)', fired: stageReached(15000) },
      { at: 15, label: `Responder escalation — ${p3name} notified (SIMULATED)`, fired: stageReached(30000) },
      { at: 0,  label: 'Emergency-services escalation recommended (SIMULATED — no live 911 dispatch)', fired: !acked && stageReached(45000) }
    ];
    const escalated = !acked && now > escalationDue;
    const escalation = {
      windowSeconds: 45, remaining, stages,
      acknowledged: !!acked, escalated,
      label: acked
        ? `Escalation halted at T-${Math.max(0, Math.ceil((escalationDue - ackAt) / 1000))}s — guardian acknowledged inside the response window.`
        : escalated
          ? 'SIMULATED: full ladder fired. Emergency-services action recommended (no live 911 dispatch in this prototype).'
          : 'Escalation ladder armed — awaiting guardian acknowledgment.'
    };

    /* Lifecycle state resolution. */
    let lifecycle = 'EMERGENCY_TRIGGERED';
    if (!pending && elN >= 3) lifecycle = 'TRUSTED_NETWORK_NOTIFIED';
    if (acked) lifecycle = 'GUARDIAN_ACKNOWLEDGED';
    if (has('RESPONDER_STATUS') || contacts.some(c => /Responding|En route|On scene/i.test(c.status))) lifecycle = 'HELP_RESPONDING';
    if (has('INCIDENT_STABILIZED')) lifecycle = 'INCIDENT_STABILIZED';
    if (inc.resolved) lifecycle = 'RESOLVED';

    /* Unified event timeline (pre-trigger telemetry + derived milestones + recorded actions). */
    const events = [];
    (inc.preEvents || []).forEach(pe => events.push({ t: inc.triggeredAt + pe.dt * 1000, actor: pe.actor, label: pe.label }));
    events.push({ t: inc.triggeredAt, actor: inc.triggerDevice, label: pending ? `TRIGGER (sensor-inferred) — ${inc.triggerMethod} — confirming before the network is told` : `TRIGGER — ${inc.triggerMethod}` });
    if (el >= 2) events.push({ t: inc.triggeredAt + 2000, actor: 'Location Engine', label: `GPS acquired · ${PATH[0].label} (accuracy 6 m)` });
    if (!pending && elN >= 3) events.push({ t: inc.confirmedAt + 3000, actor: 'Notification Engine', label: 'Trusted Network alerts dispatched by priority (SIMULATED delivery)' });
    trail.forEach((p, i) => {
      if (i > 0) events.push({ t: inc.triggeredAt + i * 8000, actor: 'Location Engine', label: `Position update · ${p.label} · ${p.speed} mph` });
    });
    evidence.forEach((s, i) => {
      if (i > 0) events.push({ t: s.t, actor: 'Evidence Engine', label: `Audio segment #${i} sealed · "${s.transcript}"` });
    });
    if (escalated) events.push({ t: escalationDue, actor: 'Escalation Engine', label: 'SIMULATED escalation: campus responder notified, emergency-services action recommended' });
    acts.forEach(a => events.push({ t: a.t, actor: a.actor, label: `${a.type.replace(/_/g, ' ')} — ${a.details}` }));
    if (inc.resolved) events.push({ t: inc.resolvedAt, actor: inc.resolution.by, label: `RESOLVED — ${inc.resolution.reason}: ${inc.resolution.notes}` });
    events.sort((a, b) => a.t - b.t);

    /* Deterministic AI-assisted summary (no live model in design phase). */
    const p = state.protectedPerson || FIXTURE.protectedPerson;
    const aiSummary =
      `${p.name} activated Billi via ${inc.triggerMethod.toLowerCase()} at ${fmtClock(inc.triggeredAt)}. ` +
      `Current position: ${loc.label.toLowerCase()} moving at ${loc.speed} mph. ` +
      `${contacts.filter(c => /Acknowledged|Responding|En route|On scene/i.test(c.status)).length} trusted responder(s) engaged. ` +
      (inc.duress ? 'DURESS INDICATOR PRESENT — treat cancellation signals as coerced. ' : '') +
      `Audio evidence contains ${evCount > 3 ? 'high-distress vocal content' : 'ambient monitoring content'}. ` +
      `Medical note: ${(state.medical && state.medical.conditions) || 'none on file'} — ${(state.medical && state.medical.equipment) || 'no rescue equipment listed'}.`;

    return { inc, elapsed: el, lifecycle, core, contacts, trail, loc, evidence, events, escalation, aiSummary, commPath, protection, degraded, pendingConfirmation: pending, confirmSecondsLeft, isPassiveTrigger: PASSIVE_TRIGGERS.has(inc.triggerKey) };
  }

  /* 911-Ready Emergency Packet (honest label — not a live CAD submission). */
  function buildPacket(inc) {
    const v = incidentView(inc);
    const p = state.protectedPerson || FIXTURE.protectedPerson;
    const m = state.medical || FIXTURE.medical;
    const ga = inc.geminiAnalysis || null;
    return [
      '====================================================',
      'BILLI 911-READY EMERGENCY PACKET (PROTOTYPE — LOCAL)',
      '====================================================',
      `INCIDENT ID:      ${inc.id}`,
      `CORRELATION ID:   ${inc.correlationId}`,
      `GENERATED:        ${new Date().toISOString()}`,
      `LIFECYCLE STATE:  ${v.lifecycle}`,
      '',
      `PROTECTED PERSON: ${p.name} (Age ${p.age})`,
      `MEDICAL:          ${m.conditions} · Allergies: ${m.allergies}`,
      `MEDICATION:       ${m.medications}`,
      `INSTRUCTIONS:     ${m.instructions}`,
      '',
      `TRIGGER:          ${inc.triggerMethod} (${inc.triggerDevice})`,
      `CURRENT GPS:      ${v.loc.lat.toFixed(5)}, ${v.loc.lng.toFixed(5)} · ${v.loc.speed} mph`,
      `MOVEMENT:         ${v.loc.label}`,
      `DURESS FLAG:      ${inc.duress ? 'YES — coerced cancellation suspected' : 'No'}`,
      '',
      'TRUSTED NETWORK:',
      ...v.contacts.map(c => `  P${c.priority} ${c.name} (${c.role}) — ${c.status}`),
      '',
      'EVIDENCE REFERENCES:',
      ...v.evidence.map((s, i) => `  [${fmtClock(s.t)}] ${s.type.toUpperCase()} — ${s.transcript}`),
      '',
      ...(ga ? [
        `AI ANALYSIS (${ga.aiProvider === 'gemini-live' ? 'LIVE GEMINI' : 'deterministic fallback'} — interpretation, not confirmed fact):`,
        `  RISK CLASSIFICATION:   ${(ga.riskClassification || '').toUpperCase()}`,
        `  CATEGORY:              ${(ga.suggestedCategory || '').replace(/_/g, ' ')}`,
        `  AUDIO SENTIMENT:       ${ga.audioSentimentVerification}`,
        `  DISTRESS VERIFIED:     ${ga.isRealDistressVerified ? 'YES' : 'NO — possible false alarm'}`,
        `  DISTRESS LEVEL:        ${ga.distressLevel}`,
        `  SUMMARY:               ${ga.summary}`,
        '  KEY OBSERVATIONS:',
        ...(ga.keyObservations || []).map(o => `    - ${o}`),
        '  RESPONDER DIRECTIVES:',
        ...(ga.responderDirectives || []).map(o => `    - ${o}`)
      ] : [
        'AI-ASSISTED SUMMARY (deterministic, interpretation — not confirmed fact):',
        `  ${v.aiSummary}`
      ]),
      '===================================================='
    ].join('\n');
  }

  /* --------------------------- NAV / CHROME --------------------------- */
  const NAV_LINKS = [
    { href: 'dashboard.html', label: 'Command Center' },
    { href: 'geofence.html',  label: 'Geofences' },
    { href: 'protected.html', label: 'Protected Person' },
    { href: 'network.html',   label: 'Network' },
    { href: 'incident.html',  label: 'Incident' },
    { href: 'responder.html', label: 'Responder' },
    { href: 'devices.html',   label: 'Devices' },
    { href: 'admin.html',     label: 'Safety Contract' },
    { href: 'history.html',   label: 'History' },
    { href: 'help.html',      label: '❓ Help' }
  ];

  function renderNav(current) {
    const active = getActiveIncident();
    const holder = document.getElementById('billi-nav');
    if (!holder) return;
    holder.dataset.current = current;
    const linkChip = link.connected
      ? `<span class="sim-chip connected" title="Gateway + services reachable">LIVE · ${link.count}/${link.total}</span>`
      : `<span class="sim-chip local" title="Backend offline — running on local simulation">LOCAL MODE</span>`;
    /* Two-row header: a compact status bar that's free to wrap on narrow
       screens, plus a single-line horizontally-scrollable nav strip below
       it (a standard tab-bar pattern) so link labels never wrap internally
       and the header never explodes vertically at any viewport width. */
    holder.innerHTML = `
      <header class="billi-header">
        ${state.isDemo ? `
        <div class="duress-banner" style="border-color:rgba(245,158,11,0.5); background:rgba(245,158,11,0.08); margin-bottom:0.75rem; animation:none;">
          <div class="flex-between" style="flex-wrap:wrap; gap:0.6rem;">
            <span style="color:#fbbf24; font-weight:700; font-size:0.82rem;">⚡ EVALUATOR DEMO — ${state.protectedPerson ? state.protectedPerson.name : 'sample'} is not your account. Nothing here is saved as yours.</span>
            <button class="btn btn-primary" style="font-size:0.72rem;" onclick="Billi.exitDemo()">← Exit Demo to My Account</button>
          </div>
        </div>` : ''}
        ${state.isViewingOther ? `
        <div class="duress-banner" style="border-color:rgba(99,102,241,0.5); background:rgba(99,102,241,0.08); margin-bottom:0.75rem; animation:none;">
          <div class="flex-between" style="flex-wrap:wrap; gap:0.6rem;">
            <span style="color:#a5b4fc; font-weight:700; font-size:0.82rem;">👥 Viewing ${state.protectedPerson ? state.protectedPerson.name : 'someone else'}'s incident as a Trusted Network member — not your account.</span>
            <button class="btn btn-primary" style="font-size:0.72rem;" onclick="Billi.exitDemo()">← Back to My Account</button>
          </div>
        </div>` : ''}
        ${namedAlert && !state.isDemo && !state.isViewingOther ? `
        <div class="duress-banner margin-bottom" style="cursor:pointer;" onclick="Billi.viewNamedAlert()">
          <div class="flex-between" style="flex-wrap:wrap; gap:0.6rem;">
            <span style="color:#fca5a5; font-weight:700; font-size:0.82rem;">🔴 ${namedAlert.name} triggered an emergency and you're on their Trusted Network.</span>
            <button class="btn btn-danger" style="font-size:0.72rem;">View & Respond →</button>
          </div>
        </div>` : ''}
        <div class="billi-header-status">
          <div class="brand-mark" onclick="location.href='landing.html'" style="cursor:pointer;">BILLI</div>
          <div class="billi-header-status-right">
            ${linkChip}
            ${active
              ? `<button class="billi-incident-chip" onclick="location.href='incident.html'">🔴 ${active.id}${active.duress ? ' · DURESS' : ''}</button>`
              : `<span class="badge badge-green" style="font-size:0.68rem;">${state.armed ? 'ARMED' : 'NOT ARMED'}</span>`}
            <span class="text-muted billi-header-owner">${state.owner ? state.owner.name : ''}</span>
            <button class="btn-dash-logout" onclick="Billi.logout()">Log Out</button>
          </div>
        </div>
        <nav class="billi-nav-links">
          ${NAV_LINKS.map(l => `<a href="${l.href}" class="${current === l.href ? 'active' : ''}">${l.label}</a>`).join('')}
        </nav>
      </header>`;
    mountFeedback();
  }

  /* Floating "send feedback" widget for the testing phase — a real inbox
     (persisted server-side via gateway, not a mailto: or a fake toast),
     reachable from every page (authenticated pages get it automatically
     via renderNav(); landing.html/auth.html call it directly since they
     render before any account exists). Idempotent — safe to call on
     every render without double-mounting. */
  function mountFeedback() {
    if (document.getElementById('billi-fb-widget')) return;
    const el = document.createElement('div');
    el.id = 'billi-fb-widget';
    el.innerHTML = `
      <button id="billi-fb-toggle" title="Send feedback" style="position:fixed;bottom:18px;right:18px;z-index:9999;width:52px;height:52px;border-radius:50%;background:#6366f1;color:#fff;border:none;font-size:1.3rem;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.35);">💬</button>
      <div id="billi-fb-panel" style="display:none;position:fixed;bottom:80px;right:18px;z-index:9999;width:min(320px,calc(100vw - 36px));background:#161b2e;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:1rem;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        <strong style="color:#fff;font-size:0.85rem;">Send feedback</strong>
        <p class="text-muted" style="font-size:0.72rem;margin-top:2px;">Testing Billi? Tell us what's broken, confusing, or working well.</p>
        <textarea id="billi-fb-text" rows="4" class="form-control-dark" style="margin-top:0.5rem;width:100%;resize:vertical;" placeholder="What happened?"></textarea>
        <input id="billi-fb-contact" class="form-control-dark" style="margin-top:0.5rem;width:100%;" placeholder="Your name or contact (optional)">
        <button id="billi-fb-submit" class="btn btn-primary" style="width:100%;margin-top:0.6rem;font-size:0.78rem;">Send</button>
        <div id="billi-fb-status" style="font-size:0.7rem;margin-top:0.4rem;"></div>
      </div>`;
    document.body.appendChild(el);
    document.getElementById('billi-fb-toggle').onclick = () => {
      const p = document.getElementById('billi-fb-panel');
      p.style.display = p.style.display === 'none' ? 'block' : 'none';
    };
    document.getElementById('billi-fb-submit').onclick = async () => {
      const text = document.getElementById('billi-fb-text').value.trim();
      const contact = document.getElementById('billi-fb-contact').value.trim();
      const statusEl = document.getElementById('billi-fb-status');
      if (!text) { statusEl.textContent = 'Enter some feedback first.'; statusEl.style.color = '#fbbf24'; return; }
      statusEl.textContent = 'Sending…'; statusEl.style.color = '#94a3b8';
      const ok = await gfetch('/api/v1/tester-feedback', 'POST', {
        text, contact, page: location.pathname, ownerName: (state.owner || {}).name || null
      }, 6000);
      if (ok) {
        statusEl.textContent = '✓ Thanks — sent.'; statusEl.style.color = '#34d399';
        document.getElementById('billi-fb-text').value = '';
      } else {
        statusEl.textContent = 'Could not reach the backend — try again shortly.'; statusEl.style.color = '#f87171';
      }
    };
  }

  /* Contextual "what is this / why is it here" help icon — a vanilla-JS
     equivalent of the legacy InfoTooltip component. Click the (i) icon to
     toggle a small popover; clicking anywhere else closes any open one. */
  function infoTip(id, title, what, why) {
    return `<span class="info-tip-wrap">
      <button type="button" class="info-tip-btn" onclick="event.stopPropagation(); Billi.toggleTip('${id}')" title="Help: ${title}">ⓘ</button>
      <div class="info-tip-pop" id="tip-${id}">
        <div class="info-tip-head">💡 ${title}</div>
        <div class="info-tip-label">What is this?</div><p>${what}</p>
        <div class="info-tip-label">Why is it here?</div><p>${why}</p>
      </div>
    </span>`;
  }
  let tipListenerAttached = false;
  function attachTipCloseListener() {
    if (tipListenerAttached) return;
    tipListenerAttached = true;
    document.addEventListener('click', () => {
      document.querySelectorAll('.info-tip-pop.open').forEach(el => el.classList.remove('open'));
    });
  }
  function toggleTip(id) {
    attachTipCloseListener();
    const el = document.getElementById(`tip-${id}`);
    if (!el) return;
    const wasOpen = el.classList.contains('open');
    document.querySelectorAll('.info-tip-pop.open').forEach(x => x.classList.remove('open'));
    if (!wasOpen) el.classList.add('open');
  }

  /* Route guard for authenticated surfaces. */
  function requireSetup() {
    if (!state.session.authed) { location.href = 'auth.html'; return false; }
    if (!state.setup.complete) { location.href = 'onboarding.html'; return false; }
    return true;
  }

  /* --------------------------- PUBLIC API --------------------------- */
  window.Billi = {
    FIXTURE, SIM_PATH, LIFECYCLE, TRIGGER_METHODS, PASSIVE_TRIGGERS,
    get state() { return state; },
    save, audit, toast, uid, initials, fmtClock, fmtAgo,

    /* auth simulation (LOCAL INTERACTIVE) */
    createAccount() {
      localStorage.removeItem(BACKUP_KEY); // explicit fresh start discards any prior account too
      state = blankState();
      state.session.authed = true;
      save();
      location.href = 'onboarding.html';
    },
    login() {
      // Returning from a demo, or from viewing someone else's incident as a
      // guardian: restore the real account instead of handing the user
      // leftover borrowed data (e.g. "David Reyes") as if it were theirs.
      if (state.isDemo || state.isViewingOther) restoreRealAccount();
      state.session.authed = true;
      save();
      location.href = state.setup.complete ? 'dashboard.html' : 'onboarding.html';
    },
    logout() {
      if (state.isDemo || state.isViewingOther) restoreRealAccount();
      state.session.authed = false;
      save();
      location.href = 'landing.html';
    },
    /* Explicit escape hatch from any demo, reachable from every page via
       the demo-mode banner — restores the real account (or a fresh one if
       none exists yet) and routes exactly like a normal login would. */
    exitDemo() {
      restoreRealAccount();
      state.session.authed = true;
      save();
      location.href = state.setup.complete ? 'dashboard.html' : 'auth.html';
    },
    resetPlatform() {
      localStorage.removeItem(BACKUP_KEY);
      state = blankState();
      save();
      location.href = 'landing.html';
    },

    /* Evaluator demonstrations: each of the nine packs proves a distinct
       outcome — persona, activation gate, telemetry, and network included.
       Demos are sandboxed: they never permanently overwrite a real account. */
    runDemo(id) {
      const pack = SCENARIO_PACKS[id] || SCENARIO_PACKS[1];
      backupRealAccountIfNeeded();
      state = blankState();
      state.isDemo = true;
      state.session.authed = true;
      applyFixturePrefill();
      if (pack.persona) state.protectedPerson = { ...pack.persona };
      if (pack.medical) state.medical = { ...state.medical, ...pack.medical };
      if (pack.contacts) {
        state.contacts = pack.contacts.map(c => ({ ...c }));
        const p1 = state.contacts.find(c => c.priority === 1);
        if (p1) state.owner = { name: p1.name, role: p1.role, relationship: p1.relationship, phone: p1.phone };
      }
      state.setup.complete = true;
      state.armed = true;
      audit('Evaluator', 'DEMO_LAUNCHED', `Demonstration started: ${pack.name}`);
      const inc = triggerIncident(pack.trigger, { scenario: pack.name });
      if (pack.path) inc.path = pack.path;
      if (pack.transcripts) inc.transcripts = pack.transcripts;
      if (pack.preEvents) inc.preEvents = pack.preEvents;
      const fx = pack.effects || {};
      if (fx.duressAfter) inc.autoDuressAt = inc.triggeredAt + fx.duressAfter * 1000;
      if (fx.degradeAfter) { inc.degradeAt = inc.triggeredAt + fx.degradeAfter * 1000; inc.degradeMode = fx.degradeMode || 'cellLost'; }
      save();
      location.href = 'demo-live.html';
    },

    applyFixturePrefill, readiness, activatePlatform,
    triggerIncident, getActiveIncident, incidentView, recordAction,
    enterDuress, cancelWithoutPin, resolveIncident, buildPacket,
    confirmEmergency, dismissFalseAlarm,
    renderNav, requireSetup, mountFeedback,
    get link() { return link; },
    probeBackend, fetchRemoteCad,
    subscribeShared, adoptActiveShared, pushTelemetry,
    infoTip, toggleTip,
    checkNamedAlerts, viewNamedAlert,
    get namedAlert() { return namedAlert; },
    /* Join a live shared incident from a fresh session in a given role. */
    async joinLive(role) {
      state = blankState();
      state.session.authed = true;
      applyFixturePrefill();
      state.setup.complete = true;
      state.armed = true;
      save();
      await probeBackend();
      const inc = await adoptActiveShared({ adoptContext: true }); // explicit — this IS meant to take on the joined incident's identity
      if (!inc) { toast('No live incident found on the gateway.', 'warn'); return null; }
      audit(role === 'responder' ? 'Responder session' : 'Guardian session', 'SESSION_JOINED', `Joined live shared incident ${inc.id}.`);
      location.href = role === 'responder' ? 'responder.html' : 'incident.html';
      return inc;
    },

    /* ---------- HOUSEHOLDS ----------
       Lets an account owner invite a second physical device (e.g. a
       child's phone) into the same safety setup without needing that
       device in hand — the owner shares a short code or join link,
       generated once and reused; the joining device fetches a snapshot
       of the owner's current contacts/safety-contract/entity type and
       adopts it locally rather than starting from a disconnected blank
       account. Real backend persistence (households.json on gateway),
       not a local-only simulation. */
    async createHousehold() {
      if (state.householdCode) return gfetch(`/api/v1/household/${state.householdCode}`, 'GET', null, 4000);
      const h = await gfetch('/api/v1/household', 'POST', {
        ownerName: (state.owner && state.owner.name) || (state.protectedPerson && state.protectedPerson.name) || 'A Billi household',
        entityType: state.entityType, contacts: state.contacts, contract: state.contract
      }, 6000);
      if (!h) { toast('Could not reach the backend to create a household code.', 'warn'); return null; }
      state.householdCode = h.code;
      save();
      return h;
    },
    /* Push this device's current contacts/safety-contract to the household
       record, so a device joining later gets what's configured NOW rather
       than a stale snapshot from whenever the code was first generated. */
    async syncHousehold() {
      if (!state.householdCode) return null;
      return gfetch(`/api/v1/household/${state.householdCode}`, 'PATCH', {
        contacts: state.contacts, contract: state.contract, entityType: state.entityType
      }, 6000);
    },
    async getHouseholdDevices() {
      if (!state.householdCode) return [];
      const h = await gfetch(`/api/v1/household/${state.householdCode}`, 'GET', null, 4000);
      return h ? h.devices : [];
    },
    /* Preview a household by code before committing to join it (used by
       join-household.html to show "You're joining X's household" before
       the device's own permissions/setup happen). */
    async previewHousehold(code) {
      return gfetch(`/api/v1/household/${(code || '').toUpperCase()}`, 'GET', null, 4000);
    },
    /* Actually join: registers this device with the household, then seeds
       a fresh local account from the household's contacts/contract/entity
       snapshot, with THIS device's own protected-person label — a child's
       phone protects the child, not whoever the parent originally set up
       their own account for. */
    async joinHousehold(code, { label, protectedPersonName }) {
      const upper = (code || '').toUpperCase();
      const result = await gfetch(`/api/v1/household/${upper}/join`, 'POST', { label, protectedPersonName }, 6000);
      if (!result) { toast('Could not reach the backend to join that household.', 'warn'); return null; }
      const h = result.household;
      state = blankState();
      state.session.authed = true;
      state.entityType = h.entityType || state.entityType;
      state.contacts = (h.contacts && h.contacts.length) ? h.contacts.map(c => ({ ...c })) : [];
      if (h.contract) state.contract = { ...h.contract };
      state.protectedPerson = { name: protectedPersonName || 'Protected person' };
      state.householdCode = upper;
      state.householdDeviceId = result.device.id;
      state.householdRole = 'member';
      state.setup.complete = true;
      state.armed = true;
      audit('Household join', 'DEVICE_JOINED_HOUSEHOLD', `Joined household ${upper} as "${label}".`);
      save();
      return result;
    },

    /* Retry the gateway activation if navigation aborted the original call. */
    async retryRemoteActivation() {
      const inc = getActiveIncident();
      if (!inc) return null;
      if (!inc.shared) sharedCreate(inc);
      if (!inc.backend) {
        const r = await activateRemote(inc);
        if (r && inc.shared) patchShared(inc, { backend: inc.backend });
        return r;
      }
      return null;
    }
  };

  /* Probe the backend on load and every 30s; subscribe to shared state when up. */
  function refreshNamedAlertBanner() {
    checkNamedAlerts().then(() => {
      const nav = document.getElementById('billi-nav');
      if (nav && nav.dataset.current) renderNav(nav.dataset.current);
    });
  }
  probeBackend().then(l => {
    if (l.connected) {
      subscribeShared();
      if (state.setup.complete) adoptActiveShared();
      refreshNamedAlertBanner();
    }
  });
  setInterval(() => {
    probeBackend().then(l => { if (l.connected) { subscribeShared(); refreshNamedAlertBanner(); } });
  }, 30000);
})();
