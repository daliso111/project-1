import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { SessionResult } from '../constants';

interface HistoryChartProps {
  history: SessionResult[];
}

export function HistoryChart({ history }: HistoryChartProps) {
  const data = history.slice(-10).map((session, index) => ({
    name: index + 1,
    wpm: session.wpm,
    accuracy: session.accuracy
  }));

  if (history.length === 0) return null;

  return (
    <div className="h-64 w-full bg-surface border border-border-theme rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider">WPM Progression</h3>
        <span className="text-[11px] text-text-dim/60 font-medium tracking-tight">Last 10 sessions</span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis 
            dataKey="name" 
            hide
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
          />
          <Line 
            type="monotone" 
            dataKey="wpm" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={{ fill: '#3b82f6', r: 3 }} 
            activeDot={{ r: 5, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
