// Sizzle Shift — tiny WebAudio synth. Every sound is generated, no audio files.
// The context is created lazily on the first user gesture (browser policy).

let ctx = null;
let master = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, t0, dur, type = 'sine', vol = 0.2, slideTo = null) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const start = c.currentTime + t0;
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(master);
  o.start(start); o.stop(start + dur + 0.05);
}

function noise(t0, dur, vol = 0.15, freq = 3000) {
  const c = ac(); if (!c) return;
  const start = c.currentTime + t0;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(master);
  src.start(start);
}

export const sfx = {
  unlock() { ac(); },
  pop() { tone(520, 0, 0.09, 'triangle', 0.22, 760); },
  place() { tone(300, 0, 0.08, 'triangle', 0.18, 210); noise(0, 0.05, 0.06, 1200); },
  sizzle() { noise(0, 0.5, 0.20, 2600); noise(0.12, 0.35, 0.12, 3400); },
  ding() { tone(1318, 0, 0.22, 'sine', 0.22); tone(1760, 0.02, 0.3, 'sine', 0.12); },
  burnt() { tone(160, 0, 0.3, 'sawtooth', 0.16, 70); noise(0, 0.25, 0.14, 700); },
  serve() { tone(659, 0, 0.12, 'triangle', 0.2); tone(784, 0.09, 0.12, 'triangle', 0.2); tone(1046, 0.18, 0.22, 'triangle', 0.22); },
  coin() { tone(988, 0, 0.09, 'square', 0.10); tone(1319, 0.07, 0.18, 'square', 0.10); },
  buzz() { tone(140, 0, 0.16, 'square', 0.16); tone(120, 0.05, 0.16, 'square', 0.14); },
  trash() { tone(220, 0, 0.14, 'triangle', 0.16, 90); noise(0.02, 0.12, 0.10, 500); },
  leave() { tone(620, 0, 0.28, 'sine', 0.16, 240); },
  bell() { tone(1568, 0, 0.4, 'sine', 0.14); tone(2093, 0.03, 0.35, 'sine', 0.07); },
  star() { tone(784, 0, 0.14, 'triangle', 0.18); tone(988, 0.12, 0.14, 'triangle', 0.18); tone(1175, 0.24, 0.3, 'triangle', 0.2); },
};
