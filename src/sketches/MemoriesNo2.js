import p5 from 'p5';
import '@lib/p5.audioReact.js';
import '@lib/p5.fps.js';
import initCapture from '@labcat2020/p5.audioreactive-capture';
import { getCoverState, sampleCoverColor, responsiveCount } from './functions/coverImage.js';

const base = import.meta.env.BASE_URL || './';
const audioUrl = base + 'audio/MemoriesNo2.ogg';
const midiUrl = base + 'audio/MemoriesNo2.mid';
// Single image for now — expand to array when you add more.
// Existing set: 8 images in public/images/. Just push more paths here.
const imageUrl = base + 'images/Kunming-Garden-Spring-Pavilion-Pukekura-Park.jpg';

const LOOP_AUDIO = true;

const sketch = (p) => {
  p.plateau = [];
  p.img = null;
  p.coverState = null;
  p._burstFrames = 0;
  p.loopAudio = LOOP_AUDIO;

  p.setup = async () => {
    // FPS badge — bottom-right lab-label; on by default, ?fps=0 to hide, F to toggle
    const params = new URLSearchParams(window.location.search);
    const wantsFps = !params.has('fps') || params.get('fps') !== '0';
    if (wantsFps) p.enableFpsIndicator();
    window.toggleFps = () => p.toggleFpsIndicator();
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) p.toggleFpsIndicator();
    });

    p.pixelDensity(1);
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.background(255);
    p.canvas.style.position = 'fixed';
    p.canvas.style.top = '0';
    p.canvas.style.left = '0';
    p.canvas.style.zIndex = '1';

    initCapture(p, {
      prefix: 'MemoriesNo2',
      enabled: false,
    });

    p.img = await p.loadImage(imageUrl);
    // Don't resize — keep native 1920x1080, sample via cover mapping (no empty space on mobile)
    p.img.loadPixels();
    p.coverState = getCoverState(p.img, p.width, p.height);
    p.initPlateau();

    await p.loadSong(audioUrl, midiUrl, (data) => {
      p.midiPpq = data.header.ppq;
      p.scheduleCueSet(data.tracks[1]?.notes ?? [], 'onTrack1Cue');
    });
  };

  p.draw = () => {
    if (!p.img) return;
    // show static preview even before play — proves cover works & no empty space
    if (!p.song?.isPlaying()) {
      // idle drift: still animate slowly so preview isn't frozen
      p.background(255);
      for (let i = 0; i < Math.min(40, p.plateau.length); i++) {
        const pt = p.plateau[i];
        p.strokeWeight(2);
        p.stroke(pt.colour);
        p.circle(pt.x, pt.y, 2);
      }
      return;
    }

    // cue-driven burst: temporarily speed up + enlarge
    const burst = p._burstFrames > 0 ? 1.5 : 1;
    if (p._burstFrames > 0) p._burstFrames--;

    for (let i = 0; i < p.plateau.length; i++) {
      const particle = p.plateau[i];
      let size = 3 / p.abs(particle.destX - particle.x);
      particle.size = size > 2 ? size : 2;
      p.strokeWeight(particle.size * burst);
      p.stroke(particle.colour);
      p.circle(particle.x, particle.y, particle.size);
      const lerp = burst > 1 ? 0.35 : 0.2;
      particle.x += (particle.destX - particle.x) * lerp;
      particle.y += (particle.destY - particle.y) * lerp;

      if (p.abs(particle.destX - particle.x) <= Math.random()) {
        const posX = Math.floor(Math.random() * p.width);
        const posY = Math.floor(Math.random() * p.height);
        particle.destX = posX;
        particle.destY = posY;
        particle.x = posX - 2;
        particle.y = posY - 2;
        particle.colour = sampleCoverColor(p, p.img, posX, posY, p.coverState);
      }
    }
  };

  p.initPlateau = () => {
    p.clear();
    p.background(255);
    p.plateau = [];
    // responsive by area — phone ~120, desktop ~300-400, no empty-space bias
    const count = responsiveCount(p.width, p.height);
    for (let i = 0; i < count; i++) {
      const destX = Math.floor(Math.random() * p.width);
      const destY = Math.floor(Math.random() * p.height);
      p.plateau.push({
        x: Math.floor(Math.random() * p.width),
        y: Math.floor(Math.random() * p.height),
        destX,
        destY,
        colour: sampleCoverColor(p, p.img, destX, destY, p.coverState),
        size: 1,
      });
    }
  };

  p.onTrack1Cue = function (note) {
    // Visible MIDI reactivity: burst + re-seed 12% of particles
    p._burstFrames = 12; // ~200ms at 60fps
    const n = Math.floor(p.plateau.length * 0.12);
    for (let k = 0; k < n; k++) {
      const idx = Math.floor(p.random(p.plateau.length));
      const pt = p.plateau[idx];
      const posX = Math.floor(p.random(p.width));
      const posY = Math.floor(p.random(p.height));
      pt.destX = posX;
      pt.destY = posY;
      pt.x = posX - 2;
      pt.y = posY - 2;
      pt.colour = sampleCoverColor(p, p.img, posX, posY, p.coverState);
    }
    // also flash background faintly so even phone sees cue
    // console.log('No2 cue', note?.currentCue, note?.midi);
  };

  p.mouseClicked = () => {
    p.togglePlayback();
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    if (p.img) {
      p.coverState = getCoverState(p.img, p.width, p.height);
      p.initPlateau();
    }
  };
};

new p5(sketch);
