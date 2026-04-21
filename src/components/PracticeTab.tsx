import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { PracticeMode, Difficulty } from '../constants';
import { cn, formatTime } from '../lib/utils';
import { Lesson } from '../services/lessonService';
import { LessonKey } from '../services/lessonService';

interface PracticeTabProps {
  mode: PracticeMode;
  effectiveDifficulty: Difficulty;
  timeLimit: number;
  wpm: number;
  accuracy: number;
  timeLeft: number;
  errors: number;
  text: string;
  userInput: string;
  isStarted: boolean;
  isFinished: boolean;
  handleInput: (val: string) => void;
  reset: (sameText?: boolean) => void;
  lessons: Record<LessonKey, Lesson> | null;
  lessonsLoading: boolean;
  onCustomTextClick: () => void;
}

export function PracticeTab({
  mode,
  effectiveDifficulty,
  timeLimit,
  wpm,
  accuracy,
  timeLeft,
  errors,
  text,
  userInput,
  isStarted,
  isFinished,
  handleInput,
  reset,
  lessons,
  lessonsLoading,
  onCustomTextClick,
}: PracticeTabProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      <LessonCard
        lesson={lessons ? lessons[effectiveDifficulty.toLowerCase() as LessonKey] ?? null : null}
        isLoading={lessonsLoading}
      />
      
      {/* Stats Row */}
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

      {/* Typing Canvas */}
      <div 
        className="relative group cursor-text"
        onClick={focusInput}
      >
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 opacity-0 pointer-events-none"
          autoFocus
          value={userInput}
          onChange={(e) => handleInput(e.target.value)}
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
                    "typing-char",
                    status === 'correct' && "text-text-main",
                    status === 'incorrect' && "text-accent-red bg-accent-red/20 underline",
                    status === 'pending' && "text-text-dim"
                  )}
                >
                  {isCursor && <span className="cursor" />}
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {!isStarted && !isFinished && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-2xl">
            <motion.p 
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-text-dim font-medium"
            >
              Start typing to begin...
            </motion.p>
          </div>
        )}
      </div>

      {/* Action Bar */}
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

// Extracted from App.tsx - keeping inline for now to avoid circular dependency
function LessonCard({ lesson, isLoading }: { lesson: Lesson | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-border-theme p-6 rounded-xl shadow-sm animate-pulse">
        <div className="h-4 bg-bg rounded w-1/3 mb-4" />
        <div className="h-3 bg-bg rounded w-1/2 mb-2" />
        <div className="h-3 bg-bg rounded w-2/3" />
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="bg-surface border border-border-theme p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-text-main mb-2">{lesson.title}</h3>
      <p className="text-text-dim text-sm">{lesson.description}</p>
    </div>
  );
}
