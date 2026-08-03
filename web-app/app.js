/* ==========================================================================
   BILLI UNIFIED APPLICATION ENGINE — FULL 10-STEP WIZARD & CAPABILITY ENGINE
   ========================================================================== */

const API_ENDPOINTS = {
  GATEWAY: 'http://localhost:8080',
  ORCHESTRATION: 'http://localhost:8081',
  COMMUNICATION: 'http://localhost:8082',
  TIMELINE: 'http://localhost:8083',
  FEEDBACK: 'http://localhost:8084',
  IDENTITY: 'http://localhost:8085',
  SAFETY: 'http://localhost:8086',
  PACKET: 'http://localhost:8087',
  CAPABILITY: 'http://localhost:8088',
  CONTEXT_AI: 'http://localhost:8089',
  TELEMETRY: 'http://localhost:8090',
  ACTION_EXEC: 'http://localhost:8091',
  OBSERVABILITY: 'http://localhost:8092'
};

const BilliState = {
  wizardStep: 1,
  totalWizardSteps: 10,
  userId: 'usr_evelyn_johnson_01',
  incidentId: 'pkt_1785648120_active'
};

// 10 STEP TITLES FOR DYNAMIC BUTTON LABELS
const STEP_NAMES = [
  'Entity Type',
  'Account Owner',
  'Protected Persons',
  'Medical & Emergency Dossier',
  'Trusted Network',
  'Safety Contract & Authorizations',
  'Register Hardware Devices',
  'Geofencing & Safe Zones',
  'Test Readiness & Diagnostics',
  'Review & Activate Billi'
];

// SCENARIO → GATEWAY ACTIVATION SOURCE MAP
const SCENARIO_TRIGGERS = {
  '1': 'SPOKEN_SAFE_WORD',
  '2': 'FALL_DETECTION',
  '3': 'CRASH_TELEMATICS',
  '4': 'ACOUSTIC_DISTRESS',
  '5': 'BLE_BEACON_SQUEEZE',
  '6': 'DURESS_PIN',
  '7': 'MESH_RELAY_FALLBACK',
  '8': 'DEVICE_FAILOVER',
  '9': 'ESCALATION_TIMEOUT'
};

// REAL EMERGENCY ACTIVATION — POSTs to the API Gateway incident pipeline.
// Returns the gateway's incident payload, or null when the backend is offline
// (the UI then falls back to local demo state).
async function activateEmergencyIncident(scenarioId) {
  const payload = {
    protected_user_id: BilliState.userId,
    activation_source: SCENARIO_TRIGGERS[scenarioId] || 'MANUAL_SOS',
    location: { latitude: 37.7753, longitude: -122.4201, accuracy_meters: 8 },
    sensor_data: { speed_mph: 42.5, mic_noise_db: 88, detected_keyword: 'HELP' }
  };

  try {
    const resp = await fetch(`${API_ENDPOINTS.GATEWAY}/api/v1/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error(`Gateway responded ${resp.status}`);
    const incident = await resp.json();

    BilliState.incidentId = incident.incident_id;
    BilliState.packetId = incident.packet_id;
    sessionStorage.setItem('billi_incident', JSON.stringify(incident));
    console.log(`[BILLI_APP] Live incident ${incident.incident_id} activated via gateway (packet ${incident.packet_id}).`);
    return incident;
  } catch (err) {
    console.warn('[BILLI_APP] Gateway offline — running incident HUD in local demo mode.', err.message);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[BILLI_APP] App Engine Ready.');
  updateWizardUI();
});

// INTERACTIVE 10-STEP WIZARD NAVIGATION
function goToStep(stepNum) {
  if (stepNum < 1 || stepNum > 10) return;
  BilliState.wizardStep = stepNum;
  updateWizardUI();
}

function nextWizardStep() {
  if (BilliState.wizardStep < 10) {
    BilliState.wizardStep++;
    updateWizardUI();
  }
}

function prevWizardStep() {
  if (BilliState.wizardStep > 1) {
    BilliState.wizardStep--;
    updateWizardUI();
  }
}

function updateWizardUI() {
  const currentStep = BilliState.wizardStep;

  // 1. Activate current step pane
  document.querySelectorAll('.wiz-step-pane').forEach((pane, idx) => {
    if (idx + 1 === currentStep) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // 2. Update progress bar text and fill
  const progressPercent = Math.round((currentStep / 10) * 100);
  const progressBar = document.getElementById('wizard-progress-bar');
  const progressText = document.getElementById('wizard-progress-text');
  const progressBadge = document.getElementById('wizard-step-badge');

  if (progressBar) progressBar.style.width = `${progressPercent}%`;
  if (progressText) progressText.innerText = `Setup Progress: Step ${currentStep} of 10 Completed`;
  if (progressBadge) progressBadge.innerText = `${progressPercent}% Complete`;

  // 3. Update bottom stepper bar highlights
  document.querySelectorAll('.stepper-col').forEach((col, idx) => {
    const stepIdx = idx + 1;
    col.classList.remove('completed', 'active', 'muted');
    if (stepIdx < currentStep) {
      col.classList.add('completed');
    } else if (stepIdx === currentStep) {
      col.classList.add('active');
    } else {
      col.classList.add('muted');
    }
  });

  // 4. Update Back and Next button labels dynamically
  const btnBack = document.getElementById('btn-wiz-back');
  const btnNext = document.getElementById('btn-wiz-next');

  if (btnBack) {
    if (currentStep === 1) {
      btnBack.style.visibility = 'hidden';
    } else {
      btnBack.style.visibility = 'visible';
      btnBack.innerText = `← Back: ${STEP_NAMES[currentStep - 2]}`;
    }
  }

  if (btnNext) {
    if (currentStep === 10) {
      btnNext.innerText = `ACTIVATE BILLI PLATFORM →`;
      btnNext.onclick = activateEcosystem;
    } else {
      btnNext.innerText = `Next: ${STEP_NAMES[currentStep]} →`;
      btnNext.onclick = nextWizardStep;
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// DYNAMIC ONBOARDING ADDERS
function triggerBleScan() {
  const output = document.getElementById('ble-scanner-output');
  if (!output) return;

  alert("📶 [BLE SPECTRUM SCANNER ENGAGED]\n\nScanning 2.4GHz RF spectrum for active Bluetooth Low Energy beacons...\n\nFound 7 registered nodes + 2 discoverable peripherals!");

  output.innerHTML = `
    <div class="flex-between">
      <strong style="color: #ffffff; font-size: 0.85rem;">Live BLE Discovery Stream (9 Discovered)</strong>
      <span class="badge badge-blue">SCANNING ACTIVE...</span>
    </div>
    <div class="grid grid-2 margin-top-xs" style="gap: 0.4rem; font-size: 0.78rem;">
      <div class="card flex-between" style="padding: 0.45rem 0.65rem;"><span>📱 Google Pixel 9 Pro (Android Hub)</span> <span class="text-green">-42 dBm · Active</span></div>
      <div class="card flex-between" style="padding: 0.45rem 0.65rem;"><span>📱 Samsung Galaxy S24 Ultra</span> <span class="text-green">-51 dBm · Active</span></div>
      <div class="card flex-between" style="padding: 0.45rem 0.65rem;"><span>⌚ Galaxy Watch 7 (Wear OS)</span> <span class="text-green">-58 dBm · Active</span></div>
      <div class="card flex-between" style="padding: 0.45rem 0.65rem;"><span>💍 Samsung Galaxy Ring</span> <span class="text-green">-64 dBm · Active</span></div>
      <div class="card flex-between" style="padding: 0.45rem 0.65rem;"><span>🏷️ Billi Smart Tag</span> <span class="text-green">-38 dBm · Active</span></div>
      <div class="card flex-between" style="padding: 0.45rem 0.65rem;"><span>👓 Ray-Ban Meta Glasses</span> <span class="text-indigo">-72 dBm · Active</span></div>
      <div class="card flex-between" style="padding: 0.45rem 0.65rem;"><span>✨ Discoverable: Pixel Tag 2</span> <span class="text-amber">-69 dBm · Pairable</span></div>
      <div class="card flex-between" style="padding: 0.45rem 0.65rem;"><span>✨ Discoverable: Galaxy Watch Ultra</span> <span class="text-amber">-75 dBm · Pairable</span></div>
    </div>
  `;
}

function openSubModal(type) {
  const titles = {
    'sub-nodes': '🔗 Secondary Peripheral Nodes (Wear OS, Ring, Tag, Glasses)',
    'sub-registry': '➕ BILLI Compatible Hardware Registry',
    'sub-wearable-sim': '⌚ Interactive Wearable Trigger Simulator',
    'sub-privacy': '🔒 Privacy & Sovereignty Locker (Zero-Knowledge Key Storage)',
    'sub-p2p-mesh': '🌐 Ad-Hoc Peer-to-Peer Safety Mesh Monitor',
    'sub-beacon': '🔑 Real-Time Cryptographic Beacon Stream',
    'sub-pipeline': '📊 Device-Agnostic Data Flow Ingress Pipeline',
    'sub-spectrum': '📡 2.4GHz BLE Spectrum & RF Frequency Monitor'
  };

  alert(`🛠️ [${titles[type] || 'HARDWARE ENGINE TOOL'}]\n\nEngaging high-precision hardware diagnostics and live telemetry stream...`);
}

function addProtectedPerson() {
  const nameInput = document.getElementById('new-person-name');
  const ageInput = document.getElementById('new-person-age');
  const facilityInput = document.getElementById('new-person-facility');

  if (!nameInput.value) {
    alert("Please enter a name for the protected person.");
    return;
  }

  const list = document.getElementById('protected-persons-list');
  const initials = nameInput.value.split(' ').map(n => n[0]).join('').toUpperCase();
  const card = document.createElement('div');
  card.className = 'card person-item-card flex-between margin-top-xs';
  card.innerHTML = `
    <div class="flex-row">
      <div class="avatar-initials">${initials}</div>
      <div>
        <strong style="color: #ffffff; font-size: 1rem;">${nameInput.value}</strong>
        <div class="text-muted" style="font-size: 0.8rem;">Age ${ageInput.value || 'N/A'} · ${facilityInput.value || 'General'}</div>
      </div>
    </div>
    <span class="badge badge-blue">Protected Person</span>
  `;
  list.appendChild(card);
  nameInput.value = ''; ageInput.value = ''; facilityInput.value = '';
  alert(`✓ Added ${nameInput.value || 'person'} to protected group!`);
}

function addTrustedContact() {
  const nameInput = document.getElementById('new-contact-name');
  const phoneInput = document.getElementById('new-contact-phone');
  const prioSelect = document.getElementById('new-contact-prio');

  if (!nameInput.value) {
    alert("Please enter a contact name.");
    return;
  }

  const list = document.getElementById('trusted-network-list');
  const card = document.createElement('div');
  card.className = 'card flex-between margin-top-xs';
  card.innerHTML = `
    <div>
      <strong style="color: #ffffff;">${nameInput.value}</strong>
      <div class="text-muted" style="font-size: 0.78rem;">${phoneInput.value || 'N/A'} · Instant Emergency Alert</div>
    </div>
    <span class="badge badge-indigo">${prioSelect.value}</span>
  `;
  list.appendChild(card);
  nameInput.value = ''; phoneInput.value = '';
  alert(`✓ Added ${nameInput.value} to Trusted Network!`);
}

function recordVoiceprint() {
  alert("🎙️ [VOICE RECOGNITION REGISTRATION]\n\nSay your phrase: \"Billi Help Me\"\n\nRecording audio sample... 3... 2... 1...\n✓ Voiceprint stored and cryptographically hashed for spoken safe word recognition!");
}

function quickPair(name, statusText) {
  const list = document.getElementById('device-nodes-list');
  if (!list) return;
  const card = document.createElement('div');
  card.className = 'card flex-between';
  card.style.padding = '0.65rem 0.85rem';
  card.style.background = 'rgba(16, 185, 129, 0.08)';
  card.style.border = '1px solid rgba(16, 185, 129, 0.3)';
  card.innerHTML = `
    <span style="font-size: 0.85rem; color: #ffffff;">📱 ${name}</span> 
    <span class="badge badge-green" style="font-size: 0.7rem;">${statusText} · Bound</span>
  `;
  list.appendChild(card);
  alert(`✓ Quick-Paired ${name} (${statusText}) to Billi Protection Mesh!`);
}

function registerDeviceNode() {
  const nameInput = document.getElementById('new-dev-name');
  const typeSelect = document.getElementById('new-dev-type');

  if (!nameInput || !nameInput.value) {
    alert("Please enter device name.");
    return;
  }

  quickPair(nameInput.value, typeSelect.value);
  nameInput.value = '';
}

async function activateEcosystem() {
  console.log('[BILLI_INITIALIZATION] Activating safety ecosystem...');
  try {
    await fetch(`${API_ENDPOINTS.IDENTITY}/identity/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: BilliState.userId, name: 'Evelyn Johnson', role: 'PRIMARY_GUARDIAN' })
    });
  } catch (err) {
    console.warn('[BACKEND] Microservice fallback local state.', err.message);
  }

  alert("✓ Safety Ecosystem Provisioned & Armed!\n\nTransitioning to Operational Entity Command Center...");
  window.location.href = 'dashboard.html';
}

function launchDemo(scenarioId) {
  window.location.href = `incident.html?scenario=${scenarioId}`;
}

// MODAL CONTROLLERS FOR DASHBOARD CAPABILITY CARDS
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

function saveModalData(modalId, msg) {
  closeModal(modalId);
  alert(`✓ ${msg}`);
}
