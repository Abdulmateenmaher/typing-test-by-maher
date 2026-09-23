import React from 'react';
import { ThemeConfig } from '../utils/themes';
import { SupportedLanguage } from '../types';
import { isRtlLanguage } from '../utils/words';

interface VirtualKeyboardProps {
  currentKey: string;
  theme: ThemeConfig;
  showFingerGuide: boolean;
  pressedKey?: string;
  language?: SupportedLanguage;
  onKeyClick?: (key: string) => void;
}

// Finger zones: 0: L Pinky, 1: L Ring, 2: L Middle, 3: L Index, 4: Thumbs, 5: R Index, 6: R Middle, 7: R Ring, 8: R Pinky
const FINGER_COLORS = [
  'border-rose-500/50 text-rose-300', // L Pinky
  'border-amber-500/50 text-amber-300', // L Ring
  'border-emerald-500/50 text-emerald-300', // L Middle
  'border-cyan-500/50 text-cyan-300', // L Index
  'border-indigo-500/50 text-indigo-300', // Thumbs
  'border-cyan-500/50 text-cyan-300', // R Index
  'border-emerald-500/50 text-emerald-300', // R Middle
  'border-amber-500/50 text-amber-300', // R Ring
  'border-rose-500/50 text-rose-300', // R Pinky
];

const FINGER_NAMES = [
  'Left Pinky',
  'Left Ring',
  'Left Middle',
  'Left Index',
  'Thumbs',
  'Right Index',
  'Right Middle',
  'Right Ring',
  'Right Pinky'
];

export interface KeyDef {
  key: string;
  display?: string;
  shiftDisplay?: string;
  finger: number;
  width?: string;
  hasNub?: boolean;
}

// English Standard US QWERTY
const ENGLISH_ROWS: KeyDef[][] = [
  [
    { key: '`', shiftDisplay: '~', finger: 0 },
    { key: '1', shiftDisplay: '!', finger: 0 },
    { key: '2', shiftDisplay: '@', finger: 1 },
    { key: '3', shiftDisplay: '#', finger: 2 },
    { key: '4', shiftDisplay: '$', finger: 3 },
    { key: '5', shiftDisplay: '%', finger: 3 },
    { key: '6', shiftDisplay: '^', finger: 5 },
    { key: '7', shiftDisplay: '&', finger: 5 },
    { key: '8', shiftDisplay: '*', finger: 6 },
    { key: '9', shiftDisplay: '(', finger: 7 },
    { key: '0', shiftDisplay: ')', finger: 8 },
    { key: '-', shiftDisplay: '_', finger: 8 },
    { key: '=', shiftDisplay: '+', finger: 8 },
    { key: 'Backspace', display: '⌫', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Tab', display: 'tab', finger: 0, width: 'w-9 sm:w-11' },
    { key: 'q', finger: 0 },
    { key: 'w', finger: 1 },
    { key: 'e', finger: 2 },
    { key: 'r', finger: 3 },
    { key: 't', finger: 3 },
    { key: 'y', finger: 5 },
    { key: 'u', finger: 5 },
    { key: 'i', finger: 6 },
    { key: 'o', finger: 7 },
    { key: 'p', finger: 8 },
    { key: '[', shiftDisplay: '{', finger: 8 },
    { key: ']', shiftDisplay: '}', finger: 8 },
    { key: '\\', shiftDisplay: '|', finger: 8, width: 'w-8 sm:w-10' }
  ],
  [
    { key: 'CapsLock', display: 'caps', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'a', finger: 0 },
    { key: 's', finger: 1 },
    { key: 'd', finger: 2 },
    { key: 'f', finger: 3, hasNub: true },
    { key: 'g', finger: 3 },
    { key: 'h', finger: 5 },
    { key: 'j', finger: 5, hasNub: true },
    { key: 'k', finger: 6 },
    { key: 'l', finger: 7 },
    { key: ';', shiftDisplay: ':', finger: 8 },
    { key: "'", shiftDisplay: '"', finger: 8 },
    { key: 'Enter', display: '⏎', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Shift', display: 'shift', finger: 0, width: 'w-12 sm:w-14' },
    { key: 'z', finger: 0 },
    { key: 'x', finger: 1 },
    { key: 'c', finger: 2 },
    { key: 'v', finger: 3 },
    { key: 'b', finger: 3 },
    { key: 'n', finger: 5 },
    { key: 'm', finger: 5 },
    { key: ',', shiftDisplay: '<', finger: 6 },
    { key: '.', shiftDisplay: '>', finger: 7 },
    { key: '/', shiftDisplay: '?', finger: 8 },
    { key: 'Shift', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Ctrl', display: 'ctrl', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'Alt', display: 'alt', finger: 1, width: 'w-9 sm:w-10' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[19rem]' },
    { key: 'Alt', display: 'alt', finger: 7, width: 'w-9 sm:w-10' },
    { key: 'Ctrl', display: 'ctrl', finger: 8, width: 'w-10 sm:w-12' }
  ]
];

// Pashto (پښتو) Afghan Standard Keyboard
const PASHTO_ROWS: KeyDef[][] = [
  [
    { key: '`', shiftDisplay: '~', finger: 0 },
    { key: '۱', shiftDisplay: '!', finger: 0 },
    { key: '۲', shiftDisplay: '@', finger: 1 },
    { key: '۳', shiftDisplay: '#', finger: 2 },
    { key: '۴', shiftDisplay: '$', finger: 3 },
    { key: '۵', shiftDisplay: '%', finger: 3 },
    { key: '۶', shiftDisplay: '^', finger: 5 },
    { key: '۷', shiftDisplay: '&', finger: 5 },
    { key: '۸', shiftDisplay: '*', finger: 6 },
    { key: '۹', shiftDisplay: '(', finger: 7 },
    { key: '۰', shiftDisplay: ')', finger: 8 },
    { key: '-', shiftDisplay: '_', finger: 8 },
    { key: '=', shiftDisplay: '+', finger: 8 },
    { key: 'Backspace', display: '⌫', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Tab', display: 'tab', finger: 0, width: 'w-9 sm:w-11' },
    { key: 'ض', shiftDisplay: 'ْ', finger: 0 },
    { key: 'ص', shiftDisplay: 'ّ', finger: 1 },
    { key: 'ث', shiftDisplay: 'ي', finger: 2 },
    { key: 'ق', shiftDisplay: 'ړ', finger: 3 },
    { key: 'ف', shiftDisplay: 'ټ', finger: 3 },
    { key: 'غ', shiftDisplay: 'ې', finger: 5 },
    { key: 'ع', shiftDisplay: 'ُ', finger: 5 },
    { key: 'ه', shiftDisplay: 'ِ', finger: 6 },
    { key: 'خ', shiftDisplay: 'ځ', finger: 7 },
    { key: 'ح', shiftDisplay: 'ح', finger: 8 },
    { key: 'ج', shiftDisplay: 'څ', finger: 8 },
    { key: 'چ', shiftDisplay: 'چ', finger: 8 },
    { key: '\\', shiftDisplay: '|', finger: 8, width: 'w-8 sm:w-10' }
  ],
  [
    { key: 'CapsLock', display: 'caps', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'ش', shiftDisplay: 'ښ', finger: 0 },
    { key: 'س', shiftDisplay: 'س', finger: 1 },
    { key: 'ی', shiftDisplay: 'ۍ', finger: 2 },
    { key: 'ب', shiftDisplay: 'ب', finger: 3, hasNub: true },
    { key: 'ل', shiftDisplay: 'ل', finger: 3 },
    { key: 'ا', shiftDisplay: 'آ', finger: 5 },
    { key: 'ت', shiftDisplay: 'ت', finger: 5, hasNub: true },
    { key: 'ن', shiftDisplay: 'ڼ', finger: 6 },
    { key: 'م', shiftDisplay: 'م', finger: 7 },
    { key: 'ک', shiftDisplay: '؛', finger: 8 },
    { key: 'ګ', shiftDisplay: '،', finger: 8 },
    { key: 'Enter', display: '⏎', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Shift', display: 'shift', finger: 0, width: 'w-12 sm:w-14' },
    { key: 'ظ', shiftDisplay: 'ظ', finger: 0 },
    { key: 'ط', shiftDisplay: 'ط', finger: 1 },
    { key: 'ز', shiftDisplay: 'ږ', finger: 2 },
    { key: 'ر', shiftDisplay: 'ر', finger: 3 },
    { key: 'ذ', shiftDisplay: 'ذ', finger: 3 },
    { key: 'د', shiftDisplay: 'ډ', finger: 5 },
    { key: 'پ', shiftDisplay: 'پ', finger: 5 },
    { key: 'و', shiftDisplay: 'ء', finger: 6 },
    { key: 'ئ', shiftDisplay: 'ئ', finger: 7 },
    { key: '؟', shiftDisplay: '؟', finger: 8 },
    { key: 'Shift', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Ctrl', display: 'ctrl', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'Alt', display: 'alt', finger: 1, width: 'w-9 sm:w-10' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[19rem]' },
    { key: 'Alt', display: 'alt', finger: 7, width: 'w-9 sm:w-10' },
    { key: 'Ctrl', display: 'ctrl', finger: 8, width: 'w-10 sm:w-12' }
  ]
];

// Dari / Persian (دری / فارسی) Keyboard
const DARI_ROWS: KeyDef[][] = [
  [
    { key: '`', shiftDisplay: '~', finger: 0 },
    { key: '۱', shiftDisplay: '!', finger: 0 },
    { key: '۲', shiftDisplay: '@', finger: 1 },
    { key: '۳', shiftDisplay: '#', finger: 2 },
    { key: '۴', shiftDisplay: '$', finger: 3 },
    { key: '۵', shiftDisplay: '%', finger: 3 },
    { key: '۶', shiftDisplay: '^', finger: 5 },
    { key: '۷', shiftDisplay: '&', finger: 5 },
    { key: '۸', shiftDisplay: '*', finger: 6 },
    { key: '۹', shiftDisplay: '(', finger: 7 },
    { key: '۰', shiftDisplay: ')', finger: 8 },
    { key: '-', shiftDisplay: '_', finger: 8 },
    { key: '=', shiftDisplay: '+', finger: 8 },
    { key: 'Backspace', display: '⌫', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Tab', display: 'tab', finger: 0, width: 'w-9 sm:w-11' },
    { key: 'ض', finger: 0 },
    { key: 'ص', finger: 1 },
    { key: 'ث', finger: 2 },
    { key: 'ق', finger: 3 },
    { key: 'ف', finger: 3 },
    { key: 'غ', finger: 5 },
    { key: 'ع', finger: 5 },
    { key: 'ه', finger: 6 },
    { key: 'خ', finger: 7 },
    { key: 'ح', finger: 8 },
    { key: 'ج', finger: 8 },
    { key: 'چ', finger: 8 },
    { key: 'پ', finger: 8, width: 'w-8 sm:w-10' }
  ],
  [
    { key: 'CapsLock', display: 'caps', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'ش', finger: 0 },
    { key: 'س', finger: 1 },
    { key: 'ی', finger: 2 },
    { key: 'ب', finger: 3, hasNub: true },
    { key: 'ل', finger: 3 },
    { key: 'ا', shiftDisplay: 'آ', finger: 5 },
    { key: 'ت', finger: 5, hasNub: true },
    { key: 'ن', finger: 6 },
    { key: 'م', finger: 7 },
    { key: 'ک', finger: 8 },
    { key: 'گ', finger: 8 },
    { key: 'Enter', display: '⏎', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Shift', display: 'shift', finger: 0, width: 'w-12 sm:w-14' },
    { key: 'ظ', finger: 0 },
    { key: 'ط', finger: 1 },
    { key: 'ز', finger: 2 },
    { key: 'ر', finger: 3 },
    { key: 'ذ', finger: 3 },
    { key: 'د', finger: 5 },
    { key: 'پ', finger: 5 },
    { key: 'و', finger: 6 },
    { key: 'ژ', finger: 7 },
    { key: '؛', shiftDisplay: ':', finger: 8 },
    { key: 'Shift', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Ctrl', display: 'ctrl', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'Alt', display: 'alt', finger: 1, width: 'w-9 sm:w-10' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[19rem]' },
    { key: 'Alt', display: 'alt', finger: 7, width: 'w-9 sm:w-10' },
    { key: 'Ctrl', display: 'ctrl', finger: 8, width: 'w-10 sm:w-12' }
  ]
];

// Arabic (العربية) Keyboard
const ARABIC_ROWS: KeyDef[][] = [
  [
    { key: '`', shiftDisplay: '~', finger: 0 },
    { key: '١', shiftDisplay: '!', finger: 0 },
    { key: '٢', shiftDisplay: '@', finger: 1 },
    { key: '٣', shiftDisplay: '#', finger: 2 },
    { key: '٤', shiftDisplay: '$', finger: 3 },
    { key: '٥', shiftDisplay: '%', finger: 3 },
    { key: '٦', shiftDisplay: '^', finger: 5 },
    { key: '٧', shiftDisplay: '&', finger: 5 },
    { key: '٨', shiftDisplay: '*', finger: 6 },
    { key: '٩', shiftDisplay: '(', finger: 7 },
    { key: '٠', shiftDisplay: ')', finger: 8 },
    { key: '-', shiftDisplay: '_', finger: 8 },
    { key: '=', shiftDisplay: '+', finger: 8 },
    { key: 'Backspace', display: '⌫', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Tab', display: 'tab', finger: 0, width: 'w-9 sm:w-11' },
    { key: 'ض', finger: 0 },
    { key: 'ص', finger: 1 },
    { key: 'ث', finger: 2 },
    { key: 'ق', finger: 3 },
    { key: 'ف', finger: 3 },
    { key: 'غ', finger: 5 },
    { key: 'ع', finger: 5 },
    { key: 'ه', finger: 6 },
    { key: 'خ', finger: 7 },
    { key: 'ح', finger: 8 },
    { key: 'ج', finger: 8 },
    { key: 'د', finger: 8 },
    { key: '\\', shiftDisplay: '|', finger: 8, width: 'w-8 sm:w-10' }
  ],
  [
    { key: 'CapsLock', display: 'caps', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'ش', finger: 0 },
    { key: 'س', finger: 1 },
    { key: 'ي', finger: 2 },
    { key: 'ب', finger: 3, hasNub: true },
    { key: 'ل', finger: 3 },
    { key: 'ا', shiftDisplay: 'أ', finger: 5 },
    { key: 'ت', finger: 5, hasNub: true },
    { key: 'ن', finger: 6 },
    { key: 'م', finger: 7 },
    { key: 'ك', finger: 8 },
    { key: 'ط', finger: 8 },
    { key: 'Enter', display: '⏎', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Shift', display: 'shift', finger: 0, width: 'w-12 sm:w-14' },
    { key: 'ئ', finger: 0 },
    { key: 'ء', finger: 1 },
    { key: 'ؤ', finger: 2 },
    { key: 'ر', finger: 3 },
    { key: 'لا', finger: 3 },
    { key: 'ى', finger: 5 },
    { key: 'ة', finger: 5 },
    { key: 'و', finger: 6 },
    { key: 'ز', finger: 7 },
    { key: 'ظ', finger: 8 },
    { key: 'Shift', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Ctrl', display: 'ctrl', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'Alt', display: 'alt', finger: 1, width: 'w-9 sm:w-10' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[19rem]' },
    { key: 'Alt', display: 'alt', finger: 7, width: 'w-9 sm:w-10' },
    { key: 'Ctrl', display: 'ctrl', finger: 8, width: 'w-10 sm:w-12' }
  ]
];

// Russian (Русский - ЙЦУКЕН) Keyboard
const RUSSIAN_ROWS: KeyDef[][] = [
  [
    { key: 'ё', finger: 0 },
    { key: '1', shiftDisplay: '!', finger: 0 },
    { key: '2', shiftDisplay: '"', finger: 1 },
    { key: '3', shiftDisplay: '№', finger: 2 },
    { key: '4', shiftDisplay: ';', finger: 3 },
    { key: '5', shiftDisplay: '%', finger: 3 },
    { key: '6', shiftDisplay: ':', finger: 5 },
    { key: '7', shiftDisplay: '?', finger: 5 },
    { key: '8', shiftDisplay: '*', finger: 6 },
    { key: '9', shiftDisplay: '(', finger: 7 },
    { key: '0', shiftDisplay: ')', finger: 8 },
    { key: '-', shiftDisplay: '_', finger: 8 },
    { key: '=', shiftDisplay: '+', finger: 8 },
    { key: 'Backspace', display: '⌫', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Tab', display: 'tab', finger: 0, width: 'w-9 sm:w-11' },
    { key: 'й', finger: 0 },
    { key: 'ц', finger: 1 },
    { key: 'у', finger: 2 },
    { key: 'к', finger: 3 },
    { key: 'е', finger: 3 },
    { key: 'н', finger: 5 },
    { key: 'г', finger: 5 },
    { key: 'ш', finger: 6 },
    { key: 'щ', finger: 7 },
    { key: 'з', finger: 8 },
    { key: 'х', finger: 8 },
    { key: 'ъ', finger: 8 },
    { key: '\\', shiftDisplay: '/', finger: 8, width: 'w-8 sm:w-10' }
  ],
  [
    { key: 'CapsLock', display: 'caps', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'ф', finger: 0 },
    { key: 'ы', finger: 1 },
    { key: 'в', finger: 2 },
    { key: 'а', finger: 3, hasNub: true },
    { key: 'п', finger: 3 },
    { key: 'р', finger: 5 },
    { key: 'о', finger: 5, hasNub: true },
    { key: 'л', finger: 6 },
    { key: 'д', finger: 7 },
    { key: 'ж', finger: 8 },
    { key: 'э', finger: 8 },
    { key: 'Enter', display: '⏎', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Shift', display: 'shift', finger: 0, width: 'w-12 sm:w-14' },
    { key: 'я', finger: 0 },
    { key: 'ч', finger: 1 },
    { key: 'с', finger: 2 },
    { key: 'м', finger: 3 },
    { key: 'и', finger: 3 },
    { key: 'т', finger: 5 },
    { key: 'ь', finger: 5 },
    { key: 'б', finger: 6 },
    { key: 'ю', finger: 7 },
    { key: '.', shiftDisplay: ',', finger: 8 },
    { key: 'Shift', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Ctrl', display: 'ctrl', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'Alt', display: 'alt', finger: 1, width: 'w-9 sm:w-10' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[19rem]' },
    { key: 'Alt', display: 'alt', finger: 7, width: 'w-9 sm:w-10' },
    { key: 'Ctrl', display: 'ctrl', finger: 8, width: 'w-10 sm:w-12' }
  ]
];

// German (Deutsch - QWERTZ) Keyboard
const GERMAN_ROWS: KeyDef[][] = [
  [
    { key: '^', shiftDisplay: '°', finger: 0 },
    { key: '1', shiftDisplay: '!', finger: 0 },
    { key: '2', shiftDisplay: '"', finger: 1 },
    { key: '3', shiftDisplay: '§', finger: 2 },
    { key: '4', shiftDisplay: '$', finger: 3 },
    { key: '5', shiftDisplay: '%', finger: 3 },
    { key: '6', shiftDisplay: '&', finger: 5 },
    { key: '7', shiftDisplay: '/', finger: 5 },
    { key: '8', shiftDisplay: '(', finger: 6 },
    { key: '9', shiftDisplay: ')', finger: 7 },
    { key: '0', shiftDisplay: '=', finger: 8 },
    { key: 'ß', shiftDisplay: '?', finger: 8 },
    { key: '´', shiftDisplay: '`', finger: 8 },
    { key: 'Backspace', display: '⌫', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Tab', display: 'tab', finger: 0, width: 'w-9 sm:w-11' },
    { key: 'q', shiftDisplay: '@', finger: 0 },
    { key: 'w', finger: 1 },
    { key: 'e', shiftDisplay: '€', finger: 2 },
    { key: 'r', finger: 3 },
    { key: 't', finger: 3 },
    { key: 'z', finger: 5 },
    { key: 'u', finger: 5 },
    { key: 'i', finger: 6 },
    { key: 'o', finger: 7 },
    { key: 'p', finger: 8 },
    { key: 'ü', finger: 8 },
    { key: '+', shiftDisplay: '*', finger: 8 },
    { key: '#', shiftDisplay: "'", finger: 8, width: 'w-8 sm:w-10' }
  ],
  [
    { key: 'CapsLock', display: 'caps', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'a', finger: 0 },
    { key: 's', finger: 1 },
    { key: 'd', finger: 2 },
    { key: 'f', finger: 3, hasNub: true },
    { key: 'g', finger: 3 },
    { key: 'h', finger: 5 },
    { key: 'j', finger: 5, hasNub: true },
    { key: 'k', finger: 6 },
    { key: 'l', finger: 7 },
    { key: 'ö', finger: 8 },
    { key: 'ä', finger: 8 },
    { key: 'Enter', display: '⏎', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Shift', display: 'shift', finger: 0, width: 'w-12 sm:w-14' },
    { key: 'y', finger: 0 },
    { key: 'x', finger: 1 },
    { key: 'c', finger: 2 },
    { key: 'v', finger: 3 },
    { key: 'b', finger: 3 },
    { key: 'n', finger: 5 },
    { key: 'm', shiftDisplay: 'µ', finger: 5 },
    { key: ',', shiftDisplay: ';', finger: 6 },
    { key: '.', shiftDisplay: ':', finger: 7 },
    { key: '-', shiftDisplay: '_', finger: 8 },
    { key: 'Shift', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Ctrl', display: 'ctrl', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'Alt', display: 'alt', finger: 1, width: 'w-9 sm:w-10' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[19rem]' },
    { key: 'Alt', display: 'alt', finger: 7, width: 'w-9 sm:w-10' },
    { key: 'Ctrl', display: 'ctrl', finger: 8, width: 'w-10 sm:w-12' }
  ]
];

// French (Français - AZERTY) Keyboard
const FRENCH_ROWS: KeyDef[][] = [
  [
    { key: '²', finger: 0 },
    { key: '&', shiftDisplay: '1', finger: 0 },
    { key: 'é', shiftDisplay: '2', finger: 1 },
    { key: '"', shiftDisplay: '3', finger: 2 },
    { key: "'", shiftDisplay: '4', finger: 3 },
    { key: '(', shiftDisplay: '5', finger: 3 },
    { key: '-', shiftDisplay: '6', finger: 5 },
    { key: 'è', shiftDisplay: '7', finger: 5 },
    { key: '_', shiftDisplay: '8', finger: 6 },
    { key: 'ç', shiftDisplay: '9', finger: 7 },
    { key: 'à', shiftDisplay: '0', finger: 8 },
    { key: ')', shiftDisplay: '°', finger: 8 },
    { key: '=', shiftDisplay: '+', finger: 8 },
    { key: 'Backspace', display: '⌫', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Tab', display: 'tab', finger: 0, width: 'w-9 sm:w-11' },
    { key: 'a', finger: 0 },
    { key: 'z', finger: 1 },
    { key: 'e', finger: 2 },
    { key: 'r', finger: 3 },
    { key: 't', finger: 3 },
    { key: 'y', finger: 5 },
    { key: 'u', finger: 5 },
    { key: 'i', finger: 6 },
    { key: 'o', finger: 7 },
    { key: 'p', finger: 8 },
    { key: '^', shiftDisplay: '¨', finger: 8 },
    { key: '$', shiftDisplay: '£', finger: 8 },
    { key: '*', shiftDisplay: 'µ', finger: 8, width: 'w-8 sm:w-10' }
  ],
  [
    { key: 'CapsLock', display: 'caps', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'q', finger: 0 },
    { key: 's', finger: 1 },
    { key: 'd', finger: 2 },
    { key: 'f', finger: 3, hasNub: true },
    { key: 'g', finger: 3 },
    { key: 'h', finger: 5 },
    { key: 'j', finger: 5, hasNub: true },
    { key: 'k', finger: 6 },
    { key: 'l', finger: 7 },
    { key: 'm', finger: 8 },
    { key: 'ù', shiftDisplay: '%', finger: 8 },
    { key: 'Enter', display: '⏎', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Shift', display: 'shift', finger: 0, width: 'w-12 sm:w-14' },
    { key: 'w', finger: 0 },
    { key: 'x', finger: 1 },
    { key: 'c', finger: 2 },
    { key: 'v', finger: 3 },
    { key: 'b', finger: 3 },
    { key: 'n', finger: 5 },
    { key: ',', shiftDisplay: '?', finger: 5 },
    { key: ';', shiftDisplay: '.', finger: 6 },
    { key: ':', shiftDisplay: '/', finger: 7 },
    { key: '!', shiftDisplay: '§', finger: 8 },
    { key: 'Shift', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Ctrl', display: 'ctrl', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'Alt', display: 'alt', finger: 1, width: 'w-9 sm:w-10' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[19rem]' },
    { key: 'Alt', display: 'alt', finger: 7, width: 'w-9 sm:w-10' },
    { key: 'Ctrl', display: 'ctrl', finger: 8, width: 'w-10 sm:w-12' }
  ]
];

// Spanish (Español) Keyboard
const SPANISH_ROWS: KeyDef[][] = [
  [
    { key: 'º', shiftDisplay: 'ª', finger: 0 },
    { key: '1', shiftDisplay: '!', finger: 0 },
    { key: '2', shiftDisplay: '"', finger: 1 },
    { key: '3', shiftDisplay: '·', finger: 2 },
    { key: '4', shiftDisplay: '$', finger: 3 },
    { key: '5', shiftDisplay: '%', finger: 3 },
    { key: '6', shiftDisplay: '&', finger: 5 },
    { key: '7', shiftDisplay: '/', finger: 5 },
    { key: '8', shiftDisplay: '(', finger: 6 },
    { key: '9', shiftDisplay: ')', finger: 7 },
    { key: '0', shiftDisplay: '=', finger: 8 },
    { key: "'", shiftDisplay: '?', finger: 8 },
    { key: '¡', shiftDisplay: '¿', finger: 8 },
    { key: 'Backspace', display: '⌫', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Tab', display: 'tab', finger: 0, width: 'w-9 sm:w-11' },
    { key: 'q', finger: 0 },
    { key: 'w', finger: 1 },
    { key: 'e', shiftDisplay: '€', finger: 2 },
    { key: 'r', finger: 3 },
    { key: 't', finger: 3 },
    { key: 'y', finger: 5 },
    { key: 'u', finger: 5 },
    { key: 'i', finger: 6 },
    { key: 'o', finger: 7 },
    { key: 'p', finger: 8 },
    { key: '`', shiftDisplay: '^', finger: 8 },
    { key: '+', shiftDisplay: '*', finger: 8 },
    { key: 'ç', shiftDisplay: 'Ç', finger: 8, width: 'w-8 sm:w-10' }
  ],
  [
    { key: 'CapsLock', display: 'caps', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'a', finger: 0 },
    { key: 's', finger: 1 },
    { key: 'd', finger: 2 },
    { key: 'f', finger: 3, hasNub: true },
    { key: 'g', finger: 3 },
    { key: 'h', finger: 5 },
    { key: 'j', finger: 5, hasNub: true },
    { key: 'k', finger: 6 },
    { key: 'l', finger: 7 },
    { key: 'ñ', finger: 8 },
    { key: '´', shiftDisplay: '¨', finger: 8 },
    { key: 'Enter', display: '⏎', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Shift', display: 'shift', finger: 0, width: 'w-12 sm:w-14' },
    { key: 'z', finger: 0 },
    { key: 'x', finger: 1 },
    { key: 'c', finger: 2 },
    { key: 'v', finger: 3 },
    { key: 'b', finger: 3 },
    { key: 'n', finger: 5 },
    { key: 'm', finger: 5 },
    { key: ',', shiftDisplay: ';', finger: 6 },
    { key: '.', shiftDisplay: ':', finger: 7 },
    { key: '-', shiftDisplay: '_', finger: 8 },
    { key: 'Shift', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Ctrl', display: 'ctrl', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'Alt', display: 'alt', finger: 1, width: 'w-9 sm:w-10' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[19rem]' },
    { key: 'Alt', display: 'alt', finger: 7, width: 'w-9 sm:w-10' },
    { key: 'Ctrl', display: 'ctrl', finger: 8, width: 'w-10 sm:w-12' }
  ]
];

// Turkish (Türkçe - Q) Keyboard
const TURKISH_ROWS: KeyDef[][] = [
  [
    { key: '"', shiftDisplay: 'é', finger: 0 },
    { key: '1', shiftDisplay: '!', finger: 0 },
    { key: '2', shiftDisplay: "'", finger: 1 },
    { key: '3', shiftDisplay: '^', finger: 2 },
    { key: '4', shiftDisplay: '+', finger: 3 },
    { key: '5', shiftDisplay: '%', finger: 3 },
    { key: '6', shiftDisplay: '&', finger: 5 },
    { key: '7', shiftDisplay: '/', finger: 5 },
    { key: '8', shiftDisplay: '(', finger: 6 },
    { key: '9', shiftDisplay: ')', finger: 7 },
    { key: '0', shiftDisplay: '=', finger: 8 },
    { key: '*', shiftDisplay: '?', finger: 8 },
    { key: '-', shiftDisplay: '_', finger: 8 },
    { key: 'Backspace', display: '⌫', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Tab', display: 'tab', finger: 0, width: 'w-9 sm:w-11' },
    { key: 'q', finger: 0 },
    { key: 'w', finger: 1 },
    { key: 'e', finger: 2 },
    { key: 'r', finger: 3 },
    { key: 't', finger: 3 },
    { key: 'y', finger: 5 },
    { key: 'u', finger: 5 },
    { key: 'ı', finger: 6 },
    { key: 'o', finger: 7 },
    { key: 'p', finger: 8 },
    { key: 'ğ', finger: 8 },
    { key: 'ü', finger: 8 },
    { key: ',', shiftDisplay: ';', finger: 8, width: 'w-8 sm:w-10' }
  ],
  [
    { key: 'CapsLock', display: 'caps', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'a', finger: 0 },
    { key: 's', finger: 1 },
    { key: 'd', finger: 2 },
    { key: 'f', finger: 3, hasNub: true },
    { key: 'g', finger: 3 },
    { key: 'h', finger: 5 },
    { key: 'j', finger: 5, hasNub: true },
    { key: 'k', finger: 6 },
    { key: 'l', finger: 7 },
    { key: 'ş', finger: 8 },
    { key: 'i', finger: 8 },
    { key: 'Enter', display: '⏎', finger: 8, width: 'w-11 sm:w-13' }
  ],
  [
    { key: 'Shift', display: 'shift', finger: 0, width: 'w-12 sm:w-14' },
    { key: 'z', finger: 0 },
    { key: 'x', finger: 1 },
    { key: 'c', finger: 2 },
    { key: 'v', finger: 3 },
    { key: 'b', finger: 3 },
    { key: 'n', finger: 5 },
    { key: 'm', finger: 5 },
    { key: 'ö', finger: 6 },
    { key: 'ç', finger: 7 },
    { key: '.', shiftDisplay: ':', finger: 8 },
    { key: 'Shift', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Ctrl', display: 'ctrl', finger: 0, width: 'w-10 sm:w-12' },
    { key: 'Alt', display: 'alt', finger: 1, width: 'w-9 sm:w-10' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[19rem]' },
    { key: 'Alt', display: 'alt', finger: 7, width: 'w-9 sm:w-10' },
    { key: 'Ctrl', display: 'ctrl', finger: 8, width: 'w-10 sm:w-12' }
  ]
];

// Helper to choose rows based on language
function getDesktopRows(lang: SupportedLanguage = 'english'): KeyDef[][] {
  switch (lang) {
    case 'pashto':
      return PASHTO_ROWS;
    case 'dari':
      return DARI_ROWS;
    case 'arabic':
      return ARABIC_ROWS;
    case 'russian':
      return RUSSIAN_ROWS;
    case 'german':
      return GERMAN_ROWS;
    case 'french':
      return FRENCH_ROWS;
    case 'spanish':
      return SPANISH_ROWS;
    case 'turkish':
      return TURKISH_ROWS;
    default:
      return ENGLISH_ROWS;
  }
}

// Extract a compact 3-row layout for mobile screens
function getMobileRows(lang: SupportedLanguage = 'english'): KeyDef[][] {
  const desktop = getDesktopRows(lang);
  // Pick letters from row 1, 2, 3
  const row1 = desktop[1].filter((k) => k.key.length === 1);
  const row2 = desktop[2].filter((k) => k.key.length === 1);
  const row3 = desktop[3].filter((k) => k.key.length === 1);

  return [
    row1,
    row2,
    [
      ...row3,
      { key: 'Backspace', display: '⌫', finger: 8, width: 'w-10 min-w-[2.2rem]' }
    ],
    [
      { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[16rem]' }
    ]
  ];
}

// Character matching helper for both base & shift symbols
function matchesKey(def: KeyDef, target: string): boolean {
  if (!target) return false;
  const t = target.toLowerCase();
  if (def.key.toLowerCase() === t) return true;
  if (def.display && def.display.toLowerCase() === t) return true;
  if (def.shiftDisplay && def.shiftDisplay.toLowerCase() === t) return true;
  return false;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  currentKey,
  theme,
  showFingerGuide,
  pressedKey,
  language = 'english',
  onKeyClick
}) => {
  const desktopRows = React.useMemo(() => getDesktopRows(language), [language]);
  const mobileRows = React.useMemo(() => getMobileRows(language), [language]);
  const isRtl = isRtlLanguage(language);

  const normalizedCurrent = currentKey ? currentKey.toLowerCase() : '';
  const normalizedPressed = pressedKey ? pressedKey.toLowerCase() : '';

  // Find which finger is active for current target
  let activeFingerIndex = -1;
  if (normalizedCurrent === ' ') {
    activeFingerIndex = 4;
  } else {
    for (const row of desktopRows) {
      for (const k of row) {
        if (matchesKey(k, normalizedCurrent)) {
          activeFingerIndex = k.finger;
          break;
        }
      }
      if (activeFingerIndex !== -1) break;
    }
  }

  const handleKeyClick = (key: string) => {
    if (onKeyClick) {
      onKeyClick(key);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto p-2 sm:p-3 rounded-2xl border ${theme.border} ${theme.cardBg} transition-all duration-200 select-none shadow-sm ${isRtl ? 'font-rtl' : ''}`}>
      {/* Finger guide bar */}
      {showFingerGuide && activeFingerIndex !== -1 && (
        <div className="flex items-center justify-between px-1 pb-1.5 mb-1.5 border-b border-white/5 text-[0.6875rem]">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Target Finger:</span>
            <span className={`font-semibold tracking-wide px-2 py-0.5 rounded-full border bg-white/5 text-[0.625rem] sm:text-[0.6875rem] ${FINGER_COLORS[activeFingerIndex]}`}>
              {FINGER_NAMES[activeFingerIndex]}
            </span>
          </div>
          <div className="text-neutral-400 text-[0.625rem] flex items-center gap-1">
            <span>Target:</span>
            <strong className="text-cyan-400 uppercase font-mono-code text-xs px-1.5 py-0.2 rounded bg-cyan-400/10 border border-cyan-400/20">
              {normalizedCurrent === ' ' ? 'SPACE' : normalizedCurrent}
            </strong>
          </div>
        </div>
      )}

      {/* MOBILE TOUCH KEYBOARD (Active on small screens < 640px) */}
      <div className="flex flex-col gap-1 sm:hidden text-xs">
        {mobileRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 w-full">
            {row.map((item, keyIdx) => {
              const isTarget = matchesKey(item, normalizedCurrent);
              const isPhysicallyPressed = matchesKey(item, normalizedPressed);
              const fingerStyle = showFingerGuide ? FINGER_COLORS[item.finger] : 'border-white/10 text-neutral-300';

              return (
                <button
                  type="button"
                  key={keyIdx}
                  onClick={() => handleKeyClick(item.key)}
                  className={`
                    relative flex flex-col items-center justify-center rounded-lg border text-center transition-all duration-75
                    h-9.5 ${item.width || 'flex-1 max-w-[2.35rem]'} min-h-[38px] active:scale-90 cursor-pointer overflow-hidden
                    ${
                      isTarget
                        ? `ring-2 ring-cyan-400 bg-cyan-400/25 text-white font-bold scale-[1.04] shadow-sm z-10 animate-pulse`
                        : isPhysicallyPressed
                        ? `bg-white/20 scale-95 border-white/40`
                        : `bg-white/[0.04] hover:bg-white/[0.08]`
                    }
                    ${fingerStyle}
                  `}
                >
                  <span className="text-xs font-semibold leading-none">
                    {item.display || item.key}
                  </span>
                  {item.shiftDisplay && (
                    <span className="text-[0.5rem] opacity-50 font-normal leading-none mt-0.5">
                      {item.shiftDisplay}
                    </span>
                  )}
                  {item.hasNub && (
                    <span className="absolute bottom-1 w-2.5 h-[0.125rem] bg-neutral-400/80 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* DESKTOP FULL KEYBOARD (Active on sm+ screens >= 640px) */}
      <div className="hidden sm:flex flex-col gap-1 text-[0.6875rem]">
        {desktopRows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 w-full">
            {row.map((item, keyIdx) => {
              const isTarget = matchesKey(item, normalizedCurrent);
              const isPhysicallyPressed = matchesKey(item, normalizedPressed);
              const fingerStyle = showFingerGuide ? FINGER_COLORS[item.finger] : 'border-white/10 text-neutral-300';

              return (
                <button
                  type="button"
                  key={keyIdx}
                  onClick={() => handleKeyClick(item.key)}
                  className={`
                    relative flex items-center justify-center rounded-md border text-center transition-transform duration-75
                    h-7 sm:h-8 ${item.width || 'w-6 sm:w-7.5'}
                    ${
                      isTarget
                        ? `ring-2 ring-cyan-400 bg-cyan-400/25 text-white font-bold scale-[1.04] shadow-sm z-10 animate-pulse`
                        : isPhysicallyPressed
                        ? `bg-white/20 scale-95 border-white/40`
                        : `bg-white/[0.03] hover:bg-white/[0.07]`
                    }
                    ${fingerStyle}
                  `}
                >
                  <span className="text-[0.625rem] sm:text-[0.6875rem] font-medium leading-none">
                    {item.display || item.key}
                  </span>

                  {/* Shift label in corner if present */}
                  {item.shiftDisplay && item.key.length === 1 && (
                    <span className="absolute top-0.5 right-1 text-[0.5rem] opacity-50 font-normal pointer-events-none">
                      {item.shiftDisplay}
                    </span>
                  )}

                  {/* Tactile F & J home row nubs */}
                  {item.hasNub && (
                    <span className="absolute bottom-0.5 w-2 h-[0.09375rem] bg-neutral-400/80 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
