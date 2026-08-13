const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadBilli } = require('./harness');

let Billi;
beforeEach(() => {
  Billi = loadBilli(); // fresh sandbox + fresh blank state per test — no cross-test leakage
});

/* Minimal setup so triggerIncident()/readiness() have something to work
   with, without going through the full onboarding UI flow. */
function minimalAccount() {
  Billi.state.session.authed = true;
  Billi.state.setup.complete = true;
  Billi.state.owner = { name: 'Test Owner', role: 'Primary Guardian', relationship: '', phone: '+1 555 000 0000' };
  Billi.state.protectedPerson = { name: 'Test Person', age: 10 };
  Billi.state.contacts = [{ id: 'c1', name: 'Contact One', priority: 1, notifyEnabled: true }];
  Billi.state.contract = { gps: true, audio: true, notifyNetwork: true };
  Billi.save();
}

describe('readiness()', () => {
  test('required items block activation on a blank account, optional ones never do', () => {
    const items = Billi.readiness();
    const required = items.filter((i) => i.required);
    const optional = items.filter((i) => !i.required);
    assert.ok(required.length >= 4, 'expected at least the 4 known required items');
    assert.ok(optional.length >= 1, 'expected at least one optional item');
    assert.ok(required.every((i) => i.ok === false), 'blank account should fail every required item');
  });

  test('required items pass once the essentials exist, independent of optional items', () => {
    minimalAccount();
    Billi.state.contract.gps = true;
    Billi.save();
    // Safety Contract "authorized" and "permissions reviewed" required items are
    // satisfied by the same minimal contract set above.
    const items = Billi.readiness();
    const required = items.filter((i) => i.required);
    assert.ok(required.every((i) => i.ok), `expected all required items ok, got: ${JSON.stringify(required)}`);
  });
});

describe('duress / cancellation safety', () => {
  test('cancelWithoutPin resolves an active incident when no PIN was ever configured', () => {
    minimalAccount();
    Billi.state.pins = { normal: null, duress: null };
    Billi.save();
    Billi.triggerIncident('sos_hold');
    assert.ok(Billi.getActiveIncident(), 'incident should be active immediately for a deliberate trigger');
    const res = Billi.cancelWithoutPin();
    assert.equal(res.ok, true);
    assert.equal(Billi.getActiveIncident(), null, 'incident should be resolved after cancelWithoutPin');
  });

  test('enterDuress with the normal PIN resolves the incident as a safe cancellation', () => {
    minimalAccount();
    Billi.state.pins = { normal: '1234', duress: '9999' };
    Billi.save();
    Billi.triggerIncident('sos_hold');
    const res = Billi.enterDuress('1234');
    assert.equal(res.ok, true);
    assert.equal(res.mode, 'normal');
    assert.equal(Billi.getActiveIncident(), null);
  });

  test('enterDuress with the duress PIN keeps the incident ACTIVE and flags duress — this must never resolve it', () => {
    minimalAccount();
    Billi.state.pins = { normal: '1234', duress: '9999' };
    Billi.save();
    Billi.triggerIncident('sos_hold');
    const res = Billi.enterDuress('9999');
    assert.equal(res.ok, true);
    assert.equal(res.mode, 'duress');
    const active = Billi.getActiveIncident();
    assert.ok(active, 'duress PIN must NOT resolve the incident — that is the entire point of a duress PIN');
    assert.equal(active.duress, true);
  });

  test('enterDuress with a wrong PIN neither resolves nor confirms duress', () => {
    minimalAccount();
    Billi.state.pins = { normal: '1234', duress: '9999' };
    Billi.save();
    Billi.triggerIncident('sos_hold');
    const res = Billi.enterDuress('0000');
    assert.equal(res.ok, false);
    assert.ok(Billi.getActiveIncident(), 'incident must remain active on a wrong PIN');
  });
});

describe('accidental-trigger safe-fail (passive vs. deliberate triggers)', () => {
  test('a deliberate trigger (hold-to-SOS) is confirmed immediately — no confirmation window', () => {
    minimalAccount();
    const inc = Billi.triggerIncident('sos_hold');
    assert.ok(inc.confirmedAt, 'deliberate triggers must never enter a pending state');
    const view = Billi.incidentView(inc);
    assert.equal(view.pendingConfirmation, false);
  });

  test('a passive trigger (fall) opens a pending confirmation window and does NOT immediately notify', () => {
    minimalAccount();
    const inc = Billi.triggerIncident('fall');
    assert.equal(inc.confirmedAt, null, 'passive triggers must start unconfirmed');
    const view = Billi.incidentView(inc);
    assert.equal(view.pendingConfirmation, true);
    assert.equal(view.core.network, 'AWAITING CONFIRMATION');
  });

  test('confirmEmergency() on a pending passive trigger proceeds exactly like a real incident', () => {
    minimalAccount();
    const inc = Billi.triggerIncident('fall');
    Billi.confirmEmergency();
    const active = Billi.getActiveIncident();
    assert.ok(active.confirmedAt, 'confirmEmergency must set confirmedAt');
    assert.equal(Billi.incidentView(active).pendingConfirmation, false);
  });

  test('dismissFalseAlarm() on a still-pending trigger resolves it with no PIN required', () => {
    minimalAccount();
    Billi.state.pins = { normal: null, duress: null }; // deliberately no PIN configured
    Billi.save();
    Billi.triggerIncident('fall');
    const res = Billi.dismissFalseAlarm();
    assert.equal(res.ok, true);
    assert.equal(Billi.getActiveIncident(), null);
  });

  test('dismissFalseAlarm() fails safe once the window has already been confirmed — it must never silently pretend to cancel a live incident', () => {
    minimalAccount();
    Billi.triggerIncident('fall');
    Billi.confirmEmergency(); // simulates either an explicit confirm or the window auto-expiring
    const res = Billi.dismissFalseAlarm();
    assert.equal(res.ok, false, 'dismissFalseAlarm must refuse once the incident is confirmed/live');
    assert.ok(Billi.getActiveIncident(), 'the now-live incident must still be active, not silently resolved');
  });

  test('only fall/crash/geofence/acoustic are passive — every other trigger type confirms immediately', () => {
    const deliberate = ['sos_hold', 'safe_word', 'tag', 'accessibility', 'wearable'];
    for (const key of deliberate) {
      minimalAccount();
      const inc = Billi.triggerIncident(key);
      assert.ok(inc.confirmedAt, `${key} should confirm immediately (deliberate trigger)`);
      Billi.cancelWithoutPin(); // reset for next iteration
    }
  });
});

/* Safe-zone breach detection. This logic decides whether to wake a family in
   the middle of the night, so both directions matter equally: a real exit must
   fire, and GPS jitter must not. Testable without hardware — the maths takes
   coordinates, not a device. */
describe('safe-zone exit-breach detection', () => {
  const SCHOOL = { id: 'z_school', name: 'Pine Middle School', lat: 37.7753, lng: -122.4201, radius: 100, active: true };

  function zonedAccount() {
    minimalAccount();
    Billi.state.armed = true;
    Billi.state.zones = [{ ...SCHOOL }];
    Billi.save();
    Billi.resetZonePresence();
  }

  test('Haversine distance is accurate against a known separation', () => {
    // Pine Middle School -> Grandma Clara's, from the platform fixtures.
    const d = Billi.zoneDistanceMeters(37.7753, -122.4201, 37.7792, -122.4208);
    assert.ok(d > 400 && d < 460, `expected ~435 m, got ${Math.round(d)} m`);
    assert.equal(Math.round(Billi.zoneDistanceMeters(37.7753, -122.4201, 37.7753, -122.4201)), 0);
  });

  test('a confident fix inside the radius reads INSIDE, a confident fix well beyond reads OUTSIDE', () => {
    zonedAccount();
    assert.equal(Billi.evaluateZones(37.7753, -122.4201, 5)[0].presence, 'INSIDE');
    assert.equal(Billi.evaluateZones(37.7792, -122.4208, 5)[0].presence, 'OUTSIDE');
  });

  test('a fix near the boundary with poor accuracy is UNCERTAIN, never a breach', () => {
    zonedAccount();
    // ~105 m out but accurate only to 50 m: the person may still be inside.
    const e = Billi.evaluateZones(37.77625, -122.4201, 50)[0];
    assert.equal(e.presence, 'UNCERTAIN', `expected UNCERTAIN, got ${e.presence} at ${e.distance} m`);
    assert.equal(Billi.detectZoneBreaches([e]).length, 0, 'an uncertain fix must never count as a breach');
  });

  test('a breach requires a transition — being outside from the very first fix does not fire', () => {
    zonedAccount();
    assert.equal(Billi.onZoneFix(37.7792, -122.4208, 5), null,
      'opening Billi already away from a zone must not trigger an emergency');
    assert.ok(!Billi.getActiveIncident(), 'no incident should exist');
  });

  test('inside then confidently outside fires a geofence incident with the breach recorded', () => {
    zonedAccount();
    Billi.onZoneFix(37.7753, -122.4201, 5);          // establish presence: inside
    const breach = Billi.onZoneFix(37.7792, -122.4208, 5); // leave
    assert.ok(breach, 'a genuine inside -> outside transition must fire');
    assert.equal(breach.name, SCHOOL.name);
    const inc = Billi.getActiveIncident();
    assert.ok(inc, 'a breach must open an incident');
    assert.equal(inc.zoneBreach.id, SCHOOL.id, 'the incident should record which zone was left');
  });

  test('a geofence breach is PASSIVE — it opens the confirmation window instead of notifying instantly', () => {
    zonedAccount();
    Billi.onZoneFix(37.7753, -122.4201, 5);
    Billi.onZoneFix(37.7792, -122.4208, 5);
    const inc = Billi.getActiveIncident();
    assert.equal(inc.confirmedAt, null, 'a sensor-inferred breach must not confirm instantly');
    assert.ok(inc.confirmWindowMs > 0, 'the accidental-trigger window must apply to geofence exits');
  });

  test('jitter across the boundary does not re-fire once an incident is already open', () => {
    zonedAccount();
    Billi.onZoneFix(37.7753, -122.4201, 5);
    Billi.onZoneFix(37.7792, -122.4208, 5);
    const firstId = Billi.getActiveIncident().id;
    assert.equal(Billi.onZoneFix(37.7753, -122.4201, 5), null, 'must not act while an incident is open');
    assert.equal(Billi.onZoneFix(37.7792, -122.4208, 5), null);
    assert.equal(Billi.getActiveIncident().id, firstId, 'no second incident may be created');
  });

  test('demo runs and unarmed accounts never fire a real geofence emergency', () => {
    zonedAccount();
    Billi.state.armed = false; Billi.save();
    Billi.onZoneFix(37.7753, -122.4201, 5);
    assert.equal(Billi.onZoneFix(37.7792, -122.4208, 5), null, 'unarmed must not fire');

    zonedAccount();
    Billi.state.isDemo = true; Billi.save();
    Billi.onZoneFix(37.7753, -122.4201, 5);
    assert.equal(Billi.onZoneFix(37.7792, -122.4208, 5), null, 'demo mode must not fire a real emergency');
  });

  test('inactive zones are ignored entirely', () => {
    zonedAccount();
    Billi.state.zones = [{ ...SCHOOL, active: false }];
    Billi.save();
    assert.equal(Billi.evaluateZones(37.7792, -122.4208, 5).length, 0);
  });
});

/* ------------------------------------------------------------------------
   SCENARIO PACKS + GUIDED DEMO TOUR

   Five packs replaced nine, with the four person-less capability demos
   folded into scenarios about real situations. These lock in the parts that
   are easy to break silently: that every pack still carries a guided tour,
   that a demo can never be mistaken for a real incident by the code paths
   that gate on that, and that the one scenario built around the safe-fail
   window genuinely runs it instead of describing it.
   ------------------------------------------------------------------------ */
describe('scenario packs and the guided demo tour', () => {
  const packs = () => Billi.scenarioPacks;

  test('there are exactly six packs, each with a name, trigger and guided tour', () => {
    const ids = Object.keys(packs());
    assert.deepEqual(ids, ['1', '2', '3', '4', '5', '6']);
    for (const id of ids) {
      const p = packs()[id];
      assert.ok(p.name, `pack ${id} needs a name`);
      assert.ok(p.trigger, `pack ${id} needs a trigger`);
      assert.ok(Array.isArray(p.beats) && p.beats.length >= 4, `pack ${id} needs a guided tour`);
      assert.ok(p.covers, `pack ${id} must state which capabilities it proves`);
    }
  });

  test('every beat points at a real page and starts on the protected person', () => {
    const PAGES = new Set(['protected.html', 'incident.html']);
    for (const [id, p] of Object.entries(packs())) {
      assert.equal(p.beats[0].page, 'protected.html', `pack ${id} must open on the protected person's screen`);
      let last = -1;
      for (const b of p.beats) {
        assert.ok(PAGES.has(b.page), `pack ${id} beat points at unknown page ${b.page}`);
        assert.ok(b.title && b.watch, `pack ${id} beat needs a title and a what-to-watch line`);
        assert.ok(b.at > last, `pack ${id} beats must be in ascending time order`);
        last = b.at;
      }
    }
  });

  test('a demo tags the incident as a scenario — the flag every real-world guard checks', () => {
    Billi.runDemo(1);
    const inc = Billi.getActiveIncident();
    assert.ok(inc.scenario, 'no scenario tag means real SMS and auto-progress guards would misfire');
    assert.equal(Billi.state.isDemo, true);
    assert.equal(inc.demoPackId, 1);
  });

  test('a pack may rename the trigger, and the rename survives being shared', () => {
    // The override must be applied inside triggerIncident, before the incident
    // is pushed to the gateway — mergeShared() assigns the gateway's copy back
    // over the local one, so a later override is silently reverted.
    Billi.runDemo(1);
    const inc = Billi.getActiveIncident();
    assert.match(inc.triggerMethod, /Order confirmed/);
    assert.match(inc.triggerDevice, /dash mount/);
  });

  test('every beat focus names a panel that some page actually anchors', () => {
    /* A typo here fails silently in the browser: the guide bar renders, the
       beat reads fine, and nothing scrolls or highlights. These are the
       data-beat anchors present in protected.html and incident.html. */
    const ANCHORS = new Set(['core', 'confirm', 'situation', 'map', 'escalation',
      'ai', 'network', 'evidence', 'timeline', 'medical', 'actions']);
    for (const [id, p] of Object.entries(packs())) {
      for (const b of p.beats) {
        assert.ok(ANCHORS.has(b.focus), `pack ${id} points at unknown anchor "${b.focus}"`);
      }
    }
  });

  test('a scenario that narrates a covert activation actually runs silently', () => {
    for (const id of [1, 5]) {
      Billi.runDemo(id);
      assert.equal(Billi.state.contract.spokenMode, 'silent',
        `pack ${id} describes a covert activation, so it must not speak aloud`);
    }
  });

  test('only the safe-fail scenario opens a confirmation window; other demos fire instantly', () => {
    Billi.runDemo(3); // fall — effects.confirmWindow
    let inc = Billi.getActiveIncident();
    assert.equal(inc.confirmedAt, null, 'the safe-fail scenario must run the real window');
    assert.equal(Billi.incidentView(inc).pendingConfirmation, true);

    Billi.runDemo(4); // crash — also a passive trigger, but no confirmWindow effect
    inc = Billi.getActiveIncident();
    assert.ok(inc.confirmedAt, 'a demo without the effect must not sit in a window');
  });

  test('the acknowledgement clock is per-scenario, so the escalation ladder can run out', () => {
    Billi.runDemo(2); // holds acknowledgement past the 45s ladder
    assert.equal(Billi.getActiveIncident().autoAckAfterMs, 48000);
    Billi.runDemo(1); // default
    assert.equal(Billi.getActiveIncident().autoAckAfterMs, 8000);
  });
});
