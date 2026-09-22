import React from 'react';
import { ThemeConfig } from '../utils/themes';

interface VirtualKeyboardProps {
  currentKey: string;
  theme: ThemeConfig;
  showFingerGuide: boolean;
  pressedKey?: string;
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

interface KeyDef {
  key: string;
  display?: string;
  shiftDisplay?: string;
  finger: number;
  width?: string;
  hasNub?: boolean;
}

const KEYBOARD_ROWS: KeyDef[][] = [
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
    { key: 'ShiftRight', display: 'shift', finger: 8, width: 'w-12 sm:w-14' }
  ],
  [
    { key: 'Control', display: 'ctrl', finger: 0, width: 'w-9 sm:w-10' },
    { key: 'Alt', display: 'alt', finger: 0, width: 'w-8 sm:w-9' },
    { key: ' ', display: 'space', finger: 4, width: 'flex-1 max-w-[10.625rem] sm:max-w-[13.75rem]' },
    { key: 'AltRight', display: 'alt', finger: 8, width: 'w-8 sm:w-9' },
    { key: 'ControlRight', display: 'ctrl', finger: 8, width: 'w-9 sm:w-10' }
  ]
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  currentKey,
  theme,
  showFingerGuide,
  pressedKey
}) => {
  const normalizedCurrent = currentKey ? currentKey.toLowerCase() : '';
  const normalizedPressed = pressedKey ? pressedKey.toLowerCase() : '';

  // Find which finger is active for current target
  let activeFingerIndex = -1;
  if (normalizedCurrent === ' ') {
    activeFingerIndex = 4;
  } else {
    for (const row of KEYBOARD_ROWS) {
      for (const k of row) {
        if (
          k.key.toLowerCase() === normalizedCurrent ||
          k.shiftDisplay?.toLowerCase() === normalizedCurrent
        ) {
          activeFingerIndex = k.finger;
          break;
        }
      }
      if (activeFingerIndex !== -1) break;
    }
  }

  return (
    <div className={`w-full max-w-2xl mx-auto p-2.5 sm:p-3 rounded-xl border ${theme.border} ${theme.cardBg} transition-all duration-200 select-none shadow-sm`}>
      {/* Finger guide bar - sleek and compact */}
      {showFingerGuide && activeFingerIndex !== -1 && (
        <div className="flex items-center justify-between px-1 pb-1.5 mb-1.5 border-b border-white/5 text-[0.6875rem]">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Target Finger:</span>
            <span className={`font-semibold tracking-wide px-2 py-0.2 rounded-full border bg-white/5 text-[0.625rem] sm:text-[0.6875rem] ${FINGER_COLORS[activeFingerIndex]}`}>
              {FINGER_NAMES[activeFingerIndex]}
            </span>
          </div>
          <div className="text-neutral-400 text-[0.625rem] hidden sm:block">
            Home row: A S D F &bull; J K L ;
          </div>
        </div>
      )}

      {/* Keyboard Grid - compact height & width */}
      <div className="flex flex-col gap-1 font-mono-code text-[0.6875rem]">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 w-full">
            {row.map((item, keyIdx) => {
              const isTarget =
                normalizedCurrent === item.key.toLowerCase() ||
                (item.shiftDisplay && normalizedCurrent === item.shiftDisplay.toLowerCase()) ||
                (item.key === ' ' && normalizedCurrent === ' ');

              const isPhysicallyPressed =
                normalizedPressed === item.key.toLowerCase() ||
                (item.key === ' ' && normalizedPressed === ' ');

              const fingerStyle = showFingerGuide ? FINGER_COLORS[item.finger] : 'border-white/10 text-neutral-300';

              return (
                <div
                  key={keyIdx}
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
                  <span className="uppercase text-[0.625rem] sm:text-[0.6875rem] font-medium leading-none">
                    {item.display || item.key}
                  </span>

                  {/* Tactile F & J home row nubs */}
                  {item.hasNub && (
                    <span className="absolute bottom-0.5 w-2 h-[0.09375rem] bg-neutral-400/80 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
