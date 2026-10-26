const MUTE_KEY = "microgames-inc-muted";

export class AudioBus {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuffer = null;
    this.muted = localStorage.getItem(MUTE_KEY) === "1";
  }

  unlock() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.createNoiseBuffer();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  toggle() {
    this.muted = !this.muted;
    localStorage.setItem(MUTE_KEY, this.muted ? "1" : "0");
    return this.muted;
  }

  createNoiseBuffer() {
    const length = Math.floor(this.ctx.sampleRate * 0.6);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  tone({
    freq = 440,
    to = null,
    dur = 0.08,
    type = "square",
    vol = 0.055,
    delay = 0,
    attack = 0.003,
  } = {}) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (to !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + dur);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  noise({ dur = 0.2, vol = 0.08, delay = 0, freq = 1200, q = 0.7 } = {}) {
    if (this.muted || !this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime + delay;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = freq;
    filter.Q.value = q;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(now);
    source.stop(now + dur);
  }

  ui() {
    this.tone({ freq: 560, dur: 0.045, vol: 0.035 });
  }

  select() {
    this.tone({ freq: 660, dur: 0.06, vol: 0.04 });
    this.tone({ freq: 990, dur: 0.08, vol: 0.035, delay: 0.06 });
  }

  intro() {
    this.tone({ freq: 330, dur: 0.06, vol: 0.04 });
    this.tone({ freq: 440, dur: 0.08, vol: 0.045, delay: 0.08 });
  }

  go() {
    this.tone({ freq: 880, dur: 0.07, vol: 0.055 });
    this.tone({ freq: 1320, dur: 0.12, vol: 0.045, delay: 0.06 });
  }

  tick() {
    this.tone({ freq: 1440, dur: 0.025, vol: 0.022 });
  }

  pop() {
    this.tone({ freq: 300, to: 820, dur: 0.09, type: "square", vol: 0.04 });
  }

  thud() {
    this.tone({ freq: 150, to: 42, dur: 0.22, type: "triangle", vol: 0.11 });
    this.noise({ dur: 0.12, vol: 0.05, freq: 380 });
  }

  crash() {
    this.noise({ dur: 0.34, vol: 0.12, freq: 1500 });
    this.tone({ freq: 210, to: 50, dur: 0.3, type: "sawtooth", vol: 0.07 });
  }

  explode() {
    this.noise({ dur: 0.5, vol: 0.16, freq: 900, q: 0.4 });
    this.tone({ freq: 110, to: 28, dur: 0.5, type: "triangle", vol: 0.12 });
  }

  lose() {
    const notes = [392, 370, 349, 311];
    notes.forEach((freq, i) => {
      this.tone({ freq, dur: 0.2, type: "square", vol: 0.045, delay: i * 0.145 });
    });
    this.tone({ freq: 233, to: 90, dur: 0.65, type: "sawtooth", vol: 0.05, delay: 0.58 });
    this.noise({ dur: 0.25, vol: 0.05, freq: 500, delay: 0.6 });
  }

  jingleStart() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => this.tone({ freq, dur: 0.11, vol: 0.045, delay: i * 0.09 }));
    this.tone({ freq: 1318, dur: 0.18, vol: 0.04, delay: 0.38 });
  }

  jingleEnd() {
    const notes = [523, 494, 466, 440, 392, 330];
    notes.forEach((freq, i) => this.tone({ freq, dur: 0.16, type: "triangle", vol: 0.06, delay: i * 0.13 }));
    this.tone({ freq: 196, to: 82, dur: 1, type: "sawtooth", vol: 0.045, delay: 0.8 });
  }
}
