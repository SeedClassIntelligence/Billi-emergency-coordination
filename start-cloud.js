#!/usr/bin/env node
/* ==========================================================================
   BILLI PLATFORM — CLOUD RUN ENTRY POINT
   --------------------------------------------------------------------------
   Same architecture as start-all.js (all 13 services + one public-facing
   server in a single process tree) — the only difference is which
   public-facing server it spawns: tools/cloud-server.js (plain HTTP,
   listens on Cloud Run's $PORT) instead of tools/https-server.js (self-
   signed HTTPS, for local LAN phone testing only). Same local-file
   persistence, same everything else — this is deliberately NOT a rewrite.
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

const children = [];

function log(name, line) {
  process.stdout.write(`[${name.padEnd(22, ' ')}] ${line}\n`);
}

function startService(svc) {
  const cwd = path.join(ROOT, 'services', svc.name);
  const child = spawn('npx', ['ts-node-dev', '--transpile-only', 'src/index.ts'], {
    cwd, shell: true, env: { ...process.env, PORT: String(svc.port) }
  });
  child.stdout.on('data', (d) => d.toString().split('\n').filter(Boolean).forEach(l => log(svc.name, l)));
  child.stderr.on('data', (d) => d.toString().split('\n').filter(Boolean).forEach(l => log(svc.name, l)));
  child.on('exit', (code) => {
    if (code !== null && code !== 0) log(svc.name, `exited with code ${code}`);
  });
  children.push(child);
}

function startCloudServer() {
  // Inherits process.env as-is (including Cloud Run's real $PORT) — this is
  // the one process that must NOT get an overridden PORT the way the
  // internal services above do.
  const child = spawn('node', ['tools/cloud-server.js'], { cwd: ROOT, shell: true, env: process.env });
  child.stdout.on('data', (d) => d.toString().split('\n').filter(Boolean).forEach(l => log('cloud-server', l)));
  child.stderr.on('data', (d) => d.toString().split('\n').filter(Boolean).forEach(l => log('cloud-server', l)));
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
  console.log('Waiting for all 13 services to come up...');
  let health = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    health = await checkHealth();
    if (health && health.connectedCount === health.total) break;
  }
  if (health) {
    console.log(`✓ BILLI PLATFORM READY — ${health.connectedCount}/${health.total} services connected`);
  } else {
    console.log('⚠ Gateway did not respond in time — check the logs above for errors.');
  }
}

console.log('BILLI PLATFORM (Cloud Run) — starting 13 services + public server...');
SERVICES.forEach(startService);
startCloudServer();
waitAndSummarize();

function shutdown() {
  console.log('Stopping all Billi services...');
  children.forEach(c => { try { c.kill(); } catch (e) {} });
  setTimeout(() => process.exit(0), 500);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
