import React, { useState } from 'react';
import { X, Dumbbell, Sparkles, FileText, Zap, Check } from 'lucide-react';
import { SPECIAL_DRILLS, generateWeakKeyDrill } from '../utils/words';
import { ThemeConfig } from '../utils/themes';

interface DrillsModalProps {
  isOpen: boolean;
  theme: ThemeConfig;
  onClose: () => void;
  onSelectWords: (words: string[], drillTitle: string) => void;
  weakKeysDetected: string[];
}

export const DrillsModal: React.FC<DrillsModalProps> = ({
  isOpen,
  theme,
  onClose,
  onSelectWords,
  weakKeysDetected
}) => {
  const [customText, setCustomText] = useState('');
  const [customKeysInput, setCustomKeysInput] = useState(weakKeysDetected.join(', '));
  const [activeTab, setActiveTab] = useState<'presets' | 'weak-keys' | 'custom'>('presets');

  if (!isOpen) return null;

  const handleSelectPreset = (drillKey: string) => {
    const drill = SPECIAL_DRILLS[drillKey];
    if (drill) {
      onSelectWords(drill.words, drill.title);
      onClose();
    }
  };

  const handleGenerateWeakKeys = () => {
    const keys = customKeysInput
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const generated = generateWeakKeyDrill(keys, 35);
    onSelectWords(generated, `Weak Keys Drill (${keys.join(', ')})`);
    onClose();
  };

  const handleApplyCustomText = () => {
    if (!customText.trim()) return;
    const splitWords = customText
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    onSelectWords(splitWords, 'Custom User Text');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border ${theme.border} ${theme.cardBg} shadow-2xl overflow-hidden animate-fade-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Adaptive Drills & Custom Practice</h2>
              <p className="text-xs text-neutral-400">Target weak finger dexterity, vocabulary, or custom material</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-5 pt-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Drills</span>
          </button>

          <button
            onClick={() => setActiveTab('weak-keys')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'weak-keys'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Weak Keys Coach</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Custom Text Input</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(SPECIAL_DRILLS).map(([key, item]) => (
                <div
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="font-semibold text-neutral-200 text-sm group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-neutral-400 text-[11px] mt-1.5 line-clamp-2">
                      {item.words.slice(0, 10).join(' ')}...
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
                    <span>{item.words.length} Words</span>
                    <span className="group-hover:translate-x-1 transition-transform">Start Drill →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'weak-keys' && (
            <div className="flex flex-col gap-4">
              <p className="text-neutral-400 leading-relaxed">
                The Weak Keys drill analyzes problematic characters and synthesizes dynamic wordlists designed to train your muscle memory on those exact finger reaches.
              </p>

              {weakKeysDetected.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-neutral-200">
                  <span className="font-semibold text-rose-300">Detected from your recent tests: </span>
                  <span className="font-mono-code font-bold">{weakKeysDetected.join(', ')}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-neutral-300 font-medium">Targeted Keys (comma separated):</label>
                <input
                  type="text"
                  value={customKeysInput}
                  onChange={(e) => setCustomKeysInput(e.target.value)}
                  placeholder="e.g. p, q, z, x, r"
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono-code focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                onClick={handleGenerateWeakKeys}
                className="mt-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors shadow-sm"
              >
                <Zap className="w-4 h-4" />
                <span>Generate Targeted Drill</span>
              </button>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="flex flex-col gap-4">
              <p className="text-neutral-400 leading-relaxed">
                Paste any article, literature excerpt, code documentation, or speech to test your real-world typing speed on it:
              </p>

              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste your custom passage or text here..."
                rows={6}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-mono-code text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
              />

              <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                <span>{customText.trim() ? customText.trim().split(/\s+/).length : 0} words parsed</span>
                <button
                  onClick={handleApplyCustomText}
                  disabled={!customText.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-semibold transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Start Custom Test</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
