import React from 'react';
import { User } from 'firebase/auth';
import {
  Keyboard,
  Settings,
  History,
  Volume2,
  VolumeX,
  Palette,
  Flame,
  Trophy,
  LogIn,
  User as UserIcon,
  CloudCheck,
  Gamepad2,
  Globe
} from 'lucide-react';
import { SoundProfile, SupportedLanguage, TestSettings, ThemeId } from '../types';
import { THEMES, ThemeConfig } from '../utils/themes';
import { SUPPORTED_LANGUAGES } from '../utils/words';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  settings: TestSettings;
  theme: ThemeConfig;
  user: User | null;
  personalBestWpm: number;
  totalTestsCompleted: number;
  onUpdateSettings: (partial: Partial<TestSettings>) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  theme,
  user,
  personalBestWpm,
  totalTestsCompleted,
  onUpdateSettings,
  onOpenSettings,
  onOpenHistory,
  onOpenLeaderboard,
  onOpenAuth
}) => {
  const toggleSound = () => {
    const nextSound: SoundProfile = settings.sound === 'off' ? 'mechanical' : 'off';
    onUpdateSettings({ sound: nextSound });
  };

  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between gap-2 px-3 sm:px-6 py-2.5 sm:py-3 select-none flex-nowrap overflow-hidden">
      {/* Brand Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/20 shrink-0">
          <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
        </div>
        <div className="shrink-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white leading-none whitespace-nowrap">
              typing test <span className="text-cyan-400 font-extrabold">by maher</span>
            </h1>
            <span className="px-1.5 py-0.5 rounded-md text-[0.5625rem] font-bold tracking-widest uppercase bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 whitespace-nowrap">
              PRO
            </span>
          </div>
          <p className="text-[0.625rem] text-neutral-400 hidden xl:block whitespace-nowrap mt-0.5">
            Benchmark & adaptive touch-typing coach &bull; Cloud Powered
          </p>
        </div>
      </div>

      {/* Stats Quick Badges & Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
        {/* Personal Best Chip */}
        {personalBestWpm > 0 && (
          <button
            onClick={onOpenHistory}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-amber-400/20 bg-amber-400/5 text-amber-300 text-xs font-semibold hover:bg-amber-400/10 transition-colors"
            title="Your Personal Best speed"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>PB: {personalBestWpm} WPM</span>
          </button>
        )}

        {/* 🎮 ARCADE RUSH PROMINENT LAUNCH BUTTON - Immediately visible on desktop & mobile */}
        <button
          onClick={() => onUpdateSettings({ mode: settings.mode === 'arcade' ? 'time' : 'arcade' })}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md min-h-[38px] ${
            settings.mode === 'arcade'
              ? 'border-amber-400 bg-gradient-to-r from-amber-400 to-rose-500 text-neutral-950 scale-105 shadow-amber-500/25 ring-2 ring-amber-400/50'
              : 'border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 hover:from-amber-500/25 hover:to-rose-500/25 text-amber-300 hover:text-white hover:border-amber-400/60'
          }`}
          title="Play Cyber Strike Arcade Game"
        >
          <Gamepad2 className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span className="font-black tracking-tight">ARCADE</span>
          <span className="px-1 py-0.2 rounded bg-amber-400 text-neutral-950 text-[0.5625rem] font-black uppercase tracking-tighter">
            GAME
          </span>
        </button>

        {/* Global Leaderboard Button */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-colors shadow-xs min-h-[38px]"
          title="Global Typist Leaderboard & Rankings"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Rankings</span>
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative flex items-center">
          <select
            value={settings.language || 'english'}
            onChange={(e) => onUpdateSettings({ language: e.target.value as SupportedLanguage })}
            className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl pl-7 pr-2.5 py-1.5 text-xs text-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer min-h-[38px] max-w-[110px] sm:max-w-none"
            title="Typing Language Bank (Pashto, Dari, English, etc.)"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-neutral-900 text-neutral-200">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <Globe className="w-3.5 h-3.5 text-cyan-400 absolute left-2 pointer-events-none" />
        </div>

        {/* Theme Picker Selector */}
        <div className="relative hidden lg:flex items-center">
          <select
            value={settings.theme}
            onChange={(e) => onUpdateSettings({ theme: e.target.value as ThemeId })}
            className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl pl-7 pr-2.5 py-1.5 text-xs text-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer min-h-[38px]"
            title="Theme Selection"
          >
            {Object.values(THEMES).map((t) => (
              <option key={t.id} value={t.id} className="bg-neutral-900 text-neutral-200">
                {t.name}
              </option>
            ))}
          </select>
          <Palette className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
        </div>

        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl border transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
            settings.sound !== 'off'
              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
              : 'border-white/10 bg-white/5 text-neutral-400 hover:text-neutral-200'
          }`}
          title={settings.sound !== 'off' ? `Sound On (${settings.sound})` : 'Sound Muted'}
        >
          {settings.sound !== 'off' ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* History button */}
        <button
          onClick={onOpenHistory}
          className="p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors relative min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="Past Test History & Analytics"
        >
          <History className="w-4 h-4" />
          {totalTestsCompleted > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0d1117]" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="Application Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Account / Profile / Cloud Sync Button */}
        {user ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-neutral-200 transition-colors group min-h-[38px]"
            title={`Logged in as ${user.displayName || user.email}`}
          >
            <UserAvatar
              uid={user.uid}
              email={user.email}
              displayName={user.displayName}
              photoURL={user.photoURL}
              className="w-5 h-5 rounded-full object-cover border border-cyan-400"
              textClassName="text-[0.625rem]"
            />
            <span className="text-xs font-semibold max-w-[4rem] sm:max-w-[6.875rem] truncate text-white">
              {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Cloud Synced" />
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400 text-neutral-950 font-bold text-xs hover:bg-cyan-300 transition-colors shadow-sm min-h-[38px]"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
