import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Target, Award, Zap, AlertTriangle, ArrowRight, Trophy, CloudCheck } from 'lucide-react';
import { TestResult } from '../types';
import { ThemeConfig } from '../utils/themes';

interface ResultsViewProps {
  result: TestResult;
  theme: ThemeConfig;
  onRestart: () => void;
  onPracticeWeakKeys: (weakKeys: string[]) => void;
  onOpenHistory: () => void;
  onOpenLeaderboard?: () => void;
  isCloudSynced?: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  theme,
  onRestart,
  onPracticeWeakKeys,
  onOpenHistory,
  onOpenLeaderboard,
  isCloudSynced
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'heatmap'>('chart');

  // Identify weakest keys (keys with >= 1 error, sorted by error count descending)
  const weakKeyEntries = Object.entries(result.keyStats)
    .filter(([_, stats]) => stats.errors > 0)
    .sort((a, b) => b[1].errors - a[1].errors);

  const weakestKeyChars = weakKeyEntries.map(([k]) => k).slice(0, 6);

  // Copy share card
  const handleCopy = () => {
    const text = `Typing Test by Maher 🚀\nWPM: ${result.wpm} | Raw: ${result.rawWpm} | Acc: ${result.accuracy}%\nMode: ${result.mode} (${result.modeDetail}) | Consistency: ${result.consistency}%\nChars: ${result.correctChars}/${result.incorrectChars}/${result.extraChars}/${result.missedChars}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Speed rank evaluation
  const getRank = (wpm: number) => {
    if (wpm >= 120) return { title: 'Transcendent', desc: 'Top 0.1% keyboard god', color: 'text-amber-400 border-amber-400/40 bg-amber-400/10' };
    if (wpm >= 100) return { title: 'Master Typist', desc: 'Competitive esports speed', color: 'text-purple-400 border-purple-400/40 bg-purple-400/10' };
    if (wpm >= 80) return { title: 'Professional', desc: 'Fluent rapid touch typing', color: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' };
    if (wpm >= 60) return { title: 'Proficient', desc: 'Well above average typist', color: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' };
    if (wpm >= 40) return { title: 'Intermediate', desc: 'Standard business cadence', color: 'text-blue-400 border-blue-400/40 bg-blue-400/10' };
    return { title: 'Developing', desc: 'Building muscle memory', color: 'text-neutral-400 border-neutral-400/40 bg-neutral-400/10' };
  };

  const rank = getRank(result.wpm);

  // Compute SVG coordinates for Timeline Chart
  const timeline = result.timeline || [];
  const maxWpm = Math.max(60, ...timeline.map((t) => Math.max(t.wpm, t.rawWpm)), result.rawWpm + 10);
  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const getX = (secIndex: number, total: number) => {
    if (total <= 1) return paddingX;
    return paddingX + (secIndex / (total - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    const usableHeight = chartHeight - paddingY * 2;
    return chartHeight - paddingY - (val / maxWpm) * usableHeight;
  };

  // Build SVG path strings
  let wpmPath = '';
  let rawWpmPath = '';

  timeline.forEach((point, i) => {
    const x = getX(i, timeline.length);
    const yWpm = getY(point.wpm);
    const yRaw = getY(point.rawWpm);

    if (i === 0) {
      wpmPath += `M ${x} ${yWpm}`;
      rawWpmPath += `M ${x} ${yRaw}`;
    } else {
      wpmPath += ` L ${x} ${yWpm}`;
      rawWpmPath += ` L ${x} ${yRaw}`;
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border bg-white/[0.02] backdrop-blur-md border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Test Complete</h2>
              {result.isPersonalBest && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  New Personal Best! 🎉
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Mode: <span className="text-neutral-200 capitalize">{result.mode} ({result.modeDetail})</span> • Difficulty: <span className="text-neutral-200 capitalize">{result.difficulty}</span>
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {isCloudSynced && (
            <div className="flex items-center gap-1 px-2.5 py-1 text-[0.6875rem] font-medium rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cloud Synced</span>
            </div>
          )}
          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors shadow-xs"
              title="View your rank on the Global Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors"
            title="Copy test summary card"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Share Card'}
          </button>
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors"
          >
            History & Trends
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Next Test (Tab + Enter)
          </button>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Net WPM */}
        <div className={`p-5 rounded-2xl border ${theme.border} ${theme.cardBg} flex flex-col justify-between`}>
          <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Net Speed</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-cyan-400">{result.wpm}</span>
            <span className="text-sm font-semibold text-neutral-400">WPM</span>
          </div>
          <div className="mt-2 text-xs text-neutral-400">
            Raw: <span className="text-neutral-200 font-semibold">{result.rawWpm} WPM</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className={`p-5 rounded-2xl border ${theme.border} ${theme.cardBg} flex flex-col justify-between`}>
          <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Accuracy</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-5xl font-black tracking-tight ${result.accuracy >= 98 ? 'text-emerald-400' : result.accuracy >= 94 ? 'text-cyan-400' : 'text-amber-400'}`}>
              {result.accuracy}%
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-400">
            Errors: <span className="text-rose-400 font-semibold">{result.incorrectChars}</span>
          </div>
        </div>

        {/* Consistency */}
        <div className={`p-5 rounded-2xl border ${theme.border} ${theme.cardBg} flex flex-col justify-between`}>
          <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Consistency</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-indigo-400">
              {result.consistency}%
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-400">
            Cadence rhythm stability
          </div>
        </div>

        {/* Typist Rank */}
        <div className={`p-5 rounded-2xl border ${theme.border} ${theme.cardBg} flex flex-col justify-between`}>
          <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Typist Tier</div>
          <div className="mt-2">
            <div className={`inline-block px-2.5 py-1 rounded-lg border text-sm font-bold ${rank.color}`}>
              {rank.title}
            </div>
          </div>
          <div className="mt-2 text-xs text-neutral-400 truncate">
            {rank.desc}
          </div>
        </div>
      </div>

      {/* Characters breakdown & Detailed metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs">
        <div>
          <span className="text-neutral-400">Characters:</span>{' '}
          <span className="font-semibold text-emerald-400">{result.correctChars}</span> /{' '}
          <span className="font-semibold text-rose-400">{result.incorrectChars}</span> /{' '}
          <span className="font-semibold text-amber-400">{result.extraChars}</span> /{' '}
          <span className="font-semibold text-neutral-400">{result.missedChars}</span>
        </div>
        <div>
          <span className="text-neutral-400">Time:</span>{' '}
          <span className="font-semibold text-neutral-200">{result.duration.toFixed(1)}s</span>
        </div>
        <div>
          <span className="text-neutral-400">Keystrokes:</span>{' '}
          <span className="font-semibold text-neutral-200">
            {result.totalChars} ({(result.totalChars / (result.duration || 1)).toFixed(1)} kps)
          </span>
        </div>
        <div>
          <span className="text-neutral-400">Difficulty:</span>{' '}
          <span className="font-semibold text-neutral-200 capitalize">{result.difficulty}</span>
        </div>
      </div>

      {/* Interactive Visualizations: Timeline Chart or Keyboard Heatmap */}
      <div className={`p-5 rounded-2xl border ${theme.border} ${theme.cardBg} flex flex-col gap-4 shadow-sm`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('chart')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'chart'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Timeline Graph (Speed & Errors)
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'heatmap'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Key Accuracy Heatmap ({Object.keys(result.keyStats).length} keys)
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-400">
            {activeTab === 'chart' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
                  <span>WPM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-neutral-500 inline-block" />
                  <span>Raw</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>Mistake</span>
                </div>
              </>
            )}
          </div>
        </div>

        {activeTab === 'chart' ? (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[37.5rem] h-[13.75rem] relative">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                {/* Horizontal reference grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const val = Math.round(maxWpm * pct);
                  const y = getY(val);
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-neutral-500 text-[0.625rem] font-mono-code"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Raw WPM Line */}
                {rawWpmPath && (
                  <path
                    d={rawWpmPath}
                    fill="none"
                    stroke="rgba(156, 163, 175, 0.45)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Net WPM Line */}
                {wpmPath && (
                  <path
                    d={wpmPath}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Points and Error Markers */}
                {timeline.map((pt, i) => {
                  const x = getX(i, timeline.length);
                  const y = getY(pt.wpm);
                  return (
                    <g key={i}>
                      {/* Normal data point dot */}
                      <circle cx={x} cy={y} r="3" fill="#22d3ee" className="hover:r-4 transition-all" />

                      {/* Error scatter dot if mistake happened in this second */}
                      {pt.errors > 0 && (
                        <g>
                          <circle cx={x} cy={getY(pt.rawWpm) - 8} r="4.5" fill="#f43f5e" />
                          <text
                            x={x}
                            y={getY(pt.rawWpm) - 14}
                            textAnchor="middle"
                            className="fill-rose-400 text-[0.5625rem] font-bold"
                          >
                            ✕{pt.errors}
                          </text>
                        </g>
                      )}

                      {/* X-axis second labels */}
                      {(i % Math.max(1, Math.floor(timeline.length / 6)) === 0 || i === timeline.length - 1) && (
                        <text
                          x={x}
                          y={chartHeight - 6}
                          textAnchor="middle"
                          className="fill-neutral-500 text-[0.625rem] font-mono-code"
                        >
                          {pt.second}s
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        ) : (
          /* Per-Key Accuracy Heatmap */
          <div className="flex flex-col gap-3">
            <p className="text-xs text-neutral-400">
              Performance breakdown for all keys pressed during this session:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2 font-mono-code text-xs">
              {Object.entries(result.keyStats).map(([keyChar, stats]) => {
                const total = stats.hits + stats.errors;
                const acc = total > 0 ? Math.round((stats.hits / total) * 100) : 100;
                const isFlawless = stats.errors === 0;

                return (
                  <div
                    key={keyChar}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                      isFlawless
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                        : stats.errors === 1
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                        : 'border-rose-500/40 bg-rose-500/15 text-rose-200 font-bold'
                    }`}
                  >
                    <span className="text-base font-bold uppercase">{keyChar === ' ' ? '␣' : keyChar}</span>
                    <span className="text-[0.625rem] mt-1 opacity-90">{acc}%</span>
                    <span className="text-[0.5625rem] opacity-60">{stats.hits}h / {stats.errors}e</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Weak Keys & One-Click Adaptive Practice Drill */}
      {weakestKeyChars.length > 0 && (
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Targeted Muscle Memory Coaching</div>
              <div className="text-xs text-neutral-400 mt-0.5">
                Struggled keys detected:{' '}
                <span className="font-mono-code font-bold text-rose-300">
                  {weakestKeyChars.map((k) => `[${k === ' ' ? 'space' : k}]`).join(' ')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onPracticeWeakKeys(weakestKeyChars)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-all shadow-md shrink-0"
          >
            <Zap className="w-4 h-4" />
            Practice Weak Keys Drill
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
