import React from 'react';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { TestMode } from '../types';

interface GameNavHudProps {
  activeGame: 'games' | 'arcade' | 'race' | 'bomb-defusal' | 'word-rain';
  onSelectGame: (mode: TestMode) => void;
  onExit: () => void;
}

export const GameNavHud: React.FC<GameNavHudProps> = ({
  activeGame,
  onSelectGame,
  onExit
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-2xl bg-neutral-900/90 border border-white/10 backdrop-blur-md shadow-xl select-none">
      {/* Return to Classic Typing Test */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Return to Classic Typing Test"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Classic Test</span>
        </button>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[0.6875rem] font-mono-code font-black text-amber-400">
          <Gamepad2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>GAMES HUD</span>
        </div>
      </div>

      {/* Quick Game Switcher Pills (Horizontal Scrollable on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {/* 🎮 Games Hub Overview */}
        <button
          onClick={() => onSelectGame('games')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeGame === 'games'
              ? 'bg-purple-500/25 border-2 border-purple-400 text-purple-200 shadow-md ring-2 ring-purple-400/40'
              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white'
          }`}
          title="All Games Hub Overview"
        >
          <span className="text-xs">🎮</span>
          <span className="hidden sm:inline">Hub</span>
        </button>

        {/* 🕹️ CYBER WORD STRIKE (ORIGINAL ARCADE) */}
        <button
          onClick={() => onSelectGame('arcade')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
            activeGame === 'arcade'
              ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-neutral-950 border-2 border-amber-300 shadow-lg shadow-amber-500/30 scale-102 ring-2 ring-amber-400/50'
              : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 hover:text-white'
          }`}
          title="Play Cyber Word Strike (Original Arcade Game)"
        >
          <span className="text-sm">🕹️</span>
          <span>CYBER WORD STRIKE</span>
          {activeGame === 'arcade' ? (
            <span className="w-2 h-2 rounded-full bg-neutral-950 animate-ping" />
          ) : (
            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950 text-[0.5625rem] font-black uppercase">
              ARCADE
            </span>
          )}
        </button>

        {/* 🏎️ SPEEDWAY RACE */}
        <button
          onClick={() => onSelectGame('race')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeGame === 'race'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-neutral-950 border-2 border-cyan-300 shadow-lg shadow-cyan-500/30 scale-102 ring-2 ring-cyan-400/50 font-black'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:text-white'
          }`}
          title="Play Speedway Race"
        >
          <span className="text-sm">🏎️</span>
          <span>Speedway</span>
        </button>

        {/* 💣 BOMB DEFUSAL */}
        <button
          onClick={() => onSelectGame('bomb-defusal')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeGame === 'bomb-defusal'
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-neutral-950 border-2 border-rose-300 shadow-lg shadow-rose-500/30 scale-102 ring-2 ring-rose-400/50 font-black'
              : 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-300 hover:text-white'
          }`}
          title="Play Bomb Defusal"
        >
          <span className="text-sm">💣</span>
          <span>Bomb Defusal</span>
        </button>

        {/* 🌧️ WORD RAIN */}
        <button
          onClick={() => onSelectGame('word-rain')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeGame === 'word-rain'
              ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-neutral-950 border-2 border-teal-300 shadow-lg shadow-teal-500/30 scale-102 ring-2 ring-teal-400/50 font-black'
              : 'bg-teal-500/10 hover:bg-teal-500/20 border border-teal-400/30 text-teal-300 hover:text-white'
          }`}
          title="Play Word Rain Balloon Drop"
        >
          <span className="text-sm">🌧️</span>
          <span>Word Rain</span>
        </button>
      </div>
    </div>
  );
};
