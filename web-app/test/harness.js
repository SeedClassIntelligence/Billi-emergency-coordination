/* Minimal browser-global shim so billi-core.js — written to be loaded via a
   plain <script> tag, deliberately with no build step or bundler — can also
   run under Node's built-in test runner. No jsdom, no test framework
   dependency: this project's whole point is "no build step," and the test
   suite shouldn't be the one place that breaks that.

   billi-core.js's own bootstrap (probeBackend() etc.) fires real fetch calls
   the instant the script loads. `fetch` here always rejects immediately, so
   every one of those calls hits the app's own already-built "backend
   unreachable" fallback path — the same LOCAL MODE behavior a real offline
   browser session would see. That's intentional: it's what makes testing the
   deterministic core logic in isolation possible at all. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeLocalStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

function loadBilli() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'billi-core.js'), 'utf8');
  const sandbox = {
    localStorage: makeLocalStorage(),
    /* The guided demo tour keeps its position here rather than in module
       scope, because advancing a beat is often a page navigation. */
    sessionStorage: makeLocalStorage(),
    document: {
      getElementById: () => null,
      addEventListener: () => {},
      dispatchEvent: () => true,
      visibilityState: 'visible'
    },
    location: { protocol: 'http:', href: '' },
    navigator: { onLine: true, connection: null },
    window: {},
    fetch: () => Promise.reject(new Error('network disabled in test harness')),
    AbortController: global.AbortController,
    EventSource: function () { this.addEventListener = () => {}; this.close = () => {}; },
    CustomEvent: function (name, opts) { this.type = name; this.detail = opts && opts.detail; },
    setInterval: () => 0,
    clearInterval: () => {},
    setTimeout,
    clearTimeout,
    console
  };
  sandbox.window.location = sandbox.location;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'billi-core.js' });
  return sandbox.window.Billi;
}

module.exports = { loadBilli };
