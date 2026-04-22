import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy } from 'lucide-react';

interface LessonCompleteModalProps {
  isOpen: boolean;
  onBackToLearningPath: () => void;
}

export function LessonCompleteModal({
  isOpen,
  onBackToLearningPath,
}: LessonCompleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-bg/95 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-surface border border-border-theme rounded-3xl p-10 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={40} className="text-accent-green" />
            </div>
            <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">Lesson Complete!</h2>
            <p className="text-text-dim mb-8 font-medium leading-relaxed">
              You've mastered all the exercises in this lesson. Your progress has been saved.
            </p>
            <button
              onClick={onBackToLearningPath}
              className="w-full py-4 bg-accent-blue text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
            >
              Back to Learning Path
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
