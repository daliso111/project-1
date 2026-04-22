import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { SessionResult } from '../constants';

interface LessonAverageChartProps {
  history: SessionResult[];
}

export function LessonAverageChart({ history }: LessonAverageChartProps) {
  // Find the most recent session with level/lesson info to determine the context
  const recentLessonSession = [...history].reverse().find(s => s.level && s.lessonNum);

  if (!recentLessonSession) return null;

  const currentLevel = recentLessonSession.level;
  const currentDifficulty = recentLessonSession.difficulty;

  // Filter history for this specific level and difficulty
  const levelHistory = history.filter(s => s.level === currentLevel && s.difficulty === currentDifficulty);

  // Prepare averages for all 5 lessons
  const data = [];
  for (let l = 1; l <= 5; l++) {
    const lessonSessions = levelHistory.filter(s => s.lessonNum === l);
    const averageWpm = lessonSessions.length > 0
      ? Math.round(lessonSessions.reduce((acc, s) => acc + s.wpm, 0) / lessonSessions.length)
      : 0;

    data.push({
      name: `Lesson ${l}`,
      wpm: averageWpm,
    });
  }

  return (
    <div className="h-72 w-full bg-surface border border-border-theme rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider">Lesson Averages</h3>
          <p className="text-[10px] text-text-dim/60 font-medium">
            {currentDifficulty} • {currentLevel?.replace('level', 'Level ')}
          </p>
        </div>
        <span className="text-[11px] text-text-dim/60 font-medium tracking-tight">WPM per Lesson</span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis
            dataKey="name"
            fontSize={10}
            tick={{ fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ fontSize: '12px', color: '#f8fafc' }}
            cursor={{ fill: '#ffffff0a' }}
          />
          <Bar dataKey="wpm" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.wpm > 0 ? '#10b981' : '#334155'}
                fillOpacity={entry.wpm > 0 ? 0.8 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
