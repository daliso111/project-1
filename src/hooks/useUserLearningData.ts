import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { SessionResult } from '../constants';
import { Lesson, LessonKey, getLessons } from '../services/lessonService';
import { UserProgress, getUserProgress } from '../services/progressService';

export function useUserLearningData(user: User | null) {
  const [history, setHistory] = useState<SessionResult[]>([]);
  const [lessons, setLessons] = useState<Record<LessonKey, Lesson> | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setLessons(null);
      setUserProgress(null);
      setProgressLoading(true);
      setLessonsLoading(true);
      return;
    }

    const savedHistory = localStorage.getItem(`swifttype_history_${user.uid}`);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory) as SessionResult[];
        const normalizedHistory = normalizeHistory(parsedHistory);
        setHistory(normalizedHistory);
        localStorage.setItem(`swifttype_history_${user.uid}`, JSON.stringify(normalizedHistory));
      } catch {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }

    setLessonsLoading(true);
    getLessons()
      .then(setLessons)
      .catch(console.error)
      .finally(() => setLessonsLoading(false));

    setProgressLoading(true);
    getUserProgress(user.uid)
      .then(setUserProgress)
      .catch(console.error)
      .finally(() => setProgressLoading(false));
  }, [user]);

  const refreshUserProgress = useCallback(async () => {
    if (!user) return;

    try {
      const latestProgress = await getUserProgress(user.uid);
      setUserProgress(latestProgress);
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  const persistHistory = useCallback((nextHistory: SessionResult[]) => {
    const normalizedHistory = normalizeHistory(nextHistory);
    setHistory(normalizedHistory);

    if (user) {
      localStorage.setItem(`swifttype_history_${user.uid}`, JSON.stringify(normalizedHistory));
    }
  }, [user]);

  return {
    history,
    setHistory,
    persistHistory,
    lessons,
    userProgress,
    setUserProgress,
    refreshUserProgress,
    progressLoading,
    lessonsLoading,
  };
}

function normalizeHistory(history: SessionResult[]) {
  const sortedHistory = [...history].sort(
    (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
  );

  return sortedHistory.filter((session, index, sessions) => {
    if (index === 0) return true;

    const previous = sessions[index - 1];
    const timeGap = Math.abs(new Date(session.date).getTime() - new Date(previous.date).getTime());
    const looksDuplicated =
      timeGap < 5000 &&
      session.wpm === previous.wpm &&
      session.accuracy === previous.accuracy &&
      session.errors === previous.errors &&
      session.timeTaken === previous.timeTaken &&
      session.mode === previous.mode &&
      session.difficulty === previous.difficulty &&
      session.lessonContext?.difficulty === previous.lessonContext?.difficulty &&
      session.lessonContext?.level === previous.lessonContext?.level &&
      session.lessonContext?.lessonNum === previous.lessonContext?.lessonNum &&
      session.lessonContext?.exerciseNum === previous.lessonContext?.exerciseNum;

    return !looksDuplicated;
  });
}
