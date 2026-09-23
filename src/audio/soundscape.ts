// Sintetizador Web Audio API puro: crea paisajes sonoros de fondo sin descargas externas
class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private campfireNode: AudioNode | null = null;
  private birdsTimer: number | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generador de ruido rosa/marrón para lluvia
  public startRain(volume: number = 0.4) {
    this.stopRain();
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Ganancia de lluvia
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filtro pasa-bajos para sonido suave de lluvia
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.isMuted ? 0 : volume, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    this.rainNode = gain;
  }

  public stopRain() {
    if (this.rainNode) {
      try {
        (this.rainNode as GainNode).disconnect();
      } catch {
        // Ignored
      }
      this.rainNode = null;
    }
  }

  // Campana Zen tibetana suave al empezar o terminar sesión
  public playZenChime(type: 'start' | 'complete' | 'wilt') {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now); // Frecuencia Solfeggio 528Hz (Transformación & Paz)
      osc.frequency.exponentialRampToValueAtTime(1056, now + 1.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);
    } else if (type === 'complete') {
      // Arpegio armónico ascendente
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
    } else if (type === 'wilt') {
      // Tono melancólico descendente
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

  // Sonido de clic háptico / burbuja al seleccionar
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
      this.stopRain();
    }
  }
}

export const soundscape = new SoundscapeEngine();
