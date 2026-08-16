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
    entityType: 'My family',   // must match an option in onboarding's ENTITIES list
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
     SCENARIO PACKS (demonstration blueprint)

     Five packs, not nine. The earlier set had four "capability" scenarios
     (duress, signal loss, phone power-off, escalation ladder) with no
     person in them — they demonstrated a mechanism with nobody it was
     happening to. Each of those is now folded into a scenario about a real
     situation, so every pack answers the same five questions: who is alone,
     how it activated, what Billi did immediately, how the network
     coordinated, and how it ended. Nothing was dropped; `covers` names the
     capabilities each one now carries.

     Personas other than the Maya fixture exist ONLY inside demonstrations.

     `beats` is the guided tour: each beat moves the viewer to a real
     product page and points at the panel that is doing the thing being
     described. `at` is seconds since trigger. See demoGuide().
     --------------------------------------------------------------------- */
  const SCENARIO_PACKS = {
    1: {
      name: 'Scenario 01 — Working Alone: Rideshare Driver', trigger: 'safe_word',
      covers: 'Safe word · duress defense · coerced cancellation',
      effects: { duressAfter: 16 },
      persona: { name: 'Andre Whitfield', age: 36, facility: 'Driving — contract rideshare, night shift' },
      voice: { state: 'Enrolled', safeWords: ['Order confirmed'] },
      contract: { spokenMode: 'silent' },
      triggerOverride: { device: 'iPhone 15 Pro (dash mount)', method: 'Spoken safe word "Order confirmed"' },
      medical: { conditions: 'None documented', allergies: 'None documented', medications: '—', equipment: 'Dash camera (road + cabin)', physician: 'Dr. Salas — Eastside Family Medicine', instructions: 'DO NOT CALL HIS PHONE OPENLY — a passenger is in the vehicle with him. Grey 2019 Camry, plate 8LKW332. Dash cabin camera is recording.' },
      contacts: [
        { id: 'c_dana', name: 'Dana Whitfield', role: 'Primary Guardian', relationship: 'Wife', priority: 1, phone: '+1 (555) 240-6612', channels: ['Push', 'SMS', 'Call'], canAcknowledge: true, canResolve: true, medicalAccess: true, evidenceAccess: true, locationAccess: true, duressVisibility: true, availability: 'Available' },
        { id: 'c_nia', name: 'Nia Whitfield', role: 'Secondary Guardian', relationship: 'Sister', priority: 2, phone: '+1 (555) 240-9047', channels: ['SMS', 'Call'], canAcknowledge: true, canResolve: false, medicalAccess: false, evidenceAccess: true, locationAccess: true, duressVisibility: true, availability: 'Available' },
        { id: 'c_desk', name: 'Metro Non-Emergency Desk', role: 'Campus Safety', relationship: 'Police non-emergency line', priority: 3, phone: '+1 (555) 311-0000', channels: ['SMS'], canAcknowledge: true, canResolve: false, medicalAccess: false, evidenceAccess: false, locationAccess: true, duressVisibility: true, availability: '24/7' }
      ],
      path: [
        { lat: 37.7599, lng: -122.4148, speed: 24, label: 'On assigned route — Mission St southbound' },
        { lat: 37.7561, lng: -122.4102, speed: 31, label: 'Off assigned route — turned east, not the drop-off' },
        { lat: 37.7514, lng: -122.4031, speed: 38, label: 'Continuing away from destination — Bayshore' },
        { lat: 37.7466, lng: -122.3968, speed: 12, label: 'Slowing — industrial frontage road, no through traffic' }
      ],
      transcripts: [
        'Trip audio. Two occupants. Driver and one rear passenger.',
        'Passenger: "Change of plan. Keep driving. Don\'t stop."',
        'Andre: "Order confirmed." (enrolled safe phrase — spoken naturally, no reaction from passenger)',
        'Passenger: "Who are you talking to? Put the phone down. Cancel it."',
        '[Screen shows cancellation. Recording continues.]'
      ],
      preEvents: [
        { dt: -40, actor: 'Rideshare App', label: 'Trip in progress — one passenger, destination 19th & Valencia' },
        { dt: -8, actor: 'Billi', label: 'ROUTE DEVIATION — vehicle heading away from the destination for 8 minutes' },
        { dt: 0, actor: 'iPhone 15 Pro (dash mount)', label: 'Phrase matched: "Order confirmed" (enrolled voiceprint verified) — no outward change on screen' }
      ],
      beats: [
        { at: 0, page: 'protected.html', focus: 'core', title: "Andre's phone, from the outside", watch: 'Nothing on this screen tells the passenger anything. Location, audio evidence and the Trusted Network all started the moment the phrase matched.' },
        { at: 15, page: 'incident.html', focus: 'situation', title: 'He was forced to cancel', watch: 'His screen now shows a believable "Emergency cancelled". Guardians see this red duress banner instead. Location and audio never stopped.' },
        { at: 26, page: 'incident.html', focus: 'network', title: 'Who was reached, and who moved', watch: 'Everyone was alerted at once. The medical note tells them not to call his phone — because calling it would tell the passenger.' },
        { at: 36, page: 'incident.html', focus: 'ai', title: 'Gemini reads the live incident', watch: 'A written summary, then a structured read of the evidence audio — risk level, category, and whether the distress looks genuine.' },
        { at: 48, page: 'incident.html', focus: 'timeline', title: 'The record', watch: 'Append-only. Route deviation, safe word, coerced cancellation, every response — this is what the 911-ready packet is built from.' }
      ]
    },
    2: {
      name: 'Scenario 02 — Protect a Child', trigger: 'safe_word',
      covers: 'Safe word · geofence context · the full 45-second escalation ladder',
      /* Nobody acknowledges for 48 seconds, so the escalation ladder runs all
         the way out on camera — the capability the old standalone "Scenario 09"
         demonstrated with no person attached to it. */
      effects: { autoAckAfter: 48 },
      preEvents: [
        { dt: -30, actor: 'Billi Geofence Engine', label: 'SAFE ZONE EXIT — left "Pine Middle School" boundary during school hours' },
        { dt: 0, actor: 'Ray-Ban Meta Glasses', label: 'Phrase matched: "Blue Folder" (enrolled voiceprint verified) — silent activation, no outward change' }
      ],
      beats: [
        { at: 0, page: 'protected.html', focus: 'core', title: "Maya's phone — she said a phrase", watch: 'No button, no screen she had to unlock and look at. Location, audio evidence and the Trusted Network all started on the words alone. Her account keeps spoken reassurance on, so Billi answers her out loud.' },
        { at: 13, page: 'incident.html', focus: 'escalation', title: 'Nobody has acknowledged yet', watch: 'Deliberately unacknowledged. Watch the ladder fire at T-30, T-15 and T-0 — each stage widens the circle instead of waiting on the first person.' },
        { at: 30, page: 'incident.html', focus: 'ai', title: 'Gemini reads the live incident', watch: 'Written summary, then a structured read of the evidence audio — risk level, category, and whether the distress looks genuine.' },
        { at: 52, page: 'incident.html', focus: 'network', title: 'The ladder worked', watch: 'The response matrix shows who was reached at each rung, and who finally moved.' },
        { at: 66, page: 'incident.html', focus: 'timeline', title: 'The record', watch: 'Append-only. Safe-zone exit, safe word, every escalation rung and every response — this is what the 911-ready packet is built from.' }
      ]
    },
    3: {
      name: 'Scenario 03 — Help After a Fall', trigger: 'fall',
      covers: 'Sensor-inferred trigger · 10-second safe-fail window · medical dossier',
      /* A fall is inferred, not declared — so this demo runs the real
         confirmation window instead of skipping it the way demos normally do.
         Robert does not answer, and silence escalates. */
      effects: { confirmWindow: true },
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
      ],
      beats: [
        { at: 0, page: 'protected.html', focus: 'confirm', title: 'A fall is a guess, so Billi asks first', watch: 'A phone in a bag can read as a fall. Nothing has gone to his family yet — but location and audio are already recording either way. Ten seconds.' },
        { at: 12, page: 'protected.html', focus: 'core', title: 'Silence escalates. It never cancels.', watch: 'Robert never answered, so Billi treated it as real and alerted the network. A deliberate trigger — hold-to-SOS, safe word — never waits at all.' },
        { at: 26, page: 'incident.html', focus: 'network', title: 'Daughter, neighbor, nurse line', watch: 'All alerted together, in one incident. The neighbor with the spare key matters more than the ambulance in the first two minutes.' },
        { at: 38, page: 'incident.html', focus: 'ai', title: 'Gemini reads the live incident', watch: 'It has the medical dossier — hypertension, prior fall, penicillin allergy — and reasons about the silence after the impact, not just the impact.' },
        { at: 50, page: 'incident.html', focus: 'timeline', title: 'The record', watch: 'Append-only, including the unanswered confirmation window itself — a responder can see exactly how the decision was made.' }
      ]
    },
    4: {
      name: 'Scenario 04 — Vehicle Crash on a Delivery Route', trigger: 'crash',
      covers: 'Automatic activation · signal-loss failover · protection tier',
      /* Rural dead zone mid-incident: the old standalone "Scenario 07" made
         this a demo about a tunnel with nobody in it. It belongs here. */
      effects: { degradeAfter: 20, degradeMode: 'cellLost' },
      persona: { name: 'David Reyes', age: 41, facility: 'Independent contract courier — box truck, I-80 corridor' },
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
      ],
      beats: [
        { at: 0, page: 'protected.html', focus: 'core', title: 'Nobody tapped anything', watch: 'David is unconscious. The vehicle reported the impact and Billi activated on its own — location, audio, and the Trusted Network, all without a human hand.' },
        { at: 13, page: 'incident.html', focus: 'network', title: 'Wife, brother, roadside desk', watch: 'One incident, everyone in it. His insulin pump and glucose kit are on the medical card a responder can actually read.' },
        { at: 25, page: 'incident.html', focus: 'situation', title: 'The signal just died', watch: 'Rural dead zone. Comm path switched to nearby-relay and the protection tier dropped — honestly, on screen, instead of the map quietly freezing.' },
        { at: 36, page: 'incident.html', focus: 'ai', title: 'Gemini reads the live incident', watch: 'It has the impact data, the airbag signal, the silence from the driver seat and the voice outside the vehicle — and weighs them together.' },
        { at: 48, page: 'incident.html', focus: 'timeline', title: 'The record', watch: 'Append-only, including the moment the network degraded — a responder can see what was known and when.' }
      ]
    },
    5: {
      name: 'Scenario 05 — Silent Call for Help on Campus', trigger: 'tag',
      covers: 'Silent activation · tactile trigger · phone power-off fallback',
      /* The phone goes dark mid-incident and the watch + tag carry it — the
         old standalone "Scenario 08", now happening to someone. */
      effects: { degradeAfter: 22, degradeMode: 'phoneOff' },
      contract: { spokenMode: 'silent' },
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
      preEvents: [{ dt: 0, actor: 'Billi Smart Tag', label: 'SILENT activation — device shows neutral screen, no spoken output, haptic-only confirmation' }],
      beats: [
        { at: 0, page: 'protected.html', focus: 'core', title: 'A squeeze in a pocket', watch: 'No screen, no sound, no spoken reassurance — silent mode was configured in advance, so nothing about this is visible to whoever is near her.' },
        { at: 13, page: 'incident.html', focus: 'network', title: 'Mother and campus officer together', watch: 'Both alerted at once. Her medical card carries one instruction that matters more than any of the rest: do not call her device openly.' },
        { at: 27, page: 'incident.html', focus: 'situation', title: 'Her phone just went dark', watch: 'Battery dead, or taken. The watch and smart tag keep the incident alive — degraded, and labeled as degraded, rather than simply ending.' },
        { at: 38, page: 'incident.html', focus: 'ai', title: 'Gemini reads the live incident', watch: 'Raised voices, closing footsteps, a silent activation and a phone going offline — it weighs the pattern, and states it as interpretation, not fact.' },
        { at: 50, page: 'incident.html', focus: 'timeline', title: 'The record', watch: 'Append-only, including the device handover — this is what the 911-ready packet is built from.' }
      ]
    },
    6: {
      name: 'Scenario 06 — Long Haul: Alone in the Sleeper Cab', trigger: 'wearable',
      covers: 'Deliberate wearable trigger · medical dossier for strangers · 911-ready packet handoff',
      /* The only scenario where the person who reaches him first has never
         met him and never will again. That is what the packet is for, and
         no other scenario makes the handoff the point. */
      persona: { name: 'Ray Delgado', age: 52, facility: 'Owner-operator — sleeper cab, 340 miles from home' },
      medical: {
        conditions: 'Coronary artery disease · stent placed 2023',
        allergies: 'Sulfa drugs',
        medications: 'Metoprolol 50 mg · aspirin 81 mg · nitroglycerin spray',
        equipment: 'Nitroglycerin spray — center console, driver side',
        physician: 'Dr. Whitaker — Cardiology Associates, +1 (555) 774-2200',
        instructions: 'CHEST PAIN PROTOCOL. Nitroglycerin spray is in the center console, driver side. The cab is locked — spare key is in a magnetic box inside the rear driver-side wheel well. DOT medical card is in the driver door pocket. Truck: white Freightliner Cascadia, unit 4471, Kettle Ridge Logistics.'
      },
      contacts: [
        { id: 'c_maria', name: 'Maria Delgado', role: 'Primary Guardian', relationship: 'Wife', priority: 1, phone: '+1 (555) 662-1180', channels: ['Push', 'SMS', 'Call'], canAcknowledge: true, canResolve: true, medicalAccess: true, evidenceAccess: true, locationAccess: true, duressVisibility: true, availability: 'Asleep — 2:14 a.m. her time' },
        { id: 'c_dispatch', name: 'Kettle Ridge Dispatch', role: 'Caregiver', relationship: '24/7 dispatcher — knows his route and unit number', priority: 2, phone: '+1 (555) 880-4400', channels: ['SMS', 'Call'], canAcknowledge: true, canResolve: false, medicalAccess: true, evidenceAccess: false, locationAccess: true, duressVisibility: false, availability: 'On shift' },
        { id: 'c_stop', name: 'Petro Stop 42 — Night Manager', role: 'Caregiver', relationship: 'Nearest person on scene — ~200 ft away, has never met him', priority: 3, phone: '+1 (555) 903-7788', channels: ['Call'], canAcknowledge: true, canResolve: false, medicalAccess: true, evidenceAccess: false, locationAccess: true, duressVisibility: false, availability: 'Overnight shift' }
      ],
      path: [{ lat: 38.9717, lng: -95.2353, speed: 0, label: 'Parked — Petro Stop 42, row C, I-70 Exit 204' }],
      transcripts: [
        'Cab interior. Engine off. Reefer unit running outside.',
        'Labored breathing. Movement against the bunk.',
        'Ray: "…can\'t… get a breath…"',
        'No further speech. Breathing continues, shallow.'
      ],
      preEvents: [
        { dt: -2820, actor: 'Kettle Ridge Dispatch', label: 'Hours-of-service break started — unit 4471 stationary at Exit 204' },
        { dt: -180, actor: 'Apple Watch Ultra 2', label: 'Elevated heart rate sustained 3 minutes — 128 bpm at rest (context only, not a trigger)' },
        { dt: 0, actor: 'Apple Watch Ultra 2', label: 'DOUBLE-TAP GESTURE — deliberate activation, no phone interaction required' }
      ],
      beats: [
        { at: 0, page: 'protected.html', focus: 'core', title: 'Two taps on a watch', watch: 'He never reached his phone. A deliberate gesture fires instantly — no confirmation window, because he chose it. Location, audio and the Trusted Network go at once.' },
        { at: 13, page: 'incident.html', focus: 'medical', title: 'Written for a stranger', watch: 'Nitro spray in the center console. The cab is locked and the spare key is in the wheel well. Nobody within 300 miles knows any of that — which is the entire reason it is written down before the emergency, not during it.' },
        { at: 26, page: 'incident.html', focus: 'network', title: 'His wife, his dispatcher, and the nearest human', watch: 'Work and family on one account. Dispatch knows the unit number and the row he parked in; the night manager is 200 feet away and has never met him. All three reached together.' },
        { at: 38, page: 'incident.html', focus: 'ai', title: 'Gemini reads the live incident', watch: 'A stationary truck, a sustained heart rate, laboured breathing and speech that stops — it weighs them together and says what it thinks, labelled as interpretation.' },
        { at: 50, page: 'incident.html', focus: 'actions', title: 'The handoff', watch: 'Export 911-Ready Packet builds the CAD-format handoff — identity, exact location, medical protocol, evidence, full timeline. There is no live 911 integration: a person still makes the call and reads it out. We would rather say that than imply otherwise.' }
      ]
    }
  };

  /* Fallback tour for a pack that defines no beats of its own. */
  const DEFAULT_BEATS = [
    { at: 0, page: 'protected.html', focus: 'core', title: 'The protected person\'s phone', watch: 'One trigger — location, audio evidence, photo evidence and the Trusted Network all fire at once.' },
    { at: 13, page: 'incident.html', focus: 'network', title: 'One shared incident', watch: 'Who was alerted and who acknowledged — the same live record on every device.' },
    { at: 26, page: 'incident.html', focus: 'ai', title: 'Gemini reads the live incident', watch: 'A written summary, then a structured read of the evidence audio.' },
    { at: 40, page: 'incident.html', focus: 'timeline', title: 'The record', watch: 'Append-only — this is what the 911-ready packet is built from.' }
  ];

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
  /* ------------------------ SAFE-ZONE BREACH DETECTION ------------------
     Zones carried lat/lng/radius and were drawn on a map, but nothing ever
     computed whether the protected person was inside one — "geofence" existed
     only as a trigger label a test button could fire by hand. This is the
     real evaluation.

     HONEST SCOPE: this runs while Billi is open on the device. A web page
     cannot watch location after it is closed, so this is not an OS-level
     background geofence and must not be described as one.
     ---------------------------------------------------------------------- */

  const EARTH_RADIUS_M = 6371000;

  /* Haversine great-circle distance in metres. */
  function zoneDistanceMeters(lat1, lng1, lat2, lng2) {
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* Classify a fix against every active zone.

     The accuracy band is the safety-critical part. A fix 105m from the centre
     of a 100m zone, accurate to only 50m, does NOT prove an exit — the person
     could be well inside. Calling that a breach would wake a family at 2am
     because GPS drifted. So:
       distance + accuracy <= radius  -> INSIDE  (certainly within)
       distance - accuracy >  radius  -> OUTSIDE (certainly beyond)
       otherwise                      -> UNCERTAIN, previous state is kept
     Silence on an uncertain fix is correct here: a genuine exit keeps
     producing fixes and resolves to OUTSIDE within seconds as accuracy
     improves or distance grows. */
  function evaluateZones(lat, lng, accuracyMeters, zones) {
    const acc = Number.isFinite(accuracyMeters) ? Math.max(0, accuracyMeters) : 0;
    const list = (zones || state.zones || []).filter(z => z.active !== false);
    return list.map(z => {
      const distance = Math.round(zoneDistanceMeters(lat, lng, z.lat, z.lng));
      let presence = 'UNCERTAIN';
      if (distance + acc <= z.radius) presence = 'INSIDE';
      else if (distance - acc > z.radius) presence = 'OUTSIDE';
      return { id: z.id, name: z.name, radius: z.radius, distance, accuracy: acc, presence };
    });
  }

  /* Per-zone presence memory. A breach is a TRANSITION (was inside, now
     certainly outside), never merely "currently outside" — otherwise simply
     opening Billi away from home would fire an emergency. */
  const zonePresence = Object.create(null);

  function detectZoneBreaches(evaluations) {
    const breaches = [];
    evaluations.forEach(e => {
      const was = zonePresence[e.id];
      if (e.presence === 'UNCERTAIN') return;      // hold previous state
      if (was === 'INSIDE' && e.presence === 'OUTSIDE') breaches.push(e);
      zonePresence[e.id] = e.presence;
    });
    return breaches;
  }

  function resetZonePresence() {
    Object.keys(zonePresence).forEach(k => delete zonePresence[k]);
  }

  /* Called for every location fix while armed. Returns the breach it acted
     on, or null. Fires the pre-existing 'geofence' trigger, which is already
     classified as PASSIVE — so it opens the 10-second confirmation window
     rather than notifying the Trusted Network instantly. A phone in a
     backpack riding past a zone edge gets those ten seconds to be wrong. */
  function onZoneFix(lat, lng, accuracyMeters) {
    if (!state.armed || state.isDemo || state.isViewingOther) return null;
    if (getActiveIncident()) return null;             // already handling one
    const breaches = detectZoneBreaches(evaluateZones(lat, lng, accuracyMeters));
    if (!breaches.length) return null;
    const b = breaches[0];
    audit('Billi', 'SAFE_ZONE_EXIT',
      `Left ${b.name} — ${b.distance} m from centre (zone radius ${b.radius} m, fix accurate to ${b.accuracy} m).`);
    const inc = triggerIncident('geofence');
    if (inc) inc.zoneBreach = b;
    save();
    return b;
  }

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
    /* Demos fire live instantly by default — an evaluator should not sit
       through a confirmation window they did not ask to see. The one
       exception is a scenario whose whole point IS the safe-fail window
       (opts.confirmWindow), which runs the real thing rather than
       describing it. */
    const needsConfirm = PASSIVE_TRIGGERS.has(triggerKey) &&
      (opts.confirmWindow || (!state.isDemo && !opts.scenario));
    const now = Date.now();
    const inc = {
      id: `BIL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      correlationId: uid('cor'),
      triggeredAt: now,
      confirmedAt: needsConfirm ? null : now,
      confirmWindowMs: CONFIRM_WINDOW_MS,
      triggerKey,
      /* A scenario may name its own device/phrasing (a driver's dash-mounted
         phone, not the fixture's glasses). It has to be applied HERE, before
         the incident is shared to the gateway — mergeShared() Object.assigns
         the gateway's copy back over the local one, so anything overridden
         after sharing gets silently reverted a second later. */
      triggerDevice: (opts.triggerOverride && opts.triggerOverride.device) || trig.device,
      triggerMethod: (opts.triggerOverride && opts.triggerOverride.method) || trig.method,
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
        ? 'Primary phone offline. Fallback: Apple Watch Ultra 2 + Billi Smart Tag telemetry. Protection degraded.'
        : 'Cellular signal lost. Communication path changed: CELLULAR → BLE NEARBY-RELAY. Last confirmed location preserved.';
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
      /* ackAt is per-scenario (see runDemo). Every later stage keeps its
         original spacing relative to it, so the default 8s schedule is
         still exactly 8 / 15 / 30 / 40. */
      const ackAt = t0 + (inc.autoAckAfterMs || 8000);
      if (!has('GUARDIAN_ACKNOWLEDGED') && now >= ackAt) {
        acts.push({ t: ackAt, actor: lead, type: 'GUARDIAN_ACKNOWLEDGED', details: 'Acknowledged — responding now. ETA 3 minutes.' });
        save();
      }
      if (!has('RESPONDER_STATUS') && now >= ackAt + 7000) {
        acts.push({ t: ackAt + 7000, actor: lead, type: 'RESPONDER_STATUS', details: 'Responding — ETA 3 min' });
        save();
      }
      if (!has('INCIDENT_STABILIZED') && now >= ackAt + 22000) {
        acts.push({ t: ackAt + 22000, actor: lead, type: 'INCIDENT_STABILIZED', details: 'Situation stabilized — protected person in guardian contact.' });
        save();
      }
      if (now >= ackAt + 32000 && state.activeIncidentId === inc.id) {
        resolveIncident(lead, 'Reunited safely — demo scenario complete.', 'Protected person confirmed safe');
      }
    }

    /* Communication path + protection tier (legacy 5-tier model). */
    const commPath = degraded
      ? (inc.degradeMode === 'phoneOff' ? 'WATCH + SMART TAG FALLBACK' : 'BLE NEARBY-RELAY')
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

    /* Real outbound SMS - fires exactly once per incident, only for a
       genuine trigger, never a demo (inc.scenario is set exclusively by
       runDemo() - a demo must never text a real phone number). Fires the
       moment the network leg reaches SENT (elN>=3), matching the
       alertState ladder below. Lazy-applied like the scenario effects
       elsewhere in this function so it survives reloads and fires on
       whichever render tick crosses the threshold.

       Two real transports, tried in this order per contact:
       1. window.BilliNative.sendSms - the native Android app (mobile-native/),
          free, sends through the phone's own SIM. Synchronous.
       2. Gateway -> communication-engine -> Twilio fallback - the only real
          option for anyone without that app, which is everyone on iOS
          (Apple permits no third-party app to send SMS without a manual
          tap, wrapped or not) and any browser-only session. Async,
          real per-message cost, requires TWILIO_* env vars to be
          configured - see .env.example. Fire-and-forget from here since
          incidentView() itself is synchronous; the resulting act lands
          on whatever render tick comes after the promise resolves, same
          pattern as this app's other async backend calls. */
    if (!pending && !inc.scenario && elN >= 3 && !inc.realSmsSentAt) {
      inc.realSmsSentAt = now;
      const who = (state.protectedPerson && state.protectedPerson.name) || 'A Billi user';
      const coords = loc ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : 'location acquiring';
      const msg = `Billi Emergency Alert: ${who} has triggered an SOS. Location: ${coords}. Open Billi for live updates.`;
      const hasNative = typeof window !== 'undefined' && window.BilliNative && window.BilliNative.sendSms;
      (state.contacts.length ? state.contacts : FIXTURE.contacts).forEach(c => {
        if (c.notifyEnabled === false || !c.channels || c.channels.indexOf('SMS') === -1 || !c.phone) return;
        if (hasNative) {
          let sent = false, err = null;
          try { sent = window.BilliNative.sendSms(c.phone, msg); } catch (e) { err = e.message; }
          acts.push({
            t: now, actor: 'Communication Engine', type: 'REAL_SMS_SENT', contactId: c.id,
            details: sent ? `Real SMS dispatched to ${c.name} (${c.phone}) via the phone's own SIM`
                           : `SMS not sent to ${c.name}${err ? ' - ' + err : ' - SEND_SMS permission not granted'}`
          });
        } else {
          // Not gfetch(): that helper collapses any non-2xx response to
          // null, which would hide the honest, specific reason (e.g.
          // "not configured" vs. an actual Twilio failure) the gateway
          // deliberately preserves for this exact route - same reasoning
          // as the gateway's own passthrough instead of fetchService().
          const ctl = new AbortController();
          const timer = setTimeout(() => ctl.abort(), 10000);
          fetch(`${GATEWAY}/api/v1/sms/send`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: c.phone, message: msg }), signal: ctl.signal
          }).then(r => r.json()).then(result => {
            clearTimeout(timer);
            const activeInc = getActiveIncident();
            if (!activeInc || activeInc.id !== inc.id) return; // incident resolved/changed by the time this resolved
            activeInc.actions = activeInc.actions || [];
            activeInc.actions.push({
              t: Date.now(), actor: 'Communication Engine', type: 'REAL_SMS_SENT', contactId: c.id,
              details: result && result.sent ? `Real SMS dispatched to ${c.name} (${c.phone}) via Twilio`
                                              : `SMS not sent to ${c.name} - ${(result && result.error) || 'unknown error'}`
            });
            save();
          }).catch(e => {
            clearTimeout(timer);
            const activeInc = getActiveIncident();
            if (!activeInc || activeInc.id !== inc.id) return;
            activeInc.actions = activeInc.actions || [];
            activeInc.actions.push({
              t: Date.now(), actor: 'Communication Engine', type: 'REAL_SMS_SENT', contactId: c.id,
              details: `SMS not sent to ${c.name} - gateway unreachable (${e.message})`
            });
            save();
          });
        }
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
       15s→ campus responder · 0s→ emergency-services escalation.
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
      { at: 30, label: 'Secondary guardian escalation', fired: stageReached(15000) },
      { at: 15, label: `Responder escalation — ${p3name} notified`, fired: stageReached(30000) },
      { at: 0,  label: 'Emergency-services escalation recommended', fired: !acked && stageReached(45000) }
    ];
    const escalated = !acked && now > escalationDue;
    const escalation = {
      windowSeconds: 45, remaining, stages,
      acknowledged: !!acked, escalated,
      label: acked
        ? `Escalation halted at T-${Math.max(0, Math.ceil((escalationDue - ackAt) / 1000))}s — guardian acknowledged inside the response window.`
        : escalated
          ? 'Full escalation ladder fired — emergency-services contact recommended.'
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
    if (!pending && elN >= 3) events.push({ t: inc.confirmedAt + 3000, actor: 'Notification Engine', label: 'Trusted Network alerts dispatched by priority' });
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
      'BILLI 911-READY EMERGENCY PACKET',
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
    { href: 'protected.html', label: 'SOS' },   // this is where YOU trigger; "Protected Person" is our word, not a user's
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

  /* ---------------------------------------------------------------------
     GUIDED DEMO TOUR

     A demo runs inside the real product, not beside it: the same
     protected.html and Guardian Command Center a paying account uses, with
     a bar along the bottom saying which panel is doing the thing being
     described right now. It moves the viewer between real pages on the
     scenario's own schedule and highlights the panel each beat is about
     (elements marked data-beat="..." in the page).

     Kept in sessionStorage, not module scope, because a beat change often
     IS a page navigation — module state would not survive it.
     --------------------------------------------------------------------- */
  const GUIDE_BEAT_KEY = 'billi_demo_beat';   // manual "Next" position
  const GUIDE_NAV_KEY = 'billi_demo_nav';     // last beat we navigated for
  let guideTimer = null;
  let guideFocused = null;
  let guidePage = '';

  function demoBeatsFor(inc) {
    const pack = SCENARIO_PACKS[inc.demoPackId];
    return (pack && pack.beats && pack.beats.length) ? pack.beats : DEFAULT_BEATS;
  }

  function sessionNum(key) {
    const raw = sessionStorage.getItem(key);
    const n = raw === null ? -1 : parseInt(raw, 10);
    return isNaN(n) ? -1 : n;
  }

  /* Start the guide on a page. Idempotent — safe to call on every render. */
  function demoGuide(page) {
    if (guideTimer) clearInterval(guideTimer);
    guidePage = page;
    const tick = () => renderGuide(page);
    tick();
    guideTimer = setInterval(tick, 1000);
  }

  function guideHost() {
    let el = document.getElementById('billi-demo-guide');
    if (!el) {
      el = document.createElement('div');
      el.id = 'billi-demo-guide';
      el.className = 'demo-guide';
      document.body.appendChild(el);
    }
    return el;
  }

  function renderGuide(page) {
    const inc = getActiveIncident() || (state.incidents && state.incidents[0]);
    const on = state.isDemo && inc && inc.scenario;
    const host = document.getElementById('billi-demo-guide');
    if (!on) {
      if (host) host.remove();
      document.body.classList.remove('has-demo-guide');
      return;
    }
    const el = guideHost();
    document.body.classList.add('has-demo-guide');

    const beats = demoBeatsFor(inc);
    const elapsed = (Date.now() - inc.triggeredAt) / 1000;
    let autoIdx = 0;
    beats.forEach((b, i) => { if (elapsed >= b.at) autoIdx = i; });
    /* "Next" can run ahead of the clock, never behind it — the incident is
       genuinely progressing in real time underneath, so rewinding would
       point at a panel that has already moved on. */
    const idx = Math.max(autoIdx, Math.min(sessionNum(GUIDE_BEAT_KEY), beats.length - 1));
    const beat = beats[idx];
    const done = !!inc.resolved && idx >= beats.length - 1;

    /* Move to the page this beat lives on — but only once per beat, so a
       viewer who navigates somewhere themselves is not dragged back. */
    if (beat.page && beat.page !== page && sessionNum(GUIDE_NAV_KEY) !== idx) {
      sessionStorage.setItem(GUIDE_NAV_KEY, String(idx));
      location.href = beat.page;
      return;
    }
    sessionStorage.setItem(GUIDE_NAV_KEY, String(idx));

    /* Highlight the panel this beat is about. The pages re-render wholesale
       every couple of seconds, so the class has to be re-applied every tick;
       the scroll only happens when the target actually changes. */
    const target = beat.focus ? document.querySelector(`[data-beat="${beat.focus}"]`) : null;
    if (target) {
      document.querySelectorAll('.beat-focus').forEach(n => { if (n !== target) n.classList.remove('beat-focus'); });
      target.classList.add('beat-focus');
      const key = `${idx}:${beat.focus}`;
      if (guideFocused !== key) {
        guideFocused = key;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const pack = SCENARIO_PACKS[inc.demoPackId] || {};
    el.innerHTML = `
      <div class="demo-guide-inner">
        <div class="demo-guide-head">
          <span class="demo-guide-scenario">${inc.scenario || 'Demonstration'}</span>
          <span class="demo-guide-dots">${beats.map((b, i) =>
            `<span class="demo-guide-dot ${i < idx ? 'done' : i === idx ? 'current' : ''}" title="${b.title}"></span>`).join('')}</span>
          <span class="demo-guide-count">${idx + 1} / ${beats.length}</span>
        </div>
        <div class="demo-guide-body">
          <div>
            <div class="demo-guide-title">${done ? 'Demonstration complete' : beat.title}</div>
            <div class="demo-guide-watch">${done
              ? `${pack.covers ? pack.covers + '. ' : ''}Everything above ran on the real engine — the same screens a paying account uses.`
              : beat.watch}</div>
          </div>
          <div class="demo-guide-actions">
            ${done
              ? `<button class="btn btn-secondary demo-guide-btn" onclick="Billi.runDemo(${inc.demoPackId || 1})">↻ Replay</button>
                 <button class="btn btn-primary demo-guide-btn" onclick="location.href='landing.html#demos-section'">← All scenarios</button>`
              : `<button class="btn btn-secondary demo-guide-btn" onclick="Billi.exitDemo()">✕ Exit demo</button>
                 <button class="btn btn-primary demo-guide-btn" ${idx >= beats.length - 1 ? 'disabled style="opacity:0.45;"' : ''} onclick="Billi.demoNextBeat()">Next →</button>`}
          </div>
        </div>
      </div>`;
  }

  function demoNextBeat() {
    const inc = getActiveIncident() || (state.incidents && state.incidents[0]);
    if (!inc) return;
    const beats = demoBeatsFor(inc);
    const elapsed = (Date.now() - inc.triggeredAt) / 1000;
    let autoIdx = 0;
    beats.forEach((b, i) => { if (elapsed >= b.at) autoIdx = i; });
    const cur = Math.max(autoIdx, Math.min(sessionNum(GUIDE_BEAT_KEY), beats.length - 1));
    sessionStorage.setItem(GUIDE_BEAT_KEY, String(Math.min(cur + 1, beats.length - 1)));
    renderGuide(guidePage);
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
      <button id="billi-fb-toggle" title="Send feedback" style="position:fixed;bottom:18px;right:18px;z-index:9999;height:44px;padding:0 16px 0 14px;border-radius:22px;background:#6366f1;color:#fff;border:none;font-size:0.8rem;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.35);display:flex;align-items:center;gap:0.4rem;white-space:nowrap;">💬 Feedback</button>
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
    /* One click from the sign-in screen to a fully populated setup, for
       walking someone through the product on a clock. Same as createAccount()
       plus the fixture, so the recording never shows anyone typing a name
       into a form. */
    createAccountPrefilled() {
      localStorage.removeItem(BACKUP_KEY);
      state = blankState();
      state.session.authed = true;
      applyFixturePrefill();
      state.setup.step = 1;
      save();
      location.href = 'onboarding.html';
    },

    /* `who` carries the answer the landing page already asked for ("Just me",
       "Me and my family", "My team") straight into onboarding step 1, so the
       question is asked once rather than twice. Anything unrecognised is
       ignored and step 1 simply starts unanswered. */
    createAccount(who) {
      localStorage.removeItem(BACKUP_KEY); // explicit fresh start discards any prior account too
      state = blankState();
      state.session.authed = true;
      const PICKS = { 'just-me': 'Just me', 'me-and-family': 'Me and my family', 'my-team': 'My team' };
      const picked = PICKS[who] || PICKS[new URLSearchParams(location.search).get('who')];
      if (picked) { state.entityType = picked; state.setup.step = 2; }
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
      sessionStorage.removeItem(GUIDE_BEAT_KEY);
      sessionStorage.removeItem(GUIDE_NAV_KEY);
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

    /* Evaluator demonstrations: each pack proves a distinct outcome —
       persona, activation gate, telemetry, and network included. Demos are
       sandboxed: they never permanently overwrite a real account.

       A demo lands on the REAL product screens (protected.html, then the
       Guardian Command Center) with the guide bar narrating it — not on a
       separate summary page that describes the product from outside it. */
    runDemo(id) {
      const pack = SCENARIO_PACKS[id] || SCENARIO_PACKS[1];
      backupRealAccountIfNeeded();
      state = blankState();
      state.isDemo = true;
      state.session.authed = true;
      applyFixturePrefill();
      if (pack.persona) state.protectedPerson = { ...pack.persona };
      if (pack.medical) state.medical = { ...state.medical, ...pack.medical };
      if (pack.voice) state.voice = { ...state.voice, ...pack.voice };
      /* A scenario that describes a covert activation has to actually BE
         covert — the fixture's default spokenMode is 'reassurance', which
         speaks aloud, and a demo narrating "nothing tells the passenger
         anything" over an audible announcement would be describing
         something the product wasn't doing. */
      if (pack.contract) state.contract = { ...state.contract, ...pack.contract };
      if (pack.contacts) {
        state.contacts = pack.contacts.map(c => ({ ...c }));
        const p1 = state.contacts.find(c => c.priority === 1);
        if (p1) state.owner = { name: p1.name, role: p1.role, relationship: p1.relationship, phone: p1.phone };
      }
      state.setup.complete = true;
      state.armed = true;
      audit('Evaluator', 'DEMO_LAUNCHED', `Demonstration started: ${pack.name}`);
      const fx = pack.effects || {};
      const inc = triggerIncident(pack.trigger, {
        scenario: pack.name,
        confirmWindow: !!fx.confirmWindow,
        triggerOverride: pack.triggerOverride
      });
      inc.demoPackId = id;
      if (pack.path) inc.path = pack.path;
      if (pack.transcripts) inc.transcripts = pack.transcripts;
      if (pack.preEvents) inc.preEvents = pack.preEvents;
      if (fx.duressAfter) inc.autoDuressAt = inc.triggeredAt + fx.duressAfter * 1000;
      if (fx.degradeAfter) { inc.degradeAt = inc.triggeredAt + fx.degradeAfter * 1000; inc.degradeMode = fx.degradeMode || 'cellLost'; }
      /* When the guardian stand-in acknowledges. Default 8s; a scenario that
         is specifically about the escalation ladder pushes it out past 45s so
         the ladder actually runs. Everything downstream keeps its relative
         spacing off this moment. */
      inc.autoAckAfterMs = (fx.autoAckAfter || 8) * 1000;
      sessionStorage.removeItem(GUIDE_BEAT_KEY);
      sessionStorage.removeItem(GUIDE_NAV_KEY);
      save();
      location.href = (pack.beats && pack.beats[0] && pack.beats[0].page) || 'protected.html';
    },

    applyFixturePrefill, readiness, activatePlatform,
    triggerIncident, getActiveIncident, incidentView, recordAction,
    enterDuress, cancelWithoutPin, resolveIncident, buildPacket,
    confirmEmergency, dismissFalseAlarm,
    renderNav, requireSetup, mountFeedback,
    demoGuide, demoNextBeat,
    get scenarioPacks() { return SCENARIO_PACKS; },
    get link() { return link; },
    probeBackend, fetchRemoteCad,
    subscribeShared, adoptActiveShared, pushTelemetry,
    infoTip, toggleTip,
    checkNamedAlerts, viewNamedAlert,
    zoneDistanceMeters, evaluateZones, detectZoneBreaches, resetZonePresence, onZoneFix,
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

  /* Safe-zone monitoring, wired here rather than on one page so it stays
     armed wherever the guardian happens to be in the app — a zone exit does
     not wait for someone to be looking at protected.html.

     Every location fix, whatever produced it, is evaluated. During an
     incident the high-accuracy watch feeds this too, which is harmless:
     onZoneFix() returns early once an incident is open.

     LIMITATION, stated rather than hidden: a browser cannot watch location
     after its page is closed, so this covers "Billi is open" and not
     OS-level background geofencing. The Android app keeps it alive while
     the app is foregrounded. True background monitoring needs a native
     service and is not built. */
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('billi:adapter', (e) => {
      const evt = e && e.detail;
      if (!evt || evt.event_type !== 'LOCATION_UPDATED') return;
      const d = evt.data || evt;
      if (!Number.isFinite(d.latitude) || !Number.isFinite(d.longitude)) return;
      try { onZoneFix(d.latitude, d.longitude, d.accuracy_meters); } catch (err) { /* never break the page on a bad fix */ }
    });

    /* Start watching once the account is armed and has at least one zone.
       No zones means nothing to breach, so no reason to hold GPS open. */
    setTimeout(() => {
      if (!state.armed || state.isDemo || state.isViewingOther) return;
      if (!(state.zones || []).some(z => z.active !== false)) return;
      if (window.BilliAdapters && BilliAdapters.Location.armZoneWatch) {
        BilliAdapters.Location.armZoneWatch();
      }
    }, 1200);
  }
})();
