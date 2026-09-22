import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Trophy, Medal, Crown, X, RefreshCw, Flame, Target, Zap, Clock, ShieldCheck } from 'lucide-react';
import { ThemeConfig } from '../utils/themes';
import { fetchLeaderboard, LeaderboardEntry } from '../firebase';
import { UserAvatar } from './UserAvatar';

interface LeaderboardModalProps {
  isOpen: boolean;
  user: User | null;
  theme: ThemeConfig;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  user,
  theme,
  onClose,
  onOpenAuth
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      setEntries(data);
    } catch (err: any) {
      setError('Unable to load rankings. Please check your Firebase connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const userRankIndex = entries.findIndex((e) => user && e.userId === user.uid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-2xl p-6 rounded-2xl border ${theme.border} ${theme.cardBg} text-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Global Typist Leaderboard</span>
                <span className="text-[0.625rem] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                  Live Rankings
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Official speed rankings powered by Maher Cloud Database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Refresh Rankings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Rank Callout if Logged In */}
        {user ? (
          <div className="my-3 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <span className="text-white font-semibold">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <div className="text-[0.6875rem] text-neutral-400">
                  {userRankIndex !== -1 ? (
                    <span className="text-emerald-400 font-medium">
                      Ranked #{userRankIndex + 1} of {entries.length} typists
                    </span>
                  ) : (
                    <span>Complete any test to establish your global rank</span>
                  )}
                </div>
              </div>
            </div>

            {userRankIndex !== -1 && (
              <div className="text-right">
                <span className="text-base font-bold text-cyan-400">
                  {entries[userRankIndex].bestWpm} WPM
                </span>
                <div className="text-[0.625rem] text-neutral-400">
                  {entries[userRankIndex].bestAccuracy}% acc
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="my-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Sign in to save your personal best and compete on the leaderboard!</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-3 py-1 rounded-lg bg-cyan-400 text-neutral-950 font-bold text-[0.6875rem] hover:bg-cyan-300 transition-colors shadow-xs"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Rankings Table */}
        <div className="flex-1 overflow-y-auto pr-1 my-1">
          {loading && entries.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Fetching latest worldwide scores...</span>
            </div>
          ) : error ? (
            <div className="py-10 text-center text-xs text-rose-300">
              <p>{error}</p>
              <button
                onClick={loadData}
                className="mt-2 text-cyan-400 hover:underline font-semibold"
              >
                Retry
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center gap-2">
              <Trophy className="w-8 h-8 text-neutral-600" />
              <p className="font-semibold text-neutral-300">No typists ranked yet!</p>
              <p className="text-[0.6875rem] max-w-xs text-neutral-500">
                Be the very first typist to set a record on this newly connected Maher Cloud database.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {entries.map((item, idx) => {
                const isMe = user && item.userId === user.uid;
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                return (
                  <div
                    key={item.userId}
                    className={`
                      flex items-center justify-between p-3 rounded-xl border text-xs transition-colors
                      ${
                        isMe
                          ? 'border-cyan-400/50 bg-cyan-500/10'
                          : isTop1
                          ? 'border-amber-400/40 bg-amber-500/5'
                          : isTop2
                          ? 'border-slate-300/30 bg-slate-300/5'
                          : isTop3
                          ? 'border-amber-700/30 bg-amber-700/5'
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    {/* Rank & User Info */}
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className="w-7 flex items-center justify-center font-bold text-xs">
                        {isTop1 ? (
                          <Crown className="w-5 h-5 text-amber-400 drop-shadow-xs" />
                        ) : isTop2 ? (
                          <Medal className="w-5 h-5 text-slate-300 drop-shadow-xs" />
                        ) : isTop3 ? (
                          <Medal className="w-5 h-5 text-amber-600 drop-shadow-xs" />
                        ) : (
                          <span className="text-neutral-400 font-mono-code">#{idx + 1}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <UserAvatar
                        uid={item.userId}
                        displayName={item.displayName}
                        photoURL={item.photoURL}
                        className="w-8 h-8 rounded-full border border-white/10 object-cover"
                        textClassName="text-xs"
                      />

                      {/* Name & Tests */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {item.displayName}
                          </span>
                          {isMe && (
                            <span className="text-[0.625rem] px-1.5 py-0.2 rounded-full bg-cyan-400 text-neutral-950 font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[0.6875rem] text-neutral-400 flex items-center gap-2">
                          <span>{item.totalTests} {item.totalTests === 1 ? 'test' : 'tests'}</span>
                          <span>&bull;</span>
                          <span>{item.bestAccuracy}% acc</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-base sm:text-lg font-bold text-cyan-400 font-mono-code">
                          {item.bestWpm}
                        </span>
                        <span className="text-[0.625rem] text-neutral-400 font-medium">WPM</span>
                      </div>
                      <div className="text-[0.625rem] text-neutral-400">
                        Raw: {item.bestRawWpm} wpm
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[0.6875rem] text-neutral-400 shrink-0">
          <span>Synced directly with typing-test-by-maher.firebaseapp.com</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
