// ============================================================
//  ARENA CLASH — SOUND.JS
//  Web Audio API synthesizer — no external files needed
// ============================================================

const Sound = (() => {
  let ctx = null;
  let muted = false;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type = 'sine', dur = 0.15, vol = 0.14, delay = 0) {
    if (muted) return;
    try {
      const c   = getCtx();
      const osc = c.createOscillator();
      const gain= c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.value = freq;
      const t = c.currentTime + delay;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    } catch (_) {}
  }

  function noise(dur = 0.1, vol = 0.08) {
    if (muted) return;
    try {
      const c      = getCtx();
      const frames = c.sampleRate * dur;
      const buf    = c.createBuffer(1, frames, c.sampleRate);
      const data   = buf.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1);
      const src  = c.createBufferSource();
      const gain = c.createGain();
      src.buffer = buf;
      src.connect(gain);
      gain.connect(c.destination);
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      src.start();
    } catch (_) {}
  }

  const SFX = {
    click() {
      tone(900, 'sine', 0.06, 0.07);
    },
    shoot() {
      noise(0.06, 0.12);
      tone(300, 'sawtooth', 0.08, 0.1);
      tone(150, 'square',   0.1,  0.07, 0.04);
    },
    hit() {
      noise(0.07, 0.15);
      tone(180, 'sawtooth', 0.09, 0.16);
    },
    crit() {
      tone(880, 'sine',     0.05, 0.2);
      tone(660, 'sine',     0.08, 0.15, 0.05);
      tone(440, 'triangle', 0.1,  0.1,  0.1);
      noise(0.05, 0.1);
    },
    kill() {
      [440, 330, 220, 110].forEach((f, i) => tone(f, 'sawtooth', 0.12, 0.18, i * 0.07));
    },
    victory() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.3, 0.22, i * 0.15));
      setTimeout(() => {
        [784, 988, 1175, 1568].forEach((f, i) => tone(f, 'sine', 0.25, 0.18, i * 0.12));
      }, 700);
    },
    defeat() {
      [440, 330, 220, 165].forEach((f, i) => tone(f, 'sine', 0.4, 0.18, i * 0.22));
    },
    collect() {
      tone(660, 'sine', 0.1, 0.13);
      tone(880, 'sine', 0.1, 0.1, 0.1);
    },
    skill() {
      tone(1200, 'sine',     0.18, 0.18);
      tone(900,  'triangle', 0.14, 0.13, 0.1);
      noise(0.08, 0.07);
    },
    ultimate() {
      // Big dramatic sound for ultimate
      [200, 300, 400].forEach((f, i) => tone(f, 'sawtooth', 0.3, 0.2, i * 0.05));
      setTimeout(() => {
        [800, 1000, 1200].forEach((f, i) => tone(f, 'sine', 0.2, 0.18, i * 0.06));
      }, 200);
      noise(0.2, 0.15);
    },
    levelup() {
      [523, 659, 784, 880, 1047].forEach((f, i) => tone(f, 'sine', 0.22, 0.22, i * 0.09));
    },
    chest() {
      [300, 400, 500, 700, 900].forEach((f, i) => tone(f, 'sine', 0.15, 0.16, i * 0.1));
    },
    passive() {
      tone(1200, 'sine',     0.2,  0.18);
      tone(900,  'triangle', 0.15, 0.13, 0.1);
    },
    stun() {
      tone(400, 'square', 0.1, 0.18);
      tone(200, 'square', 0.15, 0.12, 0.08);
    },
    heal() {
      tone(660, 'sine', 0.12, 0.14);
      tone(780, 'sine', 0.1,  0.12, 0.08);
      tone(880, 'sine', 0.08, 0.1,  0.15);
    },
    dash() {
      tone(300, 'sawtooth', 0.05, 0.12);
      tone(600, 'sine',     0.08, 0.1, 0.03);
    },
    countdown() {
      tone(440, 'sine', 0.2, 0.2);
    },
    countdownGo() {
      [440, 550, 660].forEach((f, i) => tone(f, 'sine', 0.18, 0.25, i * 0.06));
    },
  };

  function setMuted(val) { muted = val; }
  function isMuted() { return muted; }

  return { ...SFX, setMuted, isMuted, getCtx };
})();
