import http from 'node:http';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { createHash, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { recognize, compareFrames } from './recognizer.mjs';
import { readD20 } from './vision-local.mjs';

const safeId = /^[A-Za-z0-9_-]{1,80}$/;
const MAX_BYTES = 1024 * 1024;
const hash = b => createHash('sha256').update(b).digest('hex');
async function jsonFile(file) { try { return JSON.parse(await readFile(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } }
async function save(file, value) { await writeFile(file + '.tmp', JSON.stringify(value, null, 2)); await rename(file + '.tmp', file); }
function send(res, status, value) { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); }
async function body(req, max = MAX_BYTES) {
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > max) throw Object.assign(new Error('payload_too_large'), { status: 413 }); chunks.push(chunk); }
  return Buffer.concat(chunks);
}

export function createApi({ token, dir }) {
  if (!token || token.length < 20) throw new Error('Set API_TOKEN with at least 20 characters');
  let busy = false;
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { status: 'ok', recognition: 'experimental-d6-only' });
    const supplied = hash(Buffer.from(req.headers.authorization || ''));
    const expected = hash(Buffer.from(`Bearer ${token}`));
    if (!timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return send(res, 401, { error: 'unauthorized' });
    // Single writer keeps frame/confirmation updates atomic. Lab server: no multi-process deployment.
    if (busy) return send(res, 503, { error: 'busy_retry_later' });
    busy = true;
    try {
      if (req.method === 'POST' && url.pathname === '/v1/captures') {
        if (req.headers['content-type']?.split(';')[0] !== 'image/jpeg') return send(res, 415, { error: 'expected_image_jpeg' });
        const device = req.headers['x-device-id'], roll = req.headers['x-roll-id'];
        const index = req.headers['x-frame-index'];
        if (!safeId.test(device || '') || !safeId.test(roll || '') || !/^[0-2]$/.test(index || '')) return send(res, 400, { error: 'invalid_capture_headers' });
        const jpeg = await body(req);
        if (jpeg[0] !== 255 || jpeg[1] !== 216) return send(res, 422, { error: 'invalid_jpeg' });
        const folder = path.join(dir, device, roll); await mkdir(folder, { recursive: true });
        const file = path.join(folder, 'roll.json');
        let record = await jsonFile(file) || { schema_version: 1, device_id: device, roll_id: roll, sides: 6, status: 'pending', value: null, frames: {}, created_at: new Date().toISOString() };
        if (record.frames[index]) {
          if (record.frames[index].sha256 !== hash(jpeg)) return send(res, 409, { error: 'frame_id_conflict' });
          return send(res, 200, record);
        }
        if (record.status === 'confirmed') return send(res, 409, { error: 'roll_already_confirmed' });
        let result;
        try { result = await recognize(jpeg); } catch { return send(res, 422, { error: 'invalid_or_oversized_image' }); }
        await writeFile(path.join(folder, `${index}.jpg`), jpeg);
        record.frames[index] = { sha256: hash(jpeg), value: result.value, reason: result.reason, received_at: new Date().toISOString() };
        if (Object.keys(record.frames).length === 3) {
          const a = await recognize(await readFile(path.join(folder, '1.jpg')));
          const b = await recognize(await readFile(path.join(folder, '2.jpg')));
          record.mean_difference = compareFrames(a.pixels, b.pixels);
          record.status = 'review_required';
          record.candidate_value = a.value !== null && a.value === b.value && record.mean_difference < 3 ? b.value : null;
          record.reason = record.candidate_value === null ? 'unstable_or_ambiguous' : 'candidate_requires_human_confirmation';
        }
        await save(file, record); return send(res, 201, record);
      }
      const match = /^\/v1\/rolls\/([A-Za-z0-9_-]{1,80})\/([A-Za-z0-9_-]{1,80})(?:\/(confirm|analyze-d20|[0-2]\.jpg|event))?$/.exec(url.pathname);
      if (!match) return send(res, 404, { error: 'not_found' });
      const [, device, roll, action] = match, folder = path.join(dir, device, roll), file = path.join(folder, 'roll.json');
      const record = await jsonFile(file);
      if (!record) return send(res, 404, { error: 'roll_not_found' });
      // Explicit second step: slow inference never blocks the ESP32 capture POST.
      if (req.method === 'POST' && action === 'analyze-d20') {
        if (record.status !== 'review_required') return send(res, 409, { error: 'complete_unconfirmed_burst_required' });
        record.sides = 20; record.candidate_value = null; record.reason = 'local_vision_pending';
        await save(file, record);
        try {
          const result = await readD20(await Promise.all([1,2].map(i => readFile(path.join(folder, `${i}.jpg`)))));
          record.candidate_value = result.value; record.model = result.model;
          record.reason = result.value === null ? 'vision_abstained' : 'vision_candidate_requires_review';
        } catch {
          record.reason = 'local_vision_failed'; await save(file, record);
          return send(res, 502, record);
        }
        await save(file, record); return send(res, 200, record);
      }
      if (req.method === 'GET' && !action) return send(res, 200, record);
      if (req.method === 'GET' && action?.endsWith('.jpg')) {
        if (!record.frames[action[0]]) return send(res, 404, { error: 'frame_not_found' });
        const bytes = await readFile(path.join(folder, action));
        res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' }); return res.end(bytes);
      }
      if (req.method === 'POST' && action === 'confirm') {
        let input; try { input = JSON.parse(await body(req, 2048)); } catch (e) { if (e.status) throw e; return send(res, 400, { error: 'invalid_json' }); }
        if (!Number.isInteger(input?.value) || input.value < 1 || input.value > record.sides || typeof input?.reviewer !== 'string' || !input.reviewer.trim() || input.reviewer.length > 80)
          return send(res, 400, { error: 'value_in_die_range_and_reviewer_required' });
        if (record.status === 'pending') return send(res, 409, { error: 'incomplete_burst' });
        if (record.status === 'confirmed') return record.value === input.value ? send(res, 200, record) : send(res, 409, { error: 'already_confirmed_different_value' });
        record.status = 'confirmed'; record.value = input.value; record.reviewer = input.reviewer.trim(); record.confirmed_at = new Date().toISOString();
        await save(file, record); return send(res, 200, record);
      }
      if (req.method === 'GET' && action === 'event') {
        if (record.status !== 'confirmed') return send(res, 409, { error: 'confirmation_required' });
        return send(res, 200, { schema_version: 1, type: 'dice.roll.confirmed', event_id: `${device}:${roll}`, device_id: device, roll_id: roll, sides: record.sides, value: record.value, confirmed_at: record.confirmed_at, provenance: 'human_review_of_camera_capture' });
      }
      return send(res, 405, { error: 'method_not_allowed' });
    } catch (error) {
      if (!res.headersSent) send(res, error.status || 500, { error: error.status ? error.message : 'internal_error' });
      console.error(error.message);
    } finally { busy = false; }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const server = createApi({ token: process.env.API_TOKEN, dir: path.resolve(process.env.DATA_DIR || 'data') });
  server.requestTimeout = 15000; server.headersTimeout = 10000;
  server.listen(Number(process.env.PORT || 8787), process.env.HOST || '127.0.0.1', () => console.log('FRAGUA lab API ready; GET /health'));
}
