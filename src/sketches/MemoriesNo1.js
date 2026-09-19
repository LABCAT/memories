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

const base = import.meta.env.BASE_URL || './';
const audioUrl = base + 'audio/MemoriesNo1.ogg';
const midiUrl = base + 'audio/MemoriesNo1.mid';

// Reason track 13 → MIDI index 12: the "Touch Orchestra" Combinator.
// Its top voice is the melody. Photos are grouped by that voice's pitch.
const MELODY_TRACK = 12;
const LOOP_AUDIO = true;
const EXPECTED_NOTES = 72;

const CARD_SIZE = 0.17; // × min(width, height)
const SPREAD = 0.54; // × min(width, height)

const sketch = (p) => {
  p.loopAudio = LOOP_AUDIO;
  p.song = null;
  p.audioLoaded = false;
  p.songHasFinished = false;
  p.showingStatic = true;

  p.families = {};
  p.pointer = {};
  p.cards = [];
  p.index = 0;
  p.photosReady = false;
  p.cover = null;
  p.coverState = null;
  p.seed = 0;
  p.loopCount = 0;

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
    p.background(0);
    p.canvas.classList.add('p5Canvas--cursor-play');
    p.canvas.style.position = 'fixed';
    p.canvas.style.top = '0';
    p.canvas.style.left = '0';
    p.canvas.style.zIndex = '1';

    initCapture(p, { prefix: 'MemoriesNo1', enabled: false });

    p.applyGenerative();

    await p.loadSong(audioUrl, midiUrl, (data) => {
      const onsets = p.groupOnsets(data.tracks[MELODY_TRACK]?.notes ?? []);
      const melody = onsets.map((g) => g.reduce((hi, n) => (n.midi > hi.midi ? n : hi)));
      p.scheduleCueSet(melody, 'executeTrack13');
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
    p.cards = [];
    p.index = 0;
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

  /** Take the next photo of a family and lay it on the pile. */
  p.addCard = (fam, now) => {
    const pool = p.families[fam];
    if (!pool?.length) return;
    const idx = p.pointer[fam] % pool.length;
    p.pointer[fam] = idx + 1;

    const i = p.index++;
    const golden = 2.39996323;
    const angle = i * golden + p.rng() * 0.5;
    const radius = SPREAD * Math.sqrt((i % EXPECTED_NOTES) / EXPECTED_NOTES);
    p.cards.push({
      img: pool[idx].img,
      ux: Math.cos(angle) * radius,
      uy: Math.sin(angle) * radius,
      rot: angle + Math.PI / 2 + (p.rng() - 0.5) * 0.4,
      scale: 0.9 + p.rng() * 0.25,
      born: now,
    });
    if (p.cards.length > EXPECTED_NOTES * 2) {
      p.cards.splice(0, p.cards.length - EXPECTED_NOTES * 2);
    }
  };

  p.executeTrack13 = function (note) {
    p.addCard(familyForMidi(note.midi), p.getSongPlaybackTime());
  };

  p.draw = () => {
    p.background(0);

    if (p.showingStatic) {
      p.drawStatic();
      return;
    }

    const now = p.getSongPlaybackTime();
    const unit = Math.min(p.width, p.height);
    for (const c of p.cards) p.drawCard(c, unit, now);
  };

  p.drawStatic = () => {
    if (!p.cover) return;
    const c = p.coverState || getCoverState(p.cover.img, p.width, p.height);
    p.image(p.cover.img, c.dx, c.dy, c.dw, c.dh);
  };

  p.drawCard = (c, unit, now) => {
    const age = now - c.born;
    const pop = age >= 0 && age < 0.2 ? 1 - age / 0.2 : 0;
    const size = unit * CARD_SIZE * c.scale * (1 - 0.35 * pop);
    const ar = c.img.width / c.img.height;
    const w = ar >= 1 ? size * ar : size;
    const h = ar >= 1 ? size : size / ar;
    p.push();
    p.translate(p.width / 2 + c.ux * unit, p.height / 2 + c.uy * unit);
    p.rotate(c.rot);
    const ctx = p.drawingContext;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 18;
    p.image(c.img, -w / 2, -h / 2, w, h);
    ctx.restore();
    p.pop();
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
