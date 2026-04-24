import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

const KEYBOARD_ROWS = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
  ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
  ['CapsLock','A','S','D','F','G','H','J','K','L',';',"'",'Enter'],
  ['ShiftLeft','Z','X','C','V','B','N','M',',','.','/','ShiftRight'],
  ['Space'],
];

const KEY_CODES: Record<string, string> = {
  '`': 'Backquote', '1': 'Digit1', '2': 'Digit2', '3': 'Digit3',
  '4': 'Digit4', '5': 'Digit5', '6': 'Digit6', '7': 'Digit7',
  '8': 'Digit8', '9': 'Digit9', '0': 'Digit0', '-': 'Minus',
  '=': 'Equal', 'Backspace': 'Backspace', 'Tab': 'Tab',
  'Q': 'KeyQ', 'W': 'KeyW', 'E': 'KeyE', 'R': 'KeyR', 'T': 'KeyT',
  'Y': 'KeyY', 'U': 'KeyU', 'I': 'KeyI', 'O': 'KeyO', 'P': 'KeyP',
  '[': 'BracketLeft', ']': 'BracketRight', '\\': 'Backslash',
  'CapsLock': 'CapsLock', 'A': 'KeyA', 'S': 'KeyS', 'D': 'KeyD',
  'F': 'KeyF', 'G': 'KeyG', 'H': 'KeyH', 'J': 'KeyJ', 'K': 'KeyK',
  'L': 'KeyL', ';': 'Semicolon', "'": 'Quote', 'Enter': 'Enter',
  'ShiftLeft': 'ShiftLeft', 'Z': 'KeyZ', 'X': 'KeyX', 'C': 'KeyC',
  'V': 'KeyV', 'B': 'KeyB', 'N': 'KeyN', 'M': 'KeyM',
  ',': 'Comma', '.': 'Period', '/': 'Slash', 'ShiftRight': 'ShiftRight',
  'Space': 'Space',
};

const WIDE_KEYS: Record<string, string> = {
  'Backspace': 'w-20',
  'Tab': 'w-16',
  '\\': 'w-16',
  'CapsLock': 'w-20',
  'Enter': 'w-24',
  'ShiftLeft': 'w-28',
  'ShiftRight': 'w-28',
  'Space': 'w-80',
};

const KEY_LABELS: Record<string, string> = {
  'Backspace': '⌫',
  'Tab': 'tab',
  'CapsLock': 'caps',
  'Enter': 'enter',
  'ShiftLeft': 'shift',
  'ShiftRight': 'shift',
  'Space': '',
  '\\': '\\',
};

interface GhostKeyboardProps {
  nextChar?: string;
}

export function GhostKeyboard({ nextChar }: GhostKeyboardProps) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeys(prev => new Set([...prev, e.code]));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Determine which key to highlight as "next"
  const nextKeyCode = nextChar
    ? nextChar === ' '
      ? 'Space'
      : KEY_CODES[nextChar.toUpperCase()] ?? null
    : null;

  return (
    <div className="flex flex-col items-center gap-1.5 py-4">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 justify-center">
          {row.map((key) => {
            const code = KEY_CODES[key];
            const isActive = activeKeys.has(code);
            const isNext = nextKeyCode === code;
            const label = KEY_LABELS[key] ?? key.toLowerCase();
            const widthClass = WIDE_KEYS[key] ?? 'w-10';

            return (
              <div
                key={key}
                className={cn(
                  "h-10 flex items-center justify-center rounded-md text-[10px] font-bold tracking-wider transition-all duration-75 border select-none",
                  widthClass,
                  isActive
                    ? "border-accent-blue text-accent-blue bg-accent-blue/10"
                    : isNext
                    ? "border-accent-blue/50 text-accent-blue/70 bg-accent-blue/5 animate-pulse"
                    : "border-white/10 text-white/20 bg-transparent"
                )}
                style={
                  isActive
                    ? { boxShadow: '0 0 12px rgba(59,130,246,0.4), inset 0 0 8px rgba(59,130,246,0.2)' }
                    : isNext
                    ? { boxShadow: '0 0 8px rgba(59,130,246,0.2)' }
                    : {}
                }
              >
                {label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
