/**
 * Responsive cover helper for memories.
 * Eliminates empty space: image always fills the canvas (CSS `object-fit: cover`).
 * On mobile portrait, landscape 1920x1080 images are cropped left/right, not letterboxed.
 *
 * Current No2 bug: `p.img.resize(p.width,0)` leaves 600px+ empty at bottom on phone
 * because image height = 219px while canvas height = 844px.
 *
 * Usage:
 *   const state = getCoverState(img, p.width, p.height); // call on setup + windowResized
 *   drawCoverImage(p, img, state); // instead of p.image(img,0,0)
 *   const col = sampleCoverColor(p, img, canvasX, canvasY, state); // for particles
 */

export function getCoverState(img, canvasW, canvasH) {
  if (!img || !canvasW || !canvasH) return null;
  const imgW = img.width;
  const imgH = img.height;
  if (!imgW || !imgH) return null;

  const scale = Math.max(canvasW / imgW, canvasH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const dx = (canvasW - dw) / 2;
  const dy = (canvasH - dh) / 2;

  return { scale, dx, dy, dw, dh, imgW, imgH, canvasW, canvasH };
}

/**
 * Draw image with cover sizing. No empty space — excess is cropped.
 */
export function drawCoverImage(p, img, state) {
  if (!img || !state) return;
  const { dx, dy, dw, dh } = state;
  p.image(img, dx, dy, dw, dh);
}

/**
 * Alternative: contain + blurred backdrop. Keeps whole image visible,
 * fills empty top/bottom with enlarged blurred copy (avoids black bars).
 * Call if you want letterbox-fill instead of crop. Not default.
 */
export function drawContainWithBlurBackdrop(p, img, state) {
  if (!img || !state) return;
  // draw blurred cover as backdrop
  p.push();
  // p5 doesn't blur image directly well — use tint + scale trick or leave to CSS filter
  // Simplest: draw cover with low opacity + filter
  p.drawingContext.filter = 'blur(20px) brightness(0.7)';
  drawCoverImage(p, img, state);
  p.drawingContext.filter = 'none';
  p.pop();

  // now draw contain on top
  const imgW = state.imgW;
  const imgH = state.imgH;
  const canvasW = state.canvasW;
  const canvasH = state.canvasH;
  const scale = Math.min(canvasW / imgW, canvasH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const dx = (canvasW - dw) / 2;
  const dy = (canvasH - dh) / 2;
  p.image(img, dx, dy, dw, dh);
}

/**
 * Map a canvas coordinate (x,y) to image pixel coordinate for sampling.
 * Handles the dx/dy offset and scale, clamps to image bounds.
 */
export function canvasToImageCoords(canvasX, canvasY, state) {
  if (!state) return null;
  const imgX = (canvasX - state.dx) / state.scale;
  const imgY = (canvasY - state.dy) / state.scale;
  // clamp
  const x = Math.floor(Math.max(0, Math.min(state.imgW - 1, imgX)));
  const y = Math.floor(Math.max(0, Math.min(state.imgH - 1, imgY)));
  return { x, y };
}

/**
 * Sample a color from the image as it appears under canvas point (x,y) with cover.
 * This fixes No2's bug where `p.img.get(destX,destY)` sampled stretched image coords
 * that didn't match canvas — now dest is canvas space, mapped to image space.
 * Requires img has loaded pixels (call after load, img.loadPixels()).
 */
export function sampleCoverColor(p, img, canvasX, canvasY, state) {
  const coords = canvasToImageCoords(canvasX, canvasY, state);
  if (!coords) return p.color(0);
  // img.get is slow but ok for <500 particles. For >1000, use pixels[] directly.
  return img.get(coords.x, coords.y);
}

/**
 * Helper: count particles / strip count responsively by area, not just width.
 */
export function responsiveCount(canvasW, canvasH, baseArea = 1920 * 1080, baseCount = 300) {
  const area = canvasW * canvasH;
  // keep density constant, clamp to avoid explosion on 4k or emptiness on phone
  const count = Math.floor((area / baseArea) * baseCount);
  return Math.max(80, Math.min(count, 600));
}
