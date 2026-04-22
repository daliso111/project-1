import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SessionResult } from '../constants';

interface ExerciseWpmChartProps {
  history: SessionResult[];
}

export function ExerciseWpmChart({ history }: ExerciseWpmChartProps) {
  // Find the most recent session with level/lesson info to determine the context
  const recentLessonSession = [...history].reverse().find(s => s.level && s.lessonNum);

  if (!recentLessonSession) return null;

  const currentLevel = recentLessonSession.level;
  const currentDifficulty = recentLessonSession.difficulty;

  // Filter history for this specific level and difficulty
  const levelHistory = history.filter(s => s.level === currentLevel && s.difficulty === currentDifficulty);

  // Prepare all 15 points
  const data = [];
  for (let l = 1; l <= 5; l++) {
    for (let e = 1; e <= 3; e++) {
      // Find the best session for this exercise
      const exercises = levelHistory.filter(s => s.lessonNum === l && s.exerciseNum === e);
      const bestWpm = exercises.length > 0 ? Math.max(...exercises.map(s => s.wpm)) : null;

      data.push({
        name: `L${l}-E${e}`,
        wpm: bestWpm,
      });
    }
  }

  return (
    <div className="h-72 w-full bg-surface border border-border-theme rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider">Exercise Progression</h3>
          <p className="text-[10px] text-text-dim/60 font-medium">
            {currentDifficulty} • {currentLevel?.replace('level', 'Level ')}
          </p>
        </div>
        <span className="text-[11px] text-text-dim/60 font-medium tracking-tight">All 15 Exercises</span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis
            dataKey="name"
            fontSize={9}
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
            cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="wpm"
            stroke="#3b82f6"
            strokeWidth={2}
            connectNulls
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.wpm === null) return null;
              return <circle cx={cx} cy={cy} r={3} fill="#3b82f6" />;
            }}
            activeDot={{ r: 5, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
