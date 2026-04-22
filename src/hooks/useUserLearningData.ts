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
        setHistory(JSON.parse(savedHistory) as SessionResult[]);
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
    setHistory(nextHistory);

    if (user) {
      localStorage.setItem(`swifttype_history_${user.uid}`, JSON.stringify(nextHistory));
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
