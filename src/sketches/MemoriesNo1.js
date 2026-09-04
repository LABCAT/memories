import p5 from 'p5';
import '@lib/p5.audioReact.js';
import initCapture from '@labcat2020/p5.audioreactive-capture';

const base = import.meta.env.BASE_URL || './';
const audioUrl = base + 'audio/MemoriesNo1.ogg';
const midiUrl = base + 'audio/MemoriesNo1.mid';
const imageUrl = base + 'images/Kunming-Garden-Spring-Pavilion-Pukekura-Park.jpg';

const LOOP_AUDIO = true;

const sketch = (p) => {
  p.plateau = [];
  p.sizeDivisor = 1;
  p.img = null;
  p.loopAudio = LOOP_AUDIO;

  p.setup = async () => {
    p.pixelDensity(1);
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.background(255);
    p.canvas.style.position = 'fixed';
    p.canvas.style.top = '0';
    p.canvas.style.left = '0';
    p.canvas.style.zIndex = '1';

    initCapture(p, {
      prefix: 'MemoriesNo1',
      enabled: false,
    });

    p.img = await p.loadImage(imageUrl);
    p.img.resize(p.width / p.sizeDivisor, 0);
    p.img.loadPixels();
    p.initPlateau();

    await p.loadSong(audioUrl, midiUrl, (data) => {
      p.midiPpq = data.header.ppq;
      p.scheduleCueSet(data.tracks[1]?.notes ?? [], 'onTrack1Cue');
    });
  };

  p.draw = () => {
    if (!p.song?.isPlaying() || !p.img) return;

    for (let i = 0; i < p.plateau.length; i++) {
      const particle = p.plateau[i];
      let size = 3 / p.abs(particle.destX - particle.x);
      particle.size = size > 2 ? size : 2;
      p.strokeWeight(particle.size);
      p.stroke(particle.colour);
      p.circle(particle.x, particle.y, particle.size);
      particle.x += (particle.destX - particle.x) * 0.2;
      particle.y += (particle.destY - particle.y) * 0.2;

      if (p.abs(particle.destX - particle.x) <= Math.random()) {
        const posX = Math.floor(Math.random() * (p.width / p.sizeDivisor));
        const posY = Math.floor(Math.random() * (p.height / p.sizeDivisor));
        particle.destX = posX;
        particle.destY = posY;
        particle.x = posX - 2;
        particle.y = posY - 2;
        particle.colour = p.img.get(particle.destX, particle.destY);
      }
    }
  };

  p.initPlateau = () => {
    p.clear();
    p.background(255);
    p.plateau = [];
    const count = Math.floor(p.width / p.sizeDivisor);
    for (let i = 0; i < count; i++) {
      const destX = Math.floor(Math.random() * (p.width / p.sizeDivisor));
      const destY = Math.floor(Math.random() * (p.height / p.sizeDivisor));
      p.plateau.push({
        x: Math.floor(Math.random() * (p.width / p.sizeDivisor)),
        y: Math.floor(Math.random() * (p.height / p.sizeDivisor)),
        destX,
        destY,
        colour: p.img.get(destX, destY),
        size: 1,
      });
    }
  };

  p.onTrack1Cue = function () {
    // Track reserved for future cue-driven mutations (legacy sketch left this empty).
  };

  p.mouseClicked = () => {
    p.togglePlayback();
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    if (p.img) {
      p.img.resize(p.width / p.sizeDivisor, 0);
      p.img.loadPixels();
      p.initPlateau();
    }
  };
};

new p5(sketch);
