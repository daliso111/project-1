import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

import { Difficulty } from '../constants';
import { cn, formatTime } from '../lib/utils';

interface PracticeTabProps {
  effectiveDifficulty: Difficulty;
  wpm: number;
  accuracy: number;
  timeLeft: number;
  errors: number;
  userInput: string;
  isFinished: boolean;
  text: string;
  onInputChange: (val: string) => void;
  focusInput: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isStarted: boolean;
  reset: (tryAgain?: boolean) => void;
  isAdvancingExercise?: boolean;
  showKeyboard: boolean;
  nextChar?: string;
}

export function PracticeTab({
  effectiveDifficulty,
  wpm,
  accuracy,
  timeLeft,
  errors,
  userInput,
  isFinished,
  text,
  onInputChange,
  focusInput,
  inputRef,
  isStarted,
  reset,
  isAdvancingExercise = false,
  showKeyboard,
  nextChar,
}: PracticeTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2">WPM</div>
          <div className="text-3xl font-bold font-mono text-accent-green">{wpm}</div>
        </div>
        <div className="stat-card">
          <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2">Accuracy</div>
          <div className="text-3xl font-bold font-mono">{accuracy}%</div>
        </div>
        <div className="stat-card">
          <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2">Timer</div>
          <div className="text-3xl font-bold font-mono">{formatTime(timeLeft)}</div>
        </div>
        <div className="stat-card">
          <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2">Errors</div>
          <div className="text-3xl font-bold font-mono text-accent-red">{errors}</div>
        </div>
      </div>

      <div className="relative group cursor-text" onClick={focusInput}>
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 opacity-0 pointer-events-none"
          autoFocus
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isFinished}
        />

        <div className="typing-canvas" onClick={focusInput}>
          <div className="text-[26px] font-mono leading-relaxed text-text-dim select-none relative whitespace-pre-wrap">
            {text.split('').map((char, index) => {
              let status = 'pending';
              if (index < userInput.length) {
                status = userInput[index] === char ? 'correct' : 'incorrect';
              }
              const isCursor = index === userInput.length;

              return (
                <span
                  key={index}
                  className={cn(
                    'typing-char',
                    status === 'correct' && 'text-text-main',
                    status === 'incorrect' && 'text-accent-red bg-accent-red/20 underline',
                    status === 'pending' && 'text-text-dim'
                  )}
                >
                  {isCursor && <span className="cursor" />}
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {isAdvancingExercise && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-bg/80 backdrop-blur-sm border border-border-theme">
            <motion.p
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ repeat: Infinity, duration: 1.1 }}
              className="text-text-main font-semibold"
            >
              Loading next exercise...
            </motion.p>
          </div>
        )}

        {!isStarted && !isFinished && !isAdvancingExercise && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center pointer-events-none">
            <motion.p
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-text-dim text-[13px] font-medium"
            >
              Start typing to begin...
            </motion.p>
          </div>
        )}
      </div>

      {showKeyboard && (
        <GhostKeyboard nextChar={nextChar} />
      )}

      <div className="flex justify-center pt-4">
        <button
          onClick={() => reset()}
          className="btn-toggle flex items-center gap-2 px-8 py-3 !text-text-main hover:border-accent-blue/50"
        >
          <RotateCcw size={16} />
          Reset (Tab)
        </button>
      </div>
    </div>
  );
}
