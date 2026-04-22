import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, RotateCcw, BarChart3 } from 'lucide-react';
import { PracticeMode, TimeLimit } from '../constants';
import { SessionEndReason } from '../hooks/useTypingEngine';

interface ResultsModalProps {
  isFinished: boolean;
  wpm: number;
  accuracy: number;
  errors: number;
  mode: PracticeMode;
  timeLimit: TimeLimit;
  timeLeft: number;
  timeElapsed: number;
  punctMode: boolean;
  sessionEndReason: SessionEndReason | null;
  reset: (tryAgain?: boolean) => void;
  setActiveTab: (tab: 'practice' | 'stats' | 'learn') => void;
}

export function ResultsModal({
  isFinished,
  wpm,
  accuracy,
  errors,
  mode,
  timeLimit,
  timeLeft,
  timeElapsed,
  punctMode,
  sessionEndReason,
  reset,
  setActiveTab,
}: ResultsModalProps) {
  return (
    <AnimatePresence>
      {isFinished && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-surface border border-border-theme rounded-2xl p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-accent-blue" />

            <div className="text-center mb-10">
              <p className="text-text-dim font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Session Complete</p>
              <h2 className="text-3xl font-black tracking-tight text-text-main">Practice Summary</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="text-center p-6 bg-bg/50 rounded-xl border border-border-theme">
                <p className="text-text-dim font-bold uppercase tracking-wider text-[10px] mb-1">Words Per Minute</p>
                <p className="text-4xl font-black text-accent-green leading-none">{wpm}</p>
              </div>
              <div className="text-center p-6 bg-bg/50 rounded-xl border border-border-theme">
                <p className="text-text-dim font-bold uppercase tracking-wider text-[10px] mb-1">Accuracy</p>
                <p className="text-4xl font-black text-accent-blue leading-none">{accuracy}%</p>
              </div>
            </div>

            <div className="space-y-4 mb-10 text-[13px]">
              <div className="flex justify-between items-center px-2">
                <span className="text-text-dim font-medium">Errors</span>
                <span className="font-bold text-accent-red px-2 py-0.5 bg-accent-red/10 rounded">{errors}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-text-dim font-medium">Time Taken</span>
                <span className="font-bold text-text-main">{Math.round(mode === 'Time Attack' ? timeLimit - timeLeft : timeElapsed)}s</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-text-dim font-medium">Mode</span>
                <span className="font-bold text-text-main uppercase tracking-widest text-[11px]">{mode} {punctMode && '+ Punct'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {sessionEndReason === 'completed' ? (
                <>
                  <div className="flex-1 space-y-2">
                    <button
                      onClick={() => reset(false)}
                      className="w-full py-4 bg-accent-blue text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      Continue
                    </button>
                    <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">↵ Enter</p>
                  </div>

                  <div className="flex-1 space-y-2">
                    <button
                      onClick={() => reset(true)}
                      className="w-full py-4 bg-transparent border-2 border-accent-blue/30 text-accent-blue rounded-xl font-bold uppercase tracking-widest hover:bg-accent-blue/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Try Again
                    </button>
                    <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">⇥ Tab</p>
                  </div>

                  <div className="flex-1 space-y-2">
                    <button
                      onClick={() => {
                        reset();
                        setActiveTab('stats');
                      }}
                      className="w-full py-4 bg-transparent text-text-dim/60 rounded-xl font-bold uppercase tracking-widest hover:text-text-main active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={18} />
                      View Stats
                    </button>
                    <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">S Key</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 space-y-2">
                    <button
                      onClick={() => reset(false)}
                      className="w-full py-4 bg-accent-blue text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Try Again
                    </button>
                    <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">↵ Enter or ⇥ Tab</p>
                  </div>

                  <div className="flex-1 space-y-2">
                    <button
                      onClick={() => {
                        reset();
                        setActiveTab('stats');
                      }}
                      className="w-full py-4 bg-transparent border-2 border-border-theme text-text-dim rounded-xl font-bold uppercase tracking-widest hover:text-text-main hover:border-text-dim/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={18} />
                      View Stats
                    </button>
                    <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">S Key</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
