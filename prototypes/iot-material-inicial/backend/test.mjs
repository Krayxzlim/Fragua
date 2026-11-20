import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { recognize } from './recognizer.mjs';
import { createApi } from './server.mjs';

// Synthetic fixtures verify software only; they are NOT photographs of the prototype.
const patterns = [[], [[160,120]], [[130,90],[190,150]], [[130,90],[160,120],[190,150]], [[130,90],[190,90],[130,150],[190,150]], [[130,90],[190,90],[160,120],[130,150],[190,150]], [[130,90],[190,90],[130,120],[190,120],[130,150],[190,150]]];
async function fixture(n) {
  const svg = `<svg width="320" height="240"><rect width="320" height="240" fill="#222"/><rect x="100" y="60" width="120" height="120" fill="white"/>${patterns[n].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="8" fill="black"/>`).join('')}</svg>`;
  return sharp(Buffer.from(svg)).jpeg().toBuffer();
}
for (let n = 1; n <= 6; n++) test(`synthetic d6 face ${n}`, async () => assert.equal((await recognize(await fixture(n))).value, n));
test('blank face is rejected', async () => assert.equal((await recognize(await fixture(0))).value, null));
test('API authentication, capture, replay, review and confirmed event', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fragua-test-'));
  const token = 'test-only-token-at-least-20-chars';
  const server = createApi({ token, dir });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const auth = { Authorization: `Bearer ${token}` };
  const jpeg = await fixture(5), other = await fixture(3);
  const post = (i, bytes = jpeg) => fetch(base + '/v1/captures', { method: 'POST', headers: { ...auth, 'Content-Type': 'image/jpeg', 'X-Device-Id': 'cam', 'X-Roll-Id': 'test1', 'X-Frame-Index': String(i) }, body: bytes });
  try {
    assert.equal((await fetch(base + '/v1/captures', {method:'POST'})).status, 401);
    assert.equal((await post(4)).status, 400);
    assert.equal((await post(0, Buffer.from('bad'))).status, 422);
    assert.equal((await post(0)).status, 201);
    assert.equal((await post(0)).status, 200);
    assert.equal((await post(0, other)).status, 409);
    assert.equal((await fetch(base + '/v1/rolls/cam/test1/event', {headers:auth})).status, 409);
    await post(1); const record = await (await post(2)).json();
    assert.equal(record.candidate_value, 5); assert.equal(record.value, null); assert.equal(record.status, 'review_required');
    const confirm = value => fetch(base + '/v1/rolls/cam/test1/confirm', { method:'POST', headers:auth, body:JSON.stringify({value,reviewer:'test'}) });
    assert.equal((await confirm(7)).status, 400);
    assert.equal((await confirm(5)).status, 200); assert.equal((await confirm(5)).status, 200); assert.equal((await confirm(2)).status, 409);
    const event = await (await fetch(base + '/v1/rolls/cam/test1/event', {headers:auth})).json();
    assert.equal(event.value, 5); assert.equal(event.event_id, 'cam:test1');
    const image = await fetch(base + '/v1/rolls/cam/test1/2.jpg', {headers:auth});
    assert.equal(image.headers.get('content-type'), 'image/jpeg');
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), jpeg);
  } finally { await new Promise(resolve => server.close(resolve)); await rm(dir, {recursive:true,force:true}); }
});
test('different last frames do not produce a candidate', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fragua-test-'));
  const token = 'test-only-token-at-least-20-chars', server = createApi({token,dir});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    for (let i=0; i<3; i++) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/v1/captures`, {method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'image/jpeg','X-Device-Id':'cam','X-Roll-Id':'moving','X-Frame-Index':String(i)},body:await fixture(i+1)});
      const result = await response.json();
      if (i===2) { assert.equal(result.candidate_value,null); assert.equal(result.status,'review_required'); }
    }
  } finally { await new Promise(resolve => server.close(resolve)); await rm(dir,{recursive:true,force:true}); }
});
