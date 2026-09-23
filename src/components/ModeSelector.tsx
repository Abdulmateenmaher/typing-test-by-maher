import React from 'react';
import {
  Clock,
  AlignLeft,
  Quote,
  Code,
  Dumbbell,
  ShieldAlert,
  Sparkles,
  Hash,
  Type,
  Gamepad2,
  Bot
} from 'lucide-react';
import {
  CodeLanguage,
  DifficultyMode,
  QuoteLength,
  TestMode,
  TestSettings,
  TimeDuration,
  WordCount
} from '../types';
import { ThemeConfig } from '../utils/themes';

interface ModeSelectorProps {
  settings: TestSettings;
  theme: ThemeConfig;
  onUpdateSettings: (partial: Partial<TestSettings>) => void;
  onOpenDrills: () => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  settings,
  theme,
  onUpdateSettings,
  onOpenDrills,
  disabled
}) => {
  const timeOptions: TimeDuration[] = [15, 30, 60, 120];
  const wordOptions: WordCount[] = [10, 25, 50, 100];
  const quoteOptions: { label: string; value: QuoteLength }[] = [
    { label: 'all', value: 'all' },
    { label: 'short', value: 'short' },
    { label: 'med', value: 'medium' },
    { label: 'long', value: 'long' }
  ];
  const codeOptions: { label: string; value: CodeLanguage }[] = [
    { label: 'JS', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'HTML', value: 'html' },
    { label: 'Rust', value: 'rust' }
  ];

  return (
    <div
      className={`w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border ${theme.border} ${theme.cardBg} backdrop-blur-md shadow-sm select-none transition-opacity ${
        disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Primary Modes Segment (Horizontally scrollable on mobile) */}
      <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5 text-xs overflow-x-auto no-scrollbar scroll-smooth">
        {/* 🎮 ARCADE RUSH GAME MODE - Positioned at FRONT so never hidden by scroll */}
        <button
          onClick={() => onUpdateSettings({ mode: 'arcade' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black whitespace-nowrap transition-all ${
            settings.mode === 'arcade'
              ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-neutral-950 shadow-md ring-2 ring-amber-400/50'
              : 'text-amber-300 bg-amber-400/15 border border-amber-400/40 hover:bg-amber-400/25 shadow-xs'
          }`}
          title="Play Cyber Strike Arcade Game"
        >
          <Gamepad2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>ARCADE</span>
          <span className="px-1 py-0.2 text-[0.5625rem] rounded bg-amber-400 text-black font-black uppercase tracking-tighter">
            GAME
          </span>
        </button>

        <div className="w-[0.0625rem] h-4 bg-white/10 mx-1 shrink-0" />

        {/* Punctuation toggle */}
        <button
          onClick={() => onUpdateSettings({ includePunctuation: !settings.includePunctuation })}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
            settings.includePunctuation
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Toggle Punctuation"
        >
          <Type className="w-3.5 h-3.5" />
          <span>punct</span>
        </button>

        {/* Numbers toggle */}
        <button
          onClick={() => onUpdateSettings({ includeNumbers: !settings.includeNumbers })}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
            settings.includeNumbers
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Toggle Numbers"
        >
          <Hash className="w-3.5 h-3.5" />
          <span>nums</span>
        </button>

        <div className="w-[0.0625rem] h-4 bg-white/10 mx-1 shrink-0" />

        {/* Time mode */}
        <button
          onClick={() => onUpdateSettings({ mode: 'time' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
            settings.mode === 'time'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>time</span>
        </button>

        {/* Words mode */}
        <button
          onClick={() => onUpdateSettings({ mode: 'words' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
            settings.mode === 'words'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>words</span>
        </button>

        {/* Quotes mode */}
        <button
          onClick={() => onUpdateSettings({ mode: 'quote' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
            settings.mode === 'quote'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Quote className="w-3.5 h-3.5" />
          <span>quote</span>
        </button>

        {/* Code mode */}
        <button
          onClick={() => onUpdateSettings({ mode: 'code' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
            settings.mode === 'code'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>code</span>
        </button>

        {/* Special Drills / Custom */}
        <button
          onClick={onOpenDrills}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
            settings.mode === 'drill'
              ? 'bg-purple-500 text-white font-bold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>drills</span>
        </button>
      </div>

      {/* Sub-Options & Difficulty (durations, word counts, ghost racer, etc.) */}
      <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono-code overflow-x-auto no-scrollbar">
        {/* Ghost Racer Pace Battle Toggle */}
        {settings.mode !== 'arcade' && (
          <button
            onClick={() => onUpdateSettings({ showGhostRacer: !settings.showGhostRacer })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[0.6875rem] font-sans transition-colors whitespace-nowrap ${
              settings.showGhostRacer
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 font-semibold'
                : 'border-white/10 bg-white/5 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Toggle Ghost Racer Live Duel"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Ghost Duel</span>
          </button>
        )}

        {/* Sub-options for active mode */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          {settings.mode === 'time' && (
            <div className="flex items-center gap-1">
              {timeOptions.map((sec) => (
                <button
                  key={sec}
                  onClick={() => onUpdateSettings({ timeDuration: sec })}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    settings.timeDuration === sec
                      ? 'text-cyan-400 font-bold bg-cyan-400/10'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          )}

          {settings.mode === 'words' && (
            <div className="flex items-center gap-1">
              {wordOptions.map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => onUpdateSettings({ wordCount: cnt })}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    settings.wordCount === cnt
                      ? 'text-cyan-400 font-bold bg-cyan-400/10'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          )}

          {settings.mode === 'quote' && (
            <div className="flex items-center gap-1">
              {quoteOptions.map((q) => (
                <button
                  key={q.value}
                  onClick={() => onUpdateSettings({ quoteLength: q.value })}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    settings.quoteLength === q.value
                      ? 'text-cyan-400 font-bold bg-cyan-400/10'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {settings.mode === 'code' && (
            <div className="flex items-center gap-1">
              {codeOptions.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onUpdateSettings({ codeLanguage: c.value })}
                  className={`px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    settings.codeLanguage === c.value
                      ? 'text-cyan-400 font-bold bg-cyan-400/10'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {settings.mode === 'drill' && (
            <div className="flex items-center gap-1 px-2 text-purple-300 font-sans text-xs whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 mr-1" />
              <span>Targeted Practice</span>
            </div>
          )}

          {settings.mode === 'arcade' && (
            <div className="flex items-center gap-1 px-2 text-amber-300 font-sans text-xs whitespace-nowrap">
              <span>Wave Survival &amp; High Score</span>
            </div>
          )}
        </div>

        {/* Difficulty Quick Badge */}
        {settings.mode !== 'arcade' && (
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={settings.difficulty}
              onChange={(e) => onUpdateSettings({ difficulty: e.target.value as DifficultyMode })}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer min-h-[36px]"
            >
              <option value="normal" className="bg-neutral-900 text-neutral-200">Normal Difficulty</option>
              <option value="master" className="bg-neutral-900 text-cyan-300">Master (Strict 95%+ Acc)</option>
              <option value="hardcore" className="bg-neutral-900 text-rose-300">Hardcore (1 Error = Fail)</option>
              <option value="no-backspace" className="bg-neutral-900 text-amber-300">No Backspace</option>
              <option value="blind" className="bg-neutral-900 text-purple-300">Blind Mode</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
