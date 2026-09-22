import React from 'react';
import { X, Volume2, Sliders, Type, Keyboard, Eye, Sparkles, ZoomIn } from 'lucide-react';
import { CaretStyle, SoundProfile, TestSettings } from '../types';
import { ThemeConfig } from '../utils/themes';
import { ZOOM_PRESETS } from '../utils/zoom';

interface SettingsModalProps {
  isOpen: boolean;
  settings: TestSettings;
  theme: ThemeConfig;
  activeZoomPercent?: number;
  onClose: () => void;
  onUpdateSettings: (partial: Partial<TestSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  theme,
  activeZoomPercent = 100,
  onClose,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border ${theme.border} ${theme.cardBg} shadow-2xl overflow-hidden animate-fade-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Customization & Preferences</h2>
              <p className="text-xs text-neutral-400">Tailor audio, visual, and tactile mechanics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs">
          {/* Section: Mechanical Keyboard Sounds */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Keyboard Audio Feedback</span>
            </div>
            <p className="text-neutral-400 text-xs">
              Synthesized mechanical switches using low-latency Web Audio API:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'mechanical', label: 'Cherry MX Blue', desc: 'Crisp clicky double snap' },
                { id: 'thock', label: 'Thocky Brown', desc: 'Deep hollow bottom-out' },
                { id: 'creamsicle', label: 'Creamsicle Linear', desc: 'Buttery soft pop' },
                { id: 'typewriter', label: 'Typewriter Strike', desc: 'Heavy mechanical impact' },
                { id: 'digital', label: 'Digital Chirp', desc: 'Subtle sci-fi click' },
                { id: 'off', label: 'Muted (Silent)', desc: 'No keypress audio' },
              ].map((sw) => (
                <button
                  key={sw.id}
                  onClick={() => onUpdateSettings({ sound: sw.id as SoundProfile })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.sound === sw.id
                      ? 'border-cyan-500/40 bg-cyan-500/15 text-white font-medium shadow-xs'
                      : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="font-semibold text-xs text-neutral-200">{sw.label}</div>
                  <div className="text-[0.625rem] text-neutral-400 mt-0.5">{sw.desc}</div>
                </button>
              ))}
            </div>

            {settings.sound !== 'off' && (
              <div className="flex items-center gap-4 mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-neutral-400 shrink-0">Volume ({Math.round(settings.soundVolume * 100)}%)</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="w-full h-[0.0625rem] bg-white/5" />

          {/* Section: Visuals & Caret */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>Caret Style & Typography</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['line', 'block', 'underline'] as CaretStyle[]).map((cStyle) => (
                <button
                  key={cStyle}
                  onClick={() => onUpdateSettings({ caretStyle: cStyle })}
                  className={`p-3 rounded-xl border text-center transition-all capitalize ${
                    settings.caretStyle === cStyle
                      ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 font-semibold'
                      : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
                  }`}
                >
                  {cStyle} Cursor
                </button>
              ))}
            </div>

            {/* Font Size */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 mt-2">
              <span className="text-neutral-300 font-medium">Text Display Size</span>
              <div className="flex items-center gap-1.5 font-mono-code">
                {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => onUpdateSettings({ fontSize: sz })}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold uppercase transition-all ${
                      settings.fontSize === sz
                        ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                        : 'border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Display Zoom */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <ZoomIn className="w-4 h-4 text-cyan-400" />
              <span>Display Zoom & Scaling</span>
            </div>
            <p className="text-neutral-400 text-xs">
              {settings.zoom === 'auto'
                ? `Auto keeps the whole interface fitted to your browser window (currently ${activeZoomPercent}%).`
                : `Manual zoom of ${settings.zoom}% is applied to the whole interface.`}
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ZOOM_PRESETS.map((preset) => (
                <button
                  key={String(preset.value)}
                  onClick={() => onUpdateSettings({ zoom: preset.value })}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                    settings.zoom === preset.value
                      ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                      : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[0.0625rem] bg-white/5" />

          {/* Section: Touch Typing Aids */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Virtual Keyboard & Finger Guides</span>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
              <div>
                <div className="text-neutral-200 font-medium">Show On-Screen Virtual Keyboard</div>
                <div className="text-[0.6875rem] text-neutral-400 mt-0.5">Displays interactive QWERTY layout with active target key highlighting</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showVirtualKeyboard}
                onChange={(e) => onUpdateSettings({ showVirtualKeyboard: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
              <div>
                <div className="text-neutral-200 font-medium">Ergonomic Finger Placement Guidance</div>
                <div className="text-[0.6875rem] text-neutral-400 mt-0.5">Color codes home-row finger assignments (Pinky, Ring, Middle, Index, Thumbs)</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showFingerGuide}
                onChange={(e) => onUpdateSettings({ showFingerGuide: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>
          </div>

          <div className="w-full h-[0.0625rem] bg-white/5" />

          {/* Section: Dictionary & Live HUD */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Vocabulary & Live HUD</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-neutral-200 font-medium">English Vocabulary Tier</div>
                <div className="text-[0.6875rem] text-neutral-400 mt-0.5">Complexity of generated word pool</div>
              </div>
              <select
                value={settings.vocabulary}
                onChange={(e) => onUpdateSettings({ vocabulary: e.target.value as any })}
                className="bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none"
              >
                <option value="english-200">English 200 (Standard)</option>
                <option value="english-1k">English 1,000 (Intermediate)</option>
                <option value="english-5k">English 5,000 (Literary / Advanced)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                <span className="text-neutral-300">Live WPM Counter</span>
                <input
                  type="checkbox"
                  checked={settings.showLiveWpm}
                  onChange={(e) => onUpdateSettings({ showLiveWpm: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                <span className="text-neutral-300">Live Accuracy %</span>
                <input
                  type="checkbox"
                  checked={settings.showLiveAccuracy}
                  onChange={(e) => onUpdateSettings({ showLiveAccuracy: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
