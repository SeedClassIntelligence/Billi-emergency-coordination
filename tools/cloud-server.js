/* ==========================================================================
   BILLI CLOUD SERVER — Cloud Run entry point
   --------------------------------------------------------------------------
   Same job as tools/https-server.js (static-serve web-app/ + same-origin
   proxy of /api/* and /health to the internal gateway), but plain HTTP and
   listening on whatever port the platform assigns via $PORT — Cloud Run
   terminates real HTTPS at its own edge, so this container never needs the
   self-signed cert that's only for local LAN phone testing.
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8099;
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
    res.end(JSON.stringify({ error: 'gateway unreachable through cloud proxy' }));
  });
  req.pipe(up);
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/landing.html';
  const filePath = path.normalize(path.join(WEB_ROOT, urlPath));
  if (!filePath.startsWith(WEB_ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api/') || req.url === '/health') return proxyToGateway(req, res);
  return serveStatic(req, res);
}).listen(PORT, '0.0.0.0', () => {
  console.log(`[BILLI-CLOUD] Serving web-app/ on http://0.0.0.0:${PORT}`);
  console.log(`[BILLI-CLOUD] Proxying /api/* -> http://${GATEWAY_HOST}:${GATEWAY_PORT}`);
});
