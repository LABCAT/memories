/**
 * Photo-driven CSS gradient background for memories.
 *
 * Each photo's dominant colour is sampled once (after loading) and used to build
 * a layered CSS gradient on html/body — always behind the (transparent) canvas.
 * No sampling happens per frame.
 */

const wrapHue = (h) => ((h % 360) + 360) % 360;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Total frame width on each side of the photo, × min(canvas): pad + stroke + both line pairs. */
export const FRAME_INSET = 0.022 + 0.011 / 2 + 1.5 * 0.005 + 0.005 / 2;

const hsvToRgb = (h, s, v) => {
  h = wrapHue(h) / 60;
  s = clamp(s, 0, 1);
  v = clamp(v, 0, 1);
  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;
  let r;
  let g;
  let b;
  if (h < 1) [r, g, b] = [c, x, 0];
  else if (h < 2) [r, g, b] = [x, c, 0];
  else if (h < 3) [r, g, b] = [0, c, x];
  else if (h < 4) [r, g, b] = [0, x, c];
  else if (h < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

const FALLBACK_COLOR = { h: 210, s: 0.5, v: 0.5 };

/**
 * Sample a photo's dominant colour once (12×12 downsample, circular hue mean so
 * mixed photos don't average to grey). Never throws — returns a neutral colour on
 * any failure, so a photo is never lost because of sampling.
 */
export function samplePhotoColor(img) {
  try {
    const src = img?.canvas ?? img?.elt ?? img;
    if (!src || !src.width || !src.height) return FALLBACK_COLOR;
    const N = 12;
    const cv = document.createElement('canvas');
    cv.width = N;
    cv.height = N;
    const cx = cv.getContext('2d');
    cx.drawImage(src, 0, 0, N, N);
    const d = cx.getImageData(0, 0, N, N).data;
    let sx = 0;
    let sy = 0;
    let ss = 0;
    let sv = 0;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 25) continue;
      const r = d[i] / 255;
      const g = d[i + 1] / 255;
      const b = d[i + 2] / 255;
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      const df = mx - mn;
      let hue = 0;
      if (df > 0) {
        if (mx === r) hue = 60 * (((g - b) / df) % 6);
        else if (mx === g) hue = 60 * ((b - r) / df + 2);
        else hue = 60 * ((r - g) / df + 4);
      }
      const rad = (hue * Math.PI) / 180;
      sx += Math.cos(rad);
      sy += Math.sin(rad);
      ss += mx > 0 ? df / mx : 0;
      sv += mx;
      n++;
    }
    if (!n) return FALLBACK_COLOR;
    return {
      h: wrapHue((Math.atan2(sy, sx) * 180) / Math.PI),
      s: clamp((ss / n) * 1.2, 0.15, 1),
      v: clamp((sv / n) * 1.08, 0.3, 1),
    };
  } catch (err) {
    console.warn('[memories] photo colour sample failed; using fallback', err);
    return FALLBACK_COLOR;
  }
}

/** Harmonised 8-colour palette (HSB) anchored on the photo's dominant hue. */
export function paletteFromColor({ h, s, v }, rng = Math.random) {
  const offsets = [0, 28, -34, 152, 178, -108, 74, 46];
  return offsets.map((o, i) => ({
    h: wrapHue(h + o + (rng() - 0.5) * 14),
    s: clamp(58 + (i % 3) * 12 + s * 22, 55, 98),
    b: clamp(46 + ((i * 7) % 4) * 11 + v * 16, 42, 96),
  }));
}

const css = (c, a = 1) => {
  const [r, g, b] = hsvToRgb(c.h, c.s, c.b);
  return a >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
};

/** Layered CSS gradient + blend modes from a palette. */
function buildGradientCss(pal) {
  const [c0, c1, c2, c3, c4, c5] = pal;
  return {
    background:
      `radial-gradient(120% 120% at 22% 24%, ${css(c4)} 0%, ${css(c4, 0)} 60%),` +
      `radial-gradient(120% 120% at 80% 74%, ${css(c5)} 0%, ${css(c5, 0)} 62%),` +
      `linear-gradient(135deg, ${css(c0)} 0%, ${css(c1)} 38%, ${css(c2)} 72%, ${css(c3)} 100%)`,
    blend: 'screen, screen, normal',
  };
}

const applyGradient = (preset) => {
  for (const el of [document.documentElement, document.body]) {
    el.style.background = preset.background;
    el.style.backgroundBlendMode = preset.blend;
    el.style.backgroundAttachment = 'fixed';
  }
};

/** Install a default gradient (before any photo is sampled). */
export function installGradientBg(p, seed) {
  const hue = (Number(seed) % 360 + 360) % 360 || 210;
  const pal = paletteFromColor({ h: hue, s: 0.5, v: 0.5 });
  applyGradient(buildGradientCss(pal));
  p.bgPalette = pal;
}

/** Update the gradient for a new palette (called when a photo appears). */
export function setGradientBg(p, pal) {
  if (!pal?.length) return;
  p.bgPalette = pal;
  applyGradient(buildGradientCss(pal));
}

/** Rotating conic-gradient border around a photo rect. `flash` (0-1) is a kick pop. */
export function drawPhotoBorder(p, rect, now, flash = 0) {
  if (!rect?.w || !rect?.h) return;
  const ctx = p.drawingContext;
  if (typeof ctx.createConicGradient !== 'function') return;
  const pal = p.bgPalette;
  if (!pal?.length) return;

  const unit = Math.min(p.width, p.height);
  const pad = unit * 0.022;
  const strokeW = unit * 0.011;
  const x = rect.x - pad;
  const y = rect.y - pad;
  const w = rect.w + pad * 2;
  const h = rect.h + pad * 2;

  ctx.save();
  const grad = ctx.createConicGradient(now * 0.7, rect.x + rect.w / 2, rect.y + rect.h / 2);
  const STOPS = 20;
  for (let i = 0; i < STOPS; i++) {
    const c = pal[i % pal.length];
    const [r, g, b] = hsvToRgb(c.h, c.s, c.b);
    grad.addColorStop(i / STOPS, `rgb(${r}, ${g}, ${b})`);
  }
  ctx.strokeStyle = grad;
  ctx.lineWidth = strokeW;
  ctx.strokeRect(x, y, w, h);

  // kick flash over the band
  if (flash > 0.01) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,255,255,${0.7 * flash})`;
    ctx.lineWidth = strokeW;
    ctx.strokeRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  // outer pair: white then black going outward (pure solid)
  const thin = Math.max(3, unit * 0.005);
  ctx.lineWidth = thin;
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(
    x - strokeW / 2 - thin / 2,
    y - strokeW / 2 - thin / 2,
    w + strokeW + thin,
    h + strokeW + thin,
  );
  ctx.strokeStyle = '#000';
  ctx.strokeRect(
    x - strokeW / 2 - thin * 1.5,
    y - strokeW / 2 - thin * 1.5,
    w + strokeW + thin * 3,
    h + strokeW + thin * 3,
  );

  // inner pair: white then black going inward
  ctx.lineWidth = thin;
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(
    x + strokeW / 2 + thin / 2,
    y + strokeW / 2 + thin / 2,
    w - (strokeW + thin),
    h - (strokeW + thin),
  );
  ctx.strokeStyle = '#000';
  ctx.strokeRect(
    x + strokeW / 2 + thin * 1.5,
    y + strokeW / 2 + thin * 1.5,
    w - (strokeW + thin * 3),
    h - (strokeW + thin * 3),
  );
  ctx.restore();
}