import p5 from 'p5';
import '@lib/p5.audioReact.js';
import '@lib/p5.fps.js';
import initCapture from '@labcat2020/p5.audioreactive-capture';
import { getCoverState } from './functions/coverImage.js';
import {
  JAPAN_PHOTOS,
  JAPAN_FAMILIES,
  familyForMidi,
  japanPhotoUrl,
  mulberry32,
  hashSeed,
  shuffle,
} from './functions/japanPhotos.js';
import {
  installGradientBg,
  setGradientBg,
  samplePhotoColor,
  paletteFromColor,
  drawPhotoBorder,
  FRAME_INSET,
} from './functions/memoryBackground.js';

const base = import.meta.env.BASE_URL || './';
const audioUrl = base + 'audio/MemoriesNo1.ogg';
const midiUrl = base + 'audio/MemoriesNo1.mid';

// Reason track 13 → MIDI index 12: the "Touch Orchestra" Combinator.
// Its top voice is the melody. Photos are grouped by that voice's pitch.
const MELODY_TRACK = 12;
// Synth bass = Synth 4 (track 10); its notes drive the kick-style punch/flash.
const BASS_TRACK = 10;
const LOOP_AUDIO = true;

const PHOTO_POP = 0.22; // seconds of pop-in
const PHOTO_MIN = 0.65; // starting scale of the pop
const OUTER_PORTRAIT = 0.015; // frame breathing room on portrait (smaller = wider photo)
const OUTER_LANDSCAPE = 0.03; // frame breathing room on landscape
const LANDSCAPE_H = 0.82; // cap photo height on landscape so it's not too tall


const sketch = (p) => {
  p.loopAudio = LOOP_AUDIO;
  p.song = null;
  p.audioLoaded = false;
  p.songHasFinished = false;
  p.showingStatic = true;

  p.families = {};
  p.pointer = {};
  p.photo = null;
  p.photoPrev = null;
  p.photosReady = false;
  p.cover = null;
  p.coverState = null;
  p.seed = 0;
  p.loopCount = 0;
  p.bassHitT = -1;
  p.devT = -1;
  p.devDur = 0.6;

  p.setup = async () => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('fps') || params.get('fps') !== '0') p.enableFpsIndicator();
    window.toggleFps = () => p.toggleFpsIndicator();
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) p.toggleFpsIndicator();
    });

    p.seed = params.get('seed') || String(Math.floor(Math.random() * 1e9));
    window.__memoriesSeed = p.seed;

    p.pixelDensity(1);
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.canvas.classList.add('p5Canvas--cursor-play');
    p.canvas.style.position = 'fixed';
    p.canvas.style.top = '0';
    p.canvas.style.left = '0';
    p.canvas.style.zIndex = '1';
    p.canvas.style.background = 'transparent'; // let the CSS background show through

    initCapture(p, { prefix: 'MemoriesNo1', enabled: false });

    installGradientBg(p, p.seed);

    p.applyGenerative();

    await p.loadSong(audioUrl, midiUrl, (data) => {
      const onsets = p.groupOnsets(data.tracks[MELODY_TRACK]?.notes ?? []);
      const melody = onsets.map((g) => g.reduce((hi, n) => (n.midi > hi.midi ? n : hi)));
      p.scheduleCueSet(melody, 'executeTrack13');
      // Synth bass: its notes drive the punch/flash.
      p.scheduleCueSet(data.tracks[BASS_TRACK]?.notes ?? [], 'executeBass', true);
    });

    // Photos stream in after the song; they must never block the song or loader.
    p.loadPhotos()
      .then(() => {
        p.photosReady = true;
      })
      .catch((err) => console.error('[MemoriesNo1] photo load failed:', err));
  };

  /** Fresh photo order and starting memory each load / loop. */
  p.applyGenerative = () => {
    const rng = mulberry32(hashSeed(`${p.seed}:${p.loopCount}`));
    p.rng = rng;
    JAPAN_FAMILIES.forEach((fam) => {
      if (p.families[fam]) p.families[fam] = shuffle(p.families[fam], rng);
      p.pointer[fam] = 0;
    });
    p.photo = null;
    p.photoPrev = null;
    p.cover = null;
    p.coverState = null;
  };

  /** Never rejects: a bad/slow file just reduces that family's pool. */
  p.loadPhotos = async () => {
    const cap = Math.max(1200, Math.min(1800, Math.round(Math.min(p.width, p.height) * 1.1)));
    await Promise.all(
      Object.entries(JAPAN_PHOTOS).map(async ([fam, slugs]) => {
        const results = await Promise.allSettled(
          slugs.map(async (slug) => {
            const img = await p.loadImage(japanPhotoUrl(base, slug));
            if (!img || !img.width) throw new Error(`bad image: ${slug}`);
            if (img.width > cap) img.resize(cap, 0);
            return { img };
          }),
        );
        const loaded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
        const failed = results.length - loaded.length;
        if (failed) console.warn(`[MemoriesNo1] ${failed}/${slugs.length} ${fam} photos failed`);
        p.families[fam] = shuffle(loaded, p.rng);
      }),
    );
    // Sample colours only once loaded — decoupled from loading, so it can never
    // drop a photo. samplePhotoColor never throws.
    for (const fam of JAPAN_FAMILIES) {
      for (const entry of p.families[fam] ?? []) {
        entry.color = samplePhotoColor(entry.img);
      }
    }
    p.pickCover();
  };

  /** One clear memory for the pre-play static frame. */
  p.pickCover = () => {
    const fam = JAPAN_FAMILIES[Math.floor(p.rng() * JAPAN_FAMILIES.length)];
    const pool = p.families[fam];
    if (!pool?.length) return;
    p.cover = pool[0];
    p.coverState = getCoverState(p.cover.img, p.width, p.height);
  };

  p.groupOnsets = (notes) => {
    const groups = new Map();
    for (const n of notes) {
      const g = groups.get(n.ticks);
      if (g) g.push(n);
      else groups.set(n.ticks, [n]);
    }
    return [...groups.values()].sort((a, b) => a[0].time - b[0].time);
  };

  /** One image at a time, popping in to fill most of the screen. */
  p.executeTrack13 = function (note) {
    const fam = familyForMidi(note.midi);
    const pool = p.families[fam];
    if (!pool?.length) return;
    const idx = p.pointer[fam] % pool.length;
    p.pointer[fam] = idx + 1;
    if (p.photo) p.photoPrev = p.photo;
    const entry = pool[idx];
    p.photo = { img: entry.img, born: p.getSongPlaybackTime() };
    if (entry.color) setGradientBg(p, paletteFromColor(entry.color, p.rng));
    // develop bloom lasts roughly the note length
    p.devT = p.photo.born;
    p.devDur = Math.max(0.35, Math.min(1.2, note.duration ?? 0.6));
  };

  /** Synth bass note → punch/flash timer read by draw(). */
  p.executeBass = function () {
    p.bassHitT = p.getSongPlaybackTime();
  };

  /** 1 at the hit, fading linearly to 0 after `dur` seconds. */
  p.decay = (start, now, dur) => {
    if (start < 0) return 0;
    const t = (now - start) / dur;
    return t <= 0 || t >= 1 ? 0 : 1 - t;
  };

  p.draw = () => {
    p.clear(); // transparent so the CSS background shows

    if (p.showingStatic) {
      p.drawStatic();
      return;
    }
    if (!p.photo) return;

    const now = p.getSongPlaybackTime();
    const hit = p.decay(p.bassHitT, now, 0.3);
    const dev = p.decay(p.devT, now, p.devDur);

    const age = Math.max(0, now - p.photo.born);
    const t = Math.min(1, age / PHOTO_POP);
    // previous photo only needed as a backdrop during the pop
    if (p.photoPrev) {
      if (t < 1) p.drawPhoto(p.photoPrev.img, 1);
      else p.photoPrev = null;
    }
    const e = 1 - Math.pow(1 - t, 2); // gentle ease-out, no overshoot
    const weight = (PHOTO_MIN + (1 - PHOTO_MIN) * e) * (1 + 0.07 * hit);
    p.drawPhoto(p.photo.img, weight);

    // develop bloom on each new photo + subtle bass hit flash
    const flash = Math.max(dev * 0.4, hit * 0.22);
    if (flash > 0.01) {
      const r = p.photoRect(p.photo.img, weight);
      const ctx = p.drawingContext;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,255,255,${flash})`;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.restore();
    }

    // frame stays fixed while the photo pops inside; subtle bass note band flash
    drawPhotoBorder(p, p.photoRect(p.photo.img, 1), now, hit * 0.5);
  };

  p.drawStatic = () => {
    if (!p.cover) return;
    const c = p.coverState || getCoverState(p.cover.img, p.width, p.height);
    p.image(p.cover.img, c.dx, c.dy, c.dw, c.dh);
  };

  p.photoRect = (img, weight) => {
    const unit = Math.min(p.width, p.height);
    const portrait = p.height >= p.width;
    // portrait: tighter frame gives a wider photo; landscape: cap the height so it's shorter
    const outer = portrait ? OUTER_PORTRAIT : OUTER_LANDSCAPE;
    const margin = unit * (FRAME_INSET + outer);
    const hLimit = (p.height - margin * 2) * (portrait ? 1 : LANDSCAPE_H);
    const base = Math.min((p.width - margin * 2) / img.width, hLimit / img.height);
    const scale = base * weight;
    const w = img.width * scale;
    const h = img.height * scale;
    return { x: (p.width - w) / 2, y: (p.height - h) / 2, w, h };
  };

  p.drawPhoto = (img, weight) => {
    if (!img || !img.width || !img.height) return;
    const r = p.photoRect(img, weight);
    p.image(img, r.x, r.y, r.w, r.h);
  };

  p.resetAnimation = () => {
    p.loopCount += 1;
    p.applyGenerative();
  };

  p.mouseClicked = () => {
    p.togglePlayback();
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    if (p.cover) p.coverState = getCoverState(p.cover.img, p.width, p.height);
  };
};

new p5(sketch);
