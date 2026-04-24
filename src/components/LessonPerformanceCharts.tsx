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

  const lessonAverageData = buildLessonAverageData(lessonResults);
  const hasAverageData = lessonAverageData.some(
    (point) => point.averageWpm !== null || point.partialAverageWpm !== null
  );

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border-theme rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[13px] font-semibold text-text-dim uppercase tracking-wider">
              Lesson Average WPM
            </h3>
            <p className="text-[11px] text-text-dim/60 mt-1">
              {formatTrackLabel(currentTrack)} average of all 3 exercises per lesson
            </p>
          </div>
          <span className="text-[11px] text-text-dim/60 font-medium tracking-tight">
            5 lessons
          </span>
        </div>
        {hasAverageData ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lessonAverageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={0}
                tickMargin={12}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={getLessonAverageDomain(lessonAverageData)}
              />
              <Tooltip
                content={<LessonAverageTooltip />}
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
              <Line
                type="monotone"
                dataKey="partialAverageWpm"
                stroke="transparent"
                dot={<IncompleteLessonDot />}
                activeDot={false}
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
    const partialAverageWpm =
      exerciseBest.size > 0 && exerciseBest.size < EXERCISES_PER_LESSON
        ? Math.round(
            Array.from(exerciseBest.values()).reduce((sum, value) => sum + value, 0) /
              exerciseBest.size
          )
        : null;

    return {
      label: `Lesson ${lessonNum}`,
      averageWpm,
      partialAverageWpm,
      completedExercises: exerciseBest.size,
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

function getLessonAverageDomain(
  data: Array<{ averageWpm: number | null; partialAverageWpm?: number | null }>
) {
  const values = data.flatMap((point) =>
    [point.averageWpm, point.partialAverageWpm].filter(
      (value): value is number => value !== null && value !== undefined
    )
  );

  if (values.length === 0) {
    return [0, 50];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  return [Math.max(0, min - 5), max + 5];
}

function LessonAverageTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: {
      averageWpm: number | null;
      partialAverageWpm?: number | null;
      completedExercises: number;
    };
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload as
    | {
        averageWpm: number | null;
        partialAverageWpm?: number | null;
        completedExercises: number;
      }
    | undefined;

  if (!point) {
    return null;
  }

  const isComplete = point.averageWpm !== null;
  const displayValue = isComplete ? point.averageWpm : point.partialAverageWpm;

  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        border: '1px solid #334155',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '10px 12px',
      }}
    >
      <div style={{ fontSize: '12px', color: '#f8fafc', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '12px', color: '#f8fafc', marginTop: 4 }}>
        {isComplete
          ? `${displayValue} WPM average`
          : displayValue !== null && displayValue !== undefined
            ? `${displayValue} WPM partial average`
            : 'No exercises recorded'}
      </div>
      {!isComplete && (
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 4 }}>
          {point.completedExercises}/3 exercises completed
        </div>
      )}
    </div>
  );
}

function IncompleteLessonDot(props: any) {
  const { cx, cy, payload } = props;

  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    payload?.averageWpm !== null ||
    payload?.partialAverageWpm === null ||
    payload?.partialAverageWpm === undefined
  ) {
    return null;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#0f172a" stroke="#22c55e" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={2} fill="#22c55e" />
    </g>
  );
}
