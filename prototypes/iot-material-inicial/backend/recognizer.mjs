import sharp from 'sharp';

// Connected components, 4-neighbour adjacency. Background pixels never enter a group.
function components(mask, w, h) {
  const seen = new Uint8Array(mask.length), groups = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    const stack = [start]; seen[start] = 1;
    let area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0, sx = 0, sy = 0;
    while (stack.length) {
      const p = stack.pop(), x = p % w, y = Math.floor(p / w);
      area++; sx += x; sy += y;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      const neighbours = [];
      if (x > 0) neighbours.push(p - 1); if (x + 1 < w) neighbours.push(p + 1);
      if (y > 0) neighbours.push(p - w); if (y + 1 < h) neighbours.push(p + w);
      for (const q of neighbours) if (mask[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
    }
    groups.push({ area, x0, y0, x1, y1, x: sx / area, y: sy / area });
  }
  return groups;
}

export async function recognize(jpeg) {
  const decoder = sharp(jpeg, { limitInputPixels: 4000000, failOn: 'error' });
  const meta = await decoder.metadata();
  if (meta.format !== 'jpeg') throw new Error('Expected a decoded JPEG');
  const { data, info } = await decoder.resize(320, 240, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const reject = reason => ({ value: null, reason, pixels: data });
  // Controlled scene: one white die, dark matte tray, camera perpendicular to top face.
  const white = Uint8Array.from(data, v => v > 165 ? 1 : 0);
  const faces = components(white, w, h).filter(g => g.area > 900);
  if (faces.length !== 1) return reject('expected_one_white_face');
  const f = faces[0], fw = f.x1 - f.x0 + 1, fh = f.y1 - f.y0 + 1;
  if (f.x0 < 3 || f.y0 < 3 || f.x1 > w - 4 || f.y1 > h - 4 || fw / fh < .65 || fw / fh > 1.5)
    return reject('face_cropped_or_perspective');
  const margin = Math.max(3, Math.round(Math.min(fw, fh) * .07));
  const mask = new Uint8Array(data.length);
  for (let y = f.y0 + margin; y <= f.y1 - margin; y++)
    for (let x = f.x0 + margin; x <= f.x1 - margin; x++)
      if (data[y * w + x] < 85) mask[y * w + x] = 1;
  const blobs = components(mask, w, h).filter(g => g.area >= 8);
  const pips = blobs.filter(g => {
    const bw = g.x1 - g.x0 + 1, bh = g.y1 - g.y0 + 1;
    const ratio = bw / bh, fraction = g.area / (fw * fh);
    return ratio > .55 && ratio < 1.8 && fraction > .003 && fraction < .065 &&
      g.area / (bw * bh) > .45 && g.x0 > f.x0 + margin && g.x1 < f.x1 - margin &&
      g.y0 > f.y0 + margin && g.y1 < f.y1 - margin;
  });
  if (pips.length !== blobs.length || pips.length < 1 || pips.length > 6) return reject('ambiguous_pips');
  const areas = pips.map(p => p.area);
  if (Math.max(...areas) / Math.min(...areas) > 2) return reject('unequal_pips');
  return { value: pips.length, reason: 'heuristic_d6_candidate', pixels: data };
}

export function compareFrames(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length; // Mean absolute grayscale difference, 0..255, not probability.
}
