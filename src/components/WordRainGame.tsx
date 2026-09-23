import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CloudRain,
  Flame,
  Shield,
  Snowflake,
  Bomb,
  RotateCcw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Trophy,
  Sparkles,
  Gamepad2,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeConfig } from '../utils/themes';
import { TestSettings, TestMode } from '../types';
import { getWordsForLanguage, isRtlLanguage } from '../utils/words';
import {
  playLaserSound,
  playExplosionSound,
  playComboSound,
  playFreezeSound,
  playErrorSound,
  playKeySound
} from '../utils/audio';

interface WordRainGameProps {
  settings: TestSettings;
  theme: ThemeConfig;
  onExit: () => void;
  onBackToGames?: () => void;
  onSwitchGame?: (mode: TestMode) => void;
}

interface FallingWord {
  id: string;
  word: string;
  xPercent: number; // 5% to 85%
  yPercent: number; // 0% to 100%
  speed: number;
  typedChars: number;
  type: 'normal' | 'golden' | 'freeze' | 'bomb';
}

export const WordRainGame: React.FC<WordRainGameProps> = ({
  settings,
  theme,
  onExit,
  onBackToGames,
  onSwitchGame
}) => {
  const isRTL = isRtlLanguage(settings.language || 'english');

  // Game States
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'gameover'>('lobby');
  const [difficulty, setDifficulty] = useState<'gentle' | 'breeze' | 'storm'>('breeze');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wordsCleared, setWordsCleared] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [freezeSeconds, setFreezeSeconds] = useState(0);

  // Active Falling Words
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<FallingWord[]>([]);
  wordsRef.current = fallingWords;
  const isFrozenRef = useRef(false);
  isFrozenRef.current = isFrozen;

  // Word pool
  const wordPool = useRef<string[]>([]);

  useEffect(() => {
    wordPool.current = getWordsForLanguage(settings.language || 'english', 'english-200');
  }, [settings.language]);

  const getRandomWord = useCallback(() => {
    const pool = wordPool.current.length > 0 ? wordPool.current : ['cloud', 'rain', 'drop', 'storm', 'water', 'wind', 'sky', 'light'];
    const filtered = pool.filter((w) => w.length >= 3 && w.length <= 8);
    return filtered[Math.floor(Math.random() * filtered.length)] || 'rain';
  }, []);

  // Spawn a falling word
  const spawnWord = useCallback(() => {
    const roll = Math.random();
    let type: FallingWord['type'] = 'normal';
    if (roll < 0.12) type = 'golden';
    else if (roll < 0.20) type = 'freeze';
    else if (roll < 0.26) type = 'bomb';

    const baseSpeed = difficulty === 'gentle' ? 0.35 : difficulty === 'breeze' ? 0.55 : 0.85;
    const waveSpeedBoost = 1 + wave * 0.05;

    const newWord: FallingWord = {
      id: Math.random().toString(36).substring(2, 9),
      word: getRandomWord(),
      xPercent: 5 + Math.floor(Math.random() * 80),
      yPercent: 0,
      speed: (baseSpeed + Math.random() * 0.25) * waveSpeedBoost,
      typedChars: 0,
      type
    };

    setFallingWords((prev) => [...prev, newWord]);
  }, [difficulty, wave, getRandomWord]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setWave(1);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setWordsCleared(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setFallingWords([]);
    setInputVal('');
    setIsFrozen(false);
    setGameStartTime(performance.now());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Main 30FPS Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Spawner interval
    const spawnRateMs = difficulty === 'gentle' ? 2400 : difficulty === 'breeze' ? 1800 : 1300;
    const spawnTimer = setInterval(() => {
      if (wordsRef.current.length < 7) {
        spawnWord();
      }
    }, spawnRateMs);

    // Physics loop
    const physicsTimer = setInterval(() => {
      if (isFrozenRef.current) return;

      setFallingWords((prevWords) => {
        let lifeLost = false;
        const remaining: FallingWord[] = [];

        prevWords.forEach((fw) => {
          const nextY = fw.yPercent + fw.speed;
          if (nextY >= 95) {
            // Hit bottom!
            lifeLost = true;
          } else {
            remaining.push({ ...fw, yPercent: nextY });
          }
        });

        if (lifeLost) {
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setGameState('gameover');
              if (!isMuted) playErrorSound(settings.soundVolume);
            } else {
              if (!isMuted) playErrorSound(settings.soundVolume);
            }
            return Math.max(0, nextL);
          });
          setCombo(0);
        }

        return remaining;
      });
    }, 50);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(physicsTimer);
    };
  }, [gameState, difficulty, spawnWord, isMuted, settings.soundVolume]);

  // Freeze countdown timer
  useEffect(() => {
    if (!isFrozen) return;
    const timer = setInterval(() => {
      setFreezeSeconds((s) => {
        if (s <= 1) {
          setIsFrozen(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFrozen]);

  // Handle Input Matching
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return;
    const val = e.target.value;
    setInputVal(val);
    setTotalKeystrokes((t) => t + 1);

    // Look for exact word match
    const clean = val.trim().toLowerCase();
    const matchedIdx = wordsRef.current.findIndex(
      (fw) => fw.word.toLowerCase() === clean
    );

    if (matchedIdx !== -1) {
      // Completed word!
      const target = wordsRef.current[matchedIdx];
      setCorrectKeystrokes((c) => c + target.word.length);
      setWordsCleared((w) => w + 1);

      // Score calculation
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      const mult = target.type === 'golden' ? 3 : Math.min(3, 1 + nextCombo * 0.2);
      const earned = Math.round(target.word.length * 20 * mult);
      setScore((s) => s + earned);

      // Power-up triggers
      if (target.type === 'freeze') {
        setIsFrozen(true);
        setFreezeSeconds(4);
        if (!isMuted) playFreezeSound(settings.soundVolume);
      } else if (target.type === 'bomb') {
        // Clear all words on screen!
        setFallingWords([]);
        setScore((s) => s + 500);
        if (!isMuted) playExplosionSound(settings.soundVolume);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
      } else {
        if (!isMuted) playLaserSound(settings.soundVolume);
        if (target.type === 'golden') {
          confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
        }
      }

      if (!isMuted && nextCombo >= 3) {
        playComboSound(nextCombo, settings.soundVolume);
      }

      // Remove popped word
      setFallingWords((prev) => prev.filter((_, idx) => idx !== matchedIdx));
      setInputVal('');

      // Wave progression (every 10 words = +1 wave)
      if ((wordsCleared + 1) % 10 === 0) {
        setWave((w) => w + 1);
      }
    } else {
      if (!isMuted) playKeySound(settings.sound, settings.soundVolume, false);
    }
  };

  // Telemetry
  const elapsedMinutes = Math.max(0.1, (performance.now() - gameStartTime) / 60000);
  const calculatedWpm = Math.round(correctKeystrokes / 5 / elapsedMinutes);
  const accuracy =
    totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

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
          <div className="hidden md:flex items-center gap-2 text-xs font-mono-code text-teal-400 font-bold border-l border-white/10 pl-3">
            <CloudRain className="w-3.5 h-3.5" />
            <span>WORD RAIN</span>
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

          {gameState === 'playing' && (
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Sky Gamefield */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/80 border border-white/15 overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col justify-between min-h-[560px]">
        {/* LOBBY SCREEN */}
        {gameState === 'lobby' && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center my-auto z-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-4xl shadow-2xl shadow-teal-500/30 mb-5 animate-bounce">
              🌧️
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
              WORD RAIN BALLOON DROP
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mb-6 leading-relaxed">
              Descending word bubbles are drifting toward the city baseline! Pop them before they impact the ground.
              Catch Golden 3X bubbles, Cryo Freeze crystals, and Super Bomb orbs for massive high scores.
            </p>

            {/* Select Wind Tempo */}
            <div className="w-full max-w-sm flex flex-col gap-2 mb-8">
              <label className="text-xs font-mono-code font-bold text-neutral-300 uppercase tracking-wider text-left">
                Wind Velocity & Tempo:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'gentle', label: 'Gentle Breeze', sub: 'Relaxed' },
                  { id: 'breeze', label: 'Gusty Winds', sub: 'Standard' },
                  { id: 'storm', label: 'Typhoon', sub: 'Fast & Intense' }
                ].map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id as typeof difficulty)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      difficulty === diff.id
                        ? 'bg-teal-500/25 border-teal-400 text-teal-300 ring-1 ring-teal-400'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{diff.label}</div>
                    <div className="text-[0.625rem] text-neutral-400">{diff.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-neutral-950 font-black text-sm tracking-wider uppercase transition-transform active:scale-95 shadow-xl shadow-teal-500/30 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-neutral-950" />
              <span>START WORD RAIN (SPACE / ENTER)</span>
            </button>
          </div>
        )}

        {/* ACTIVE PLAYING SCREEN */}
        {gameState === 'playing' && (
          <>
            {/* Top Game Dashboard */}
            <div className="grid grid-cols-4 gap-2 bg-neutral-900/70 border border-white/10 p-2.5 rounded-2xl backdrop-blur-md z-20">
              {/* Score */}
              <div className="flex flex-col items-center">
                <span className="text-[0.625rem] uppercase font-mono-code text-neutral-400">Score</span>
                <span className="text-base sm:text-xl font-black text-yellow-400">{score.toLocaleString()}</span>
              </div>

              {/* Wave */}
              <div className="flex flex-col items-center">
                <span className="text-[0.625rem] uppercase font-mono-code text-neutral-400">Wave</span>
                <span className="text-base sm:text-xl font-black text-teal-300">{wave}</span>
              </div>

              {/* Combo Multiplier */}
              <div className="flex flex-col items-center">
                <span className="text-[0.625rem] uppercase font-mono-code text-neutral-400">Combo</span>
                <span className="text-base sm:text-xl font-black text-amber-400">
                  {combo > 1 ? `${combo}x` : '—'}
                </span>
              </div>

              {/* Lives / Shields */}
              <div className="flex flex-col items-center">
                <span className="text-[0.625rem] uppercase font-mono-code text-neutral-400">Shields</span>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3].map((s) => (
                    <Shield
                      key={s}
                      className={`w-4 h-4 transition-transform ${
                        s <= lives
                          ? 'text-teal-400 fill-teal-400/40 scale-100'
                          : 'text-neutral-700 scale-90'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Freeze Active Alert */}
            {isFrozen && (
              <div className="absolute top-20 inset-x-0 mx-auto max-w-xs flex items-center justify-center gap-2 p-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-mono-code font-bold z-30 animate-pulse">
                <Snowflake className="w-4 h-4 text-cyan-300 animate-spin" />
                <span>CRYO FREEZE ACTIVE ({freezeSeconds}s)</span>
              </div>
            )}

            {/* Sky Rain Playfield */}
            <div className="relative flex-1 w-full min-h-[340px] overflow-hidden my-2">
              {fallingWords.map((fw) => {
                const isPartiallyMatched =
                  inputVal.length > 0 && fw.word.toLowerCase().startsWith(inputVal.trim().toLowerCase());

                let bubbleStyle = 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-cyan-500/30';
                let icon = '💧';

                if (fw.type === 'golden') {
                  bubbleStyle = 'bg-amber-400/30 border-amber-300 text-amber-200 shadow-amber-400/50 ring-2 ring-amber-400';
                  icon = '⭐';
                } else if (fw.type === 'freeze') {
                  bubbleStyle = 'bg-blue-500/30 border-blue-300 text-blue-200 shadow-blue-400/50';
                  icon = '❄️';
                } else if (fw.type === 'bomb') {
                  bubbleStyle = 'bg-rose-500/30 border-rose-400 text-rose-200 shadow-rose-500/50 animate-pulse';
                  icon = '💣';
                }

                if (isPartiallyMatched) {
                  bubbleStyle += ' ring-2 ring-white scale-110 shadow-lg';
                }

                return (
                  <div
                    key={fw.id}
                    style={{
                      left: `${fw.xPercent}%`,
                      top: `${fw.yPercent}%`,
                      transition: isFrozen ? 'none' : 'top 50ms linear'
                    }}
                    className={`absolute flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border backdrop-blur-md font-mono-code text-sm sm:text-base font-black shadow-lg cursor-pointer transform -translate-x-1/2 select-none ${bubbleStyle}`}
                  >
                    <span className="text-xs">{icon}</span>
                    <span>{fw.word}</span>
                  </div>
                );
              })}

              {/* City Defense Line at Bottom */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 opacity-60" />
            </div>

            {/* Bottom Typing Input Field */}
            <div className="relative flex items-center z-20">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                autoFocus
                dir={isRTL ? 'rtl' : 'ltr'}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                placeholder="Type words as they fall from the clouds..."
                className="w-full bg-black/60 border border-teal-500/40 focus:border-teal-400 rounded-2xl px-5 py-3.5 text-white text-lg sm:text-xl font-mono-code focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all placeholder:text-neutral-500 placeholder:text-sm shadow-xl"
              />
            </div>
          </>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'gameover' && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center my-auto z-10">
            <div className="w-20 h-20 rounded-3xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-4xl mb-4 animate-bounce">
              ⚡
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-rose-400 font-mono-code mb-2">
              SHIELDS COLLAPSED!
            </h2>
            <p className="text-sm text-neutral-300 max-w-md mb-6">
              The balloon storm overwhelmed the ground baseline defense.
            </p>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-lg mb-8 font-mono-code">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Total Score</div>
                <div className="text-xl font-bold text-yellow-400">{score.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Words Popped</div>
                <div className="text-xl font-bold text-teal-400">{wordsCleared}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Max Combo</div>
                <div className="text-xl font-bold text-amber-400">{maxCombo}x</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[0.625rem] text-neutral-400">Velocity</div>
                <div className="text-xl font-bold text-white">{calculatedWpm} WPM</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-neutral-950 font-black text-sm tracking-wider uppercase transition-transform active:scale-95 shadow-xl shadow-teal-500/30 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 fill-neutral-950" />
                <span>PLAY AGAIN</span>
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
