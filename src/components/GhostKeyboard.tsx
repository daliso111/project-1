import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface GhostKeyboardProps {
  nextChar?: string;
}

const ROWS = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
  ['Space']
];

const KEY_LABELS: Record<string, string> = {
  Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0', Minus: '-', Equal: '=',
  BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  Semicolon: ';', Quote: "'",
  Comma: ',', Period: '.', Slash: '/',
  ShiftLeft: 'Shift', ShiftRight: 'Shift',
  ControlLeft: 'Ctrl', MetaLeft: 'Win', AltLeft: 'Alt', Space: ' ', AltRight: 'Alt', MetaRight: 'Win', ContextMenu: 'Menu', ControlRight: 'Ctrl'
};

const WIDE_KEYS: Record<string, number> = {
  Backspace: 80,
  CapsLock: 80,
  Tab: 64,
  Backslash: 64,
  Enter: 96,
  ShiftLeft: 112,
  ShiftRight: 112,
  Space: 320
};

const CHAR_TO_CODE: Record<string, string> = {
  ' ': 'Space',
  '`': 'Backquote', '~': 'Backquote',
  '1': 'Digit1', '!': 'Digit1',
  '2': 'Digit2', '@': 'Digit2',
  '3': 'Digit3', '#': 'Digit3',
  '4': 'Digit4', '$': 'Digit4',
  '5': 'Digit5', '%': 'Digit5',
  '6': 'Digit6', '^': 'Digit6',
  '7': 'Digit7', '&': 'Digit7',
  '8': 'Digit8', '*': 'Digit8',
  '9': 'Digit9', '(': 'Digit9',
  '0': 'Digit0', ')': 'Digit0',
  '-': 'Minus', '_': 'Minus',
  '=': 'Equal', '+': 'Equal',
  '[': 'BracketLeft', '{': 'BracketLeft',
  ']': 'BracketRight', '}': 'BracketRight',
  '\\': 'Backslash', '|': 'Backslash',
  ';': 'Semicolon', ':': 'Semicolon',
  "'": 'Quote', '"': 'Quote',
  ',': 'Comma', '<': 'Comma',
  '.': 'Period', '>': 'Period',
  '/': 'Slash', '?': 'Slash'
};

// Add letters
'abcdefghijklmnopqrstuvwxyz'.split('').forEach(char => {
  CHAR_TO_CODE[char] = `Key${char.toUpperCase()}`;
  CHAR_TO_CODE[char.toUpperCase()] = `Key${char.toUpperCase()}`;
});

export function GhostKeyboard({ nextChar }: GhostKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const targetCode = nextChar ? CHAR_TO_CODE[nextChar] : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => new Set(prev).add(e.code));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
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

  return (
    <div className="flex flex-col gap-1 p-4 bg-surface/40 rounded-2xl border border-border-theme/50 backdrop-blur-sm select-none items-center shadow-inner mt-8">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map(code => {
            const isPressed = pressedKeys.has(code);
            const isTarget = code === targetCode;
            const width = WIDE_KEYS[code] || 40;
            const label = KEY_LABELS[code] || code.replace('Key', '').replace('Digit', '');

            return (
              <div
                key={code}
                style={{ width: `${width}px`, minWidth: `${width}px` }}
                className={cn(
                  "h-10 flex items-center justify-center rounded-lg border text-[11px] font-bold transition-all duration-75 uppercase",
                  isTarget
                    ? "bg-accent-blue/20 border-accent-blue text-accent-blue shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse"
                    : isPressed
                    ? "bg-text-main/10 border-text-dim text-text-main translate-y-0.5"
                    : "bg-bg border-border-theme text-text-dim/60 shadow-sm"
                )}
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
