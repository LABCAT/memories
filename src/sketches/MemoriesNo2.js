import p5 from 'p5';
import '@lib/p5.audioReact.js';
import initCapture from '@labcat2020/p5.audioreactive-capture';
import { getCoverState, drawCoverImage } from './functions/coverImage.js';

const base = import.meta.env.BASE_URL || './';
const audioUrl = base + 'audio/MemoriesNo2.ogg';
const midiUrl = base + 'audio/MemoriesNo2.mid';
const imageUrl = base + 'images/Melbourne-City-Skyline.jpg'; // distinct from No1

const LOOP_AUDIO = true;

const sketch = (p) => {
  p.loopAudio = LOOP_AUDIO;
  p.img = null;
  p.coverState = null;

  p.setup = async () => {
    p.pixelDensity(1);
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.background(0);
    p.canvas.style.position = 'fixed';
    p.canvas.style.top = '0';
    p.canvas.style.left = '0';
    p.canvas.style.zIndex = '1';

    initCapture(p, {
      prefix: 'MemoriesNo2',
      enabled: false,
    });

    // Load cover image — no empty space, fills canvas on any aspect
    p.img = await p.loadImage(imageUrl);
    p.coverState = getCoverState(p.img, p.width, p.height);

    await p.loadSong(audioUrl, midiUrl, (data) => {
      p.midiPpq = data.header.ppq;
      // Legacy memories-no-4 used tracks[5] (Synth 1).
      p.scheduleCueSet(data.tracks[5]?.notes ?? [], 'onTrack1Cue');
    });
  };

  p._flashUntil = 0;
  p._flashColor = null;

  p.draw = () => {
    // Always show cover — even before play — so preview isn't black
    if (p.img && p.coverState) {
      drawCoverImage(p, p.img, p.coverState);
    } else {
      p.background(0);
    }

    if (!p.song?.isPlaying()) {
      // idle: faint pulse so user sees it's alive before 9.8s first cue
      const t = p.millis() * 0.002;
      const pulse = 0.5 + 0.5 * Math.sin(t);
      if (p.img) {
        p.noStroke();
        p.fill(255, 255 * 0.2 * pulse);
        const dia = p.min(p.width, p.height) * 0.18;
        p.ellipse(p.width / 2, p.height / 2, dia, dia);
      }
      return;
    }

    // active flash overlay — drawn here, not in cue, so it persists >1 frame
    if (p.millis() < p._flashUntil && p._flashColor) {
      const remaining = p._flashUntil - p.millis();
      const alpha = remaining / 350; // fade over 350ms
      p.fill(p._flashColor.levels[0], p._flashColor.levels[1], p._flashColor.levels[2], 255 * alpha);
      p.noStroke();
      const dia = p.min(p.width, p.height) * 0.35;
      p.ellipse(p.width / 2, p.height / 2, dia, dia);
    }
  };

  p.onTrack1Cue = function (note) {
    // Schedule a visible flash — 350ms, survives draw() cover redraw
    p._flashUntil = p.millis() + 350;
    p._flashColor = p.color(p.random(255), p.random(255), p.random(255));
    // console.log('No2 cue', note?.currentCue, 'at', note?.time?.toFixed(2));
  };

  p.mouseClicked = () => {
    p.togglePlayback();
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    if (p.img) p.coverState = getCoverState(p.img, p.width, p.height);
  };
};

new p5(sketch);
