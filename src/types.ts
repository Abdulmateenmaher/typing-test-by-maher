export type TestMode = 'time' | 'words' | 'quote' | 'code' | 'drill' | 'arcade' | 'race' | 'lessons' | 'games' | 'bomb-defusal' | 'word-rain';

export type TimeDuration = 15 | 30 | 60 | 120;
export type WordCount = 10 | 25 | 50 | 100;
export type QuoteLength = 'all' | 'short' | 'medium' | 'long';
export type CodeLanguage = 'javascript' | 'python' | 'html' | 'rust';

export type DifficultyMode = 'normal' | 'master' | 'hardcore' | 'no-backspace' | 'blind';

export type SoundProfile = 'mechanical' | 'thock' | 'creamsicle' | 'typewriter' | 'digital' | 'off';

export type CaretStyle = 'line' | 'block' | 'underline' | 'laser';

/** 'auto' fits the interface to the browser window, numbers are zoom percentages. */
export type ZoomLevel = 'auto' | 100 | 110 | 125 | 150 | 175 | 200;

export type ThemeMode = 'system' | 'dark' | 'light';

export type ThemeId =
  | 'maher-obsidian'
  | 'nordic-frost'
  | 'cyberpunk'
  | 'retro-terminal'
  | 'matcha-cream'
  | 'dracula'
  | 'serene-light';

export type SupportedLanguage =
  | 'english'
  | 'pashto'
  | 'dari'
  | 'arabic'
  | 'urdu'
  | 'spanish'
  | 'french'
  | 'german'
  | 'italian'
  | 'turkish'
  | 'russian'
  | 'hindi';

export interface TestSettings {
  mode: TestMode;
  language: SupportedLanguage;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  quoteLength: QuoteLength;
  codeLanguage: CodeLanguage;
  difficulty: DifficultyMode;
  includePunctuation: boolean;
  includeNumbers: boolean;
  vocabulary: 'english-200' | 'english-1k' | 'english-5k';
  sound: SoundProfile;
  soundVolume: number; // 0 to 1
  errorBeep: boolean;
  theme: ThemeId;
  themeMode: ThemeMode;
  caretStyle: CaretStyle;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  zoom: ZoomLevel;
  showVirtualKeyboard: boolean;
  showFingerGuide: boolean;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  paceCaret: boolean;
  targetWpm: number;
  showGhostRacer?: boolean;
  ghostRacerSpeed?: number;
  mobileKeyboardMode?: 'auto' | 'native' | 'touch';
}

export interface SecondMetric {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
  accuracy: number;
}

export interface KeyStats {
  hits: number;
  errors: number;
  totalLatencyMs: number;
}

export interface TestResult {
  id: string;
  date: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalChars: number;
  duration: number; // actual elapsed in seconds
  mode: TestMode;
  modeDetail: string; // e.g. "time 30s" or "50 words"
  difficulty: DifficultyMode;
  timeline: SecondMetric[];
  keyStats: Record<string, KeyStats>;
  mistypedWords: string[];
  isPersonalBest?: boolean;
}

export interface QuoteItem {
  id: string;
  text: string;
  author: string;
  source?: string;
  length: 'short' | 'medium' | 'long';
}

export interface CodeSnippet {
  id: string;
  language: CodeLanguage;
  title: string;
  code: string;
}
