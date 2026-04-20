import { motion } from 'motion/react';
import { Lock, CheckCircle, PlayCircle, Trophy } from 'lucide-react';
import { UserProgress, isLevelUnlocked, PASS_THRESHOLDS, DifficultyKey } from '../services/progressService';
import { cn } from '../lib/utils';

interface LearningPathProps {
  progress: UserProgress | null;
  isLoading: boolean;
  onStartLesson: (difficulty: DifficultyKey, level: 'level1' | 'level2' | 'level3', lesson: number) => void;
  onStartTest: (difficulty: DifficultyKey, level: 'level1' | 'level2' | 'level3') => void;
}

const DIFFICULTIES: { key: DifficultyKey; label: string; color: string }[] = [
  { key: 'beginner', label: 'Beginner', color: 'text-accent-green' },
  { key: 'intermediate', label: 'Intermediate', color: 'text-accent-blue' },
  { key: 'advanced', label: 'Advanced', color: 'text-accent-red' }
];

const LEVELS = ['level1', 'level2', 'level3'] as const;

export function LearningPath({ progress, isLoading, onStartLesson, onStartTest }: LearningPathProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface border border-border-theme rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-border-theme rounded w-1/4 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-32 bg-border-theme rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="space-y-8">
      {DIFFICULTIES.map((diff) => (
        <div key={diff.key} className="space-y-4">
          <h2 className={cn("text-[13px] font-black uppercase tracking-widest", diff.color)}>
            {diff.label}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LEVELS.map((level, levelIndex) => {
              const unlocked = isLevelUnlocked(progress, diff.key, level);
              const levelProgress = progress[diff.key][level];
              const threshold = PASS_THRESHOLDS[diff.key];

              return (
                <motion.div
                  key={level}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: levelIndex * 0.1 }}
                  className={cn(
                    "bg-surface border rounded-xl p-5 space-y-4",
                    unlocked ? "border-border-theme" : "border-border-theme opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-text-dim">
                      Level {levelIndex + 1}
                    </span>
                    {!unlocked ? (
                      <Lock size={14} className="text-text-dim" />
                    ) : levelProgress.testPassed ? (
                      <CheckCircle size={14} className="text-accent-green" />
                    ) : null}
                  </div>

                  {/* Lessons */}
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((lessonNum) => {
                      const completed = lessonNum <= levelProgress.lessonsCompleted;
                      return (
                        <button
                          key={lessonNum}
                          disabled={!unlocked}
                          onClick={() => onStartLesson(diff.key, level, lessonNum)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                            !unlocked && "cursor-not-allowed",
                            unlocked && completed && "bg-accent-green/10 text-accent-green",
                            unlocked && !completed && "hover:bg-bg text-text-dim hover:text-text-main"
                          )}
                        >
                          {completed ? (
                            <CheckCircle size={12} className="text-accent-green shrink-0" />
                          ) : (
                            <PlayCircle size={12} className="text-text-dim shrink-0" />
                          )}
                          <span className="text-[11px] font-bold">Lesson {lessonNum}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Test button */}
                  {unlocked && levelProgress.lessonsCompleted >= 5 && (
                    <button
                      onClick={() => onStartTest(diff.key, level)}
                      className={cn(
                        "w-full py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                        levelProgress.testPassed
                          ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                          : "bg-accent-blue text-white hover:brightness-110"
                      )}
                    >
                      <Trophy size={12} />
                      {levelProgress.testPassed
                        ? `Passed ${levelProgress.testWpm} WPM`
                        : `Take Test (${threshold.wpm} WPM)`}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
