/**
 * Curated Japan 2018 photos, grouped by the Touch Orchestra melody pitch family
 * they belong to. Each family is a distinct visual world; the melody cuts between
 * them (D5 = light, C5 = neon city, B4 = water/bay, A4 = people).
 *
 * Source set: 539 photos from Google Drive/Photos/2018/japan, downscaled to 2000px
 * AVIF (crf 34) into public/images/japan/. Regenerate with scripts/curate-japan-photos.sh.
 */

export const JAPAN_PHOTOS = {
  D5: [
    'd5-korakuen-arch-red',
    'd5-korakuen-arch-corridor',
    'd5-korakuen-arch-gold',
    'd5-korakuen-tunnel-bluegreen',
    'd5-korakuen-tree-blue',
    'd5-korakuen-fountain-pink',
    'd5-tobu-gold-tunnel',
    'd5-tobu-field-green',
    'd5-tobu-rainbow-tunnel',
    'd5-tobu-treble-clef',
    'd5-tobu-purple-trees',
  ],
  C5: [
    'c5-godzilla-1',
    'c5-godzilla-2',
    'c5-china-town',
    'c5-odaiba-arcade-1',
    'c5-odaiba-arcade-2',
    'c5-korakuen-stalls',
  ],
  B4: [
    'b4-odaiba-ship',
    'b4-odaiba-bridge',
    'b4-odaiba-night',
    'b4-reflect-purple-1',
    'b4-reflect-purple-2',
    'b4-yokohama-stadium',
  ],
  A4: [
    'a4-ninja-dojo-1',
    'a4-ninja-sword',
    'a4-mochi',
    'a4-goldfish-family',
    'a4-odaiba-liberty',
    'a4-tobu-couple',
  ],
};

export const JAPAN_FAMILIES = Object.keys(JAPAN_PHOTOS);

/** Which family a MIDI pitch class belongs to (A/B/C/D only in this track). */
export function familyForMidi(midi) {
  switch (midi % 12) {
    case 2:
      return 'D5';
    case 0:
      return 'C5';
    case 11:
      return 'B4';
    case 9:
      return 'A4';
    default:
      return 'C5';
  }
}

/** Public URL for a curated photo slug. */
export function japanPhotoUrl(base, slug) {
  return `${base}images/japan/${slug}.avif`;
}

/** Deterministic PRNG (mulberry32) so a seed reproduces a run exactly. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turn any string/number into a 32-bit seed. */
export function hashSeed(value) {
  const str = String(value ?? '');
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fisher-Yates shuffle driven by a seeded rng (returns a new array). */
export function shuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
