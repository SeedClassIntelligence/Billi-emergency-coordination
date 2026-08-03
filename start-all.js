#!/usr/bin/env node
/* ==========================================================================
   BILLI PLATFORM — ONE-COMMAND STARTUP
   --------------------------------------------------------------------------
   Launches all 13 backend microservices, then the HTTPS LAN server (serves
   web-app/ and proxies /api/* to the gateway — the only server a phone or
   browser needs to talk to). Ctrl+C stops everything cleanly.

   Usage:  node start-all.js        (or: npm start)
   ========================================================================== */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const ROOT = __dirname;

const SERVICES = [
  { name: 'gateway',                port: 8080 },
  { name: 'orchestration-engine',   port: 8081 },
  { name: 'communication-engine',   port: 8082 },
  { name: 'incident-timeline',      port: 8083 },
  { name: 'feedback-engine',        port: 8084 },
  { name: 'identity-service',       port: 8085 },
  { name: 'safety-protocol',        port: 8086 },
  { name: 'emergency-packet',       port: 8087 },
  { name: 'capability-registry',    port: 8088 },
  { name: 'context-engine',         port: 8089 },
  { name: 'telemetry-processor',    port: 8090 },
  { name: 'action-execution-engine', port: 8091 },
  { name: 'observability',          port: 8092 }
];

const COLORS = ['36', '35', '33', '32', '34', '31', '96', '95', '93', '92', '94', '91', '97'];
const children = [];

function log(name, colorCode, line) {
  const pad = name.padEnd(22, ' ');
  process.stdout.write(`\x1b[${colorCode}m[${pad}]\x1b[0m ${line}\n`);
}

function startService(svc, idx) {
  const cwd = path.join(ROOT, 'services', svc.name);
  const color = COLORS[idx % COLORS.length];
  const child = spawn('npx', ['ts-node-dev', '--transpile-only', 'src/index.ts'], {
    cwd, shell: true, env: { ...process.env, PORT: String(svc.port) }
  });
  child.stdout.on('data', (d) => d.toString().split('\n').filter(Boolean).forEach(l => log(svc.name, color, l)));
  child.stderr.on('data', (d) => d.toString().split('\n').filter(Boolean).forEach(l => log(svc.name, color, l)));
  child.on('exit', (code) => {
    if (code !== null && code !== 0) log(svc.name, '91', `exited with code ${code}`);
  });
  children.push(child);
}

function startHttpsServer() {
  const child = spawn('node', ['tools/https-server.js'], { cwd: ROOT, shell: true });
  child.stdout.on('data', (d) => d.toString().split('\n').filter(Boolean).forEach(l => log('https-server', '97', l)));
  child.stderr.on('data', (d) => d.toString().split('\n').filter(Boolean).forEach(l => log('https-server', '97', l)));
  children.push(child);
}

function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8080/api/v1/health/all', { timeout: 3000 }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function waitAndSummarize() {
  process.stdout.write('\n\x1b[1mWaiting for services to come up (13 concurrent TS compilations take a little while)...\x1b[0m\n');
  // Bounded but generous: ts-node-dev compiling 13 services at once under
  // shared CPU load is measurably slower than starting them one at a time.
  // Keep polling until every service reports in, not just until the
  // gateway itself answers — a partial roster printed too early is its own
  // kind of false report.
  let health = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    health = await checkHealth();
    if (health && health.connectedCount === health.total) break;
  }
  console.log('\n' + '='.repeat(70));
  if (health) {
    console.log(`\x1b[92m✓ BILLI PLATFORM READY — ${health.connectedCount}/${health.total} services connected\x1b[0m`);
    for (const [name, status] of Object.entries(health.services)) {
      const ok = status === 'CONNECTED';
      console.log(`  ${ok ? '\x1b[92m✓\x1b[0m' : '\x1b[91m✗\x1b[0m'} ${name.padEnd(24)} ${status}`);
    }
  } else {
    console.log('\x1b[93m⚠ Gateway did not respond in time — check the logs above for errors.\x1b[0m');
  }
  console.log('='.repeat(70));
  console.log('\n  Web app (HTTP, no mic/GPS):  http://localhost:8099/landing.html  (via preview tool)');
  console.log('  Web app (HTTPS, phone-ready): https://localhost:8443/landing.html');
  console.log('  Gateway API:                  http://localhost:8080');
  console.log('\n  Press Ctrl+C to stop everything.\n');
}

console.log('\x1b[1m\nBILLI PLATFORM — starting 13 services + HTTPS server...\x1b[0m\n');
SERVICES.forEach(startService);
startHttpsServer();
waitAndSummarize();

function shutdown() {
  console.log('\n\x1b[93mStopping all Billi services...\x1b[0m');
  children.forEach(c => { try { c.kill(); } catch (e) {} });
  setTimeout(() => process.exit(0), 500);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
