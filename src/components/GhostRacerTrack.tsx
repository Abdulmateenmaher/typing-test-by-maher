import React from 'react';
import { Bot, User as UserIcon, Flag, Flame, Trophy } from 'lucide-react';

interface GhostRacerTrackProps {
  playerProgress: number; // 0 to 100%
  ghostProgress: number; // 0 to 100%
  playerWpm: number;
  ghostWpm: number;
  ghostLabel?: string;
  isActive: boolean;
}

export const GhostRacerTrack: React.FC<GhostRacerTrackProps> = ({
  playerProgress,
  ghostProgress,
  playerWpm,
  ghostWpm,
  ghostLabel = 'AI Ghost',
  isActive
}) => {
  const clampedPlayer = Math.min(100, Math.max(0, playerProgress));
  const clampedGhost = Math.min(100, Math.max(0, ghostProgress));
  const delta = Math.round(clampedPlayer - clampedGhost);

  return (
    <div className="w-full rounded-2xl bg-neutral-900/90 border border-white/10 p-3 sm:p-4 mb-2 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md select-none">
      {/* Track Header with Live Speed & Delta */}
      <div className="flex items-center justify-between text-xs font-mono-code px-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-cyan-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            YOU: {playerWpm} WPM
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-purple-400 font-medium">
            {ghostLabel}: {ghostWpm} WPM
          </span>
        </div>

        {/* Live Distance Delta */}
        {isActive && (
          <div
            className={`flex items-center gap-1 text-[0.6875rem] font-bold px-2 py-0.5 rounded-md ${
              delta >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {delta >= 0 ? <Trophy className="w-3 h-3 text-emerald-400" /> : <Flame className="w-3 h-3 text-rose-400" />}
            <span>{delta >= 0 ? `+${delta}% AHEAD` : `${delta}% BEHIND`}</span>
          </div>
        )}
      </div>

      {/* Speedway Tracks */}
      <div className="relative flex flex-col gap-2 py-1">
        {/* Lane 1: Player Lane */}
        <div className="relative h-6 bg-white/[0.04] rounded-lg border border-cyan-500/20 flex items-center px-2 overflow-hidden">
          {/* Track dashes */}
          <div className="absolute inset-0 border-b border-dashed border-white/10" />

          {/* Player Vehicle Marker */}
          <div
            style={{ left: `calc(${clampedPlayer}% * 0.92)` }}
            className="absolute transition-all duration-150 ease-out flex items-center gap-1 -translate-x-1"
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-[0.625rem] font-black shadow-md shadow-cyan-500/40">
              <span>🏎️</span>
              <span className="hidden sm:inline">YOU</span>
            </div>
          </div>

          {/* Finish Line */}
          <div className="absolute right-2 top-0 bottom-0 flex items-center text-neutral-400">
            <Flag className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* Lane 2: Ghost Lane */}
        <div className="relative h-6 bg-white/[0.03] rounded-lg border border-purple-500/20 flex items-center px-2 overflow-hidden">
          {/* Track dashes */}
          <div className="absolute inset-0 border-b border-dashed border-white/10" />

          {/* Ghost Vehicle Marker */}
          <div
            style={{ left: `calc(${clampedGhost}% * 0.92)` }}
            className="absolute transition-all duration-300 ease-linear flex items-center gap-1 -translate-x-1"
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[0.625rem] font-bold shadow-xs">
              <span>👻</span>
              <span className="hidden sm:inline">PACE</span>
            </div>
          </div>

          {/* Finish Line */}
          <div className="absolute right-2 top-0 bottom-0 flex items-center text-neutral-400">
            <Flag className="w-3.5 h-3.5 text-neutral-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
