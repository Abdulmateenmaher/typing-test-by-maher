import React from 'react';
import { X, Trophy, TrendingUp, Clock, Target, Trash2, Download, Upload, CheckCircle2 } from 'lucide-react';
import { TestResult } from '../types';
import { ThemeConfig } from '../utils/themes';

interface HistoryModalProps {
  isOpen: boolean;
  history: TestResult[];
  theme: ThemeConfig;
  onClose: () => void;
  onClearHistory: () => void;
  onExportHistory: () => void;
  onImportHistory: (imported: TestResult[]) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  history,
  theme,
  onClose,
  onClearHistory,
  onExportHistory,
  onImportHistory
}) => {
  if (!isOpen) return null;

  // Aggregate stats
  const totalTests = history.length;
  const bestWpm = history.reduce((max, item) => Math.max(max, item.wpm), 0);

  const recent10 = history.slice(0, 10);
  const avgWpmLast10 = recent10.length > 0
    ? Math.round(recent10.reduce((acc, curr) => acc + curr.wpm, 0) / recent10.length)
    : 0;

  const avgAccuracy = totalTests > 0
    ? (history.reduce((acc, curr) => acc + curr.accuracy, 0) / totalTests).toFixed(1)
    : '0';

  const totalTimeSeconds = history.reduce((acc, curr) => acc + curr.duration, 0);
  const totalTimeMinutes = (totalTimeSeconds / 60).toFixed(1);

  // File import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportHistory(parsed);
        }
      } catch (err) {
        console.error('Failed to parse history JSON', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border ${theme.border} ${theme.cardBg} shadow-2xl overflow-hidden animate-fade-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Typing History & Trends</h2>
              <p className="text-xs text-neutral-400">Track your speed progression and consistency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lifetime Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Personal Best</span>
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">{bestWpm} <span className="text-xs font-normal text-neutral-400">WPM</span></div>
          </div>

          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg (Last 10)</span>
            </div>
            <div className="text-2xl font-black text-cyan-400 mt-1">{avgWpmLast10} <span className="text-xs font-normal text-neutral-400">WPM</span></div>
          </div>

          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Avg Accuracy</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{avgAccuracy}%</div>
          </div>

          <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Practice Time</span>
            </div>
            <div className="text-2xl font-black text-purple-400 mt-1">{totalTimeMinutes} <span className="text-xs font-normal text-neutral-400">mins</span></div>
          </div>
        </div>

        {/* Tests List */}
        <div className="flex-1 overflow-y-auto p-5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
              <Trophy className="w-12 h-12 stroke-[1.2] opacity-40 mb-3" />
              <p className="text-sm font-medium text-neutral-300">No test records saved yet</p>
              <p className="text-xs text-neutral-400 mt-1">Complete your first test to start generating progress statistics!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    <th className="pb-2.5 font-medium">WPM</th>
                    <th className="pb-2.5 font-medium">Accuracy</th>
                    <th className="pb-2.5 font-medium">Mode</th>
                    <th className="pb-2.5 font-medium">Difficulty</th>
                    <th className="pb-2.5 font-medium">Consistency</th>
                    <th className="pb-2.5 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-code">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 font-bold text-cyan-400 flex items-center gap-1.5">
                        <span>{item.wpm}</span>
                        {item.wpm === bestWpm && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                            PB
                          </span>
                        )}
                      </td>
                      <td className={`py-2.5 ${item.accuracy >= 98 ? 'text-emerald-400' : 'text-neutral-200'}`}>
                        {item.accuracy}%
                      </td>
                      <td className="py-2.5 text-neutral-300 font-sans capitalize">
                        {item.mode} ({item.modeDetail})
                      </td>
                      <td className="py-2.5 text-neutral-400 font-sans capitalize">
                        {item.difficulty}
                      </td>
                      <td className="py-2.5 text-indigo-300">
                        {item.consistency}%
                      </td>
                      <td className="py-2.5 text-right text-neutral-400 font-sans">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportHistory}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
