import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { SessionResult } from '../constants';

interface DailyGoalsProps {
  history: SessionResult[];
}

export function DailyGoals({ history }: DailyGoalsProps) {
  const [goals, setGoals] = useState({
    targetWpm: Number(localStorage.getItem('swifttype_goal_wpm')) || 50,
    targetSessions: Number(localStorage.getItem('swifttype_goal_sessions')) || 5
  });

  const today = new Date().toDateString();
  const sessionsToday = history.filter(s => new Date(s.date).toDateString() === today);
  const maxWpmToday = sessionsToday.reduce((max, s) => Math.max(max, s.wpm), 0);

  const wpmProgress = Math.min(100, Math.round((maxWpmToday / goals.targetWpm) * 100));
  const sessionProgress = Math.min(100, Math.round((sessionsToday.length / goals.targetSessions) * 100));

  const updateGoal = (key: 'targetWpm' | 'targetSessions', value: string) => {
    const num = parseInt(value) || 0;
    const newGoals = { ...goals, [key]: num };
    setGoals(newGoals);
    localStorage.setItem(`swifttype_goal_${key === 'targetWpm' ? 'wpm' : 'sessions'}`, num.toString());
  };

  return (
    <div className="bg-surface border border-border-theme p-6 rounded-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider">Daily Goals</h3>
        <span className="text-[11px] text-text-dim/60 font-medium">{today}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* WPM Goal */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-dim uppercase">Target WPM</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={goals.targetWpm} 
                  onChange={(e) => updateGoal('targetWpm', e.target.value)}
                  className="bg-bg border border-border-theme rounded px-2 py-1 text-sm w-16 focus:border-accent-blue outline-none"
                />
                {maxWpmToday >= goals.targetWpm && <CheckCircle2 size={16} className="text-accent-green" />}
              </div>
            </div>
            <span className="text-[11px] font-mono text-text-dim">{maxWpmToday} / {goals.targetWpm}</span>
          </div>
          <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-blue transition-all duration-1000" 
              style={{ width: `${wpmProgress}%` }}
            />
          </div>
          {maxWpmToday >= goals.targetWpm && (
             <p className="text-[10px] text-accent-green font-bold uppercase animate-pulse">✅ Goal Met: Speedster!</p>
          )}
        </div>

        {/* Session Goal */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-dim uppercase">Daily Sessions</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={goals.targetSessions} 
                  onChange={(e) => updateGoal('targetSessions', e.target.value)}
                  className="bg-bg border border-border-theme rounded px-2 py-1 text-sm w-16 focus:border-accent-blue outline-none"
                />
                {sessionsToday.length >= goals.targetSessions && <CheckCircle2 size={16} className="text-accent-green" />}
              </div>
            </div>
            <span className="text-[11px] font-mono text-text-dim">{sessionsToday.length} / {goals.targetSessions}</span>
          </div>
          <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-green transition-all duration-1000" 
              style={{ width: `${sessionProgress}%` }}
            />
          </div>
          {sessionsToday.length >= goals.targetSessions && (
             <p className="text-[10px] text-accent-green font-bold uppercase animate-pulse">✅ Goal Met: Consistent!</p>
          )}
        </div>
      </div>
    </div>
  );
}
