import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  LessonDifficultyKey,
  LessonLevelKey,
  SessionResult,
} from '../constants';

interface LessonPerformanceChartsProps {
  history: SessionResult[];
  activeLesson?: {
    difficulty: LessonDifficultyKey;
    level: LessonLevelKey;
  } | null;
}

const TOTAL_LESSONS = 5;
const EXERCISES_PER_LESSON = 3;

export function LessonPerformanceCharts({
  history,
  activeLesson,
}: LessonPerformanceChartsProps) {
  const currentTrack = activeLesson ?? getMostRecentLessonTrack(history);

  if (!currentTrack) {
    return (
      <EmptyChartState message="Complete lesson exercises to unlock lesson-based WPM charts." />
    );
  }

  const lessonResults = history.filter((session) => {
    const context = session.lessonContext;
    return (
      context &&
      context.difficulty === currentTrack.difficulty &&
      context.level === currentTrack.level
    );
  });

  const exerciseChartData = buildExerciseChartData(lessonResults);
  const lessonAverageData = buildLessonAverageData(lessonResults);
  const hasLessonData = exerciseChartData.some((point) => point.wpm !== null);
  const hasAverageData = lessonAverageData.some((point) => point.averageWpm !== null);

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border-theme rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider">
              Exercise WPM
            </h3>
            <p className="text-[11px] text-text-dim/60 mt-1">
              {formatTrackLabel(currentTrack)} exercise-by-exercise speed
            </p>
          </div>
          <span className="text-[11px] text-text-dim/60 font-medium tracking-tight">
            Up to 15 exercises
          </span>
        </div>
        {hasLessonData ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={exerciseChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{ fontSize: '12px', color: '#f8fafc' }}
                formatter={(value: number | null) => (value === null ? 'Not done' : `${value} WPM`)}
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
        ) : (
          <EmptyPanelMessage message="No lesson exercise speeds recorded for this level yet." />
        )}
      </div>

      <div className="bg-surface border border-border-theme rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider">
              Lesson Average WPM
            </h3>
            <p className="text-[11px] text-text-dim/60 mt-1">
              Average of all 3 exercises per lesson
            </p>
          </div>
          <span className="text-[11px] text-text-dim/60 font-medium tracking-tight">
            Incomplete lessons stay empty
          </span>
        </div>
        {hasAverageData ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lessonAverageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{ fontSize: '12px', color: '#f8fafc' }}
                formatter={(value: number | null) => (value === null ? 'Incomplete lesson' : `${value} WPM avg`)}
              />
              <Line
                type="monotone"
                dataKey="averageWpm"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 4 }}
                activeDot={{ r: 6, fill: '#22c55e' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyPanelMessage message="Lesson averages appear after all 3 exercises of a lesson are completed." />
        )}
      </div>
    </div>
  );
}

function buildExerciseChartData(history: SessionResult[]) {
  const bestResults = new Map<string, number>();

  history.forEach((session) => {
    const context = session.lessonContext;
    if (!context) return;

    const key = `${context.lessonNum}-${context.exerciseNum}`;
    const current = bestResults.get(key) ?? 0;
    bestResults.set(key, Math.max(current, session.wpm));
  });

  return Array.from({ length: TOTAL_LESSONS * EXERCISES_PER_LESSON }, (_, index) => {
    const lessonNum = Math.floor(index / EXERCISES_PER_LESSON) + 1;
    const exerciseNum = (index % EXERCISES_PER_LESSON) + 1;
    const key = `${lessonNum}-${exerciseNum}`;

    return {
      label: `L${lessonNum}-E${exerciseNum}`,
      wpm: bestResults.get(key) ?? null,
    };
  });
}

function buildLessonAverageData(history: SessionResult[]) {
  return Array.from({ length: TOTAL_LESSONS }, (_, index) => {
    const lessonNum = index + 1;
    const lessonSessions = history.filter(
      (session) => session.lessonContext?.lessonNum === lessonNum
    );
    const exerciseBest = new Map<number, number>();

    lessonSessions.forEach((session) => {
      const exerciseNum = session.lessonContext?.exerciseNum;
      if (!exerciseNum) return;

      const current = exerciseBest.get(exerciseNum) ?? 0;
      exerciseBest.set(exerciseNum, Math.max(current, session.wpm));
    });

    const averageWpm =
      exerciseBest.size === EXERCISES_PER_LESSON
        ? Math.round(
            Array.from(exerciseBest.values()).reduce((sum, value) => sum + value, 0) /
              EXERCISES_PER_LESSON
          )
        : null;

    return {
      label: `Lesson ${lessonNum}`,
      averageWpm,
    };
  });
}

function getMostRecentLessonTrack(history: SessionResult[]) {
  const latestLessonSession = [...history]
    .reverse()
    .find((session) => session.lessonContext);

  if (!latestLessonSession?.lessonContext) {
    return null;
  }

  return {
    difficulty: latestLessonSession.lessonContext.difficulty,
    level: latestLessonSession.lessonContext.level,
  };
}

function formatTrackLabel(track: {
  difficulty: LessonDifficultyKey;
  level: LessonLevelKey;
}) {
  const difficultyLabel =
    track.difficulty.charAt(0).toUpperCase() + track.difficulty.slice(1);
  const levelLabel = track.level.replace('level', 'Level ');

  return `${difficultyLabel} ${levelLabel}`;
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="bg-surface border border-border-theme rounded-xl p-8 text-center">
      <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider mb-3">
        Lesson WPM Charts
      </h3>
      <p className="text-[13px] text-text-dim">{message}</p>
    </div>
  );
}

function EmptyPanelMessage({ message }: { message: string }) {
  return <p className="text-[13px] text-text-dim py-16 text-center">{message}</p>;
}
