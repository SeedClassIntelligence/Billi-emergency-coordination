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
