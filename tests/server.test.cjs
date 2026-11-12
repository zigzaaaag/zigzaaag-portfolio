const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server.cjs');
const fs = require('node:fs');
const path = require('node:path');
let server, base;
before(async () => {
  server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });
test('pages and nested assets load; private backups stay private', async () => {
  for (const route of ['/', '/project.html?id=project-01', '/about.html', '/data/site.js', '/data/projects.js', '/assets/images/hero/hero.jpg']) {
    const response = await fetch(base + route); assert.equal(response.status, 200, route); await response.arrayBuffer();
  }
  for (const route of ['/backups/phase-1/index.html', '/data/missing.js', '/assets/%2e%2e%2fserver.cjs', '/assets/none.jpg']) assert.equal((await fetch(base + route)).status, 404);
});
test('MP4 serves exact byte ranges, suffix, open range, HEAD and invalid ranges', async () => {
  const bytes = fs.readFileSync(path.join(__dirname, '../assets/videos/project-02/preview.mp4'));
  const route = base + '/assets/videos/project-02/preview.mp4';
  for (const [range, expected] of [['bytes=0-99', bytes.subarray(0, 100)], ['bytes=-64', bytes.subarray(-64)], [`bytes=${bytes.length - 40}-`, bytes.subarray(-40)]]) {
    const res = await fetch(route, { headers: { Range: range } });
    assert.equal(res.status, 206); assert.equal(res.headers.get('content-type'), 'video/mp4');
    assert.deepEqual(Buffer.from(await res.arrayBuffer()), expected);
  }
  const head = await fetch(route, { method: 'HEAD' });
  assert.equal(Number(head.headers.get('content-length')), bytes.length);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  for (const range of [`bytes=${bytes.length}-`, 'bytes=9-2', 'bytes=-0', 'bytes=0-1,5-6', 'bytes=-']) assert.equal((await fetch(route, { headers: { Range: range } })).status, 416);
});
test('WebM has correct MIME and range support', async () => {
  const res = await fetch(base + '/assets/videos/project-02/main.webm', { headers: { Range: 'bytes=0-15' } });
  assert.equal(res.status, 206); assert.equal(res.headers.get('content-type'), 'video/webm'); assert.equal((await res.arrayBuffer()).byteLength, 16);
});
