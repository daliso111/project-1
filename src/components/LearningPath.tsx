import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, CheckCircle, PlayCircle, Trophy, BookOpen } from 'lucide-react';
import { UserProgress, isLevelUnlocked, PASS_THRESHOLDS, DifficultyKey } from '../services/progressService';
import { LessonKey, Lesson } from '../services/lessonService';
import { LessonLevelKey } from '../constants';
import { cn } from '../lib/utils';

interface LearningPathProps {
  progress: UserProgress | null;
  lessons: Record<LessonKey, Record<LessonLevelKey, Lesson>> | null;
  isLoading: boolean;
  onStartLesson: (difficulty: DifficultyKey, level: 'level1' | 'level2' | 'level3', lesson: number) => void;
  onStartTest: (difficulty: DifficultyKey, level: 'level1' | 'level2' | 'level3') => void;
  onWatchTutorial: (difficulty: DifficultyKey, level: 'level1' | 'level2' | 'level3') => void;
}

const DIFFICULTIES: { key: DifficultyKey; label: string; color: string; activeClass: string }[] = [
  { key: 'beginner', label: 'Beginner', color: 'text-accent-green', activeClass: 'bg-accent-green text-white' },
  { key: 'intermediate', label: 'Intermediate', color: 'text-accent-blue', activeClass: 'bg-accent-blue text-white' },
  { key: 'advanced', label: 'Advanced', color: 'text-accent-red', activeClass: 'bg-accent-red text-white' }
];

const LEVELS = ['level1', 'level2', 'level3'] as const;

function ProgressRing({ exercises, total = 3, size = 64, color = '#3b82f6' }: {
  exercises: number;
  total?: number;
  size?: number;
  color?: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = exercises / total;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-border-theme"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

export function LearningPath({ progress, lessons, isLoading, onStartLesson, onStartTest, onWatchTutorial }: LearningPathProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyKey>('beginner');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 w-28 bg-surface border border-border-theme rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-surface border border-border-theme rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!progress) return null;

  const diff = DIFFICULTIES.find(d => d.key === selectedDifficulty)!;

  return (
    <div className="space-y-8">

      {/* Difficulty Selector */}
      <div className="flex gap-3 justify-center">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.key}
            onClick={() => setSelectedDifficulty(d.key)}
            className={cn(
              "px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all border",
              selectedDifficulty === d.key
                ? d.activeClass + " border-transparent"
                : "bg-surface border-border-theme " + d.color
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Levels for selected difficulty */}
      <div className="space-y-4">
        <h2 className={cn("text-[13px] font-black uppercase tracking-widest text-center", diff.color)}>
          {diff.label} Path
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LEVELS.map((level, levelIndex) => {
            const unlocked = isLevelUnlocked(progress, selectedDifficulty, level);
            const levelProgress = progress[selectedDifficulty][level];
            const threshold = PASS_THRESHOLDS[selectedDifficulty];

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

                {/* Tutorial Button */}
                <div className="flex flex-col items-center gap-2">
                  {unlocked && lessons?.[selectedDifficulty]?.[level] ? (
                    <a
                      href={lessons[selectedDifficulty][level].videoUrl || '#'}
                      onClick={() => onWatchTutorial(selectedDifficulty, level)}
                      target={lessons[selectedDifficulty][level].videoUrl ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className={cn(
                        "w-full py-3.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                        lessons[selectedDifficulty][level].videoUrl
                          ? !levelProgress.tutorialWatched
                            ? "bg-accent-amber text-bg border-accent-amber hover:brightness-110 animate-pulse-subtle"
                            : "bg-accent-amber/10 text-accent-amber border-accent-amber/30 hover:bg-accent-amber/20"
                          : "bg-surface border-border-theme text-text-dim cursor-not-allowed opacity-50"
                      )}
                    >
                      <BookOpen size={16} />
                      {lessons[selectedDifficulty][level].videoUrl
                        ? !levelProgress.tutorialWatched
                          ? 'START HERE: WATCH TUTORIAL'
                          : 'Tutorial Watched'
                        : 'No Tutorial'}
                    </a>
                  ) : (
                    <div className="w-full py-3.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-border-theme bg-surface text-text-dim opacity-50">
                      <Lock size={16} />
                      [Tutorial Locked]
                    </div>
                  )}

                  {/* Connecting line to first lesson */}
                  <div className={cn(
                    "w-0.5 h-6",
                    levelProgress.tutorialWatched ? "bg-accent-green" : "bg-border-theme"
                  )} />
                </div>

                {/* Lessons as circular nodes */}
                <div className="flex flex-col items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lessonNum) => {
                    const completed = lessonNum <= levelProgress.lessonsCompleted;
                    const isCurrent = lessonNum === levelProgress.lessonsCompleted + 1;
                    const isAccessible = unlocked && levelProgress.tutorialWatched && (completed || isCurrent);

                    return (
                      <div key={lessonNum} className="flex flex-col items-center">
                        <button
                          disabled={!isAccessible}
                          onClick={() => onStartLesson(selectedDifficulty, level, lessonNum)}
                          className={cn(
                            "w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all relative",
                            !unlocked && "cursor-not-allowed opacity-40",
                            unlocked && completed && "bg-accent-green/20 text-accent-green",
                            unlocked && isCurrent && "bg-accent-blue/20 text-accent-blue cursor-pointer",
                            unlocked && !completed && !isCurrent && "bg-surface text-text-dim opacity-40 cursor-not-allowed"
                          )}
                        >
                          {/* Progress ring */}
                          {unlocked && !completed && (
                            <ProgressRing
                              exercises={levelProgress.lessonExercises?.[lessonNum] ?? 0}
                              total={3}
                              size={64}
                              color={isCurrent ? '#3b82f6' : '#374151'}
                            />
                          )}
                          {unlocked && completed && (
                            <ProgressRing exercises={3} total={3} size={64} color="#22c55e" />
                          )}

                          {/* Icon */}
                          <div className="relative z-10 flex flex-col items-center">
                            {!unlocked ? (
                              <Lock size={18} className="text-text-dim" />
                            ) : completed ? (
                              <CheckCircle size={18} className="text-accent-green" />
                            ) : (
                              <>
                                <PlayCircle size={18} />
                                <span className="text-[9px] font-black mt-0.5">{lessonNum}</span>
                              </>
                            )}
                          </div>
                        </button>

                        {/* Connecting line between nodes */}
                        {lessonNum < 5 && (
                          <div className={cn(
                            "w-0.5 h-4",
                            completed ? "bg-accent-green" : "bg-border-theme"
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Test button */}
                {unlocked && levelProgress.lessonsCompleted >= 5 && (
                  <button
                    onClick={() => onStartTest(selectedDifficulty, level)}
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
    </div>
  );
}
