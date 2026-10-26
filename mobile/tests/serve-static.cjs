// Minimal dependency-free static server for Playwright's webServer, serving Expo's web export (`dist/`).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const port = Number(process.argv[3] || 4310);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function send(res, status, data, contentType) {
  res.writeHead(status, { 'Content-Type': contentType || 'text/plain' });
  res.end(data);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const requestedPath = urlPath.replace(/^[/\\]+/, '');
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const candidates = [path.join(root, safePath)];
  if (urlPath.endsWith('/')) candidates.push(path.join(root, safePath, 'index.html'));
  candidates.push(path.join(root, `${safePath}.html`));

  const hit = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!hit) return send(res, 404, 'Not found');
  const ext = path.extname(hit);
  fs.readFile(hit, (err, data) => {
    if (err) return send(res, 500, 'Server error');
    send(res, 200, data, MIME[ext] || 'application/octet-stream');
  });
});

server.listen(port, () => {
  process.stdout.write(`serving ${root} on http://localhost:${port}\n`);
});
