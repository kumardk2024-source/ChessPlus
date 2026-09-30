/**
 * Audio Manager for ChessPlus
 * Pure Web Audio API procedural sound engine:
 * - 100% offline, zero network latency
 * - Crisp tactile wood/mineral/impact textures
 * - Handles browser autoplay restrictions gracefully
 */

export type SoundEffectType =
  | 'move'
  | 'capture'
  | 'check'
  | 'checkmate'
  | 'win'
  | 'loss'
  | 'draw'
  | 'castle'
  | 'select'
  | 'illegal'
  | 'clockTick';

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.75;

  constructor() {
    // Read persisted audio preference
    if (typeof window !== 'undefined') {
      try {
        const storedMuted = localStorage.getItem('chessplus_muted');
        if (storedMuted !== null) {
          this.isMuted = storedMuted === 'true';
        }
        const storedVolume = localStorage.getItem('chessplus_volume');
        if (storedVolume !== null) {
          const parsed = parseFloat(storedVolume);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.volume = parsed;
          }
        }
      } catch {
        // LocalStorage fallback
      }
    }
  }

  /**
   * Initializes or resumes the AudioContext after user interaction
   */
  public async ensureContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume failed:', err);
      }
    }

    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('chessplus_muted', String(muted));
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem('chessplus_volume', String(this.volume));
    } catch {
      // ignore
    }
  }

  /**
   * Play piece move: clean tactile wooden/mineral tap with subtle resonant body
   */
  public playMove(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      // Master gain node
      const master = ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.7, now);
      master.connect(ctx.destination);

      // Primary impact (damped triangle click)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.1);

      // Soft high tap burst (noise simulation via filtered quick pulse)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(750, now);
      subOsc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      subOsc.connect(subGain);
      subGain.connect(master);

      subOsc.start(now);
      subOsc.stop(now + 0.06);
    });
  }

  /**
   * Play piece capture: heavy satisfying acoustic impact + metallic ring
   */
  public playCapture(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.9, now);
      master.connect(ctx.destination);

      // Low punch
      const lowOsc = ctx.createOscillator();
      const lowGain = ctx.createGain();
      lowOsc.type = 'sine';
      lowOsc.frequency.setValueAtTime(240, now);
      lowOsc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

      lowGain.gain.setValueAtTime(1.0, now);
      lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      lowOsc.connect(lowGain);
      lowGain.connect(master);
      lowOsc.start(now);
      lowOsc.stop(now + 0.2);

      // High transient snap
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'square';
      snapOsc.frequency.setValueAtTime(880, now);
      snapOsc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

      snapGain.gain.setValueAtTime(0.4, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      snapOsc.connect(snapGain);
      snapGain.connect(master);
      snapOsc.start(now);
      snapOsc.stop(now + 0.07);

      // Subtle metallic overtone (chrome piece reflection)
      const ringOsc = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ringOsc.type = 'sine';
      ringOsc.frequency.setValueAtTime(1240, now);
      ringGain.gain.setValueAtTime(0.25, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      ringOsc.connect(ringGain);
      ringGain.connect(master);
      ringOsc.start(now);
      ringOsc.stop(now + 0.25);
    });
  }

  /**
   * Castling: Double rhythmic piece glide and placement
   */
  public playCastle(): void {
    if (this.isMuted) return;
    this.playMove();
    setTimeout(() => {
      this.playMove();
    }, 110);
  }

  /**
   * Check alert: dramatic two-tone warning chime
   */
  public playCheck(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.85, now);
      master.connect(ctx.destination);

      // Tone 1: High warning chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(master);
      osc1.start(now);
      osc1.stop(now + 0.36);

      // Tone 2: Dissonant resolving alert
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5
      gain2.gain.setValueAtTime(0.0, now);
      gain2.gain.setValueAtTime(0.65, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(master);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.56);
    });
  }

  /**
   * Checkmate: deep resonant power chord
   */
  public playCheckmate(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.95, now);
      master.connect(ctx.destination);

      const freqs = [146.83, 220.0, 293.66, 440.0]; // D3, A3, D4, A4
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.35, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now + idx * 0.04);
        osc.stop(now + 1.25);
      });
    });
  }

  /**
   * Win: Radiant victorious major arpeggio
   */
  public playWin(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.9, now);
      master.connect(ctx.destination);

      // C major 7 fanfare: C5, E5, G5, B5, C6
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
      notes.forEach((freq, i) => {
        const noteStart = now + i * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.3, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.65);

        osc.connect(gain);
        gain.connect(master);
        osc.start(noteStart);
        osc.stop(noteStart + 0.7);
      });
    });
  }

  /**
   * Loss: Somber descending minor phrase
   */
  public playLoss(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.8, now);
      master.connect(ctx.destination);

      const notes = [440.0, 392.0, 349.23, 293.66]; // A4, G4, F4, D4
      notes.forEach((freq, i) => {
        const noteStart = now + i * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.3, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.55);

        osc.connect(gain);
        gain.connect(master);
        osc.start(noteStart);
        osc.stop(noteStart + 0.6);
      });
    });
  }

  /**
   * Draw: Calm dual harmonic chime
   */
  public playDraw(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.75, now);
      master.connect(ctx.destination);

      const notes = [440.0, 554.37];
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 0.75);
      });
    });
  }

  /**
   * Select piece: very soft subtle tactile tap
   */
  public playSelect(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.03);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    });
  }

  /**
   * Illegal move: muted soft buzz
   */
  public playIllegal(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.06);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    });
  }

  /**
   * Clock tick for low-time warning (< 10s)
   */
  public playClockTick(): void {
    if (this.isMuted) return;
    this.ensureContext().then((ctx) => {
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(this.volume * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    });
  }
}

export const audioManager = new AudioManager();
