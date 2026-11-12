const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.vtt': 'text/vtt; charset=utf-8' };
const publicFiles = new Set(['/index.html', '/project.html', '/about.html', '/styles.css', '/portfolio.css', '/script.js', '/portfolio.js', '/data/site.js', '/data/projects.js']);
function createServer() {
  return http.createServer((req, res) => {
    let name;
    try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end('Bad request'); return; }
    if (name === '/') name = '/index.html';
    const ext = path.extname(name).toLowerCase();
    const safePath = !name.includes('\\') && !name.includes('\0') && !name.split('/').some(segment => segment === '..' || segment.startsWith('.'));
    const allowed = publicFiles.has(name) || (name.startsWith('/assets/') && Object.hasOwn(types, ext));
    if (!safePath || !allowed || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404).end('Not found'); return; }
    const filename = path.join(__dirname, name);
    fs.stat(filename, (err, stat) => {
      if (err || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
      const headers = { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' };
      let start = 0, end = stat.size - 1, status = 200;
      // Byte ranges are required for reliable seeking without reading entire videos.
      if (req.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!range || (!range[1] && !range[2])) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
        if (!range[1]) start = Math.max(0, stat.size - Number(range[2]));
        else { start = Number(range[1]); if (range[2]) end = Math.min(end, Number(range[2])); }
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
        status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
      }
      headers['Content-Length'] = Math.max(0, end - start + 1);
      res.writeHead(status, headers);
      if (req.method === 'HEAD' || !stat.size) { res.end(); return; }
      const stream = fs.createReadStream(filename, { start, end });
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    });
  });
}
if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  const server = createServer();
  server.on('error', error => { console.error(`Cannot start preview: ${error.message}`); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Portfolio: http://127.0.0.1:${port}`));
}
module.exports = { createServer };
