import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  CodeLanguage,
  DifficultyMode,
  TestMode,
  TestResult,
  TestSettings,
  ThemeId
} from './types';
import { THEMES } from './utils/themes';
import {
  CODE_SNIPPETS,
  QUOTES,
  generateWeakKeyDrill,
  generateWordSequence
} from './utils/words';
import {
  auth,
  saveTestToCloud,
  syncUserLeaderboard,
  fetchUserCloudHistory
} from './firebase';
import { useViewportZoom } from './hooks/useViewportZoom';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { TypingArea } from './components/TypingArea';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { ResultsView } from './components/ResultsView';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { DrillsModal } from './components/DrillsModal';
import { AuthModal } from './components/AuthModal';
import { LeaderboardModal } from './components/LeaderboardModal';

const DEFAULT_SETTINGS: TestSettings = {
  mode: 'time',
  timeDuration: 30,
  wordCount: 25,
  quoteLength: 'medium',
  codeLanguage: 'javascript',
  difficulty: 'normal',
  includePunctuation: false,
  includeNumbers: false,
  vocabulary: 'english-200',
  sound: 'mechanical',
  soundVolume: 0.5,
  errorBeep: false,
  theme: 'maher-obsidian',
  caretStyle: 'line',
  fontSize: 'md',
  zoom: 'auto',
  showVirtualKeyboard: true,
  showFingerGuide: true,
  showLiveWpm: true,
  showLiveAccuracy: true,
  paceCaret: false,
  targetWpm: 75
};

export default function App() {
  // Settings with LocalStorage persistence
  const [settings, setSettings] = useState<TestSettings>(() => {
    try {
      const saved = localStorage.getItem('maher_typing_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Keep the whole interface scaled to the browser window (rem based zoom)
  const zoomScale = useViewportZoom(settings.zoom || 'auto');


  // History with LocalStorage persistence
  const [history, setHistory] = useState<TestResult[]>(() => {
    try {
      const saved = localStorage.getItem('maher_typing_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Firebase Auth & Cloud Sync State
  const [user, setUser] = useState<User | null>(null);
  const [cloudSynced, setCloudSynced] = useState(false);

  // Modal Visibility States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDrillsOpen, setIsDrillsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Active Words & Typing Engine State
  const [words, setWords] = useState<string[]>([]);
  const [currentKey, setCurrentKey] = useState<string>('');
  const [pressedKey, setPressedKey] = useState<string>('');
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [activeDrillTitle, setActiveDrillTitle] = useState<string>('');

  // Subscribe to Firebase Auth State & Cloud Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const cloudHistory = await fetchUserCloudHistory(currentUser.uid);
          if (cloudHistory && cloudHistory.length > 0) {
            setHistory((prevLocal) => {
              const localIds = new Set(prevLocal.map((p) => p.id));
              const merged = [...prevLocal];
              cloudHistory.forEach((c) => {
                if (!localIds.has(c.id)) {
                  merged.push(c);
                }
              });
              merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              return merged;
            });
          }
          // Sync personal best to global leaderboard
          if (history.length > 0) {
            syncUserLeaderboard(currentUser, history);
          }
        } catch (err) {
          console.error('Error fetching cloud history:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist Settings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('maher_typing_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Persist History to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('maher_typing_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Find personal best
  const personalBestWpm = history.reduce((max, h) => Math.max(max, h.wpm), 0);

  // Identify weak keys from overall history
  const allWeakKeys = React.useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((h) => {
      if (h.keyStats) {
        Object.entries(h.keyStats).forEach(([k, stats]) => {
          if (stats.errors > 0) {
            counts[k] = (counts[k] || 0) + stats.errors;
          }
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k)
      .slice(0, 8);
  }, [history]);

  // Generate word stream based on current mode & settings
  const generateWordsForMode = useCallback(
    (customSettings?: TestSettings) => {
      const cfg = customSettings || settings;

      if (cfg.mode === 'time') {
        const count = cfg.timeDuration * 3.5;
        return generateWordSequence(Math.round(count), cfg.vocabulary, cfg.includePunctuation, cfg.includeNumbers);
      }

      if (cfg.mode === 'words') {
        return generateWordSequence(cfg.wordCount, cfg.vocabulary, cfg.includePunctuation, cfg.includeNumbers);
      }

      if (cfg.mode === 'quote') {
        const filtered = QUOTES.filter(
          (q) => cfg.quoteLength === 'all' || q.length === cfg.quoteLength
        );
        const randomQuote = filtered[Math.floor(Math.random() * filtered.length)] || QUOTES[0];
        setActiveDrillTitle(`Quote by ${randomQuote.author}`);
        return randomQuote.text.split(/\s+/);
      }

      if (cfg.mode === 'code') {
        const filtered = CODE_SNIPPETS.filter((c) => c.language === cfg.codeLanguage);
        const snippet = filtered[Math.floor(Math.random() * filtered.length)] || CODE_SNIPPETS[0];
        setActiveDrillTitle(`Code: ${snippet.title} (${snippet.language})`);
        return snippet.code.split(/\s+/);
      }

      return generateWordSequence(30, cfg.vocabulary, cfg.includePunctuation, cfg.includeNumbers);
    },
    [settings]
  );

  // Initialize words on mount or when mode/settings change
  useEffect(() => {
    if (settings.mode !== 'drill') {
      const generated = generateWordsForMode(settings);
      setWords(generated);
      setLastResult(null);
    }
  }, [
    settings.mode,
    settings.timeDuration,
    settings.wordCount,
    settings.quoteLength,
    settings.codeLanguage,
    settings.includePunctuation,
    settings.includeNumbers,
    settings.vocabulary,
    generateWordsForMode
  ]);

  // Restart current test
  const handleRestart = () => {
    setCloudSynced(false);
    if (settings.mode === 'drill' && words.length > 0) {
      setLastResult(null);
    } else {
      const newWords = generateWordsForMode();
      setWords(newWords);
      setLastResult(null);
    }
  };

  // Complete test handler
  const handleFinishTest = async (result: TestResult) => {
    const isNewPB = result.wpm > personalBestWpm && result.wpm > 0;
    const finalResult = { ...result, isPersonalBest: isNewPB };

    if (isNewPB) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setLastResult(finalResult);
    const updatedHistory = [finalResult, ...history];
    setHistory(updatedHistory);

    // Save to Firebase Cloud & Global Leaderboard if user is signed in
    if (user) {
      try {
        await saveTestToCloud(user.uid, finalResult);
        await syncUserLeaderboard(user, updatedHistory);
        setCloudSynced(true);
      } catch (err) {
        console.error('Failed to sync to Maher Cloud:', err);
      }
    }
  };

  // Physical key press flash animation
  const handlePhysicalKeyPress = (key: string) => {
    setPressedKey(key);
    setTimeout(() => {
      setPressedKey('');
    }, 120);
  };

  // Launch Weak Keys Practice Drill
  const handlePracticeWeakKeys = (weakKeys: string[]) => {
    const generated = generateWeakKeyDrill(weakKeys, 30);
    setWords(generated);
    setSettings((prev) => ({ ...prev, mode: 'drill' }));
    setActiveDrillTitle(`Weak Keys Focus (${weakKeys.join(', ')})`);
    setLastResult(null);
  };

  // Launch Drill from Drills Modal
  const handleSelectDrillWords = (drillWords: string[], title: string) => {
    setWords(drillWords);
    setSettings((prev) => ({ ...prev, mode: 'drill' }));
    setActiveDrillTitle(title);
    setLastResult(null);
  };

  // Clear History
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local typing history?')) {
      setHistory([]);
    }
  };

  // Export History as JSON
  const handleExportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maher-typing-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import History
  const handleImportHistory = (imported: TestResult[]) => {
    setHistory(imported);
    setIsHistoryOpen(false);
  };

  const currentTheme = THEMES[settings.theme] || THEMES['maher-obsidian'];

  return (
    <div
      className={`min-h-screen ${currentTheme.bg} ${currentTheme.textNormal} flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300 font-sans`}
    >
      {/* Top Navbar */}
      <Header
        settings={settings}
        theme={currentTheme}
        user={user}
        personalBestWpm={personalBestWpm}
        totalTestsCompleted={history.length}
        onUpdateSettings={(partial) => setSettings((prev) => ({ ...prev, ...partial }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex flex-col justify-center gap-3 sm:gap-3.5">
        {/* Active Custom Drill Notification Banner */}
        {settings.mode === 'drill' && activeDrillTitle && !lastResult && (
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between p-2.5 px-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-xs text-purple-200">
            <span className="font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              {activeDrillTitle}
            </span>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, mode: 'time' }))}
              className="text-purple-300 hover:text-white underline font-medium"
            >
              Exit Drill
            </button>
          </div>
        )}

        {/* Mode Selector Toolbar (only visible during test mode) */}
        {!lastResult && (
          <ModeSelector
            settings={settings}
            theme={currentTheme}
            onUpdateSettings={(partial) => setSettings((prev) => ({ ...prev, ...partial }))}
            onOpenDrills={() => setIsDrillsOpen(true)}
          />
        )}

        {/* View Switch: Active Typing Test OR Post-Test Results Dashboard */}
        {lastResult ? (
          <ResultsView
            result={lastResult}
            theme={currentTheme}
            onRestart={handleRestart}
            onPracticeWeakKeys={handlePracticeWeakKeys}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            isCloudSynced={cloudSynced}
          />
        ) : (
          <TypingArea
            words={words}
            settings={settings}
            theme={currentTheme}
            onFinishTest={handleFinishTest}
            onRestartTest={handleRestart}
            onCurrentKeyChange={setCurrentKey}
            onPhysicalKeyPress={handlePhysicalKeyPress}
          />
        )}

        {/* Interactive Virtual Keyboard (if enabled & not on results screen) */}
        {!lastResult && settings.showVirtualKeyboard && (
          <VirtualKeyboard
            currentKey={currentKey}
            theme={currentTheme}
            showFingerGuide={settings.showFingerGuide}
            pressedKey={pressedKey}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400 border-t border-white/5 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            typing test by maher
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">Live Global Leaderboard</span>
        </div>

        <div className="flex items-center gap-4 text-[0.6875rem]">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">tab</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">enter</kbd> restart
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">esc</kbd> reset
          </span>
        </div>
      </footer>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        history={history}
        theme={currentTheme}
        onClose={() => setIsHistoryOpen(false)}
        onClearHistory={handleClearHistory}
        onExportHistory={handleExportHistory}
        onImportHistory={handleImportHistory}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        theme={currentTheme}
        activeZoomPercent={Math.round(zoomScale * 100)}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(partial) => setSettings((prev) => ({ ...prev, ...partial }))}
      />

      {/* Drills & Custom Text Modal */}
      <DrillsModal
        isOpen={isDrillsOpen}
        theme={currentTheme}
        onClose={() => setIsDrillsOpen(false)}
        onSelectWords={handleSelectDrillWords}
        weakKeysDetected={allWeakKeys}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        user={user}
        theme={currentTheme}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Global Leaderboard & Rankings Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        user={user}
        theme={currentTheme}
        onClose={() => setIsLeaderboardOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
}
