import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Difficulty, LessonLevelKey, PracticeMode, SessionResult, TimeLimit } from '../constants';
import {
  DifficultyKey,
  completeExercise,
} from '../services/progressService';
import { getLessonText } from '../services/contentService';
import { SessionEndReason } from './useTypingEngine';
import { useUserLearningData } from './useUserLearningData';

type ActiveTab = 'practice' | 'stats' | 'learn';
type ActiveLesson = {
  difficulty: DifficultyKey;
  level: LessonLevelKey;
  lessonNum: number;
  exerciseNum: number;
} | null;

interface UseSessionCoordinatorArgs {
  user: User | null;
  inputRef: RefObject<HTMLInputElement | null>;
  mode: PracticeMode;
  difficulty: Difficulty;
  timeLimit: TimeLimit;
  timeLeft: number;
  timeElapsed: number;
  wpm: number;
  accuracy: number;
  errors: number;
  missedKeys: Record<string, number>;
  text: string;
  userInput: string;
  isStarted: boolean;
  isFinished: boolean;
  sessionEndReason: SessionEndReason | null;
  activeLesson: ActiveLesson;
  setActiveLesson: (lesson: ActiveLesson) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setMode: (mode: PracticeMode) => void;
  setCustomText: (text: string) => void;
  setLessonText: (text: string | null) => void;
  playCorrect: () => void;
  playError: () => void;
  playComplete: () => void;
  updateStreak: () => void;
  streak: number;
  checkBadges: (stats: {
    wpm: number;
    accuracy: number;
    streak: number;
    codeSessions: number;
  }) => void;
  handleInput: (value: string) => void;
  reset: (keepText?: boolean) => void;
}

export function useSessionCoordinator({
  user,
  inputRef,
  mode,
  difficulty,
  timeLimit,
  timeLeft,
  timeElapsed,
  wpm,
  accuracy,
  errors,
  missedKeys,
  text,
  userInput,
  isFinished,
  sessionEndReason,
  activeLesson,
  setActiveLesson,
  setActiveTab,
  setDifficulty,
  setMode,
  setCustomText,
  setLessonText,
  playCorrect,
  playError,
  playComplete,
  updateStreak,
  streak,
  checkBadges,
  handleInput,
  reset,
}: UseSessionCoordinatorArgs) {
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  const {
    history,
    setHistory,
    persistHistory,
    lessons,
    userProgress,
    refreshUserProgress,
    progressLoading,
    lessonsLoading,
  } = useUserLearningData(user);

  const historyRef = useRef(history);
  const hasProcessedFinishedSessionRef = useRef(false);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    if (!isFinished) {
      hasProcessedFinishedSessionRef.current = false;
      return;
    }

    if (hasProcessedFinishedSessionRef.current) {
      return;
    }

    hasProcessedFinishedSessionRef.current = true;

    playComplete();

    const result: SessionResult = {
      id: Date.now().toString(),
      wpm,
      accuracy,
      errors,
      timeTaken: mode === 'Time Attack' ? timeLimit - timeLeft : timeElapsed,
      mode,
      difficulty,
      date: new Date().toISOString(),
      missedKeys,
      lessonContext: activeLesson
        ? {
            difficulty: activeLesson.difficulty,
            level: activeLesson.level,
            lessonNum: activeLesson.lessonNum,
            exerciseNum: activeLesson.exerciseNum,
          }
        : undefined,
    };

    const nextHistory = [...historyRef.current, result];
    persistHistory(nextHistory);

    updateStreak();

    checkBadges({
      wpm,
      accuracy,
      streak: streak + 1,
      codeSessions: nextHistory.filter((session) => session.mode === 'Code').length,
    });

    if (user) {
      void saveUserStats(user.uid, wpm, accuracy);
    }

    if (activeLesson && user) {
      completeExercise(
        user.uid,
        activeLesson.difficulty,
        activeLesson.level,
        activeLesson.lessonNum
      )
        .then(async ({ lessonCompleted, nextExerciseNumber }) => {
          await refreshUserProgress();

          if (lessonCompleted) {
            setShowLessonComplete(true);
            setActiveLesson(null);
            return;
          }

          const nextText = await getLessonText(
            activeLesson.difficulty,
            activeLesson.level,
            activeLesson.lessonNum,
            nextExerciseNumber
          );

          if (nextText) {
            setCustomText(nextText);
            setLessonText(nextText);
            setActiveLesson({
              difficulty: activeLesson.difficulty,
              level: activeLesson.level,
              lessonNum: activeLesson.lessonNum,
              exerciseNum: nextExerciseNumber,
            });
            setMode('Custom');
            reset(true);
          }
        })
        .catch(console.error);
    }
  }, [
    activeLesson,
    accuracy,
    checkBadges,
    difficulty,
    errors,
    isFinished,
    missedKeys,
    mode,
    playComplete,
    persistHistory,
    refreshUserProgress,
    reset,
    setActiveLesson,
    setMode,
    streak,
    timeElapsed,
    timeLeft,
    timeLimit,
    updateStreak,
    user,
    wpm,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFinished) return;

      if (sessionEndReason === 'completed') {
        if (event.key === 'Enter') {
          event.preventDefault();
          reset(false);
        } else if (event.key === 'Tab') {
          event.preventDefault();
          reset(true);
        } else if (event.key.toLowerCase() === 's') {
          event.preventDefault();
          reset();
          setActiveTab('stats');
        }
      } else if (sessionEndReason === 'timeout') {
        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault();
          reset(false);
        } else if (event.key.toLowerCase() === 's') {
          event.preventDefault();
          reset();
          setActiveTab('stats');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, reset, sessionEndReason, setActiveTab]);

  const personalBest = useMemo(
    () => history.reduce((max, session) => Math.max(max, session.wpm), 0),
    [history]
  );

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const onInputChange = (value: string) => {
    if (value.length > userInput.length) {
      const isCorrect = value[value.length - 1] === text[value.length - 1];
      if (isCorrect) {
        playCorrect();
      } else {
        playError();
      }
    }

    handleInput(value);
  };

  const handleStartLesson = (
    nextDifficulty: DifficultyKey,
    level: LessonLevelKey,
    lesson: number
  ) => {
    const currentProgress = userProgress?.[nextDifficulty]?.[level];
    const exerciseNumber = (currentProgress?.lessonExercises?.[lesson] ?? 0) + 1;

    setActiveLesson({
      difficulty: nextDifficulty,
      level,
      lessonNum: lesson,
      exerciseNum: Math.min(exerciseNumber, 3),
    });
    setActiveTab('practice');
    setDifficulty(toDisplayDifficulty(nextDifficulty));

    getLessonText(nextDifficulty, level, lesson, Math.min(exerciseNumber, 3))
      .then((nextText) => {
        if (!nextText) return;
        setLessonText(nextText);
        setCustomText(nextText);
        setMode('Custom');
      })
      .catch(console.error);
  };

  const handleStartTest = (
    nextDifficulty: DifficultyKey,
    _level: LessonLevelKey
  ) => {
    setActiveLesson(null);
    setActiveTab('practice');
    setDifficulty(toDisplayDifficulty(nextDifficulty));
    setMode('Time Attack');
  };

  return {
    history,
    lessons,
    userProgress,
    progressLoading,
    lessonsLoading,
    showLessonComplete,
    setShowLessonComplete,
    personalBest,
    focusInput,
    onInputChange,
    handleStartLesson,
    handleStartTest,
    setHistory,
  };
}

async function saveUserStats(userId: string, wpm: number, accuracy: number) {
  try {
    await setDoc(doc(db, 'users', userId), {
      wpm,
      accuracy,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

function toDisplayDifficulty(difficulty: DifficultyKey): Difficulty {
  return `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}` as Difficulty;
}
