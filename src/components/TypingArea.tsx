import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, AlertOctagon, Sparkles } from 'lucide-react';
import {
  CaretStyle,
  DifficultyMode,
  KeyStats,
  SecondMetric,
  TestResult,
  TestSettings
} from '../types';
import { ThemeConfig } from '../utils/themes';
import { playErrorSound, playFinishFanfare, playKeySound } from '../utils/audio';

interface TypingAreaProps {
  words: string[];
  settings: TestSettings;
  theme: ThemeConfig;
  onFinishTest: (result: TestResult) => void;
  onRestartTest: () => void;
  onCurrentKeyChange: (key: string) => void;
  onPhysicalKeyPress: (key: string) => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  words,
  settings,
  theme,
  onFinishTest,
  onRestartTest,
  onCurrentKeyChange,
  onPhysicalKeyPress
}) => {
  // Test State
  const [wordIndex, setWordIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]); // Typed words history
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [isFailed, setIsFailed] = useState(false);
  const [failureReason, setFailureReason] = useState('');

  // Performance Tracking
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(settings.timeDuration);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveRawWpm, setLiveRawWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);

  // Deep metrics state
  const timelineRef = useRef<SecondMetric[]>([]);
  const keyStatsRef = useRef<Record<string, KeyStats>>({});
  const lastKeyTimeRef = useRef<number | null>(null);
  const mistypedWordsRef = useRef<Set<string>>(new Set());
  const secondErrorCountRef = useRef<number>(0);
  const totalCorrectCharsRef = useRef<number>(0);
  const totalIncorrectCharsRef = useRef<number>(0);
  const totalExtraCharsRef = useRef<number>(0);

  // DOM References
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Target Key determination for Virtual Keyboard
  useEffect(() => {
    const currentWord = words[wordIndex] || '';
    if (inputVal.length < currentWord.length) {
      const nextChar = currentWord[inputVal.length];
      onCurrentKeyChange(nextChar);
    } else {
      // Space to move to next word
      onCurrentKeyChange(' ');
    }
  }, [wordIndex, inputVal, words, onCurrentKeyChange]);

  // Keep input focused
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [words]);

  // Smooth line scrolling only when wordIndex changes (line wrap)
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const wordTop = activeWordRef.current.offsetTop;
      if (wordTop > 40) {
        containerRef.current.scrollTo({
          top: wordTop - 36,
          behavior: 'smooth'
        });
      } else {
        containerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  }, [wordIndex]);

  // Time Countdown & Second-by-Second Metric Sampling
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isActive && !isFailed) {
      timer = setInterval(() => {
        const now = Date.now();
        const start = startTime || now;
        const secondsElapsed = Math.max(1, (now - start) / 1000);
        setElapsedTime(secondsElapsed);

        // Time mode countdown
        if (settings.mode === 'time') {
          const remaining = Math.max(0, settings.timeDuration - Math.floor(secondsElapsed));
          setTimeLeft(remaining);
          if (remaining <= 0) {
            handleComplete(secondsElapsed);
            return;
          }
        }

        // Compute Live Metrics
        const correctChars = totalCorrectCharsRef.current;
        const totalChars = correctChars + totalIncorrectCharsRef.current + totalExtraCharsRef.current;
        const curWpm = Math.round((correctChars / 5) / (secondsElapsed / 60));
        const curRawWpm = Math.round((totalChars / 5) / (secondsElapsed / 60));
        const curAcc = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

        setLiveWpm(curWpm);
        setLiveRawWpm(curRawWpm);
        setLiveAccuracy(curAcc);

        // Check Master Difficulty (Strict > 90% accuracy)
        if (settings.difficulty === 'master' && secondsElapsed > 5 && curAcc < 90) {
          setIsFailed(true);
          setFailureReason('Master mode failed: Accuracy dropped below 90%');
          playErrorSound(settings.soundVolume);
          return;
        }

        // Record Timeline entry
        timelineRef.current.push({
          second: Math.round(secondsElapsed),
          wpm: curWpm,
          rawWpm: curRawWpm,
          errors: secondErrorCountRef.current,
          accuracy: curAcc
        });
        secondErrorCountRef.current = 0; // reset for next second
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, isFailed, startTime, settings.mode, settings.timeDuration, settings.difficulty, settings.soundVolume]);

  // Complete Test Handler
  const handleComplete = useCallback(
    (forcedElapsed?: number) => {
      setIsActive(false);
      const totalElapsed = forcedElapsed || elapsedTime || Math.max(1, (Date.now() - (startTime || Date.now())) / 1000);
      const correct = totalCorrectCharsRef.current;
      const incorrect = totalIncorrectCharsRef.current;
      const extra = totalExtraCharsRef.current;
      const totalChars = correct + incorrect + extra;

      const finalWpm = Math.max(0, Math.round((correct / 5) / (totalElapsed / 60)));
      const finalRawWpm = Math.max(0, Math.round((totalChars / 5) / (totalElapsed / 60)));
      const finalAcc = totalChars > 0 ? Number(((correct / totalChars) * 100).toFixed(1)) : 100;

      // Compute Consistency (stability of speed across timeline)
      let consistency = 100;
      if (timelineRef.current.length > 2) {
        const wpms = timelineRef.current.map((t) => t.wpm);
        const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
        const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = mean > 0 ? (stdDev / mean) * 100 : 0;
        consistency = Math.max(20, Math.min(100, Math.round(100 - coefficientOfVariation)));
      }

      // Check if missed chars at end
      let missed = 0;
      for (let i = wordIndex; i < words.length; i++) {
        missed += words[i].length;
      }

      playFinishFanfare();

      const result: TestResult = {
        id: `test-${Date.now()}`,
        date: new Date().toISOString(),
        wpm: finalWpm,
        rawWpm: finalRawWpm,
        accuracy: finalAcc,
        consistency,
        correctChars: correct,
        incorrectChars: incorrect,
        extraChars: extra,
        missedChars: missed,
        totalChars,
        duration: totalElapsed,
        mode: settings.mode,
        modeDetail:
          settings.mode === 'time'
            ? `${settings.timeDuration}s`
            : settings.mode === 'words'
            ? `${settings.wordCount} words`
            : settings.mode,
        difficulty: settings.difficulty,
        timeline: timelineRef.current,
        keyStats: keyStatsRef.current,
        mistypedWords: Array.from(mistypedWordsRef.current)
      };

      onFinishTest(result);
    },
    [elapsedTime, startTime, wordIndex, words, settings, onFinishTest]
  );

  // Handle Input Changes & Key Strokes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Quick Reset Shortcuts: Tab + Enter or Escape
    if (e.key === 'Tab') {
      e.preventDefault();
      onRestartTest();
      return;
    }
    if (e.key === 'Escape') {
      onRestartTest();
      return;
    }

    // Physical key feedback for virtual keyboard
    onPhysicalKeyPress(e.key);

    // Prevent Backspace if difficulty is 'no-backspace'
    if (e.key === 'Backspace' && settings.difficulty === 'no-backspace') {
      e.preventDefault();
      playErrorSound(settings.soundVolume);
      return;
    }

    // Handle Ctrl + Backspace to erase whole active word input
    if (e.ctrlKey && e.key === 'Backspace') {
      e.preventDefault();
      setInputVal('');
      return;
    }

    // Check Start
    if (!isActive && !isFailed) {
      setIsActive(true);
      setStartTime(Date.now());
      lastKeyTimeRef.current = Date.now();
    }

    const currentWord = words[wordIndex] || '';

    // Record Key Latency & Stats
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const now = Date.now();
      const latency = lastKeyTimeRef.current ? Math.min(1000, now - lastKeyTimeRef.current) : 150;
      lastKeyTimeRef.current = now;

      const expectedChar = inputVal.length < currentWord.length ? currentWord[inputVal.length] : ' ';
      const isCorrect = e.key === expectedChar;

      // Track key statistics
      const charKey = e.key.toLowerCase();
      if (!keyStatsRef.current[charKey]) {
        keyStatsRef.current[charKey] = { hits: 0, errors: 0, totalLatencyMs: 0 };
      }
      keyStatsRef.current[charKey].hits += 1;
      keyStatsRef.current[charKey].totalLatencyMs += latency;

      if (isCorrect) {
        totalCorrectCharsRef.current += 1;
        playKeySound(settings.sound, settings.soundVolume, e.key === ' ');
      } else {
        totalIncorrectCharsRef.current += 1;
        secondErrorCountRef.current += 1;
        keyStatsRef.current[charKey].errors += 1;
        mistypedWordsRef.current.add(currentWord);

        if (settings.errorBeep) {
          playErrorSound(settings.soundVolume);
        } else {
          playKeySound(settings.sound, settings.soundVolume, e.key === ' ');
        }

        // Hardcore mode: Instant failure on mistake!
        if (settings.difficulty === 'hardcore') {
          setIsFailed(true);
          setFailureReason('Hardcore Mode Failed: Instant death upon typing mistake!');
          playErrorSound(settings.soundVolume);
          return;
        }
      }
    }

    // Spacebar: advance to next word
    if (e.key === ' ') {
      e.preventDefault();
      if (inputVal.length === 0) return; // Don't advance on empty space

      playKeySound(settings.sound, settings.soundVolume, true);

      // Save to history
      const newHistory = [...history, inputVal];
      setHistory(newHistory);
      setInputVal('');

      const nextIndex = wordIndex + 1;
      setWordIndex(nextIndex);

      // Check if words mode is completed
      if (settings.mode === 'words' && nextIndex >= settings.wordCount) {
        handleComplete();
      } else if (nextIndex >= words.length) {
        handleComplete();
      }
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFailed) return;
    const val = e.target.value;
    setInputVal(val);

    // If on quote or code mode, check if we hit the very end of the final word
    if (
      wordIndex === words.length - 1 &&
      val === words[wordIndex]
    ) {
      handleComplete();
    }
  };

  // Render individual words with Zero-Latency Inline Caret
  const renderWord = (word: string, idx: number) => {
    const isCurrent = idx === wordIndex;
    const isPast = idx < wordIndex;
    const typedWord = isPast ? history[idx] : isCurrent ? inputVal : '';

    return (
      <span
        key={idx}
        ref={isCurrent ? activeWordRef : null}
        className={`inline-block mr-2.5 mb-1.5 leading-relaxed tracking-wide select-none ${
          isCurrent ? 'relative' : ''
        }`}
      >
        {word.split('').map((char, charIdx) => {
          let charClass = theme.textMuted;
          const isCurrentChar = isCurrent && charIdx === inputVal.length;

          if (isPast) {
            const typedChar = typedWord ? typedWord[charIdx] : undefined;
            charClass = typedChar === char ? theme.correct : theme.incorrect;
          } else if (isCurrent) {
            if (charIdx < inputVal.length) {
              const typedChar = inputVal[charIdx];
              if (settings.difficulty === 'blind') {
                charClass = theme.textNormal;
              } else {
                charClass = typedChar === char ? theme.correct : theme.incorrect;
              }
            } else if (charIdx === inputVal.length) {
              charClass = theme.textBright;
            }
          }

          return (
            <span
              key={charIdx}
              className="relative inline-block font-mono-code"
            >
              {/* Real-time Zero-Latency Caret attached directly to active character */}
              {isCurrentChar && isFocused && !isFailed && (
                <span
                  className={`
                    absolute pointer-events-none z-20
                    ${
                      settings.caretStyle === 'block'
                        ? 'inset-0 opacity-40 rounded-xs ' + theme.accentBg
                        : settings.caretStyle === 'underline'
                        ? 'left-0 right-0 bottom-0.5 h-[2.5px] rounded-full ' + theme.accentBg
                        : 'left-0 top-[10%] bottom-[10%] w-[2.5px] -translate-x-[1px] rounded-full ' + theme.caret
                    }
                    ${!isActive ? 'animate-caret-blink' : ''}
                  `}
                />
              )}
              <span className={`transition-colors duration-75 ${charClass}`}>
                {settings.difficulty === 'blind' && isCurrent && charIdx < inputVal.length ? '•' : char}
              </span>
            </span>
          );
        })}

        {/* Extra overflow characters typed that exceed expected word length */}
        {isCurrent && inputVal.length > word.length && (
          <span className={`font-mono-code ${theme.extra}`}>
            {inputVal.slice(word.length)}
          </span>
        )}

        {/* Caret when inputVal length >= word.length (at the end of the word awaiting space) */}
        {isCurrent && inputVal.length >= word.length && isFocused && !isFailed && (
          <span className="relative inline-block w-1 font-mono-code">
            <span
              className={`
                absolute pointer-events-none z-20
                ${
                  settings.caretStyle === 'block'
                    ? 'left-0 top-[10%] bottom-[10%] w-2.5 opacity-40 rounded-xs ' + theme.accentBg
                    : settings.caretStyle === 'underline'
                    ? 'left-0 w-2.5 bottom-0.5 h-[2.5px] rounded-full ' + theme.accentBg
                    : 'left-0 top-[10%] bottom-[10%] w-[2.5px] rounded-full ' + theme.caret
                }
                ${!isActive ? 'animate-caret-blink' : ''}
              `}
            />
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-2.5 relative">
      {/* Floating Real-Time HUD */}
      <div className="flex items-center justify-between px-3 text-xs font-mono-code text-neutral-400 select-none">
        <div className="flex items-center gap-4">
          {/* Live Progress indicator */}
          {settings.mode === 'time' ? (
            <div className="flex items-center gap-1.5 text-base font-bold text-cyan-400">
              <span className="text-lg sm:text-xl">{timeLeft}</span>
              <span className="text-xs text-neutral-400">s</span>
            </div>
          ) : settings.mode === 'words' ? (
            <div className="flex items-center gap-1.5 text-base font-bold text-cyan-400">
              <span className="text-lg sm:text-xl">{wordIndex}</span>
              <span className="text-xs text-neutral-400">/ {settings.wordCount} words</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-base font-bold text-cyan-400">
              <span className="text-lg sm:text-xl">{wordIndex}</span>
              <span className="text-xs text-neutral-400">/ {words.length}</span>
            </div>
          )}

          {/* Live WPM */}
          {settings.showLiveWpm && isActive && (
            <div className="flex items-center gap-1 text-neutral-300">
              <span className="font-bold text-sm text-cyan-400">{liveWpm}</span>
              <span className="text-[11px] text-neutral-400">wpm</span>
            </div>
          )}

          {/* Live Accuracy */}
          {settings.showLiveAccuracy && isActive && (
            <div className="flex items-center gap-1 text-neutral-300">
              <span className={`font-bold text-sm ${liveAccuracy >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {liveAccuracy}%
              </span>
              <span className="text-[11px] text-neutral-400">acc</span>
            </div>
          )}
        </div>

        {/* Live Shortcut Hint */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-400">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">tab</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">enter</kbd>
          <span>to restart</span>
        </div>
      </div>

      {/* Main Text Display & Focus Area */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`
          relative w-full p-5 sm:p-6 rounded-2xl border transition-all duration-150 cursor-text
          ${theme.border} ${theme.cardBg} shadow-sm overflow-hidden
          ${settings.fontSize === 'xl' ? 'text-xl sm:text-2xl' : settings.fontSize === 'lg' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}
        `}
      >
        {/* Hidden Input field capturing keystrokes */}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 opacity-0 pointer-events-none"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Blurring overlay if user clicks away */}
        {!isFocused && !isFailed && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30 transition-all rounded-2xl cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold shadow-lg">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Click or press any key to focus</span>
            </div>
          </div>
        )}

        {/* Failure modal if hardcore/master difficulty triggers */}
        {isFailed && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 p-6 text-center rounded-2xl">
            <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 mb-2 border border-rose-500/30">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Test Terminated</h3>
            <p className="text-xs text-rose-300 mt-0.5 max-w-sm">{failureReason}</p>
            <button
              onClick={onRestartTest}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-all shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Test (Tab + Enter)
            </button>
          </div>
        )}

        {/* Text Container with smooth 3-line viewport */}
        <div
          ref={containerRef}
          className="relative max-h-[115px] sm:max-h-[130px] overflow-hidden leading-relaxed tracking-wider select-none font-mono-code"
        >
          {/* Words */}
          <div className="flex flex-wrap">
            {words.map((word, idx) => renderWord(word, idx))}
          </div>
        </div>
      </div>

      {/* Quick restart icon button */}
      <div className="flex justify-center -mt-1">
        <button
          onClick={onRestartTest}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 text-xs font-medium transition-colors"
          title="Restart Test (Tab + Enter)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restart Test</span>
        </button>
      </div>
    </div>
  );
};
