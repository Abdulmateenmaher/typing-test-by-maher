import { ThemeId } from '../types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bg: string;
  cardBg: string;
  textMuted: string;
  textNormal: string;
  textBright: string;
  correct: string;
  incorrect: string;
  extra: string;
  accent: string;
  accentBg: string;
  caret: string;
  border: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'maher-obsidian': {
    id: 'maher-obsidian',
    name: 'Maher Obsidian',
    bg: 'bg-[#0d1117]',
    cardBg: 'bg-[#161b22]',
    textMuted: 'text-[#6e7681]',
    textNormal: 'text-[#8b949e]',
    textBright: 'text-[#f0f6fc]',
    correct: 'text-[#2dd4bf]', // crisp teal
    incorrect: 'text-[#f43f5e] bg-[#f43f5e]/15 rounded-xs',
    extra: 'text-[#f87171] opacity-75',
    accent: 'text-[#38bdf8]',
    accentBg: 'bg-[#38bdf8]',
    caret: 'bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    border: 'border-[#30363d]',
  },
  'nordic-frost': {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    bg: 'bg-[#1e222a]',
    cardBg: 'bg-[#282c34]',
    textMuted: 'text-[#5c6370]',
    textNormal: 'text-[#abb2bf]',
    textBright: 'text-[#ffffff]',
    correct: 'text-[#98c379]',
    incorrect: 'text-[#e06c75] bg-[#e06c75]/20',
    extra: 'text-[#be5046]',
    accent: 'text-[#61afef]',
    accentBg: 'bg-[#61afef]',
    caret: 'bg-[#61afef] shadow-[0_0_8px_rgba(97,175,239,0.8)]',
    border: 'border-[#3e4451]',
  },
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    bg: 'bg-[#121016]',
    cardBg: 'bg-[#1d1727]',
    textMuted: 'text-[#625575]',
    textNormal: 'text-[#a594bd]',
    textBright: 'text-[#fff176]',
    correct: 'text-[#00ffcc]',
    incorrect: 'text-[#ff0055] bg-[#ff0055]/20',
    extra: 'text-[#ff5588]',
    accent: 'text-[#facc15]',
    accentBg: 'bg-[#facc15]',
    caret: 'bg-[#facc15] shadow-[0_0_10px_rgba(250,204,21,0.9)]',
    border: 'border-[#36274e]',
  },
  'retro-terminal': {
    id: 'retro-terminal',
    name: 'Retro Terminal',
    bg: 'bg-[#050805]',
    cardBg: 'bg-[#0d140d]',
    textMuted: 'text-[#2e522e]',
    textNormal: 'text-[#488248]',
    textBright: 'text-[#4ade80]',
    correct: 'text-[#22c55e]',
    incorrect: 'text-[#ef4444] bg-[#ef4444]/20',
    extra: 'text-[#f87171]',
    accent: 'text-[#4ade80]',
    accentBg: 'bg-[#4ade80]',
    caret: 'bg-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.9)]',
    border: 'border-[#1b331b]',
  },
  'matcha-cream': {
    id: 'matcha-cream',
    name: 'Matcha Cream',
    bg: 'bg-[#1a211e]',
    cardBg: 'bg-[#222c27]',
    textMuted: 'text-[#62776d]',
    textNormal: 'text-[#8ea59b]',
    textBright: 'text-[#e2ece7]',
    correct: 'text-[#a3e635]',
    incorrect: 'text-[#fb7185] bg-[#fb7185]/20',
    extra: 'text-[#f43f5e]',
    accent: 'text-[#86efac]',
    accentBg: 'bg-[#86efac]',
    caret: 'bg-[#86efac]',
    border: 'border-[#314038]',
  },
  'dracula': {
    id: 'dracula',
    name: 'Dracula',
    bg: 'bg-[#282a36]',
    cardBg: 'bg-[#343746]',
    textMuted: 'text-[#6272a4]',
    textNormal: 'text-[#bd93f9]',
    textBright: 'text-[#f8f8f2]',
    correct: 'text-[#50fa7b]',
    incorrect: 'text-[#ff5555] bg-[#ff5555]/20',
    extra: 'text-[#ffb86c]',
    accent: 'text-[#bd93f9]',
    accentBg: 'bg-[#bd93f9]',
    caret: 'bg-[#bd93f9] shadow-[0_0_8px_rgba(189,147,249,0.8)]',
    border: 'border-[#44475a]',
  },
  'serene-light': {
    id: 'serene-light',
    name: 'Serene Minimal',
    bg: 'bg-[#f4f6f8]',
    cardBg: 'bg-[#ffffff]',
    textMuted: 'text-[#94a3b8]',
    textNormal: 'text-[#64748b]',
    textBright: 'text-[#0f172a]',
    correct: 'text-[#0284c7]',
    incorrect: 'text-[#e11d48] bg-[#e11d48]/15',
    extra: 'text-[#f43f5e]',
    accent: 'text-[#2563eb]',
    accentBg: 'bg-[#2563eb]',
    caret: 'bg-[#2563eb]',
    border: 'border-[#e2e8f0]',
  }
};
