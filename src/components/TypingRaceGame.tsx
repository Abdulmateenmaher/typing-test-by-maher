import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Zap,
  Flame,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  Sparkles,
  ArrowLeft,
  Gauge,
  Flag,
  Crown,
  Timer,
  Gamepad2
} from 'lucide-react';
import { TestSettings, TestMode } from '../types';
import { ThemeConfig } from '../utils/themes';
import { generateWordSequence, isRtlLanguage } from '../utils/words';
import { verifyEventSecurity } from '../utils/antiCheat';
import {
  playCountdownBeep,
  playEngineRevSound,
  playNitroSound,
  playKeySound,
  playErrorSound,
  playFinishFanfare
} from '../utils/audio';

interface TypingRaceGameProps {
  settings: TestSettings;
  theme: ThemeConfig;
  onExit: () => void;
  onBackToGames?: () => void;
  onSwitchGame?: (mode: TestMode) => void;
}

interface RacerCar {
  id: string;
  name: string;
  avatar: string;
  color: string;
  laneBg: string;
  borderCol: string;
  targetWpm: number;
  currentWpm: number;
  progress: number; // 0 to 100
  isPlayer?: boolean;
  finishedTime?: number;
  rank?: number;
}

const CAR_SKINS = [
  { id: 'cyan', name: 'Cyber Cyan', icon: '🏎️', hex: '#06b6d4', gradient: 'from-cyan-400 to-blue-600', glow: 'shadow-cyan-500/60', text: 'text-neutral-950' },
  { id: 'crimson', name: 'Flame Red', icon: '🏎️', hex: '#f43f5e', gradient: 'from-rose-500 to-red-600', glow: 'shadow-rose-500/60', text: 'text-white' },
  { id: 'amber', name: 'Thunder Gold', icon: '🏎️', hex: '#f59e0b', gradient: 'from-amber-400 to-yellow-500', glow: 'shadow-amber-500/60', text: 'text-neutral-950' },
  { id: 'purple', name: 'Neon Violet', icon: '🏎️', hex: '#a855f7', gradient: 'from-purple-500 to-fuchsia-600', glow: 'shadow-purple-500/60', text: 'text-white' },
  { id: 'emerald', name: 'Apex Green', icon: '🏎️', hex: '#10b981', gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-500/60', text: 'text-neutral-950' }
];

const DIFFICULTY_LEVELS = [
  { id: 'rookie', label: 'Rookie', botWpm: 35, desc: 'Casual cruise for beginners' },
  { id: 'intermediate', label: 'Pro', botWpm: 55, desc: 'Balanced competitive race' },
  { id: 'champion', label: 'Champion', botWpm: 80, desc: 'Fast reflexes required' },
  { id: 'apex', label: 'Apex Cyber', botWpm: 110, desc: 'Lightning speed showdown' }
];

export const TypingRaceGame: React.FC<TypingRaceGameProps> = ({
  settings,
  theme,
  onExit,
  onBackToGames,
  onSwitchGame
}) => {
  const isRTL = isRtlLanguage(settings.language || 'english');

  // Race Config
  const [selectedDifficulty, setSelectedDifficulty] = useState<'rookie' | 'intermediate' | 'champion' | 'apex'>('intermediate');
  const [playerSkin, setPlayerSkin] = useState(CAR_SKINS[0]);
  const [isMuted, setIsMuted] = useState(false);

  // Race Lifecycle: 'lobby' | 'countdown' | 'racing' | 'finished'
  const [raceState, setRaceState] = useState<'lobby' | 'countdown' | 'racing' | 'finished'>('lobby');
  const [countdownNum, setCountdownNum] = useState<number | 'GO'>(3);

  // Race Words & Text Input
  const [words, setWords] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  // Performance Telemetry
  const [playerWpm, setPlayerWpm] = useState(0);
  const [playerRawWpm, setPlayerRawWpm] = useState(0);
  const [topSpeedWpm, setTopSpeedWpm] = useState(0);
  const [nitroFuel, setNitroFuel] = useState(0); // 0 to 100%
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [nitroBoostsUsed, setNitroBoostsUsed] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Competitors List
  const [racers, setRacers] = useState<RacerCar[]>([]);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const raceStartTimeRef = useRef<number>(0);
  const finishOrderRef = useRef<string[]>([]);
  const nitroStreakRef = useRef(0);

  // Initialize Racers with Distinct Vibrant Colors
  const initRacers = useCallback((difficultyKey: string) => {
    const diff = DIFFICULTY_LEVELS.find((d) => d.id === difficultyKey) || DIFFICULTY_LEVELS[1];
    const baseWpm = diff.botWpm;

    const botList: RacerCar[] = [
      {
        id: 'player',
        name: 'You (Player)',
        avatar: playerSkin.icon,
        color: playerSkin.hex,
        laneBg: 'bg-cyan-950/40 border-cyan-500/50 shadow-inner',
        borderCol: playerSkin.hex,
        targetWpm: 0,
        currentWpm: 0,
        progress: 0,
        isPlayer: true
      },
      {
        id: 'bot-1',
        name: 'Turbo Tanya ⚡',
        avatar: '🏎️',
        color: '#f43f5e',
        laneBg: 'bg-rose-950/30 border-rose-500/30',
        borderCol: '#f43f5e',
        targetWpm: Math.round(baseWpm * (0.95 + Math.random() * 0.1)),
        currentWpm: 0,
        progress: 0
      },
      {
        id: 'bot-2',
        name: 'Drift King Ken 🏁',
        avatar: '🏎️',
        color: '#f59e0b',
        laneBg: 'bg-amber-950/30 border-amber-500/30',
        borderCol: '#f59e0b',
        targetWpm: Math.round(baseWpm * (0.9 + Math.random() * 0.12)),
        currentWpm: 0,
        progress: 0
      },
      {
        id: 'bot-3',
        name: 'Neon Nova 🌌',
        avatar: '🏎️',
        color: '#a855f7',
        laneBg: 'bg-purple-950/30 border-purple-500/30',
        borderCol: '#a855f7',
        targetWpm: Math.round(baseWpm * (0.88 + Math.random() * 0.15)),
        currentWpm: 0,
        progress: 0
      },
      {
        id: 'bot-4',
        name: 'Pixel Pete 🤖',
        avatar: '🏎️',
        color: '#10b981',
        laneBg: 'bg-emerald-950/30 border-emerald-500/30',
        borderCol: '#10b981',
        targetWpm: Math.round(baseWpm * (0.85 + Math.random() * 0.1)),
        currentWpm: 0,
        progress: 0
      }
    ];

    setRacers(botList);
  }, [playerSkin]);

  // Generate race words
  const generateRaceWords = useCallback(() => {
    const raw = generateWordSequence(35, settings.vocabulary || 'english-200', false, false, settings.language || 'english');
    const cleaned = raw.map((w) => w.toLowerCase());
    setWords(cleaned);
    setWordIndex(0);
    setInputVal('');
    setHistory([]);
  }, [settings.vocabulary, settings.language]);

  // Start Race: Countdown -> Action
  const startRace = useCallback(() => {
    generateRaceWords();
    initRacers(selectedDifficulty);
    finishOrderRef.current = [];
    setRaceState('countdown');
    setCountdownNum(3);
    setPlayerWpm(0);
    setTopSpeedWpm(0);
    setNitroFuel(0);
    setIsNitroActive(false);
    setNitroBoostsUsed(0);
    setCorrectKeystrokes(0);
    setTotalKeystrokes(0);
    setElapsedSeconds(0);
    nitroStreakRef.current = 0;

    if (!isMuted) {
      playCountdownBeep(false, settings.soundVolume);
      playEngineRevSound(settings.soundVolume);
    }

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
        if (!isMuted) playCountdownBeep(false, settings.soundVolume);
      } else if (count === 0) {
        setCountdownNum('GO');
        if (!isMuted) playCountdownBeep(true, settings.soundVolume);
      } else {
        clearInterval(interval);
        setRaceState('racing');
        raceStartTimeRef.current = performance.now();
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }, 900);
  }, [generateRaceWords, initRacers, selectedDifficulty, isMuted, settings.soundVolume]);

  // Handle Input in Active Race
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (raceState !== 'racing') return;

    // Anti-Cheat: Validate physical hardware interaction
    const sec = verifyEventSecurity(e);
    if (!sec.safe) return;

    const val = e.target.value;

    // Anti-Cheat: Prevent console bulk string injection
    if (val.length - inputVal.length > 2 && !(e.nativeEvent as any)?.isComposing) return;

    const currentWord = words[wordIndex] || '';

    // Check if space was pressed (or word finished)
    if (val.endsWith(' ')) {
      const trimmed = val.trim();
      if (trimmed.length === 0) return;

      const isMatch = trimmed === currentWord;

      // Update Nitro Streak
      if (isMatch) {
        nitroStreakRef.current += 1;
        setCorrectKeystrokes((c) => c + currentWord.length + 1);
        setTotalKeystrokes((t) => t + currentWord.length + 1);

        // Charge Nitro (every 3 consecutive words = +25% Nitro)
        setNitroFuel((fuel) => {
          const nextFuel = Math.min(100, fuel + 20);
          // Auto fire Nitro at 100%!
          if (nextFuel >= 100 && !isNitroActive) {
            triggerNitroBoost();
            return 0;
          }
          return nextFuel;
        });

        if (!isMuted) playKeySound(settings.sound, settings.soundVolume, true);
      } else {
        // Mistake drops nitro streak
        nitroStreakRef.current = 0;
        setTotalKeystrokes((t) => t + trimmed.length + 1);
        if (!isMuted) playErrorSound(settings.soundVolume);
      }

      setHistory((prev) => [...prev, trimmed]);
      setInputVal('');

      const nextIndex = wordIndex + 1;
      setWordIndex(nextIndex);

      // Check if Player Completed Track
      if (nextIndex >= words.length) {
        finishPlayerRace();
      }
      return;
    }

    // Regular letter typed
    setInputVal(val);
    setTotalKeystrokes((t) => t + 1);

    if (currentWord.startsWith(val)) {
      setCorrectKeystrokes((c) => c + 1);
      if (!isMuted) playKeySound(settings.sound, settings.soundVolume, false);
    } else {
      if (!isMuted) playErrorSound(settings.soundVolume);
    }
  };

  // Trigger Nitro Boost
  const triggerNitroBoost = () => {
    setIsNitroActive(true);
    setNitroBoostsUsed((b) => b + 1);
    if (!isMuted) playNitroSound(settings.soundVolume);

    setTimeout(() => {
      setIsNitroActive(false);
    }, 2500);
  };

  // Player Finishes Race
  const finishPlayerRace = () => {
    const finishTime = (performance.now() - raceStartTimeRef.current) / 1000;
    if (!finishOrderRef.current.includes('player')) {
      finishOrderRef.current.push('player');
    }

    setRacers((prev) =>
      prev.map((r) =>
        r.id === 'player'
          ? { ...r, progress: 100, finishedTime: finishTime, rank: finishOrderRef.current.indexOf('player') + 1 }
          : r
      )
    );

    if (!isMuted) playFinishFanfare();

    // Mark finished if not already
    setTimeout(() => {
      setRaceState('finished');
    }, 800);
  };

  // 60FPS Game & AI Competitor Loop
  useEffect(() => {
    if (raceState !== 'racing') return;

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsedSec = Math.max(0.1, (now - raceStartTimeRef.current) / 1000);
      setElapsedSeconds(Math.round(elapsedSec));

      // Calculate Player WPM
      const totalCharsTyped = history.join(' ').length + inputVal.length;
      const calcWpm = Math.round((totalCharsTyped / 5) / (elapsedSec / 60));
      const boostedWpm = isNitroActive ? Math.round(calcWpm * 1.3) : calcWpm;

      setPlayerWpm(boostedWpm);
      setTopSpeedWpm((prev) => Math.max(prev, boostedWpm));

      const playerProgress = words.length > 0 ? Math.min(100, (wordIndex / words.length) * 100) : 0;

      // Update AI Competitor positions
      setRacers((prevRacers) =>
        prevRacers.map((racer) => {
          if (racer.isPlayer) {
            return {
              ...racer,
              progress: playerProgress,
              currentWpm: boostedWpm
            };
          }

          if (racer.progress >= 100) return racer;

          // AI speed with random realistic fluctuations (curves, drafting)
          const fluctuation = (Math.sin(now / 1500 + Number(racer.id.slice(-1))) * 0.15);
          const currentBotSpeed = racer.targetWpm * (1 + fluctuation);

          // Word length roughly 5 chars
          const wordsPerSec = (currentBotSpeed / 60);
          const targetTotalWords = words.length || 35;
          const progressDelta = (wordsPerSec / targetTotalWords) * 100 * 0.1; // 100ms interval

          const nextProgress = Math.min(100, racer.progress + progressDelta);

          if (nextProgress >= 100 && !finishOrderRef.current.includes(racer.id)) {
            finishOrderRef.current.push(racer.id);
          }

          return {
            ...racer,
            progress: nextProgress,
            currentWpm: Math.round(currentBotSpeed),
            rank: finishOrderRef.current.includes(racer.id)
              ? finishOrderRef.current.indexOf(racer.id) + 1
              : undefined
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [raceState, words.length, wordIndex, history, inputVal, isNitroActive]);

  // Calculate live player rank
  const sortedRacers = [...racers].sort((a, b) => b.progress - a.progress);
  const playerCurrentRank = sortedRacers.findIndex((r) => r.isPlayer) + 1;

  // Player accuracy
  const playerAccuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

  // Auto focus input on click
  const handleContainerClick = () => {
    if (raceState === 'racing') {
      inputRef.current?.focus();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="w-full max-w-5xl mx-auto flex flex-col gap-3 py-2 px-2 sm:px-4 text-white font-sans select-none"
    >
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between bg-neutral-900/80 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onBackToGames && (
            <button
              onClick={onBackToGames}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-bold text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Games Hub</span>
            </button>
          )}

          {/* Quick-switch to Arcade Game */}
          {onSwitchGame && (
            <button
              onClick={() => onSwitchGame('arcade')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 hover:text-white text-xs font-black transition-colors cursor-pointer shadow-sm"
              title="Switch to Arcade Game"
            >
              <span>🕹️</span>
              <span>Arcade Game</span>
            </button>
          )}

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Classic</span>
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono-code text-cyan-400 font-bold border-l border-white/10 pl-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TURBO SPEEDWAY</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {raceState === 'racing' && (
            <button
              onClick={startRace}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Race</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Track & Speedway Arena */}
      <div className="relative rounded-3xl bg-neutral-950/90 border border-white/10 overflow-hidden shadow-2xl p-3 sm:p-5 flex flex-col gap-4 min-h-[580px]">
        {/* LOBBY / PRE-RACE SCREEN */}
        {raceState === 'lobby' && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center z-10">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/30 mb-4 animate-bounce">
              🏎️
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
              TYPING SPEEDWAY RACING
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-6">
              Compete head-to-head against turbo AI opponents. Build up continuous typing combos to unleash high-octane Nitro Boost!
            </p>

            {/* Select Difficulty */}
            <div className="w-full max-w-md flex flex-col gap-2 mb-6 text-left">
              <label className="text-xs font-mono-code font-bold text-neutral-300 uppercase tracking-wider">
                Select Competitor Difficulty:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DIFFICULTY_LEVELS.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setSelectedDifficulty(diff.id as typeof selectedDifficulty)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedDifficulty === diff.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-black">{diff.label}</div>
                    <div className="text-[0.625rem] text-neutral-400 font-mono-code">{diff.botWpm} WPM</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Car Skin */}
            <div className="w-full max-w-md flex flex-col gap-2 mb-8 text-left">
              <label className="text-xs font-mono-code font-bold text-neutral-300 uppercase tracking-wider">
                Choose Your Machine:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CAR_SKINS.map((skin) => (
                  <button
                    key={skin.id}
                    onClick={() => setPlayerSkin(skin)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      playerSkin.id === skin.id
                        ? 'bg-white/15 border-white text-white shadow-lg scale-105'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{skin.icon}</span>
                    <span className="text-[0.5625rem] font-bold truncate max-w-full">{skin.name.split(' ')[1]}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: skin.hex }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Race Button */}
            <button
              onClick={startRace}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-neutral-950 font-black text-sm tracking-wider uppercase transition-transform active:scale-95 shadow-xl shadow-cyan-500/30 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-neutral-950" />
              <span>START RACE (SPACE / ENTER)</span>
            </button>
          </div>
        )}

        {/* COUNTDOWN OVERLAY - HIGH-IMPACT TALL F1 GANTRY */}
        {raceState === 'countdown' && (
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md flex flex-col items-center justify-center z-40 p-4 sm:p-8 min-h-[580px]">
            {/* Elevated Carbon Cockpit Box */}
            <div className="w-full max-w-lg bg-neutral-900/95 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-cyan-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Top Neon Ambient Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 animate-pulse" />

              {/* F1 Gantry Starting Light Array */}
              <div className="flex items-center gap-2.5 sm:gap-4 p-3.5 px-5 sm:px-7 rounded-2xl bg-black/70 border border-white/15 shadow-inner mb-6">
                {[1, 2, 3, 4, 5].map((lightIdx) => {
                  let isLit = false;
                  let lightColor = 'bg-neutral-800 border-neutral-700 opacity-40';

                  if (countdownNum === 3 && lightIdx <= 2) {
                    isLit = true;
                    lightColor = 'bg-rose-500 border-rose-300 shadow-lg shadow-rose-500/80';
                  } else if (countdownNum === 2 && lightIdx <= 4) {
                    isLit = true;
                    lightColor = 'bg-amber-400 border-amber-200 shadow-lg shadow-amber-400/80';
                  } else if (countdownNum === 1 && lightIdx <= 5) {
                    isLit = true;
                    lightColor = 'bg-amber-500 border-amber-300 shadow-lg shadow-amber-500/80';
                  } else if (countdownNum === 'GO') {
                    isLit = true;
                    lightColor = 'bg-emerald-400 border-emerald-200 shadow-xl shadow-emerald-400/90 animate-ping';
                  }

                  return (
                    <div key={lightIdx} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-150 ${lightColor}`}
                      />
                      <span className="text-[0.5625rem] font-mono-code text-neutral-400 font-bold">L{lightIdx}</span>
                    </div>
                  );
                })}
              </div>

              {/* Massive Glowing Countdown Number / GO */}
              <div className="py-2 min-h-[140px] flex items-center justify-center">
                <div
                  className={`text-8xl sm:text-9xl font-black font-mono-code tracking-tighter drop-shadow-2xl transition-all scale-110 ${
                    countdownNum === 'GO'
                      ? 'text-emerald-400 animate-bounce'
                      : countdownNum === 1
                      ? 'text-amber-400 animate-pulse'
                      : countdownNum === 2
                      ? 'text-amber-300 animate-pulse'
                      : 'text-rose-400 animate-pulse'
                  }`}
                >
                  {countdownNum}
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black font-mono-code tracking-widest uppercase text-cyan-300">
                  {countdownNum === 'GO'
                    ? '🟢 GREEN LIGHT - ACCELERATE NOW!'
                    : countdownNum === 1
                    ? '🟡 TURBOS SPOOLING... GET READY!'
                    : countdownNum === 2
                    ? '🟠 ENGINES REVVING... SET!'
                    : '🔴 RED LIGHTS ON... PREPARE TO RACE!'}
                </span>
                <span className="text-[0.6875rem] text-neutral-400 font-mono-code">
                  Home fingers resting on keyboard • Nitro fills on continuous clean words
                </span>
              </div>
            </div>
          </div>
        )}

        {/* LIVE RACING HUD & TRACK */}
        {(raceState === 'countdown' || raceState === 'racing' || raceState === 'finished') && (
          <div className="flex flex-col gap-3">
            {/* Live Dashboard Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-900/70 border border-white/5 p-3 rounded-2xl">
              {/* Position */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[0.625rem] text-neutral-400 uppercase font-mono-code">Standing</div>
                  <div className="text-base font-black text-white">
                    {playerCurrentRank === 1 ? (
                      <span className="text-amber-400">1st PLACE 🏆</span>
                    ) : (
                      <span>{playerCurrentRank}th / 5</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Speedometer */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[0.625rem] text-neutral-400 uppercase font-mono-code">Velocity</div>
                  <div className="text-base font-black text-emerald-400 font-mono-code">
                    {playerWpm} <span className="text-xs text-neutral-400">WPM</span>
                  </div>
                </div>
              </div>

              {/* Accuracy */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[0.625rem] text-neutral-400 uppercase font-mono-code">Precision</div>
                  <div className="text-base font-black text-purple-300 font-mono-code">{playerAccuracy}%</div>
                </div>
              </div>

              {/* Nitro Boost Status */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className={`p-2 rounded-xl ${isNitroActive ? 'bg-amber-400/30 text-amber-300 animate-bounce' : 'bg-blue-500/20 text-blue-400'}`}>
                  <Flame className="w-5 h-5" />
                </div>
                <div className="w-full">
                  <div className="flex items-center justify-between text-[0.625rem] text-neutral-400 uppercase font-mono-code">
                    <span>Nitro Turbo</span>
                    <span className="text-amber-400 font-bold">{isNitroActive ? 'BURST ACTIVE!' : `${nitroFuel}%`}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 mt-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isNitroActive
                          ? 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${isNitroActive ? 100 : nitroFuel}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SPEEDWAY LANES */}
            <div className="relative flex flex-col gap-2 py-3 px-2 sm:px-4 rounded-2xl bg-neutral-900/90 border border-white/10 overflow-hidden">
              {/* Asphalt Grid Lines & Finish Line Flag Pole */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {/* Finish Line Checkered Banner */}
              <div className="absolute right-6 sm:right-10 top-0 bottom-0 w-4 bg-[repeating-conic-gradient(#fff_0_90deg,#000_0_180deg)] [background-size:8px_8px] opacity-40 z-0 pointer-events-none" />
              <div className="absolute right-4 sm:right-8 top-1 z-10">
                <Flag className="w-5 h-5 text-amber-400" />
              </div>

              {/* Render 5 Racing Lanes */}
              {racers.map((racer, index) => {
                const isUser = racer.isPlayer;
                const clampedProgress = Math.min(100, Math.max(0, racer.progress));

                return (
                  <div
                    key={racer.id}
                    className={`relative h-10 rounded-xl border flex items-center px-2 transition-all ${
                      isUser
                        ? 'bg-cyan-950/40 border-cyan-400/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                        : racer.laneBg
                    }`}
                  >
                    {/* Lane Info Label */}
                    <div className="w-24 sm:w-32 shrink-0 flex items-center gap-1.5 text-xs font-mono-code z-10">
                      <span className="text-[0.625rem] text-neutral-400 font-bold">L{index + 1}</span>
                      <span className={`text-[0.6875rem] font-bold truncate ${isUser ? 'text-cyan-300 font-black' : 'text-neutral-300'}`}>
                        {racer.name}
                      </span>
                    </div>

                    {/* Track Running Area */}
                    <div className="relative flex-1 h-full flex items-center mx-2 sm:mx-4">
                      {/* Midline dash */}
                      <div className="absolute inset-x-0 h-[0.0625rem] border-b border-dashed border-white/10" />

                      {/* Moving Car Marker with Vibrant Colors */}
                      <div
                        style={{ left: `calc(${clampedProgress}% * 0.85)` }}
                        className={`absolute flex items-center gap-1.5 transition-all duration-150 ease-out z-20 ${
                          isUser && isNitroActive ? 'scale-110' : ''
                        }`}
                      >
                        {/* Nitro Exhaust Flame */}
                        {isUser && isNitroActive && (
                          <div className="flex items-center -mr-1">
                            <span className="text-xs animate-ping">🔥</span>
                            <span className="text-xs animate-pulse -ml-1">⚡</span>
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black shadow-lg border transition-all ${
                            isUser
                              ? `bg-gradient-to-r ${playerSkin.gradient} ${playerSkin.text} border-white/60 ${playerSkin.glow} ring-2 ring-white/40`
                              : racer.id === 'bot-1'
                              ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white border-rose-300/80 shadow-rose-500/60'
                              : racer.id === 'bot-2'
                              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-neutral-950 border-amber-200/80 shadow-amber-400/60'
                              : racer.id === 'bot-3'
                              ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-600 text-white border-purple-300/80 shadow-purple-500/60'
                              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 text-neutral-950 border-emerald-200/80 shadow-emerald-400/60'
                          }`}
                        >
                          <span className="px-1 py-0.2 rounded text-[0.5625rem] bg-black/35 text-white font-mono-code font-black">
                            #{isUser ? '01' : racer.id === 'bot-1' ? '77' : racer.id === 'bot-2' ? '08' : racer.id === 'bot-3' ? '42' : '99'}
                          </span>
                          <span className="text-sm">🏎️</span>
                          <span className="text-[0.6875rem] font-mono-code font-black tracking-tight">
                            {racer.currentWpm} <span className="text-[0.5rem] opacity-85 uppercase">wpm</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rank Badge on Right */}
                    <div className="w-8 shrink-0 text-right z-10">
                      <span className="text-xs font-bold font-mono-code text-neutral-400">
                        {Math.round(clampedProgress)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RACING TYPING PROMPT & INPUT AREA */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-white/10 flex flex-col gap-3.5 relative shadow-xl">
              {/* Words Flow Container - Wrapped cleanly without horizontal scroll */}
              <div
                dir={isRTL ? 'rtl' : 'ltr'}
                className="flex flex-wrap items-baseline gap-x-2.5 gap-y-2 text-xl sm:text-2xl leading-relaxed font-mono-code tracking-wide py-3 px-3.5 rounded-xl bg-black/40 border border-white/10 select-none break-words min-h-[5.5rem]"
              >
                {words.map((word, idx) => {
                  const isCurrent = idx === wordIndex;
                  const isPast = idx < wordIndex;
                  const pastWord = history[idx] || '';
                  const isCorrect = pastWord === word;

                  let colorClass = 'text-neutral-500';
                  if (isPast) {
                    colorClass = isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 underline decoration-rose-500/70 font-semibold';
                  } else if (isCurrent) {
                    colorClass = 'text-white font-black bg-cyan-500/25 px-2.5 py-0.5 rounded-lg ring-2 ring-cyan-400 shadow-md shadow-cyan-500/30';
                  }

                  return (
                    <span key={idx} className={`inline-block transition-all ${colorClass}`}>
                      {word}
                    </span>
                  );
                })}
              </div>

              {/* Hidden/Active Input with Focus Prompt */}
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={handleInputChange}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  disabled={raceState === 'countdown' || raceState === 'finished'}
                  placeholder={raceState === 'racing' ? 'Type the words to accelerate your car...' : raceState === 'countdown' ? 'Starting in 3, 2, 1...' : ''}
                  className="w-full bg-white/5 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-3.5 text-white text-lg sm:text-xl font-mono-code focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder:text-neutral-500 placeholder:text-sm"
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                />

                {/* Inline Hint */}
                <div className="absolute right-3 flex items-center gap-1.5 text-xs text-neutral-400 pointer-events-none">
                  <span className="hidden sm:inline">Spacebar to advance word</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FINISH LINE PODIUM & RESULTS MODAL */}
        {raceState === 'finished' && (
          <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 overflow-y-auto">
            <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white mb-1">
              {playerCurrentRank === 1 ? 'VICTORY! GRAND PRIX CHAMPION' : `RACE FINISHED: ${playerCurrentRank}th PLACE`}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mb-4">
              {playerCurrentRank === 1
                ? 'Flawless driving! You outpaced all AI rivals on the speedway.'
                : 'Great race! Refine your rhythm and nitro timing to seize the podium.'}
            </p>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-lg mb-6 text-left font-mono-code">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] text-neutral-400 uppercase">Average Speed</div>
                <div className="text-lg font-black text-cyan-400">{playerWpm} WPM</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] text-neutral-400 uppercase">Top Velocity</div>
                <div className="text-lg font-black text-emerald-400">{topSpeedWpm} WPM</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] text-neutral-400 uppercase">Accuracy</div>
                <div className="text-lg font-black text-purple-400">{playerAccuracy}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] text-neutral-400 uppercase">Nitro Boosts</div>
                <div className="text-lg font-black text-amber-400">{nitroBoostsUsed} ⚡</div>
              </div>
            </div>

            {/* Race Standings Table */}
            <div className="w-full max-w-lg rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-6 font-mono-code text-xs">
              <div className="text-[0.625rem] text-neutral-400 uppercase font-bold mb-2 flex items-center justify-between">
                <span>Final Race Standings</span>
                <span>Speed</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {sortedRacers.map((r, rankIdx) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between p-1.5 rounded-lg ${
                      r.isPlayer ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'bg-white/5 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black">
                        {rankIdx === 0 ? '🥇 1st' : rankIdx === 1 ? '🥈 2nd' : rankIdx === 2 ? '🥉 3rd' : `${rankIdx + 1}th`}
                      </span>
                      <span>{r.name}</span>
                    </div>
                    <span className="font-bold">{r.currentWpm} WPM</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={startRace}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-neutral-950 font-black text-sm transition-transform active:scale-95 shadow-lg shadow-cyan-400/25 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RACE AGAIN</span>
              </button>
              <button
                onClick={() => setRaceState('lobby')}
                className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Change Difficulty
              </button>
              {onBackToGames && (
                <button
                  onClick={onBackToGames}
                  className="px-4 py-3 rounded-2xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Games Hub</span>
                </button>
              )}
              <button
                onClick={onExit}
                className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
