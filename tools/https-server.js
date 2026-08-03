/* ==========================================================================
   BILLI HTTPS LAN SERVER — physical-phone capability testing
   --------------------------------------------------------------------------
   Real phones require a secure context for microphone and geolocation.
   This server provides:
     1. HTTPS static serving of web-app/ (self-signed cert in tools/certs)
     2. Same-origin proxy of /api/* and /health to the gateway (:8080),
        including SSE streaming — so pages served over HTTPS reach the
        backend without mixed-content or CORS issues.

   Run:   node tools/https-server.js       (listens on 0.0.0.0:8443)
   Phone: https://<LAN-IP>:8443  → accept the self-signed cert warning.
   ========================================================================== */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8443;
const WEB_ROOT = path.join(__dirname, '..', 'web-app');
const GATEWAY_HOST = '127.0.0.1';
const GATEWAY_PORT = 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};

const tls = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'billi-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'billi-cert.pem'))
};

function proxyToGateway(req, res) {
  const opts = {
    host: GATEWAY_HOST, port: GATEWAY_PORT,
    path: req.url, method: req.method,
    headers: { ...req.headers, host: `${GATEWAY_HOST}:${GATEWAY_PORT}` }
  };
  const up = http.request(opts, (upRes) => {
    res.writeHead(upRes.statusCode || 502, upRes.headers);
    upRes.pipe(res); // streams SSE frames through unchanged
  });
  up.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'gateway unreachable through HTTPS proxy' }));
  });
  req.pipe(up);
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(WEB_ROOT, urlPath));
  if (!filePath.startsWith(WEB_ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

https.createServer(tls, (req, res) => {
  if (req.url.startsWith('/api/') || req.url === '/health') return proxyToGateway(req, res);
  return serveStatic(req, res);
}).listen(PORT, '0.0.0.0', () => {
  console.log(`[BILLI-HTTPS] Serving web-app/ on https://0.0.0.0:${PORT}`);
  console.log(`[BILLI-HTTPS] Proxying /api/* -> http://${GATEWAY_HOST}:${GATEWAY_PORT}`);
  const os = require('os');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const n of nets[name] || []) {
      if (n.family === 'IPv4' && !n.internal) {
        console.log(`[BILLI-HTTPS] Phone URL: https://${n.address}:${PORT}/protected.html`);
      }
    }
  }
});
