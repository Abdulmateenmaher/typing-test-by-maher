import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  Zap,
  Flame,
  Shield,
  Snowflake,
  Volume2,
  VolumeX,
  Trophy,
  ArrowLeft,
  Sparkles,
  Gamepad2,
  AlertTriangle,
  Radio,
  Crosshair,
  Gauge,
  Keyboard as KeyboardIcon,
  Crown,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeConfig } from '../utils/themes';
import { SoundProfile, SupportedLanguage } from '../types';
import {
  playLaserSound,
  playExplosionSound,
  playComboSound,
  playShieldLostSound,
  playPowerUpSound,
  playFreezeSound,
  playEmpSound,
  playErrorSound,
  playKeySound
} from '../utils/audio';
import { getWordsForLanguage, isRtlLanguage } from '../utils/words';

export interface CategoryRecord {
  highScore: number;
  bestWpm: number;
  maxWave: number;
}

export type CategoryRecords = Record<'normal' | 'fast' | 'hyper', CategoryRecord>;

const DEFAULT_CATEGORY_RECORDS: CategoryRecords = {
  normal: { highScore: 0, bestWpm: 0, maxWave: 1 },
  fast: { highScore: 0, bestWpm: 0, maxWave: 1 },
  hyper: { highScore: 0, bestWpm: 0, maxWave: 1 }
};

interface EnemyWord {
  id: string;
  word: string;
  x: number;
  y: number;
  speed: number;
  typedChars: number;
  isBoss?: boolean;
  powerUp?: 'freeze' | 'emp' | 'heal' | null;
  droneType: 'scout' | 'assault' | 'heavy' | 'boss';
  color: string;
  width: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface FloatText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
}

interface LaserBolt {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  color: string;
}

interface SnowflakeParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  alpha: number;
}

interface ArcadeGameProps {
  theme: ThemeConfig;
  sound: SoundProfile;
  soundVolume: number;
  language?: SupportedLanguage;
  onExit: () => void;
  onSaveScore?: (
    score: number,
    wave: number,
    accuracy: number,
    wpm: number,
    category: 'normal' | 'fast' | 'hyper'
  ) => void;
}

export const ArcadeGame: React.FC<ArcadeGameProps> = ({
  theme,
  sound,
  soundVolume,
  language = 'english',
  onExit,
  onSaveScore
}) => {
  // Game States
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [difficultySpeed, setDifficultySpeed] = useState<'normal' | 'fast' | 'hyper'>('normal');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [shields, setShields] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wordsDestroyed, setWordsDestroyed] = useState(0);
  const [totalKeysPressed, setTotalKeysPressed] = useState(0);
  const [correctKeysPressed, setCorrectKeysPressed] = useState(0);
  const [lastGameWpm, setLastGameWpm] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Per-category Rankings & Records
  const [categoryRecords, setCategoryRecords] = useState<CategoryRecords>(() => {
    try {
      const stored = localStorage.getItem('maher_arcade_category_records');
      if (stored) return { ...DEFAULT_CATEGORY_RECORDS, ...JSON.parse(stored) };
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORY_RECORDS;
  });

  // Active target & states
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [waveAnnouncement, setWaveAnnouncement] = useState<string>('');
  const [isFrozen, setIsFrozen] = useState(false);
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [showTouchKeys, setShowTouchKeys] = useState(false);

  // Audio mute toggle
  const [isMuted, setIsMuted] = useState(sound === 'off');

  // Input & Canvas References
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Physics and Game loop refs
  const enemiesRef = useRef<EnemyWord[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const floatTextsRef = useRef<FloatText[]>([]);
  const starsRef = useRef<Star[]>([]);
  const snowflakesRef = useRef<SnowflakeParticle[]>([]);
  const laserBoltsRef = useRef<LaserBolt[]>([]);
  const empArcsRef = useRef<{ x1: number; y1: number; x2: number; y2: number; life: number }[]>([]);
  const activeTargetIdRef = useRef<string | null>(null);

  const lastTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const freezeEndTimeRef = useRef<number>(0);
  const freezeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const shieldsRef = useRef<number>(3);
  const hasHandledGameOverRef = useRef<boolean>(false);
  const difficultySpeedRef = useRef<'normal' | 'fast' | 'hyper'>('normal');

  useEffect(() => {
    difficultySpeedRef.current = difficultySpeed;
  }, [difficultySpeed]);

  // Stable reference to onSaveScore
  const onSaveScoreRef = useRef(onSaveScore);
  useEffect(() => {
    onSaveScoreRef.current = onSaveScore;
  });

  // Keep target id in sync for high frequency animation loop
  useEffect(() => {
    activeTargetIdRef.current = activeTargetId;
  }, [activeTargetId]);

  // Auto focus input
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, []);

  // Initialize Background Starfield
  const initStars = (width: number, height: number) => {
    const stars: Star[] = [];
    const count = Math.min(80, Math.floor(width / 10));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 18 + Math.random() * 45,
        size: Math.random() < 0.25 ? 2 : 1,
        alpha: 0.2 + Math.random() * 0.65
      });
    }
    starsRef.current = stars;
  };

  // Add Explosion Particles
  const addExplosionParticles = (x: number, y: number, color: string, count = 18) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 45 + Math.random() * 160;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: 1.5 + Math.random() * 3,
        decay: 1.6 + Math.random() * 1.8
      });
    }
  };

  // Add Radial Shockwave
  const addShockwave = (x: number, y: number, color: string, maxRadius = 75) => {
    shockwavesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      alpha: 0.9
    });
  };

  // Add Floating Text
  const addFloatText = (text: string, x: number, y: number, color = '#22d3ee') => {
    floatTextsRef.current.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -40
    });
  };

  // Spawn Enemy Drone with snappy speeds
  const spawnEnemy = useCallback((curWave: number, canvasWidth: number, initialY = -25) => {
    if (canvasWidth <= 0) return;

    // Word Length & Difficulty based on wave
    let lengthTier = 4;
    if (curWave >= 3) lengthTier = 5;
    if (curWave >= 6) lengthTier = 6;
    if (curWave >= 9) lengthTier = 7;

    const rawWordPool = getWordsForLanguage(language);
    const filtered = rawWordPool.filter((w) => w.length >= 2 && w.length <= lengthTier + 2);
    let candidate = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)].toLowerCase()
      : 'strike';

    // Prevent identical word on screen
    const existing = new Set(enemiesRef.current.map((e) => e.word));
    if (existing.has(candidate)) {
      candidate = candidate + (isRtlLanguage(language) ? 'ه' : 's');
    }

    // Drone Type & Speed calculation
    const isBoss = curWave % 5 === 0 && enemiesRef.current.every((e) => !e.isBoss);
    let droneType: 'scout' | 'assault' | 'heavy' | 'boss' = 'assault';
    let powerUp: 'freeze' | 'emp' | 'heal' | null = null;
    let color = '#38bdf8'; // Cyan default

    if (isBoss) {
      droneType = 'boss';
      const bossWords = isRtlLanguage(language)
        ? ['بریالیتوب', 'روښانه', 'خوشبختی', 'کامیابی']
        : ['cyberpunk', 'hyperdrive', 'supernova', 'algorithm', 'mainframe', 'quicksilver', 'vanguard'];
      candidate = bossWords[Math.floor(Math.random() * bossWords.length)];
      color = '#f43f5e'; // Crimson
    } else {
      const roll = Math.random();
      if (roll < 0.22) {
        // Bonus Drone with Power-up
        droneType = 'scout';
        const pTypes: ('freeze' | 'emp' | 'heal')[] = ['freeze', 'emp', 'heal'];
        powerUp = pTypes[Math.floor(Math.random() * pTypes.length)];
        color = powerUp === 'freeze' ? '#67e8f9' : powerUp === 'emp' ? '#fbbf24' : '#34d399';
      } else if (roll < 0.48) {
        // Fast Scout
        droneType = 'scout';
        color = '#a855f7'; // Purple
      } else if (roll < 0.78) {
        // Assault Cruiser
        droneType = 'assault';
        color = '#06b6d4'; // Cyan
      } else {
        // Heavy Drone
        droneType = 'heavy';
        color = '#f97316'; // Orange
      }
    }

    // Base falling speed (snappy, energetic - NO LAZY SLUGGISH START)
    const curSpeed = difficultySpeedRef.current;
    const speedMult = curSpeed === 'normal' ? 1.0 : curSpeed === 'fast' ? 1.4 : 1.85;
    let baseSpeedPx = (52 + Math.min(75, (curWave - 1) * 8)) * speedMult;
    if (droneType === 'scout') baseSpeedPx *= 1.35;
    if (droneType === 'heavy') baseSpeedPx *= 0.8;
    if (droneType === 'boss') baseSpeedPx *= 0.65;

    // Approximate width based on word length
    const estimatedWidth = Math.max(75, candidate.length * 13 + 24);

    // Random X bounded nicely to prevent clipping edges
    const minX = estimatedWidth / 2 + 16;
    const maxX = Math.max(minX + 20, canvasWidth - estimatedWidth / 2 - 16);
    const x = minX + Math.random() * (maxX - minX);

    const newEnemy: EnemyWord = {
      id: `enemy-${Date.now()}-${Math.random()}`,
      word: candidate,
      x,
      y: initialY,
      speed: baseSpeedPx,
      typedChars: 0,
      isBoss,
      powerUp,
      droneType,
      color,
      width: estimatedWidth
    };

    enemiesRef.current.push(newEnemy);
  }, [language]);

  // Activate Wonderfully Polished Freeze Power-Up
  const triggerFreeze = useCallback(() => {
    if (!isMuted) playFreezeSound(soundVolume);
    setIsFrozen(true);
    setFreezeTimeLeft(5.0);

    const now = performance.now();
    freezeEndTimeRef.current = now + 5000;

    // Populate crystalline snowflakes
    if (canvasRef.current) {
      const { width, height } = canvasRef.current;
      const flakes: SnowflakeParticle[] = [];
      for (let i = 0; i < 40; i++) {
        flakes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 20,
          vy: 18 + Math.random() * 30,
          size: 1.5 + Math.random() * 2.5,
          alpha: 0.4 + Math.random() * 0.5
        });
      }
      snowflakesRef.current = flakes;
    }

    if (freezeIntervalRef.current) clearInterval(freezeIntervalRef.current);
    freezeIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, (freezeEndTimeRef.current - performance.now()) / 1000);
      setFreezeTimeLeft(remaining);
      if (remaining <= 0) {
        setIsFrozen(false);
        snowflakesRef.current = [];
        if (freezeIntervalRef.current) clearInterval(freezeIntervalRef.current);
      }
    }, 100);
  }, [isMuted, soundVolume]);

  // Activate Wonderfully Epic EMP / Nuke Power-Up
  const triggerEmp = useCallback(() => {
    if (!isMuted) playEmpSound(soundVolume);

    const canvas = canvasRef.current;
    const turretX = canvas ? canvas.clientWidth / 2 : 250;
    const turretY = canvas ? canvas.clientHeight - 32 : 300;

    // Generate dramatic lightning bolts connecting turret to all targets
    const arcs: { x1: number; y1: number; x2: number; y2: number; life: number }[] = [];
    enemiesRef.current.forEach((e) => {
      arcs.push({
        x1: turretX,
        y1: turretY,
        x2: e.x,
        y2: e.y,
        life: 0.4
      });
      // Staggered explosions with golden electric rings
      addExplosionParticles(e.x, e.y, '#fbbf24', 35);
      addExplosionParticles(e.x, e.y, '#38bdf8', 25);
      addShockwave(e.x, e.y, '#fbbf24', 95);
      addShockwave(e.x, e.y, '#38bdf8', 120);
    });
    empArcsRef.current = arcs;

    // Screen shake impact
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 450);

    const count = enemiesRef.current.length;
    enemiesRef.current = [];
    setActiveTargetId(null);
    activeTargetIdRef.current = null;
    setCurrentInput('');
    const bonus = count * 200;
    setScore((s) => s + bonus);
    setWordsDestroyed((w) => w + count);

    if (count > 0) {
      addFloatText(`⚡ EMP DETONATION: +${bonus} PTS ⚡`, turretX, turretY - 80, '#fbbf24');
    }
  }, [isMuted, soundVolume]);

  // Fire laser bolt animation towards target
  const fireLaserBolt = (targetX: number, targetY: number, turretX: number, turretY: number, color = '#22d3ee') => {
    laserBoltsRef.current.push({
      startX: turretX,
      startY: turretY,
      targetX,
      targetY,
      progress: 0,
      color
    });
  };

  // Start / Restart Game with Instant Action (NO WAITING / NO LAZY DELAY)
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setWave(1);
    setShields(3);
    shieldsRef.current = 3;
    setCombo(0);
    setMaxCombo(0);
    setWordsDestroyed(0);
    setTotalKeysPressed(0);
    setCorrectKeysPressed(0);
    setActiveTargetId(null);
    activeTargetIdRef.current = null;
    setCurrentInput('');
    setIsFrozen(false);
    setIsNewRecord(false);
    hasHandledGameOverRef.current = false;

    enemiesRef.current = [];
    particlesRef.current = [];
    shockwavesRef.current = [];
    floatTextsRef.current = [];
    laserBoltsRef.current = [];
    snowflakesRef.current = [];
    empArcsRef.current = [];

    const now = performance.now();
    lastTimeRef.current = now;
    lastSpawnTimeRef.current = now;
    startTimeRef.current = now;

    setWaveAnnouncement('WAVE 1: DEFENSE INITIATED');
    setTimeout(() => setWaveAnnouncement(''), 1600);

    // Instant Action: Spawn 2 targets right away so user shoots immediately
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      initStars(rect.width, rect.height);
      // Drone 1 starts mid-screen, Drone 2 starts near top
      spawnEnemy(1, rect.width, 60);
      spawnEnemy(1, rect.width, 10);
    }
    setTimeout(focusInput, 30);
  }, [spawnEnemy, focusInput]);

  // Main Canvas 60FPS / 120FPS Animation & Physics Loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const renderLoop = (timestamp: number) => {
      if (!isRunning) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(0.1, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // 1. Clear Frame
      ctx.clearRect(0, 0, width, height);

      // 2. Cyber Space Background with Starfield
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, width, height);

      // 3. Grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Update & Draw Stars
      for (const s of starsRef.current) {
        s.y += s.speed * dt * (isFrozen ? 0.3 : 1);
        if (s.y > height) {
          s.y = -2;
          s.x = Math.random() * width;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      // 5. Freeze Effect: Crystalline Frost Vignette & Snowflakes
      if (isFrozen) {
        // Frost border glow
        const frostGrad = ctx.createRadialGradient(
          width / 2, height / 2, Math.min(width, height) * 0.3,
          width / 2, height / 2, Math.max(width, height) * 0.7
        );
        frostGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        frostGrad.addColorStop(1, 'rgba(103, 232, 249, 0.22)');
        ctx.fillStyle = frostGrad;
        ctx.fillRect(0, 0, width, height);

        // Snowflakes drifting
        for (const sf of snowflakesRef.current) {
          sf.y += sf.vy * dt;
          sf.x += sf.vx * dt;
          if (sf.y > height) {
            sf.y = -4;
            sf.x = Math.random() * width;
          }
          ctx.save();
          ctx.fillStyle = `rgba(165, 243, 252, ${sf.alpha})`;
          ctx.beginPath();
          ctx.arc(sf.x, sf.y, sf.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 6. EMP Electrical Lightning Arcs
      for (let i = empArcsRef.current.length - 1; i >= 0; i--) {
        const arc = empArcsRef.current[i];
        arc.life -= dt * 2.2;
        if (arc.life <= 0) {
          empArcsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = arc.life > 0.2 ? '#fef08a' : '#38bdf8';
        ctx.lineWidth = 2.5 * arc.life;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);
        const segments = 5;
        const dx = (arc.x2 - arc.x1) / segments;
        const dy = (arc.y2 - arc.y1) / segments;
        for (let j = 1; j < segments; j++) {
          const jitterX = (Math.random() - 0.5) * 28;
          const jitterY = (Math.random() - 0.5) * 28;
          ctx.lineTo(arc.x1 + dx * j + jitterX, arc.y1 + dy * j + jitterY);
        }
        ctx.lineTo(arc.x2, arc.y2);
        ctx.stroke();
        ctx.restore();
      }

      // 7. Base Defense Line (Shield Barrier at bottom)
      const baselineY = height - 44;
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#06b6d4';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, baselineY);
      ctx.lineTo(width - 10, baselineY);
      ctx.stroke();
      ctx.restore();

      // 8. Update & Draw Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += dt * 180;
        sw.alpha -= dt * 1.8;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 9. Update & Draw Laser Bolts
      const turretX = width / 2;
      const turretY = baselineY + 12;

      for (let i = laserBoltsRef.current.length - 1; i >= 0; i--) {
        const lb = laserBoltsRef.current[i];
        lb.progress += dt * 8; // Ultra fast laser beam
        if (lb.progress >= 1) {
          laserBoltsRef.current.splice(i, 1);
          continue;
        }

        const currentX = lb.startX + (lb.targetX - lb.startX) * lb.progress;
        const currentY = lb.startY + (lb.targetY - lb.startY) * lb.progress;

        ctx.save();
        ctx.strokeStyle = lb.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = lb.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lb.startX, lb.startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        ctx.restore();
      }

      // 10. Update & Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= p.decay * dt;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 11. Update & Draw Floating Text
      for (let i = floatTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatTextsRef.current[i];
        ft.y += ft.vy * dt;
        ft.alpha -= dt * 1.2;

        if (ft.alpha <= 0) {
          floatTextsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 12. Update & Render Falling Enemy Words (Continuous 60FPS physics)
      const enemiesToKeep: EnemyWord[] = [];
      let breached = false;
      const currentTargetId = activeTargetIdRef.current;
      const isRtl = isRtlLanguage(language);

      for (const enemy of enemiesRef.current) {
        // Continuous movement downwards (slowed during Freeze)
        const fallSpeed = isFrozen ? enemy.speed * 0.2 : enemy.speed;
        enemy.y += fallSpeed * dt;

        // Check breach
        if (enemy.y >= baselineY - 8) {
          breached = true;
          addExplosionParticles(enemy.x, baselineY, '#f43f5e', 28);
          addShockwave(enemy.x, baselineY, '#f43f5e', 65);
          if (!isMuted) playShieldLostSound(soundVolume);
          continue;
        }

        enemiesToKeep.push(enemy);

        // Draw thruster fire beneath drone
        if (!isFrozen && Math.random() < 0.4) {
          particlesRef.current.push({
            x: enemy.x + (Math.random() - 0.5) * 12,
            y: enemy.y + 14,
            vx: (Math.random() - 0.5) * 15,
            vy: 25 + Math.random() * 35,
            color: enemy.droneType === 'boss' ? '#f43f5e' : '#38bdf8',
            alpha: 0.7,
            size: 1.5 + Math.random() * 2,
            decay: 2.5
          });
        }

        const isTargeted = enemy.id === currentTargetId;

        // Render Drone Card & Glowing Letters directly on Canvas
        ctx.save();
        const boxWidth = enemy.width;
        const boxHeight = 32;
        const boxX = enemy.x - boxWidth / 2;
        const boxY = enemy.y - boxHeight / 2;

        // Active Target Reticle & Laser lock
        if (isTargeted) {
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(turretX, turretY);
          ctx.lineTo(enemy.x, enemy.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Glowing Crosshair Ring
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#22d3ee';
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, boxWidth / 2 + 10, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Drone Box Background & Border
        ctx.shadowBlur = isTargeted ? 15 : 6;
        ctx.shadowColor = isTargeted ? '#38bdf8' : enemy.color;
        ctx.fillStyle = isTargeted
          ? 'rgba(15, 23, 42, 0.95)'
          : 'rgba(10, 15, 28, 0.88)';
        ctx.strokeStyle = isTargeted
          ? '#38bdf8'
          : enemy.droneType === 'boss'
          ? '#f43f5e'
          : enemy.color;
        ctx.lineWidth = isTargeted ? 2 : 1.2;

        const radius = 8;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
        ctx.fill();
        ctx.stroke();

        // Frozen ice crystal wrapping
        if (isFrozen) {
          ctx.strokeStyle = '#a5f3fc';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = '#67e8f9';
          ctx.shadowBlur = 12;
          ctx.strokeRect(boxX - 3, boxY - 3, boxWidth + 6, boxHeight + 6);
        }

        // Power-Up or Boss Badge above box
        if (enemy.powerUp) {
          const badgeText = enemy.powerUp === 'freeze' ? '❄ FREEZE' : enemy.powerUp === 'emp' ? '⚡ EMP' : '🛡 REPAIR';
          ctx.font = 'bold 9px system-ui, sans-serif';
          ctx.fillStyle = enemy.color;
          ctx.textAlign = 'center';
          ctx.fillText(badgeText, enemy.x, boxY - 5);
        } else if (enemy.droneType === 'boss') {
          ctx.font = 'bold 9px system-ui, sans-serif';
          ctx.fillStyle = '#f43f5e';
          ctx.textAlign = 'center';
          ctx.fillText('⚠ BOSS INVADER ⚠', enemy.x, boxY - 5);
        }

        // Font selection supporting Arabic/Pashto/Dari ligatures cleanly
        ctx.font = isRtl
          ? 'bold 18px "Noto Sans Arabic", Tahoma, "Segoe UI", system-ui, sans-serif'
          : 'bold 15px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
        ctx.textBaseline = 'middle';

        if (isRtl) {
          ctx.direction = 'rtl';
          ctx.textAlign = 'center';
          // Draw whole word in base color: 100% connected cursive letters
          ctx.shadowBlur = 0;
          ctx.fillStyle = isTargeted ? '#ffffff' : '#cbd5e1';
          ctx.fillText(enemy.word, enemy.x, enemy.y);

          // If typed characters exist, highlight them by clipping the right portion
          if (enemy.typedChars > 0) {
            ctx.save();
            const totalWidth = ctx.measureText(enemy.word).width;
            const typedFraction = Math.min(1, enemy.typedChars / enemy.word.length);
            const clipWidth = totalWidth * typedFraction;
            ctx.beginPath();
            ctx.rect(enemy.x + totalWidth / 2 - clipWidth - 2, enemy.y - 18, clipWidth + 4, 36);
            ctx.clip();
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#34d399';
            ctx.fillStyle = '#34d399';
            ctx.fillText(enemy.word, enemy.x, enemy.y);
            ctx.restore();
          }
        } else {
          ctx.direction = 'ltr';
          const typedText = enemy.word.slice(0, enemy.typedChars);
          const remainingText = enemy.word.slice(enemy.typedChars);

          const typedWidth = ctx.measureText(typedText).width;
          const remainingWidth = ctx.measureText(remainingText).width;
          const totalTextWidth = typedWidth + remainingWidth;
          const startTextX = enemy.x - totalTextWidth / 2;

          if (typedText.length > 0) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#34d399';
            ctx.fillStyle = '#34d399'; // Emerald
            ctx.fillText(typedText, startTextX, enemy.y);
          }

          ctx.shadowBlur = 0;
          ctx.fillStyle = isTargeted ? '#ffffff' : '#cbd5e1';
          ctx.fillText(remainingText, startTextX + typedWidth, enemy.y);
        }

        ctx.restore();
      }

      enemiesRef.current = enemiesToKeep;

      // Handle Base Shield Breached
      if (breached) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 350);

        shieldsRef.current = Math.max(0, shieldsRef.current - 1);
        setShields(shieldsRef.current);

        setCombo(0);
        setActiveTargetId(null);
        activeTargetIdRef.current = null;
        setCurrentInput('');

        if (shieldsRef.current <= 0) {
          setGameState('gameover');
          if (!isMuted) playErrorSound(soundVolume);
          return;
        }
      }

      // 13. Draw Player Turret Base at bottom center
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#06b6d4';
      ctx.fillStyle = '#06b6d4';

      ctx.beginPath();
      ctx.arc(turretX, turretY, 18, Math.PI, 0, false);
      ctx.fill();

      // Turret Barrel angling towards active target
      let targetAngle = -Math.PI / 2;
      const curTarget = enemiesRef.current.find((e) => e.id === currentTargetId);
      if (curTarget) {
        targetAngle = Math.atan2(curTarget.y - turretY, curTarget.x - turretX);
      }

      const barrelLen = 22;
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(turretX, turretY);
      ctx.lineTo(turretX + Math.cos(targetAngle) * barrelLen, turretY + Math.sin(targetAngle) * barrelLen);
      ctx.stroke();

      ctx.restore();

      // 14. Automatic Word Spawner
      const curWave = wave;
      const speedMult = difficultySpeed === 'normal' ? 1.0 : difficultySpeed === 'fast' ? 1.35 : 1.75;
      const spawnIntervalMs = Math.max(1300, (2600 - curWave * 120)) / speedMult;

      if (timestamp - lastSpawnTimeRef.current >= spawnIntervalMs) {
        spawnEnemy(curWave, width);
        lastSpawnTimeRef.current = timestamp;
      }

      gameLoopRef.current = requestAnimationFrame(renderLoop);
    };

    gameLoopRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, wave, difficultySpeed, isFrozen, isMuted, soundVolume, spawnEnemy, language]);

  // Handle Character Strike
  const handleKeyStroke = (char: string) => {
    if (gameState !== 'playing') return;

    setTotalKeysPressed((t) => t + 1);
    const enemies = enemiesRef.current;
    const canvas = canvasRef.current;
    const turretX = canvas ? canvas.clientWidth / 2 : 250;
    const turretY = canvas ? canvas.clientHeight - 32 : 300;

    // Case 1: Already targeting a drone
    const currentTarget = enemies.find((e) => e.id === activeTargetIdRef.current);
    if (currentTarget) {
      const nextExpectedChar = currentTarget.word[currentTarget.typedChars];

      if (char === nextExpectedChar) {
        // Correct Hit!
        currentTarget.typedChars += 1;
        setCurrentInput(currentTarget.word.slice(0, currentTarget.typedChars));
        setCorrectKeysPressed((c) => c + 1);

        if (!isMuted) playLaserSound(soundVolume);
        fireLaserBolt(currentTarget.x, currentTarget.y, turretX, turretY, '#22d3ee');
        addExplosionParticles(currentTarget.x, currentTarget.y, '#22d3ee', 6);

        // Word completed!
        if (currentTarget.typedChars >= currentTarget.word.length) {
          if (!isMuted) playExplosionSound(soundVolume);
          addExplosionParticles(currentTarget.x, currentTarget.y, currentTarget.color, 32);
          addShockwave(currentTarget.x, currentTarget.y, currentTarget.color, 65);

          // Handle Power-Up
          if (currentTarget.powerUp === 'emp') {
            triggerEmp();
          } else if (currentTarget.powerUp === 'freeze') {
            triggerFreeze();
            addFloatText('❄ TIME DILATION!', currentTarget.x, currentTarget.y, '#67e8f9');
          } else if (currentTarget.powerUp === 'heal') {
            if (!isMuted) playPowerUpSound(soundVolume);
            shieldsRef.current = Math.min(3, shieldsRef.current + 1);
            setShields(shieldsRef.current);
            addFloatText('🛡 REPAIR +1!', currentTarget.x, currentTarget.y, '#34d399');
          }

          // Combo & Score formula
          const nextCombo = combo + 1;
          setCombo(nextCombo);
          if (nextCombo > maxCombo) setMaxCombo(nextCombo);
          if (!isMuted && nextCombo >= 3) playComboSound(nextCombo, soundVolume);

          const comboMult = Math.min(4.0, 1 + nextCombo * 0.25);
          const earned = Math.round(currentTarget.word.length * 35 * comboMult);
          setScore((s) => s + earned);

          addFloatText(`+${earned}`, currentTarget.x, currentTarget.y, '#38bdf8');

          const nextDestroyed = wordsDestroyed + 1;
          setWordsDestroyed(nextDestroyed);

          // Wave Level Up every 6 words
          if (nextDestroyed % 6 === 0) {
            const nextWave = wave + 1;
            setWave(nextWave);
            setWaveAnnouncement(`WAVE ${nextWave}: INVASION ACCELERATING!`);
            setTimeout(() => setWaveAnnouncement(''), 1800);
          }

          // Remove destroyed drone
          enemiesRef.current = enemiesRef.current.filter((e) => e.id !== currentTarget.id);
          setActiveTargetId(null);
          activeTargetIdRef.current = null;
          setCurrentInput('');
        }
        return;
      } else {
        // Miss!
        if (!isMuted) playErrorSound(soundVolume);
        setCombo(0);
        addFloatText('MISS', currentTarget.x, currentTarget.y, '#f43f5e');
        return;
      }
    }

    // Case 2: No active target - search for closest drone starting with typed character
    const matching = enemies
      .filter((e) => e.word.startsWith(char))
      .sort((a, b) => b.y - a.y);

    if (matching.length > 0) {
      const chosen = matching[0];
      chosen.typedChars = 1;
      setActiveTargetId(chosen.id);
      activeTargetIdRef.current = chosen.id;
      setCurrentInput(char);
      setCorrectKeysPressed((c) => c + 1);

      if (!isMuted) playLaserSound(soundVolume);
      fireLaserBolt(chosen.x, chosen.y, turretX, turretY, '#22d3ee');
      addExplosionParticles(chosen.x, chosen.y, '#22d3ee', 6);

      // Single letter edge case
      if (chosen.word.length === 1) {
        if (!isMuted) playExplosionSound(soundVolume);
        enemiesRef.current = enemiesRef.current.filter((e) => e.id !== chosen.id);
        setActiveTargetId(null);
        activeTargetIdRef.current = null;
        setCurrentInput('');
        setScore((s) => s + 50);
        setWordsDestroyed((w) => w + 1);
      }
    } else {
      if (!isMuted) playKeySound(sound, soundVolume);
    }
  };

  // Keyboard Event Handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onExit();
      return;
    }
    if (gameState === 'ready' || gameState === 'gameover') {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        startGame();
        return;
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      startGame();
      return;
    }
    // Space or Backspace breaks lock to let player switch target
    if (e.key === ' ' || e.key === 'Backspace') {
      setActiveTargetId(null);
      activeTargetIdRef.current = null;
      setCurrentInput('');
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      handleKeyStroke(e.key.toLowerCase());
    }
  };

  // Global window shortcut listener so Space/Enter/Escape works even if input lost focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      if (gameState === 'ready' || gameState === 'gameover') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          startGame();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, onExit, startGame]);

  // Mobile Input Event
  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length > 0) {
      const lastChar = val[val.length - 1].toLowerCase();
      handleKeyStroke(lastChar);
    }
    e.target.value = '';
  };

  // Game Over handling & per-category high scores / WPM records
  useEffect(() => {
    if (gameState === 'playing') {
      hasHandledGameOverRef.current = false;
    } else if (gameState === 'gameover') {
      if (hasHandledGameOverRef.current) return;
      hasHandledGameOverRef.current = true;

      const accuracy =
        totalKeysPressed > 0 ? Math.round((correctKeysPressed / totalKeysPressed) * 100) : 100;
      const elapsedMinutes = Math.max(0.1, (performance.now() - startTimeRef.current) / 60000);
      const computedWpm = Math.round(correctKeysPressed / 5 / elapsedMinutes);
      setLastGameWpm(computedWpm);

      // Save per-category record
      const cat = difficultySpeed;
      setCategoryRecords((prev) => {
        const curCat = prev[cat] || { highScore: 0, bestWpm: 0, maxWave: 1 };
        const isHighScorePB = score > curCat.highScore;
        const isWpmPB = computedWpm > curCat.bestWpm;
        const isWavePB = wave > curCat.maxWave;

        if (isHighScorePB || isWpmPB || isWavePB) {
          setIsNewRecord(true);
          confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
        }

        const nextCat: CategoryRecord = {
          highScore: Math.max(score, curCat.highScore),
          bestWpm: Math.max(computedWpm, curCat.bestWpm),
          maxWave: Math.max(wave, curCat.maxWave)
        };

        const updated = { ...prev, [cat]: nextCat };
        try {
          localStorage.setItem('maher_arcade_category_records', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (onSaveScoreRef.current) {
        onSaveScoreRef.current(score, wave, accuracy, computedWpm, cat);
      }
    }
  }, [gameState, score, totalKeysPressed, correctKeysPressed, wave, difficultySpeed]);

  const activeCategoryRecord = categoryRecords[difficultySpeed];

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-4xl mx-auto flex flex-col gap-2.5 relative select-none transition-all ${
        screenShake ? 'translate-x-1.5 -translate-y-1' : ''
      }`}
    >
      {/* Top Arcade HUD Console */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 rounded-2xl bg-neutral-900/90 border border-cyan-500/20 text-xs font-mono-code backdrop-blur-md shadow-lg">
        {/* Exit to Classic Modes */}
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
          title="Back to Classic Typing Test"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Classic Modes</span>
        </button>

        {/* Live Score, Wave & Combo Streak */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[0.625rem] uppercase tracking-widest text-neutral-400">Score</span>
            <span className="text-base sm:text-xl font-black text-cyan-400">{score.toLocaleString()}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[0.625rem] uppercase tracking-widest text-neutral-400">Wave</span>
            <span className="text-base sm:text-xl font-black text-amber-400">{wave}</span>
          </div>

          <div className="hidden sm:flex flex-col items-center">
            <span className="text-[0.625rem] uppercase tracking-widest text-neutral-400">Tempo</span>
            <span className="text-xs font-bold uppercase text-purple-300">{difficultySpeed}</span>
          </div>

          {/* Combo Multiplier Flame */}
          {combo >= 2 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs">x{(1 + combo * 0.25).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Shields & Audio / Touch Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Shields */}
          <div className="flex items-center gap-1" title={`${shields} Shield Batteries Left`}>
            {[1, 2, 3].map((s) => (
              <Shield
                key={s}
                className={`w-4 h-4 transition-transform duration-200 ${
                  s <= shields
                    ? 'text-cyan-400 fill-cyan-400/40 scale-100'
                    : 'text-neutral-700 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile Touch Keyboard Toggle */}
          <button
            onClick={() => setShowTouchKeys(!showTouchKeys)}
            className={`p-1.5 rounded-xl border transition-colors sm:hidden ${
              showTouchKeys
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
            }`}
            title="Toggle On-Screen Touch Keyboard"
          >
            <KeyboardIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 60FPS Arcade Arena Display (Clicking anywhere focuses input) */}
      <div
        onClick={focusInput}
        className="relative w-full h-[24rem] sm:h-[29rem] rounded-3xl border-2 border-cyan-500/30 bg-neutral-950 shadow-2xl overflow-hidden cursor-crosshair flex flex-col justify-between"
      >
        {/* Hidden full-area input field capturing keystrokes directly */}
        <input
          ref={inputRef}
          type="text"
          dir={isRtlLanguage(language) ? 'rtl' : 'ltr'}
          lang={isRtlLanguage(language) ? (language === 'pashto' ? 'ps' : language === 'dari' ? 'fa' : 'ar') : 'en'}
          onChange={handleMobileInput}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair z-20"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          inputMode="text"
        />

        {/* 60FPS Continuous Falling Physics Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Wave Announcement Banner */}
        {waveAnnouncement && (
          <div className="absolute top-8 inset-x-0 flex justify-center z-10 pointer-events-none animate-bounce">
            <div className="px-5 py-2 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 backdrop-blur-md text-cyan-200 font-bold text-xs sm:text-sm tracking-widest shadow-xl">
              {waveAnnouncement}
            </div>
          </div>
        )}

        {/* Freeze Effect Active Banner with Frost Gauge */}
        {isFrozen && (
          <div className="absolute top-3 inset-x-0 flex justify-center z-10 pointer-events-none">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/95 border-2 border-cyan-400 text-cyan-200 text-xs font-bold shadow-lg shadow-cyan-500/30">
              <Snowflake className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>TIME DILATION: {freezeTimeLeft.toFixed(1)}s</span>
              <div className="w-16 h-1.5 rounded-full bg-cyan-950 border border-cyan-400/50 overflow-hidden">
                <div
                  className="h-full bg-cyan-300 transition-all duration-100"
                  style={{ width: `${(freezeTimeLeft / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Ready / Start Screen */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 overflow-y-auto">
            <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-2 shadow-xl shadow-cyan-500/10 animate-pulse">
              <Gamepad2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
              CYBER WORD STRIKE
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-3">
              Enemies drop continuously! Type target letters to blast them. Collect EMP nukes & freeze time dilation.
            </p>

            {/* Category Speed Selector & Rankings Overview */}
            <div className="w-full max-w-md mb-4">
              <div className="text-[0.6875rem] uppercase tracking-wider font-bold text-neutral-400 mb-2 font-mono-code">
                Select Speed Tempo & Category Rankings
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'fast', 'hyper'] as const).map((cat) => {
                  const rec = categoryRecords[cat];
                  const isSelected = difficultySpeed === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setDifficultySpeed(cat)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 shadow-md ring-2 ring-cyan-400/50 scale-102'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase text-cyan-300 font-mono-code">{cat}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                      </div>
                      <div className="text-[0.625rem] text-neutral-400 font-mono-code">
                        PB: <strong className="text-white">{rec.highScore.toLocaleString()}</strong>
                      </div>
                      <div className="text-[0.625rem] text-amber-300 font-mono-code">
                        {rec.bestWpm > 0 ? `${rec.bestWpm} WPM` : '0 WPM'} • W{rec.maxWave}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-neutral-950 font-black text-sm transition-transform active:scale-95 shadow-xl shadow-cyan-500/30 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-neutral-950" />
              <span>LAUNCH DEFENSE (SPACE / ENTER)</span>
            </button>
          </div>
        )}

        {/* Game Over Screen with Category Ranking Breakdown */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 overflow-y-auto">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-2">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">DEFENSE BREACHED</h2>
            <p className="text-xs text-rose-300 mb-3">Core shields depleted under cyber invasion</p>

            {/* Record Broken Banner */}
            {isNewRecord && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-3 animate-pulse">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>NEW CATEGORY RECORD ({difficultySpeed.toUpperCase()})!</span>
              </div>
            )}

            {/* Score Grid with WPM */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-md mb-3 text-left">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] text-neutral-400 uppercase font-mono-code">Score</div>
                <div className="text-base font-black text-cyan-400">{score.toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] text-neutral-400 uppercase font-mono-code">Speed WPM</div>
                <div className="text-base font-black text-emerald-400">{lastGameWpm} WPM</div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] text-neutral-400 uppercase font-mono-code">Wave Reached</div>
                <div className="text-base font-black text-amber-400">Wave {wave}</div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] text-neutral-400 uppercase font-mono-code">Category PB</div>
                <div className="text-base font-black text-purple-400">{activeCategoryRecord.highScore.toLocaleString()}</div>
              </div>
            </div>

            {/* Category Ranking Matrix */}
            <div className="w-full max-w-md p-2 rounded-xl bg-white/[0.03] border border-white/10 mb-4 text-left font-mono-code text-xs">
              <div className="text-[0.625rem] text-neutral-400 uppercase font-bold mb-1.5 flex items-center justify-between">
                <span>Category Leaderboard Status</span>
                <span className="text-cyan-400">Playing: {difficultySpeed.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {(['normal', 'fast', 'hyper'] as const).map((cat) => {
                  const rec = categoryRecords[cat];
                  return (
                    <div
                      key={cat}
                      className={`p-1.5 rounded-lg border ${
                        difficultySpeed === cat ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <div className="text-[0.625rem] font-bold uppercase text-neutral-300">{cat}</div>
                      <div className="text-xs font-black text-white">{rec.highScore.toLocaleString()}</div>
                      <div className="text-[0.5625rem] text-amber-300">{rec.bestWpm} WPM</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-black text-xs sm:text-sm transition-transform active:scale-95 shadow-lg shadow-cyan-400/25 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY (SPACE / ENTER)</span>
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                Classic Modes
              </button>
            </div>
          </div>
        )}

        {/* Bottom Console Radar Status */}
        <div className="w-full pb-2 px-4 flex items-center justify-between pointer-events-none z-10 text-xs font-mono-code text-neutral-500">
          <div className="flex items-center gap-1.5 text-[0.6875rem]">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>TURRET RADAR ONLINE</span>
          </div>
          <div className="flex items-center gap-1 text-[0.6875rem] text-cyan-300 font-semibold">
            {activeTargetId ? (
              <span className="flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                LOCKED: <strong className="text-white">{currentInput.toUpperCase()}</strong>
              </span>
            ) : (
              'TYPE TO LOCK & BLAST'
            )}
          </div>
        </div>
      </div>

      {/* On-Screen Mobile Touch Keyboard (when toggled or on mobile) */}
      {showTouchKeys && (
        <div className="flex flex-col gap-1 p-2 rounded-2xl bg-neutral-900/95 border border-cyan-500/20 backdrop-blur-md select-none">
          {[['q','w','e','r','t','y','u','i','o','p'],
            ['a','s','d','f','g','h','j','k','l'],
            ['z','x','c','v','b','n','m']].map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 w-full">
              {row.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeyStroke(k)}
                  className="flex-1 max-w-[2.4rem] h-9 rounded-lg bg-white/5 active:bg-cyan-500 active:text-black border border-white/10 text-xs font-bold text-neutral-200 flex items-center justify-center cursor-pointer transition-colors uppercase font-mono-code"
                >
                  {k}
                </button>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                setActiveTargetId(null);
                activeTargetIdRef.current = null;
                setCurrentInput('');
              }}
              className="px-4 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold"
            >
              Unlock Target
            </button>
            <button
              type="button"
              onClick={focusInput}
              className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold"
            >
              Native Keyboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
