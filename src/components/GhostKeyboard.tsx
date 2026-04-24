import React from 'react';
import { cn } from '../lib/utils';

interface GhostKeyboardProps {
  nextChar?: string;
}

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export function GhostKeyboard({ nextChar }: GhostKeyboardProps) {
  const char = nextChar?.toLowerCase();

  return (
    <div className="flex flex-col gap-1.5 items-center opacity-60 pointer-events-none select-none">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {row.map((key) => (
            <div
              key={key}
              className={cn(
                "w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-bold transition-all",
                char === key
                  ? "bg-accent-blue border-accent-blue text-white scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  : "bg-surface border-border-theme text-text-dim"
              )}
            >
              {key.toUpperCase()}
            </div>
          ))}
        </div>
      ))}
      <div className="flex gap-1.5 mt-1.5">
        <div
          className={cn(
            "w-48 h-9 rounded-lg border flex items-center justify-center text-[10px] font-bold transition-all",
            char === ' '
              ? "bg-accent-blue border-accent-blue text-white scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              : "bg-surface border-border-theme text-text-dim/50"
          )}
        >
          SPACE
        </div>
      </div>
    </div>
  );
}
