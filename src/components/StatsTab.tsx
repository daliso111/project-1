import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';
import { User } from 'firebase/auth';
import { SessionResult } from '../constants';
import { DailyGoals } from './DailyGoals';
import { HistoryChart } from './HistoryChart';
import { ExerciseWpmChart } from './ExerciseWpmChart';
import { LessonAverageChart } from './LessonAverageChart';
import { BadgeGrid } from './BadgeGrid';
import { KeyboardHeatmap } from './KeyboardHeatmap';

interface StatsTabProps {
  streak: number;
  personalBest: number;
  history: SessionResult[];
  user: User;
  unlockedIds: string[];
  missedKeys: Record<string, number>;
}

export function StatsTab({
  streak,
  personalBest,
  history,
  user,
  unlockedIds,
  missedKeys,
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ExerciseWpmChart history={history} />
            <LessonAverageChart history={history} />
          </div>

          <HistoryChart history={history} />
          <BadgeGrid unlockedIds={unlockedIds} />
          <KeyboardHeatmap missedKeys={missedKeys} />
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
