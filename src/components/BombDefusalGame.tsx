import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bomb,
  Timer,
  ShieldAlert,
  Zap,
  RotateCcw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Trophy,
  Award,
  AlertOctagon,
  Gamepad2,
  CheckCircle2,
  Lock,
  Flame,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeConfig } from '../utils/themes';
import { TestSettings, TestMode } from '../types';
import { playKeySound, playErrorSound, playLaserSound } from '../utils/audio';

interface BombDefusalGameProps {
  settings: TestSettings;
  theme: ThemeConfig;
  onExit: () => void;
  onBackToGames?: () => void;
  onSwitchGame?: (mode: TestMode) => void;
}

interface DefusalStage {
  id: number;
  title: string;
  subtitle: string;
  wireColor: string;
  wireBorder: string;
  wireGlow: string;
  timeLimit: number; // in seconds
  words: string[];
}

const DEFUSAL_STAGES: DefusalStage[] = [
  {
    id: 1,
    title: 'CIRCUIT ALPHA: WIRE CUTTER',
    subtitle: 'Sever the primary ignition relays before the fuse burns down.',
    wireColor: 'from-red-600 to-rose-700',
    wireBorder: 'border-red-500/50',
    wireGlow: 'shadow-red-500/30',
    timeLimit: 25,
    words: ['cut', 'wire', 'red', 'fuse', 'spark', 'relay', 'safety']
  },
  {
    id: 2,
    title: 'CIRCUIT BETA: LOGIC OVERRIDE',
    subtitle: 'Bypass the anti-tamper security microprocessor.',
    wireColor: 'from-amber-500 to-yellow-600',
    wireBorder: 'border-amber-500/50',
    wireGlow: 'shadow-amber-500/30',
    timeLimit: 28,
    words: ['bypass', 'voltage', 'ground', 'transistor', 'capacitor', 'switch', 'current']
  },
  {
    id: 3,
    title: 'CIRCUIT GAMMA: CIPHER MATRIX',
    subtitle: 'Crack the rotating cryptographic detonator sequence.',
    wireColor: 'from-cyan-500 to-blue-600',
    wireBorder: 'border-cyan-500/50',
    wireGlow: 'shadow-cyan-500/30',
    timeLimit: 30,
    words: ['quantum', 'decrypt', 'cipher', 'protocol', 'payload', 'override', 'lockdown']
  },
  {
    id: 4,
    title: 'CIRCUIT DELTA: CORE STABILIZER',
    subtitle: 'Neutralize explosive chemical pressure before detonation.',
    wireColor: 'from-purple-500 to-fuchsia-600',
    wireBorder: 'border-purple-500/50',
    wireGlow: 'shadow-purple-500/30',
    timeLimit: 32,
    words: ['stabilize', 'barometric', 'neutral', 'compound', 'chamber', 'pressure', 'suppress']
  },
  {
    id: 5,
    title: 'APEX TERMINAL: MASTER DEFUSAL',
    subtitle: 'Final kill-switch! Enter the master defusal phrase flawlessly!',
    wireColor: 'from-emerald-500 to-teal-600',
    wireBorder: 'border-emerald-500/50',
    wireGlow: 'shadow-emerald-500/30',
    timeLimit: 35,
    words: ['disarm', 'master', 'system', 'offline', 'secure', 'neutralized', 'victory']
  }
];

export const BombDefusalGame: React.FC<BombDefusalGameProps> = ({
  settings,
  theme,
  onExit,
  onBackToGames,
  onSwitchGame
}) => {
  const [gameState, setGameState] = useState<'briefing' | 'defusing' | 'detonated' | 'defused'>('briefing');
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [timeLeftMs, setTimeLeftMs] = useState(25000);
  const [totalTimeLeftSec, setTotalTimeLeftSec] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [defusalStartTime, setDefusalStartTime] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStage = DEFUSAL_STAGES[currentStageIdx];
  const currentWord = currentStage.words[wordIndex] || '';

  // Initialize or start stage
  const startStage = useCallback((stageIndex: number) => {
    setCurrentStageIdx(stageIndex);
    setWordIndex(0);
    setInputVal('');
    const limit = DEFUSAL_STAGES[stageIndex].timeLimit;
    setTimeLeftMs(limit * 1000);
    setTotalTimeLeftSec(limit);
    setGameState('defusing');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleStartGame = () => {
    setScore(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setMistakes(0);
    setDefusalStartTime(performance.now());
    startStage(0);
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'defusing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => {
        const next = prev - 100;
        setTotalTimeLeftSec(Math.ceil(next / 1000));
        if (next <= 0) {
          clearInterval(interval);
          setGameState('detonated');
          if (!isMuted) playErrorSound(settings.soundVolume);
          return 0;
        }
        return next;
      });
    }, 100);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [gameState, isMuted, settings.soundVolume]);

  // Input keystroke handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'defusing') return;
    const val = e.target.value;

    if (val.endsWith(' ')) {
      const trimmed = val.trim();
      if (trimmed.length === 0) return;

      if (trimmed.toLowerCase() === currentWord.toLowerCase()) {
        // Correct Word!
        setCorrectKeystrokes((c) => c + currentWord.length + 1);
        setTotalKeystrokes((t) => t + currentWord.length + 1);
        setScore((s) => s + currentWord.length * 15 + Math.round(totalTimeLeftSec * 5));
        if (!isMuted) playKeySound(settings.sound, settings.soundVolume, true);

        const nextWordIdx = wordIndex + 1;
        if (nextWordIdx >= currentStage.words.length) {
          // Completed this stage!
          if (currentStageIdx + 1 < DEFUSAL_STAGES.length) {
            if (!isMuted) playLaserSound(settings.soundVolume);
            confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
            startStage(currentStageIdx + 1);
          } else {
            // ALL STAGES COMPLETED - BOMB DEFUSED!
            setGameState('defused');
            if (!isMuted) playLaserSound(settings.soundVolume);
            confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
          }
        } else {
          setWordIndex(nextWordIdx);
          setInputVal('');
        }
      } else {
        // Mistake! Deduct 2 seconds as a penalty
        setMistakes((m) => m + 1);
        setTotalKeystrokes((t) => t + trimmed.length + 1);
        setTimeLeftMs((t) => Math.max(100, t - 2000));
        if (!isMuted) playErrorSound(settings.soundVolume);
        setInputVal('');
      }
      return;
    }

    // Typing in-progress
    setInputVal(val);
    setTotalKeystrokes((t) => t + 1);

    if (val.length <= currentWord.length && currentWord.toLowerCase().startsWith(val.toLowerCase())) {
      setCorrectKeystrokes((c) => c + 1);
      if (!isMuted) playKeySound(settings.sound, settings.soundVolume, false);
    } else {
      if (!isMuted) playErrorSound(settings.soundVolume);
    }
  };

  // Telemetry
  const elapsedMinutes = Math.max(0.1, (performance.now() - defusalStartTime) / 60000);
  const calculatedWpm = Math.round(correctKeystrokes / 5 / elapsedMinutes);
  const accuracy =
    totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

  const isCriticalTime = totalTimeLeftSec <= 7;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 py-2 px-2 sm:px-4 text-white font-sans select-none">
      {/* Top Header */}
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
          <div className="hidden md:flex items-center gap-2 text-xs font-mono-code text-rose-400 font-bold border-l border-white/10 pl-3">
            <Bomb className="w-3.5 h-3.5" />
            <span>BOMB DEFUSAL</span>
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

          {gameState === 'defusing' && (
            <button
              onClick={handleStartGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Bomb</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Bomb Enclosure */}
      <div
        className={`relative rounded-3xl bg-neutral-950/95 border-2 transition-all duration-300 p-4 sm:p-7 shadow-2xl flex flex-col gap-4 min-h-[540px] overflow-hidden ${
          isCriticalTime && gameState === 'defusing'
            ? 'border-rose-600 shadow-rose-600/40 animate-pulse'
            : 'border-white/10 shadow-black/80'
        }`}
      >
        {/* Hazard Stripes Ambient Bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 animate-pulse" />

        {/* BRIEFING / LOBBY */}
        {gameState === 'briefing' && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center my-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-4xl shadow-2xl shadow-rose-600/40 mb-5 animate-pulse">
              💣
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
              EMERGENCY BOMB DEFUSAL UNIT
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mb-6 leading-relaxed">
              A high-yield digital explosive has been armed. Cut 5 electronic circuits by typing security passcodes with zero hesitation.
              <span className="block text-rose-400 font-bold mt-1">⚠️ Typos trigger an immediate 2-second time penalty!</span>
            </p>

            {/* Stages Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 w-full max-w-2xl mb-8">
              {DEFUSAL_STAGES.map((stg, i) => (
                <div
                  key={stg.id}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-1"
                >
                  <span className="text-[0.625rem] font-mono-code text-neutral-400">STAGE {i + 1}</span>
                  <span className="text-xs font-bold text-white truncate max-w-full">{stg.title.split(':')[0]}</span>
                  <span className="text-[0.6875rem] font-mono-code text-amber-400">{stg.timeLimit}s fuse</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartGame}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-neutral-950 font-black text-sm tracking-wider uppercase transition-transform active:scale-95 shadow-xl shadow-rose-500/40 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-neutral-950" />
              <span>DEFUSE THE BOMB (SPACE / ENTER)</span>
            </button>
          </div>
        )}

        {/* ACTIVE DEFUSAL HUD & CODING CHAMBER */}
        {gameState === 'defusing' && (
          <div className="flex flex-col gap-4 my-auto">
            {/* Digital Timer & Stage Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* LED Countdown Timer */}
              <div
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  isCriticalTime
                    ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-500/40 animate-pulse'
                    : 'bg-black/60 border-white/15'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[0.625rem] font-mono-code text-neutral-400 uppercase tracking-wider">
                  <Timer className="w-3.5 h-3.5 text-rose-400" />
                  <span>Detonation Timer</span>
                </div>
                <div
                  className={`text-3xl sm:text-4xl font-black font-mono-code tracking-tighter ${
                    isCriticalTime ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {(timeLeftMs / 1000).toFixed(1)}s
                </div>
              </div>

              {/* Stage Progress */}
              <div className="p-3 rounded-2xl bg-black/60 border border-white/15 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 text-[0.625rem] font-mono-code text-neutral-400 uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Circuit Stage</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono-code">
                  {currentStageIdx + 1} <span className="text-xs text-neutral-500">/ 5</span>
                </div>
              </div>

              {/* Score */}
              <div className="p-3 rounded-2xl bg-black/60 border border-white/15 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 text-[0.625rem] font-mono-code text-neutral-400 uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Defusal Score</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-yellow-400 font-mono-code">
                  {score.toLocaleString()}
                </div>
              </div>

              {/* Accuracy */}
              <div className="p-3 rounded-2xl bg-black/60 border border-white/15 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 text-[0.625rem] font-mono-code text-neutral-400 uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Precision</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-code">
                  {accuracy}%
                </div>
              </div>
            </div>

            {/* Circuit Wire Visual Board */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code font-bold uppercase text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  {currentStage.title}
                </span>
                <span className="text-[0.6875rem] font-mono-code text-neutral-400">
                  Passcode {wordIndex + 1} of {currentStage.words.length}
                </span>
              </div>
              <p className="text-xs text-neutral-400">{currentStage.subtitle}</p>

              {/* Multi-wire cables */}
              <div className="grid grid-cols-5 gap-2 mt-2">
                {DEFUSAL_STAGES.map((stg, i) => {
                  const isDone = i < currentStageIdx;
                  const isActive = i === currentStageIdx;

                  return (
                    <div
                      key={stg.id}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                          : isActive
                          ? 'bg-amber-400 animate-pulse ring-2 ring-amber-300/60'
                          : 'bg-neutral-800'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Word Display Stream */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-white/10 flex flex-col gap-3.5 shadow-xl">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-2 text-xl sm:text-2xl leading-relaxed font-mono-code tracking-wide py-3 px-4 rounded-xl bg-black/40 border border-white/10 select-none break-words min-h-[5.5rem]">
                {currentStage.words.map((word, idx) => {
                  const isCurrent = idx === wordIndex;
                  const isPast = idx < wordIndex;

                  let colorClass = 'text-neutral-500';
                  if (isPast) {
                    colorClass = 'text-emerald-400 font-bold';
                  } else if (isCurrent) {
                    colorClass = 'text-white font-black bg-rose-500/30 px-3 py-0.5 rounded-lg ring-2 ring-rose-400 shadow-lg shadow-rose-500/40';
                  }

                  return (
                    <span key={idx} className={`inline-block transition-all ${colorClass}`}>
                      {word}
                    </span>
                  );
                })}
              </div>

              {/* Hidden/Active Input */}
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={handleInputChange}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  placeholder="Type passcode to cut wire..."
                  className="w-full bg-white/5 border border-white/15 focus:border-rose-400 rounded-xl px-4 py-3.5 text-white text-lg sm:text-xl font-mono-code focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all placeholder:text-neutral-500 placeholder:text-sm"
                />
                <div className="absolute right-3 text-xs text-neutral-400 pointer-events-none">
                  Press Space to submit
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DETONATED / GAME OVER */}
        {gameState === 'detonated' && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center my-auto">
            <div className="w-20 h-20 rounded-3xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-4xl mb-4 animate-bounce">
              💥
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-rose-500 font-mono-code mb-2">
              BOMB DETONATED!
            </h2>
            <p className="text-sm text-neutral-300 max-w-md mb-6">
              The detonator reached zero before the circuits were fully severed.
            </p>

            <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-8 font-mono-code">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Circuits Cut</div>
                <div className="text-xl font-bold text-white">{currentStageIdx} / 5</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Velocity</div>
                <div className="text-xl font-bold text-cyan-400">{calculatedWpm} WPM</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Final Score</div>
                <div className="text-xl font-bold text-yellow-400">{score}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartGame}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-neutral-950 font-black text-sm tracking-wider uppercase transition-transform active:scale-95 shadow-xl shadow-rose-500/30 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 fill-neutral-950" />
                <span>TRY DEFUSING AGAIN</span>
              </button>
              {onBackToGames && (
                <button
                  onClick={onBackToGames}
                  className="px-5 py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Games Hub
                </button>
              )}
            </div>
          </div>
        )}

        {/* DEFUSED / VICTORY */}
        {gameState === 'defused' && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center my-auto">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-4xl mb-4 animate-bounce text-emerald-400 shadow-xl shadow-emerald-500/30">
              🛡️
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono-code mb-2">
              BOMB NEUTRALIZED!
            </h2>
            <p className="text-sm text-neutral-300 max-w-md mb-6">
              All 5 security circuits were successfully decrypted and severed. City saved!
            </p>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-lg mb-8 font-mono-code">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Total Score</div>
                <div className="text-xl font-bold text-yellow-400">{score}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Velocity</div>
                <div className="text-xl font-bold text-cyan-400">{calculatedWpm} WPM</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Accuracy</div>
                <div className="text-xl font-bold text-emerald-400">{accuracy}%</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Rank</div>
                <div className="text-xs font-bold text-amber-300 truncate">MASTER S.W.A.T.</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartGame}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-neutral-950 font-black text-sm tracking-wider uppercase transition-transform active:scale-95 shadow-xl shadow-emerald-500/30 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 fill-neutral-950" />
                <span>DEFUSE ANOTHER BOMB</span>
              </button>
              {onBackToGames && (
                <button
                  onClick={onBackToGames}
                  className="px-5 py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Games Hub
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
