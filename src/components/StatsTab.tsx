import React, { Suspense, lazy } from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';
import { User } from 'firebase/auth';
import { LessonDifficultyKey, LessonLevelKey, SessionResult } from '../constants';
import { DailyGoals } from './DailyGoals';
import { BadgeGrid } from './BadgeGrid';

const LessonPerformanceCharts = lazy(() =>
  import('./LessonPerformanceCharts').then((module) => ({
    default: module.LessonPerformanceCharts,
  }))
);
const KeyboardHeatmap = lazy(() =>
  import('./KeyboardHeatmap').then((module) => ({ default: module.KeyboardHeatmap }))
);

interface StatsTabProps {
  streak: number;
  personalBest: number;
  history: SessionResult[];
  user: User;
  unlockedIds: string[];
  missedKeys: Record<string, number>;
  activeLesson?: {
    difficulty: LessonDifficultyKey;
    level: LessonLevelKey;
  } | null;
}

export function StatsTab({
  streak,
  personalBest,
  history,
  user,
  unlockedIds,
  missedKeys,
  activeLesson,
}: StatsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="stat-card flex flex-row items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-text-dim uppercase tracking-widest">Current Streak</p>
                <p className="text-4xl font-black text-accent-red flex items-center gap-2">
                  {streak} <Flame className="fill-accent-red/10" size={24} />
                </p>
              </div>
              <div className="p-3 bg-bg rounded-xl border border-border-theme">
                <Trophy size={20} className="text-text-dim" />
              </div>
            </div>
            <div className="stat-card flex flex-row items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-text-dim uppercase tracking-widest">All-Time Best</p>
                <p className="text-4xl font-black text-accent-blue">{personalBest}</p>
              </div>
              <div className="p-3 bg-bg rounded-xl border border-border-theme text-text-dim">
                <Zap size={20} strokeWidth={3} />
              </div>
            </div>
          </div>

          <DailyGoals history={history} userId={user.uid} />
          <Suspense fallback={<StatsPanelFallback className="h-80" />}>
            <LessonPerformanceCharts history={history} activeLesson={activeLesson} />
          </Suspense>
          <BadgeGrid unlockedIds={unlockedIds} />
          <Suspense fallback={<StatsPanelFallback className="h-56" />}>
            <KeyboardHeatmap missedKeys={missedKeys} />
          </Suspense>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface border border-border-theme p-6 rounded-xl shadow-sm">
            <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-4">Recent Sessions</div>
            <div className="space-y-4">
              {history.slice(-8).reverse().map((session) => (
                <div key={session.id} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-text-main">{session.mode}</span>
                    <span className="text-[10px] text-text-dim">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-text-main text-[13px]">{session.wpm} WPM</span>
                    <p className="text-[10px] text-text-dim">{session.accuracy}% Acc</p>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-center text-text-dim py-10 italic text-[13px]">No history yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsPanelFallbackProps {
  className: string;
}

function StatsPanelFallback({ className }: StatsPanelFallbackProps) {
  return (
    <div className={`bg-surface border border-border-theme rounded-xl p-6 animate-pulse ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="h-4 w-40 rounded bg-bg/80" />
        <div className="h-3 w-24 rounded bg-bg/60" />
      </div>
      <div className="h-[calc(100%-2.5rem)] rounded-lg bg-bg/50" />
    </div>
  );
}
