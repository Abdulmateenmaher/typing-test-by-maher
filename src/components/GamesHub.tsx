import React from 'react';
import {
  Gamepad2,
  Zap,
  Bomb,
  CloudRain,
  Rocket,
  Trophy,
  Flame,
  ArrowLeft,
  Sparkles,
  Shield,
  Gauge,
  Crown
} from 'lucide-react';
import { ThemeConfig } from '../utils/themes';
import { TestMode, TestSettings } from '../types';

import { GameNavHud } from './GameNavHud';

interface GamesHubProps {
  settings: TestSettings;
  theme: ThemeConfig;
  onSelectGame: (mode: TestMode) => void;
  onExit: () => void;
}

interface GameCard {
  id: TestMode;
  title: string;
  badge: string;
  icon: string;
  gradient: string;
  borderHover: string;
  glow: string;
  buttonGradient: string;
  description: string;
  tags: string[];
  features: string[];
}

const GAMES: GameCard[] = [
  {
    id: 'arcade',
    title: 'Cyber Word Strike',
    badge: 'ORIGINAL ARCADE GAME',
    icon: '🕹️',
    gradient: 'from-amber-950/60 via-rose-950/40 to-neutral-900',
    borderHover: 'hover:border-amber-400 group-hover:shadow-amber-500/25',
    glow: 'group-hover:border-amber-400/80',
    buttonGradient: 'from-amber-400 via-rose-500 to-purple-600 text-neutral-950 hover:from-amber-300 hover:to-purple-500',
    description:
      'The original Cyber Word Strike arcade game! Shoot down descending alien enemy drones with rapid-fire keyboard laser turrets, trigger freeze-time dilation crystals, and detonate EMP screen nukes across 10 progressive waves!',
    tags: ['Cyber Word Strike', '10 Waves', 'EMP Shockwaves', 'Freeze Dilation', 'Boss Battles'],
    features: ['Canvas 60FPS particle physics', '3 Speed categories (Normal, Fast, Hyper)', 'Global arcade leaderboard']
  },
  {
    id: 'race',
    title: 'Speedway Grand Prix',
    badge: 'Formula Esports',
    icon: '🏎️',
    gradient: 'from-cyan-950/60 via-blue-950/40 to-neutral-900',
    borderHover: 'hover:border-cyan-400 group-hover:shadow-cyan-500/20',
    glow: 'group-hover:border-cyan-400/80',
    buttonGradient: 'from-cyan-400 via-blue-500 to-indigo-600 text-neutral-950 hover:from-cyan-300 hover:to-indigo-500',
    description:
      '5-lane multi-car speedway race against intelligent AI drivers. Maintain clean streaks to charge dual-exhaust Nitro boosts and claim the podium 1st place!',
    tags: ['Multi-Lane', 'Nitro Boost', '5 Car Skins', 'Live WPM'],
    features: ['Real-time drafting & slipstreams', 'F1 Gantry 5-light countdown', '4 AI difficulty tiers']
  },
  {
    id: 'bomb-defusal',
    title: 'Cyber Bomb Defusal',
    badge: 'High Stakes',
    icon: '💣',
    gradient: 'from-rose-950/60 via-red-950/40 to-neutral-900',
    borderHover: 'hover:border-rose-400 group-hover:shadow-rose-500/20',
    glow: 'group-hover:border-rose-400/80',
    buttonGradient: 'from-rose-500 via-red-500 to-amber-500 text-neutral-950 hover:from-rose-400 hover:to-amber-400',
    description:
      'Race against a live digital detonator! Cut 5 high-voltage circuit wires and decrypt classified override ciphers before the timer hits 00.00s. Zero room for typos!',
    tags: ['Ticking Timer', 'Circuit Cutting', 'Penalties', 'Tactical'],
    features: ['Ticking clock audio tension', '5 progressive wire stages', 'SWAT technician rank badges']
  },
  {
    id: 'word-rain',
    title: 'Word Rain & Balloons',
    badge: 'Zen & Reflexes',
    icon: '🌧️',
    gradient: 'from-teal-950/60 via-emerald-950/40 to-neutral-900',
    borderHover: 'hover:border-teal-400 group-hover:shadow-teal-500/20',
    glow: 'group-hover:border-teal-400/80',
    buttonGradient: 'from-teal-400 via-emerald-400 to-cyan-500 text-neutral-950 hover:from-teal-300 hover:to-cyan-400',
    description:
      'Relaxing yet thrilling word drop challenge! Pop descending bubbles and floating balloons before they hit the ground baseline. Catch Golden 3X and freeze orbs!',
    tags: ['Falling Words', 'Freeze Orbs', 'Super Bombs', 'Combo Streaks'],
    features: ['Golden 3X multiplier bubbles', '3 Shield defense lines', 'Relaxed to typhoon wind speeds']
  }
];

export const GamesHub: React.FC<GamesHubProps> = ({
  settings,
  theme,
  onSelectGame,
  onExit
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 py-2 px-2 sm:px-4 text-white font-sans select-none animate-fadeIn">
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between bg-neutral-900/80 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Classic Test</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-mono-code text-purple-400 font-bold border-l border-white/10 pl-3">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span>MAHER TYPING ARCADIA & GAMES</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold font-mono-code">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>4 ARCADE GAMES</span>
          </span>
        </div>
      </div>

      {/* GAMES HUD - QUICK-SWITCH TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-2xl bg-neutral-900/95 border border-white/15 shadow-xl no-scrollbar">
        <div className="text-[0.6875rem] font-mono-code uppercase font-black text-amber-400 px-2 shrink-0 flex items-center gap-1.5 border-r border-white/10 pr-3">
          <Gamepad2 className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>GAMES HUD:</span>
        </div>

        {/* 🕹️ CYBER WORD STRIKE (ORIGINAL ARCADE) */}
        <button
          onClick={() => onSelectGame('arcade')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/30 via-rose-500/30 to-purple-500/30 hover:from-amber-500/40 hover:to-purple-500/40 border-2 border-amber-400 text-amber-200 hover:text-white text-xs font-black shrink-0 transition-all cursor-pointer shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40"
        >
          <span className="text-base">🕹️</span>
          <span>CYBER WORD STRIKE</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 text-[0.5625rem] font-black uppercase tracking-wider">
            ARCADE
          </span>
        </button>

        {/* 🏎️ SPEEDWAY RACE QUICK BUTTON */}
        <button
          onClick={() => onSelectGame('race')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold shrink-0 transition-all cursor-pointer"
        >
          <span className="text-base">🏎️</span>
          <span>Speedway Race</span>
        </button>

        {/* 💣 BOMB DEFUSAL QUICK BUTTON */}
        <button
          onClick={() => onSelectGame('bomb-defusal')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-300 hover:text-white text-xs font-bold shrink-0 transition-all cursor-pointer"
        >
          <span className="text-base">💣</span>
          <span>Bomb Defusal</span>
        </button>

        {/* 🌧️ WORD RAIN QUICK BUTTON */}
        <button
          onClick={() => onSelectGame('word-rain')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/40 text-teal-300 hover:text-white text-xs font-bold shrink-0 transition-all cursor-pointer"
        >
          <span className="text-base">🌧️</span>
          <span>Word Rain</span>
        </button>
      </div>

      {/* Main Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/80 via-neutral-950 to-cyan-950/80 border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[0.6875rem] font-bold tracking-wider uppercase text-cyan-300 mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Typing Game Arena</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
            PLAY, RACE & DEFEND
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
            Level up your speed, muscle memory, and reaction time with 4 dedicated gamified modes.
            Compete on high-octane speedways, defend galaxies, defuse cyber detonators, or pop floating word bubbles.
          </p>
        </div>

        {/* Ambient Glows */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-12 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className={`group relative rounded-3xl bg-gradient-to-b ${game.gradient} border border-white/10 ${game.borderHover} p-5 sm:p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl flex flex-col justify-between`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  <div>
                    <span className="text-[0.625rem] font-mono-code uppercase font-bold text-neutral-400">
                      {game.badge}
                    </span>
                    <h3 className="text-xl font-black text-white">{game.title}</h3>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                {game.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[0.625rem] font-mono-code px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Key Features List */}
              <ul className="space-y-1 mb-6">
                {game.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => onSelectGame(game.id)}
              className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r ${game.buttonGradient} font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg cursor-pointer`}
            >
              <Zap className="w-4 h-4" />
              <span>PLAY {game.title.toUpperCase()}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
