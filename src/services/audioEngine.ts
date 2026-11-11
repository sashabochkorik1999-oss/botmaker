/**
 * Web Audio Synthesizer for high-quality instant preview of audio,
 * sound effects (whoosh, deep impact, glitch, chords), and soundtrack loops.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isAmbientPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public playSFX(type: 'whoosh' | 'impact' | 'glitch' | 'typewriter' | 'chords') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    switch (type) {
      case 'whoosh': {
        // High to low frequency sweep with bandpass filter
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 3.0;
        filter.frequency.setValueAtTime(300, t);
        filter.frequency.exponentialRampToValueAtTime(3000, t + 0.15);
        filter.frequency.exponentialRampToValueAtTime(200, t + 0.38);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.39);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(t);
        noise.stop(t + 0.4);
        break;
      }

      case 'impact': {
        // Deep cinematic sub-bass boom
        const osc = this.ctx.createOscillator();
        const subOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.8);

        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(70, t);
        subOsc.frequency.exponentialRampToValueAtTime(28, t + 1.2);

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        subOsc.start(t);
        osc.stop(t + 1.3);
        subOsc.stop(t + 1.3);
        break;
      }

      case 'glitch': {
        // Rapid frequency bursts
        for (let i = 0; i < 4; i++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = t + i * 0.04;

          osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
          osc.frequency.setValueAtTime(600 + Math.random() * 1200, startTime);
          osc.frequency.setValueAtTime(120 + Math.random() * 400, startTime + 0.02);

          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.038);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(startTime);
          osc.stop(startTime + 0.04);
        }
        break;
      }

      case 'typewriter': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.03);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.035);
        break;
      }

      case 'chords': {
        // Lush cinematic chord (C-minor 9th: C, Eb, G, Bb, D)
        const freqs = [130.81, 155.56, 196.0, 233.08, 293.66];
        freqs.forEach((freq, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), t + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 2.6);
        });
        break;
      }
    }
  }

  public startSoundtrackLoop() {
    if (this.isAmbientPlaying || this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isAmbientPlaying = true;
    const t = this.ctx.currentTime;
    const freqs = [65.41, 98.0, 130.81, 196.0]; // Low C power chord

    this.ambientOscillators = freqs.map((f) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.04, t + 1.0);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      return osc;
    });
  }

  public stopSoundtrackLoop() {
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.ambientOscillators = [];
    this.isAmbientPlaying = false;
  }
}

export const audioEngine = new AudioEngine();
