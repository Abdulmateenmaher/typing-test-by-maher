import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, AlertOctagon, Sparkles, Keyboard as KeyboardIcon } from 'lucide-react';
import {
  CaretStyle,
  DifficultyMode,
  KeyStats,
  SecondMetric,
  TestResult,
  TestSettings
} from '../types';
import { ThemeConfig } from '../utils/themes';
import { BASE_FONT_SIZE } from '../utils/zoom';
import { playErrorSound, playFinishFanfare, playKeySound } from '../utils/audio';
import { isRtlLanguage } from '../utils/words';
import { GhostRacerTrack } from './GhostRacerTrack';

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
  const prevTargetKeyRef = useRef<string>('');

  // Full reset function for internal state
  const resetInternalState = useCallback(() => {
    setWordIndex(0);
    setInputVal('');
    setHistory([]);
    setIsActive(false);
    setIsFailed(false);
    setFailureReason('');
    setStartTime(null);
    setElapsedTime(0);
    setTimeLeft(settings.mode === 'time' ? settings.timeDuration : 0);
    setLiveWpm(0);
    setLiveRawWpm(0);
    setLiveAccuracy(100);
    timelineRef.current = [];
    keyStatsRef.current = {};
    lastKeyTimeRef.current = null;
    mistypedWordsRef.current = new Set();
    secondErrorCountRef.current = 0;
    totalCorrectCharsRef.current = 0;
    totalIncorrectCharsRef.current = 0;
    totalExtraCharsRef.current = 0;
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 20);
  }, [settings.mode, settings.timeDuration]);

  // Reset internal state whenever words change or settings change
  useEffect(() => {
    resetInternalState();
  }, [words, resetInternalState]);

  // Global window shortcut listener for restart (especially when failed or blurred)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        resetInternalState();
        onRestartTest();
      } else if (isFailed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        resetInternalState();
        onRestartTest();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFailed, resetInternalState, onRestartTest]);

  // Target Key determination for Virtual Keyboard
  useEffect(() => {
    const currentWord = words[wordIndex] || '';
    const nextChar = inputVal.length < currentWord.length ? currentWord[inputVal.length] : ' ';
    if (nextChar !== prevTargetKeyRef.current) {
      prevTargetKeyRef.current = nextChar;
      onCurrentKeyChange(nextChar);
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
      // Line offsets below are authored in px at 100%, keep them proportional
      // to the interface zoom so the visible lines stay aligned.
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || BASE_FONT_SIZE;
      const uiScale = rootFontSize / BASE_FONT_SIZE;

      const wordTop = activeWordRef.current.offsetTop;
      if (wordTop > 40 * uiScale) {
        containerRef.current.scrollTo({
          top: wordTop - 36 * uiScale,
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

        // Check Master Difficulty (Strict > 95% accuracy)
        if (settings.difficulty === 'master' && secondsElapsed > 3 && curAcc < 95) {
          setIsFailed(true);
          setFailureReason('Master mode failed: Accuracy dropped below 95%');
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

  // Advance word handler (called by spacebar, mobile input, or mobile button)
  const advanceWord = useCallback(() => {
    if (inputVal.length === 0) return;
    playKeySound(settings.sound, settings.soundVolume, true);

    const newHistory = [...history, inputVal];
    setHistory(newHistory);
    setInputVal('');

    const nextIndex = wordIndex + 1;
    setWordIndex(nextIndex);

    if (settings.mode === 'words' && nextIndex >= settings.wordCount) {
      handleComplete();
    } else if (nextIndex >= words.length) {
      handleComplete();
    }
  }, [inputVal, history, wordIndex, settings, words, handleComplete]);

  // Handle backspace (hardware or touch)
  const handleBackspace = useCallback(() => {
    if (settings.difficulty === 'no-backspace') {
      playErrorSound(settings.soundVolume);
      return;
    }
    setInputVal((prev) => prev.slice(0, -1));
  }, [settings.difficulty, settings.soundVolume]);

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

    // Record Key Latency & Stats for normal printable keys
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
      advanceWord();
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFailed) return;
    const val = e.target.value;

    // Mobile Virtual Keyboard handling: Detect trailing space or input composition
    if (val.endsWith(' ')) {
      if (inputVal.length > 0) {
        advanceWord();
        return;
      } else {
        setInputVal('');
        return;
      }
    }

    // If test not active, start on first input
    if (!isActive && val.length > 0 && !isFailed) {
      setIsActive(true);
      setStartTime(Date.now());
      lastKeyTimeRef.current = Date.now();
    }

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
  const isRTL = isRtlLanguage(settings.language || 'english');

  // Dedicated RTL word renderer preserving 100% authentic cursive ligatures & RTL cursor
  const renderRtlWord = (word: string, idx: number) => {
    const isCurrent = idx === wordIndex;
    const isPast = idx < wordIndex;
    const typedWord = isPast ? history[idx] : isCurrent ? inputVal : '';

    if (isPast) {
      const isCorrect = typedWord === word;
      return (
        <span
          key={idx}
          dir="rtl"
          className="inline-block ml-3.5 mb-2.5 font-rtl text-xl sm:text-2xl select-none"
        >
          <span className={isCorrect ? theme.correct : `${theme.incorrect} underline decoration-rose-500`}>
            {word}
          </span>
        </span>
      );
    }

    if (!isCurrent) {
      // Future untyped word: single unbroken string, naturally connected ligatures
      return (
        <span
          key={idx}
          dir="rtl"
          className={`inline-block ml-3.5 mb-2.5 font-rtl text-xl sm:text-2xl select-none ${theme.textMuted}`}
        >
          {word}
        </span>
      );
    }

    // Active Current Word in RTL:
    // Partition typed input into matched & error segments without breaking font rendering
    const typedLen = inputVal.length;
    let matchLen = 0;
    while (matchLen < typedLen && matchLen < word.length && inputVal[matchLen] === word[matchLen]) {
      matchLen++;
    }

    const matchedPrefix = word.slice(0, matchLen);
    const hasError = typedLen > matchLen;
    const errorChars = hasError ? (typedLen <= word.length ? word.slice(matchLen, typedLen) : word.slice(matchLen)) : '';
    const extraTyped = typedLen > word.length ? inputVal.slice(word.length) : '';
    const untypedRemaining = word.slice(Math.min(typedLen, word.length));

    return (
      <span
        key={idx}
        ref={activeWordRef}
        dir="rtl"
        className="relative inline-block ml-3.5 mb-2.5 font-rtl text-xl sm:text-2xl select-none text-right"
      >
        {/* Caret before any typing starts: positioned on the far RIGHT edge of the RTL word */}
        {typedLen === 0 && isFocused && !isFailed && (
          <span
            className={`
              absolute -right-1 top-[10%] bottom-[10%] w-[0.1875rem] rounded-full pointer-events-none z-20
              ${theme.caret} ${!isActive ? 'animate-caret-blink' : ''}
            `}
          />
        )}

        {/* Matched Prefix (Correct Green) */}
        {matchedPrefix.length > 0 && (
          <span className={settings.difficulty === 'blind' ? theme.textNormal : theme.correct}>
            {matchedPrefix}
          </span>
        )}

        {/* Active Caret: Moves smoothly from right to left as characters are typed */}
        {typedLen > 0 && typedLen <= word.length && isFocused && !isFailed && (
          <span
            className={`
              inline-block w-[0.1875rem] h-[1.3em] align-middle -mx-[0.09375rem] rounded-full pointer-events-none z-20
              ${theme.caret} ${!isActive ? 'animate-caret-blink' : ''}
            `}
          />
        )}

        {/* Mismatched error segment */}
        {hasError && errorChars.length > 0 && (
          <span className={`${theme.incorrect} underline decoration-rose-500`}>
            {errorChars}
          </span>
        )}

        {/* Extra typed letters beyond word length */}
        {extraTyped.length > 0 && (
          <span className={theme.extra}>
            {extraTyped}
          </span>
        )}

        {/* Caret when input length exceeds word length */}
        {typedLen > word.length && isFocused && !isFailed && (
          <span
            className={`
              inline-block w-[0.1875rem] h-[1.3em] align-middle -mx-[0.09375rem] rounded-full pointer-events-none z-20
              ${theme.caret} ${!isActive ? 'animate-caret-blink' : ''}
            `}
          />
        )}

        {/* Remaining untyped target word letters */}
        {untypedRemaining.length > 0 && (
          <span className={theme.textMuted}>
            {untypedRemaining}
          </span>
        )}
      </span>
    );
  };

  const renderLtrWord = (word: string, idx: number) => {
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
                        ? 'left-0 right-0 bottom-0.5 h-[0.15625rem] rounded-full ' + theme.accentBg
                        : 'left-0 top-[10%] bottom-[10%] w-[0.15625rem] -translate-x-[0.0625rem] rounded-full ' + theme.caret
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
                    ? 'left-0 w-2.5 bottom-0.5 h-[0.15625rem] rounded-full ' + theme.accentBg
                    : 'left-0 top-[10%] bottom-[10%] w-[0.15625rem] rounded-full ' + theme.caret
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
              <span className="text-[0.6875rem] text-neutral-400">wpm</span>
            </div>
          )}

          {/* Live Accuracy */}
          {settings.showLiveAccuracy && isActive && (
            <div className="flex items-center gap-1 text-neutral-300">
              <span className={`font-bold text-sm ${liveAccuracy >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {liveAccuracy}%
              </span>
              <span className="text-[0.6875rem] text-neutral-400">acc</span>
            </div>
          )}
        </div>

        {/* Live Shortcut Hint */}
        <div className="hidden sm:flex items-center gap-1.5 text-[0.6875rem] text-neutral-400">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">tab</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">enter</kbd>
          <span>to restart</span>
        </div>
      </div>

      {/* Optional AI Ghost Racer Speedway Track */}
      {settings.showGhostRacer && (
        <GhostRacerTrack
          playerProgress={
            settings.mode === 'time'
              ? (elapsedTime / Math.max(1, settings.timeDuration)) * 100
              : settings.mode === 'words'
              ? (wordIndex / Math.max(1, settings.wordCount)) * 100
              : (wordIndex / Math.max(1, words.length)) * 100
          }
          ghostProgress={
            settings.mode === 'time'
              ? (elapsedTime / Math.max(1, settings.timeDuration)) * 100
              : (elapsedTime / Math.max(1, ((settings.wordCount || words.length) * 5) / ((settings.ghostRacerSpeed || settings.targetWpm || 70) / 60))) * 100
          }
          playerWpm={liveWpm}
          ghostWpm={settings.ghostRacerSpeed || settings.targetWpm || 70}
          ghostLabel={settings.ghostRacerSpeed ? `${settings.ghostRacerSpeed} WPM AI` : 'Target Pace'}
          isActive={isActive}
        />
      )}

      {/* Main Text Display & Focus Area */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`
          relative w-full p-4 sm:p-6 rounded-2xl border transition-all duration-150 cursor-text
          ${theme.border} ${theme.cardBg} shadow-sm overflow-hidden
          ${settings.fontSize === 'xl' ? 'text-xl sm:text-2xl' : settings.fontSize === 'lg' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}
        `}
      >
        {/* Hidden Input field capturing keystrokes (touch-friendly on mobile) */}
        <input
          ref={inputRef}
          type="text"
          dir={isRTL ? 'rtl' : 'ltr'}
          lang={isRTL ? (settings.language === 'pashto' ? 'ps' : settings.language === 'dari' ? 'fa' : 'ar') : 'en'}
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          inputMode="text"
        />

        {/* Blurring overlay if user clicks away */}
        {!isFocused && !isFailed && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30 transition-all rounded-2xl cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold shadow-lg">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Tap or press any key to focus</span>
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
              type="button"
              onClick={() => {
                resetInternalState();
                onRestartTest();
              }}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-all shadow-md cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Test (Enter / Tab / Esc)
            </button>
          </div>
        )}

        {/* Text Container with smooth 3-line viewport */}
        <div
          ref={containerRef}
          dir={isRTL ? 'rtl' : 'ltr'}
          className={`relative ${
            isRTL
              ? 'max-h-[8.5rem] sm:max-h-[9.75rem] text-right font-rtl leading-loose'
              : 'max-h-[7.1875rem] sm:max-h-[8.125rem] text-left font-mono-code leading-relaxed tracking-wider'
          } overflow-hidden select-none`}
        >
          {/* Words */}
          <div className="flex flex-wrap" dir={isRTL ? 'rtl' : 'ltr'}>
            {words.map((word, idx) => (isRTL ? renderRtlWord(word, idx) : renderLtrWord(word, idx)))}
          </div>
        </div>
      </div>

      {/* Mobile Touch Bar (visible on mobile phones for easy touch typing & control) */}
      <div className="flex sm:hidden items-center gap-2">
        <button
          type="button"
          onClick={() => {
            advanceWord();
            inputRef.current?.focus();
          }}
          className="flex-1 py-2.5 rounded-xl bg-cyan-500/15 active:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-mono-code text-xs font-bold flex items-center justify-center gap-1 min-h-[44px]"
        >
          <span>␣ Space (Next)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            handleBackspace();
            inputRef.current?.focus();
          }}
          className="px-4 py-2.5 rounded-xl bg-white/5 active:bg-white/15 border border-white/10 text-neutral-300 text-xs font-semibold min-h-[44px]"
          title="Backspace"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="px-3.5 py-2.5 rounded-xl bg-white/5 active:bg-white/15 border border-white/10 text-neutral-300 text-xs min-h-[44px]"
          title="Focus Keyboard"
        >
          <KeyboardIcon className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          type="button"
          onClick={onRestartTest}
          className="px-3.5 py-2.5 rounded-xl bg-white/5 active:bg-white/15 border border-white/10 text-neutral-300 text-xs min-h-[44px]"
          title="Restart Test"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop Quick restart icon button */}
      <div className="hidden sm:flex justify-center -mt-1">
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
