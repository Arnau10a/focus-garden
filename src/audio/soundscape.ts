import { SoundscapeType } from '../types';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentSourceNode: AudioNode | null = null;
  private currentType: SoundscapeType = 'rain';
  private isMuted: boolean = false;
  private birdInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSoundscape(type: SoundscapeType, volume: number = 0.35) {
    this.stopSoundscape();
    this.currentType = type;
    this.initCtx();
    if (!this.ctx) return;

    if (type === 'rain') {
      this.startRain(volume);
    } else if (type === 'waves') {
      this.startOceanWaves(volume);
    } else if (type === 'fire') {
      this.startFireplace(volume);
    } else if (type === 'cafe') {
      this.startPinkNoiseCafe(volume);
    } else if (type === 'birds') {
      this.startForestBirds(volume);
    }
  }

  private startRain(volume: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.isMuted ? 0 : volume, this.ctx.currentTime);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    this.currentSourceNode = gain;
  }

  private startOceanWaves(volume: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.4;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Modulador LFO para el vaivén de las olas
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 1 ola cada 8 segundos
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(volume * 0.6, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);

    lfo.connect(gain.gain);
    noise.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start();
    noise.start();
    this.currentSourceNode = gain;
  }

  private startFireplace(volume: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const crackle = Math.random() > 0.998 ? (Math.random() * 2 - 1) * 2.5 : 0;
      data[i] = (Math.random() * 2 - 1) * 0.04 + crackle;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.isMuted ? 0 : volume, this.ctx.currentTime);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    this.currentSourceNode = gain;
  }

  private startPinkNoiseCafe(volume: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.05;
      b2 = 0.85 * b2 + white * 0.1;
      data[i] = (b0 + b1 + b2) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.isMuted ? 0 : volume, this.ctx.currentTime);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    this.currentSourceNode = gain;
  }

  private startForestBirds(volume: number) {
    // Ruido suave de brisa de hojas + píos de pájaros
    this.startRain(volume * 0.4);
    if (!this.ctx) return;

    this.birdInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const baseFreq = 2200 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, now + 0.25);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }, 4500);
  }

  public stopSoundscape() {
    if (this.birdInterval) {
      clearInterval(this.birdInterval);
      this.birdInterval = null;
    }
    if (this.currentSourceNode) {
      try {
        (this.currentSourceNode as GainNode).disconnect();
      } catch {
        // Ignorado
      }
      this.currentSourceNode = null;
    }
  }

  public playZenChime(type: 'start' | 'complete' | 'wilt' | 'break') {
    this.initCtx();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now);
      osc.frequency.exponentialRampToValueAtTime(1056, now + 1.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);
    } else if (type === 'complete') {
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        const noteStart = now + idx * 0.15;
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq, noteStart);
        subGain.gain.setValueAtTime(0.2, noteStart);
        subGain.gain.exponentialRampToValueAtTime(0.001, noteStart + 2.0);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(noteStart);
        subOsc.stop(noteStart + 2.0);
      });
    } else if (type === 'break') {
      // Tono suave para descanso (acorde mayor de relajación)
      [523.25, 659.25].forEach((freq, idx) => {
        if (!this.ctx) return;
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        const noteStart = now + idx * 0.2;
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(freq, noteStart);
        subGain.gain.setValueAtTime(0.18, noteStart);
        subGain.gain.exponentialRampToValueAtTime(0.001, noteStart + 3.0);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(noteStart);
        subOsc.stop(noteStart + 3.0);
      });
    } else if (type === 'wilt') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 1.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    }
  }

  public playPop() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public toggleMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSoundscape();
    }
  }
}

export const soundscape = new SoundscapeEngine();
