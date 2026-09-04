import p5 from 'p5';
import '@lib/p5.audioReact.js';
import initCapture from '@labcat2020/p5.audioreactive-capture';

const base = import.meta.env.BASE_URL || './';
const audioUrl = base + 'audio/MemoriesNo2.ogg';
const midiUrl = base + 'audio/MemoriesNo2.mid';

const LOOP_AUDIO = true;

const sketch = (p) => {
  p.loopAudio = LOOP_AUDIO;

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

    await p.loadSong(audioUrl, midiUrl, (data) => {
      p.midiPpq = data.header.ppq;
      // Legacy memories-no-4 used tracks[5] (Synth 1).
      p.scheduleCueSet(data.tracks[5]?.notes ?? [], 'onTrack1Cue');
    });
  };

  p.draw = () => {
    // Visual updates are cue-driven (see onTrack1Cue).
  };

  p.onTrack1Cue = function () {
    p.background(p.random(255), p.random(255), p.random(255));
    p.fill(p.random(255), p.random(255), p.random(255));
    p.noStroke();
    p.ellipse(p.width / 2, p.height / 2, p.width / 4, p.width / 4);
  };

  p.mouseClicked = () => {
    p.togglePlayback();
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
};

new p5(sketch);
