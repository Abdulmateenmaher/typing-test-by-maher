import { SoundProfile } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play procedural sound based on selected mechanical switch profile
 */
export function playKeySound(profile: SoundProfile, volume = 0.5, isSpace = false) {
  if (profile === 'off' || volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.4, now);
  masterGain.connect(ctx.destination);

  switch (profile) {
    case 'mechanical': {
      // Crisp mechanical click (Cherry MX Blue style) - high frequency double snap
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSpace ? 750 : 1200 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      clickGain.gain.setValueAtTime(0.8, now);
      clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);

      osc.connect(clickGain);
      clickGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }
    case 'thock': {
      // Deep resonance (Topre / Lubed switches) - deep bottom-out acoustic thud
      const osc = ctx.createOscillator();
      const thockGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isSpace ? 110 : 180 + Math.random() * 30, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

      thockGain.gain.setValueAtTime(1.0, now);
      thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(thockGain);
      thockGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
    }
    case 'creamsicle': {
      // Smooth linear keypress - soft organic pop
      const osc = ctx.createOscillator();
      const popGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isSpace ? 260 : 380 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.045);

      popGain.gain.setValueAtTime(0.7, now);
      popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.045);

      osc.connect(popGain);
      popGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
    case 'typewriter': {
      // Heavy mechanical strike
      const osc = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isSpace ? 300 : 600 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

      strikeGain.gain.setValueAtTime(0.6, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(strikeGain);
      strikeGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
      break;
    }
    case 'digital': {
      // Clean modern digital UI chirp
      const osc = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isSpace ? 880 : 1320, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.025);

      chirpGain.gain.setValueAtTime(0.4, now);
      chirpGain.gain.exponentialRampToValueAtTime(0.005, now + 0.025);

      osc.connect(chirpGain);
      chirpGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.03);
      break;
    }
  }
}

/**
 * Play subtle error warning sound
 */
export function playErrorSound(volume = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.09);

  gain.gain.setValueAtTime(volume * 0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * Celebration chime for Personal Best / Finish
 */
export function playFinishFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + idx * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.35);
  });
}

/**
 * Procedural Laser Shot sound for Arcade mode
 */
export function playLaserSound(volume = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(980, now);
  osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

  gain.gain.setValueAtTime(volume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Procedural Arcade Explosion sound when a word is destroyed
 */
export function playExplosionSound(volume = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);

  gain.gain.setValueAtTime(volume * 0.45, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

/**
 * Ascending pitch combo chime for hitting word streaks
 */
export function playComboSound(streak = 1, volume = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const baseFreq = 440;
  const step = Math.min(12, streak);
  const freq = baseFreq * Math.pow(2, step / 12);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.linearRampToValueAtTime(freq * 1.2, now + 0.12);

  gain.gain.setValueAtTime(volume * 0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * Sound when a shield / life is lost
 */
export function playShieldLostSound(volume = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(240, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

  gain.gain.setValueAtTime(volume * 0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.26);
}

/**
 * Sound when a power-up (Freeze, EMP, Heal) is activated
 */
export function playPowerUpSound(volume = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.05;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(volume * 0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  });
}

/**
 * Majestic Crystalline Freeze sound: descending glass chime harmonics with shimmer
 */
export function playFreezeSound(volume = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [1760, 1318.5, 987.77, 880, 659.25];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.04;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.85, start + 0.35);

    gain.gain.setValueAtTime(volume * 0.22, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

/**
 * Thunderous EMP / Nuke sound: heavy sub-bass seismic discharge with high-voltage electric crackle
 */
export function playEmpSound(volume = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Sub-bass shockwave impact
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(140, now);
  subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.45);
  subGain.gain.setValueAtTime(volume * 0.6, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.5);

  // 2. High voltage electric zap & discharge
  const zapOsc = ctx.createOscillator();
  const zapGain = ctx.createGain();
  zapOsc.type = 'sawtooth';
  zapOsc.frequency.setValueAtTime(1400, now);
  zapOsc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
  zapGain.gain.setValueAtTime(volume * 0.4, now);
  zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
  zapOsc.connect(zapGain);
  zapGain.connect(ctx.destination);
  zapOsc.start(now);
  zapOsc.stop(now + 0.32);
}
