import { Lesson } from '../services/lessonService';
import { PlayCircle, BookOpen } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson | null;
  isLoading: boolean;
}

export function LessonCard({ lesson, isLoading }: LessonCardProps) {
  if (isLoading) {
    return (
      <div className="bg-surface border border-border-theme rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-border-theme rounded w-1/3 mb-3" />
        <div className="h-3 bg-border-theme rounded w-2/3" />
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="bg-surface border border-border-theme rounded-xl p-6 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-accent-blue/10 rounded-xl border border-accent-blue/20">
          <BookOpen size={20} className="text-accent-blue" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1">
            {lesson.level} lesson
          </p>
          <p className="text-[14px] font-bold text-text-main">{lesson.title}</p>
          <p className="text-[11px] text-text-dim mt-0.5">{lesson.description}</p>
        </div>
      </div>

      {lesson.videoUrl ? (
        <a
          href={lesson.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-xl font-bold text-[12px] uppercase tracking-wider hover:brightness-110 transition-all whitespace-nowrap"
        >
          <PlayCircle size={16} />
          Watch Lesson
        </a>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-theme text-text-dim rounded-xl font-bold text-[12px] uppercase tracking-wider whitespace-nowrap">
          <PlayCircle size={16} />
          Coming Soon
        </div>
      )}
    </div>
  );
}
