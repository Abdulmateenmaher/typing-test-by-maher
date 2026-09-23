import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GraduationCap,
  Star,
  Trophy,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  Keyboard,
  Info
} from 'lucide-react';
import { TestSettings } from '../types';
import { ThemeConfig } from '../utils/themes';
import {
  LESSONS_DATA,
  LESSONS_STAGES,
  LessonDef,
  LessonProgress,
  isLessonUnlocked,
  getStoredLessonsProgress,
  saveStoredLessonProgress
} from '../utils/lessonsData';
import {
  playStarChime,
  playLessonCompleteSound,
  playKeySound,
  playErrorSound
} from '../utils/audio';
import { isRtlLanguage } from '../utils/words';

interface LessonsProgramProps {
  settings: TestSettings;
  theme: ThemeConfig;
  onExit: () => void;
}

export const LessonsProgram: React.FC<LessonsProgramProps> = ({
  settings,
  theme,
  onExit
}) => {
  const isRTL = isRtlLanguage(settings.language || 'english');

  // Lessons Progress State
  const [progressMap, setProgressMap] = useState<Record<number, LessonProgress>>(() => getStoredLessonsProgress());
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [activeLesson, setActiveLesson] = useState<LessonDef | null>(null);

  // Active Lesson Playback State
  const [typedInput, setTypedInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [lessonActive, setLessonActive] = useState<boolean>(false);
  const [lessonComplete, setLessonComplete] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [finalWpm, setFinalWpm] = useState<number>(0);
  const [finalAccuracy, setFinalAccuracy] = useState<number>(100);
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Total Stats Calculation
  const totalCompleted = Object.values(progressMap).filter((p) => p.completed).length;
  const totalStars = Object.values(progressMap).reduce((acc, p) => acc + (p.stars || 0), 0);
  const maxPossibleStars = LESSONS_DATA.length * 5;
  const progressPercent = Math.round((totalCompleted / LESSONS_DATA.length) * 100);

  // Launch a specific lesson
  const startLesson = (lesson: LessonDef) => {
    if (!isLessonUnlocked(lesson.id, progressMap)) {
      return;
    }
    setActiveLesson(lesson);
    setTypedInput('');
    setStartTime(null);
    setLessonActive(true);
    setLessonComplete(false);
    setMistakeCount(0);
    setFinalWpm(0);
    setFinalAccuracy(100);
    setEarnedStars(0);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Exit from lesson player back to curriculum roadmap
  const returnToRoadmap = () => {
    setActiveLesson(null);
    setLessonActive(false);
    setLessonComplete(false);
    setTypedInput('');
  };

  // Key stroke handler in active lesson
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeLesson || lessonComplete) return;

    const val = e.target.value;
    const targetContent = activeLesson.content;

    // Start timer on first keystroke
    if (!startTime && val.length > 0) {
      setStartTime(performance.now());
    }

    // Check last typed character
    if (val.length > typedInput.length) {
      const charIndex = val.length - 1;
      const expectedChar = targetContent[charIndex];
      const typedChar = val[charIndex];

      if (typedChar === expectedChar) {
        if (!isMuted) playKeySound(settings.sound, settings.soundVolume, typedChar === ' ');
      } else {
        setMistakeCount((m) => m + 1);
        if (!isMuted) playErrorSound(settings.soundVolume);
      }
    }

    setTypedInput(val);

    // Check if lesson reached completion
    if (val.length >= targetContent.length) {
      finishLesson(val, targetContent);
    }
  };

  // Complete lesson & evaluate score/stars
  const finishLesson = (typedText: string, targetText: string) => {
    setLessonComplete(true);
    const endTime = performance.now();
    const elapsedMinutes = startTime ? Math.max(0.05, (endTime - startTime) / 60000) : 0.1;

    // Calculate accuracy
    let correctCount = 0;
    for (let i = 0; i < targetText.length; i++) {
      if (typedText[i] === targetText[i]) {
        correctCount += 1;
      }
    }
    const acc = Math.round((correctCount / targetText.length) * 100);

    // Calculate WPM: (all characters / 5) / minutes
    const wpm = Math.round((targetText.length / 5) / elapsedMinutes);

    setFinalWpm(wpm);
    setFinalAccuracy(acc);

    // Calculate Stars (1 to 5)
    let stars = 1;
    if (acc >= 90) stars = 2;
    if (acc >= 95 && wpm >= activeLesson!.targetWpm * 0.8) stars = 3;
    if (acc >= 96 && wpm >= activeLesson!.targetWpm) stars = 4;
    if (acc >= 98 && wpm >= activeLesson!.targetWpm) stars = 5;

    setEarnedStars(stars);

    // Play sounds
    if (!isMuted) {
      playLessonCompleteSound(settings.soundVolume);
      setTimeout(() => {
        playStarChime(stars, settings.soundVolume);
      }, 300);
    }

    // Save to local progress
    if (activeLesson) {
      const existing = progressMap[activeLesson.id];
      const newProgress: LessonProgress = {
        lessonId: activeLesson.id,
        completed: true,
        stars: Math.max(existing?.stars || 0, stars),
        bestWpm: Math.max(existing?.bestWpm || 0, wpm),
        bestAccuracy: Math.max(existing?.bestAccuracy || 0, acc),
        completedAt: new Date().toISOString()
      };

      saveStoredLessonProgress(activeLesson.id, newProgress);
      setProgressMap((prev) => ({ ...prev, [activeLesson.id]: newProgress }));
    }
  };

  // Auto advance to next lesson
  const handleNextLesson = () => {
    if (!activeLesson) return;
    const nextLesson = LESSONS_DATA.find((l) => l.id === activeLesson.id + 1);
    if (nextLesson) {
      startLesson(nextLesson);
    } else {
      returnToRoadmap();
    }
  };

  // Determine finger guide details for active key
  const getFingerInstruction = (char: string) => {
    const c = char.toLowerCase();
    if (['f', 'r', 'v', 't', 'g', 'b'].includes(c)) return { hand: 'Left Hand', finger: 'Index Finger', color: 'text-cyan-400' };
    if (['d', 'e', 'c'].includes(c)) return { hand: 'Left Hand', finger: 'Middle Finger', color: 'text-blue-400' };
    if (['s', 'w', 'x'].includes(c)) return { hand: 'Left Hand', finger: 'Ring Finger', color: 'text-amber-400' };
    if (['a', 'q', 'z'].includes(c)) return { hand: 'Left Hand', finger: 'Pinky Finger', color: 'text-rose-400' };
    if (['j', 'u', 'm', 'y', 'h', 'n'].includes(c)) return { hand: 'Right Hand', finger: 'Index Finger', color: 'text-cyan-400' };
    if (['k', 'i', ','].includes(c)) return { hand: 'Right Hand', finger: 'Middle Finger', color: 'text-blue-400' };
    if (['l', 'o', '.'].includes(c)) return { hand: 'Right Hand', finger: 'Ring Finger', color: 'text-amber-400' };
    if ([';', 'p', '/', '[', ']', '-', '='].includes(c)) return { hand: 'Right Hand', finger: 'Pinky Finger', color: 'text-rose-400' };
    if (c === ' ') return { hand: 'Either Hand', finger: 'Thumb (Spacebar)', color: 'text-emerald-400' };
    return { hand: 'Both Hands', finger: 'Home Row Posture', color: 'text-purple-400' };
  };

  const nextCharToType = activeLesson ? activeLesson.content[typedInput.length] || '' : '';
  const fingerGuide = getFingerInstruction(nextCharToType);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 py-2 px-2 sm:px-4 text-white font-sans select-none">
      {/* Top Header / Nav */}
      <div className="flex items-center justify-between bg-neutral-900/80 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={activeLesson ? returnToRoadmap : onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{activeLesson ? 'Curriculum Roadmap' : 'Return to Modes'}</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono-code text-purple-400 font-bold border-l border-white/10 pl-3">
            <GraduationCap className="w-4 h-4" />
            <span>TOUCH-TYPING ACADEMY (100 LESSONS)</span>
          </div>
        </div>

        {/* Global Stars & Completed Count */}
        <div className="flex items-center gap-3 text-xs font-mono-code">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{totalStars} / {maxPossibleStars}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* ROADMAP / LESSON SELECTION VIEW */}
      {!activeLesson && (
        <div className="flex flex-col gap-4">
          {/* Hero Banner with Course Progress */}
          <div className="rounded-3xl bg-gradient-to-br from-purple-950/40 via-neutral-900/90 to-neutral-950 border border-purple-500/20 p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 relative">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono-code text-purple-400 uppercase tracking-widest font-bold mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Interactive Touch-Typing Curriculum</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Master Touch-Typing from Scratch
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mt-1">
                  Master muscle memory, finger positioning, developer syntax, and rhythm cadence through 100 progressive lessons across 10 stages. Complete each lesson to unlock the next!
                </p>
              </div>

              {/* Course Progress Gauge */}
              <div className="flex flex-col items-center sm:items-end w-full sm:w-auto bg-white/5 border border-white/10 rounded-2xl p-3 min-w-[180px]">
                <div className="text-[0.625rem] text-neutral-400 uppercase font-mono-code">Mastery Progress</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {totalCompleted} <span className="text-xs text-neutral-400">/ 100 Lessons</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stage Tabs (Stages 1 through 10) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {LESSONS_STAGES.map((stg) => {
              const stageLessons = LESSONS_DATA.filter((l) => l.stage === stg.stage);
              const stageCompleted = stageLessons.filter((l) => progressMap[l.id]?.completed).length;
              const isSelected = selectedStage === stg.stage;

              return (
                <button
                  key={stg.stage}
                  onClick={() => setSelectedStage(stg.stage)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-md ring-1 ring-purple-400/50'
                      : 'bg-neutral-900/60 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>{stg.icon}</span>
                  <span>Stage {stg.stage}: {stg.title}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[0.625rem] font-mono-code">
                    {stageCompleted}/{stageLessons.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lessons Grid for Selected Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LESSONS_DATA.filter((l) => l.stage === selectedStage).map((lesson) => {
              const prog = progressMap[lesson.id];
              const isCompleted = Boolean(prog?.completed);
              const stars = prog?.stars || 0;
              const isUnlocked = isLessonUnlocked(lesson.id, progressMap);
              const isLocked = !isUnlocked;

              return (
                <div
                  key={lesson.id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all relative ${
                    isLocked
                      ? 'bg-neutral-950/40 border-white/5 opacity-70'
                      : isCompleted
                      ? 'bg-neutral-900/70 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg'
                      : 'bg-neutral-900/50 border-white/10 hover:border-white/20 hover:shadow-lg'
                  }`}
                >
                  <div>
                    {/* Header: Lesson # & Status / Stars */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[0.6875rem] font-mono-code font-bold px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-purple-300">
                          Lesson {lesson.id}
                        </span>
                        {isLocked && (
                          <span className="flex items-center gap-1 text-[0.625rem] font-mono-code font-semibold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-white/5">
                            <Lock className="w-3 h-3 text-neutral-400" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>

                      {/* Stars Display */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className={`text-sm font-bold mb-1 ${isLocked ? 'text-neutral-400' : 'text-white'}`}>
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                      {lesson.description}
                    </p>

                    {/* Focus Keys Badges */}
                    <div className="flex items-center gap-1 flex-wrap mb-4">
                      {lesson.focusKeys.map((k, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-cyan-300 font-mono-code text-[0.6875rem] font-bold"
                        >
                          {k === ' ' ? 'Space' : k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Stats & Action */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="text-[0.625rem] font-mono-code text-neutral-400">
                      {isLocked ? (
                        <span className="text-amber-400/80 flex items-center gap-1 font-semibold">
                          <Lock className="w-3 h-3" />
                          <span>Pass Lesson {lesson.id - 1}</span>
                        </span>
                      ) : (
                        <>Target: <strong className="text-white">{lesson.targetWpm} WPM</strong> • {lesson.targetAccuracy}%</>
                      )}
                    </div>

                    <button
                      onClick={() => !isLocked && startLesson(lesson)}
                      disabled={isLocked}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isLocked
                          ? 'bg-white/[0.04] text-neutral-500 border border-white/5 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer active:scale-95'
                          : 'bg-purple-500 hover:bg-purple-400 text-black font-black shadow-md shadow-purple-500/25 cursor-pointer active:scale-95'
                      }`}
                      title={isLocked ? `Complete Lesson ${lesson.id - 1} to unlock this lesson` : undefined}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </>
                      ) : isCompleted ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Practice Again</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-black" />
                          <span>Start Lesson</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVE LESSON RUNNER */}
      {activeLesson && (
        <div className="flex flex-col gap-4">
          {/* Lesson Status Header */}
          <div className="rounded-2xl bg-neutral-900/80 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono-code text-purple-400 font-bold mb-0.5">
                <span>Stage {activeLesson.stage}: {activeLesson.stageTitle}</span>
                <span>•</span>
                <span>Lesson {activeLesson.id}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">{activeLesson.title}</h2>
            </div>

            {/* Target Criteria */}
            <div className="flex items-center gap-3 text-xs font-mono-code">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center min-w-[80px]">
                <div className="text-[0.5625rem] text-neutral-400 uppercase">Target Speed</div>
                <div className="text-sm font-bold text-cyan-400">{activeLesson.targetWpm} WPM</div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center min-w-[80px]">
                <div className="text-[0.5625rem] text-neutral-400 uppercase">Target Acc</div>
                <div className="text-sm font-bold text-emerald-400">{activeLesson.targetAccuracy}%</div>
              </div>
            </div>
          </div>

          {/* Real-time Pedagogical Finger Guide Card */}
          <div className="rounded-2xl bg-purple-950/20 border border-purple-500/30 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-lg font-mono-code font-black text-white">
                {nextCharToType === ' ' ? '␣' : nextCharToType || '✓'}
              </div>
              <div>
                <div className="text-[0.625rem] text-neutral-400 uppercase font-mono-code">Next Target Key</div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className={fingerGuide.color}>{fingerGuide.hand} — {fingerGuide.finger}</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-400 italic">
              <Info className="w-3.5 h-3.5 text-purple-400" />
              <span>{activeLesson.instruction}</span>
            </div>
          </div>

          {/* Interactive Lesson Text Box */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="rounded-3xl bg-neutral-950/90 border border-white/10 p-6 sm:p-8 flex flex-col gap-4 relative min-h-[160px] cursor-text shadow-2xl"
          >
            {/* Display Stream with Zero-Latency Highlighting - Wrapped cleanly & enlarged */}
            <div
              dir={isRTL ? 'rtl' : 'ltr'}
              className="text-2xl sm:text-3xl md:text-4xl font-mono-code leading-relaxed tracking-wider select-none break-words whitespace-pre-wrap"
            >
              {activeLesson.content.split('').map((char, index) => {
                const isTyped = index < typedInput.length;
                const isCurrent = index === typedInput.length;
                const isCorrect = isTyped && typedInput[index] === char;

                let charClass = 'text-neutral-500';
                if (isTyped) {
                  charClass = isCorrect ? 'text-emerald-400 font-medium' : 'text-rose-400 bg-rose-500/20 rounded-xs';
                } else if (isCurrent) {
                  charClass = 'text-white bg-purple-500/30 px-0.5 rounded-xs ring-2 ring-purple-400 animate-pulse font-black';
                }

                return (
                  <span key={index} className={charClass}>
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Hidden Input capturing real-time keystrokes */}
            <input
              ref={inputRef}
              type="text"
              value={typedInput}
              onChange={handleInputChange}
              dir={isRTL ? 'rtl' : 'ltr'}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              className="opacity-0 absolute inset-0 cursor-default"
            />
          </div>

          {/* Live Progress Bar */}
          <div className="w-full flex items-center gap-3 text-xs font-mono-code text-neutral-400">
            <span>Progress: {Math.round((typedInput.length / activeLesson.content.length) * 100)}%</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-150"
                style={{ width: `${(typedInput.length / activeLesson.content.length) * 100}%` }}
              />
            </div>
            <span>Errors: <strong className="text-rose-400">{mistakeCount}</strong></span>
          </div>

          {/* LESSON COMPLETE / STAR RESULTS MODAL */}
          {lessonComplete && (
            <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-purple-500/30 mb-4 animate-bounce">
                🎓
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">
                LESSON {activeLesson.id} COMPLETED!
              </h2>

              {/* Star Rating Fanfare */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-8 h-8 transition-transform duration-300 ${
                      s <= earnedStars
                        ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-md'
                        : 'text-neutral-700'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mb-6">
                {earnedStars === 5
                  ? 'Outstanding Grand Master performance! Perfect rhythm and accuracy.'
                  : earnedStars >= 3
                  ? 'Great progress! Muscle memory is developing steadily.'
                  : 'Lesson passed! Try again to achieve 5-star perfection.'}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md mb-6 text-left font-mono-code">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[0.625rem] text-neutral-400 uppercase">Your Speed</div>
                  <div className="text-lg font-black text-cyan-400">{finalWpm} WPM</div>
                  <div className="text-[0.5625rem] text-neutral-500">Target: {activeLesson.targetWpm} WPM</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[0.625rem] text-neutral-400 uppercase">Accuracy</div>
                  <div className="text-lg font-black text-emerald-400">{finalAccuracy}%</div>
                  <div className="text-[0.5625rem] text-neutral-500">Target: {activeLesson.targetAccuracy}%</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                  <div className="text-[0.625rem] text-neutral-400 uppercase">Stars Earned</div>
                  <div className="text-lg font-black text-amber-400">+{earnedStars} ⭐️</div>
                  <div className="text-[0.5625rem] text-neutral-500">Total: {totalStars}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNextLesson}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-neutral-950 font-black text-sm transition-transform active:scale-95 shadow-lg shadow-purple-500/30 cursor-pointer"
                >
                  <span>NEXT LESSON</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startLesson(activeLesson)}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={returnToRoadmap}
                  className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Roadmap
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
