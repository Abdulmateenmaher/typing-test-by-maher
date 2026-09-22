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
  CloudCheck
} from 'lucide-react';
import { SoundProfile, TestSettings, ThemeId } from '../types';
import { THEMES, ThemeConfig } from '../utils/themes';

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
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/20 shrink-0">
          <Keyboard className="w-5 h-5 text-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
              typing test <span className="text-cyan-400 font-extrabold">by maher</span>
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold tracking-widest uppercase bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 hidden md:block">
            Benchmark & adaptive touch-typing coach &bull; Cloud Powered
          </p>
        </div>
      </div>

      {/* Stats Quick Badges & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Personal Best Chip */}
        {personalBestWpm > 0 && (
          <div
            onClick={onOpenHistory}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-amber-400/20 bg-amber-400/5 text-amber-300 text-xs font-semibold cursor-pointer hover:bg-amber-400/10 transition-colors"
            title="Your Personal Best speed"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>PB: {personalBestWpm} WPM</span>
          </div>
        )}

        {/* Global Leaderboard Button */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-colors shadow-xs"
          title="Global Typist Leaderboard & Rankings"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Rankings</span>
        </button>

        {/* Theme Picker Selector */}
        <div className="relative hidden sm:flex items-center">
          <select
            value={settings.theme}
            onChange={(e) => onUpdateSettings({ theme: e.target.value as ThemeId })}
            className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl pl-7 pr-2.5 py-1.5 text-xs text-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
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
          className={`p-2 rounded-xl border transition-colors ${
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
          className="p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors relative"
          title="Past Test History & Analytics"
        >
          <History className="w-4 h-4" />
          {totalTestsCompleted > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0d1117]" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Application Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Account / Profile / Cloud Sync Button */}
        {user ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-neutral-200 transition-colors group"
            title={`Logged in as ${user.displayName || user.email}`}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-5 h-5 rounded-full object-cover border border-cyan-400"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-cyan-500/30 text-cyan-300 font-bold text-[10px] flex items-center justify-center">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs font-semibold max-w-[80px] sm:max-w-[110px] truncate text-white">
              {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Cloud Synced" />
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400 text-neutral-950 font-bold text-xs hover:bg-cyan-300 transition-colors shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
