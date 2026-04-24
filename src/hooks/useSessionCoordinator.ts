import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Difficulty, LessonLevelKey, PracticeMode, SessionResult, TimeLimit } from '../constants';
import {
  DifficultyKey,
  completeExercise,
  markTutorialAsWatched,
  updateLevelProgress,
  PASS_THRESHOLDS,
} from '../services/progressService';
import { getLessonText } from '../services/contentService';
import { SessionEndReason } from './useTypingEngine';
import { useUserLearningData } from './useUserLearningData';

const EXERCISES_PER_LESSON = 3;

type ActiveTab = 'practice' | 'stats' | 'learn';
type ActiveLesson = {
  difficulty: DifficultyKey;
  level: LessonLevelKey;
  lessonNum: number;
  exerciseNum: number;
} | null;

type ActiveTest = {
  difficulty: DifficultyKey;
  level: LessonLevelKey;
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
  activeTest: ActiveTest;
  setActiveTest: (test: ActiveTest) => void;
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
  loadText: (nextText: string) => void;
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
  activeTest,
  setActiveTest,
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
  loadText,
}: UseSessionCoordinatorArgs) {
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  const [isAdvancingExercise, setIsAdvancingExercise] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);

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

    if (hasProcessedFinishedSessionRef.current) return;
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
      codeSessions: nextHistory.filter((s) => s.mode === 'Code').length,
    });

    if (user) {
      void saveUserStats(user.uid, wpm, accuracy);
    }

    if (activeTest && user) {
      const threshold = PASS_THRESHOLDS[activeTest.difficulty];
      const passed = wpm >= threshold.wpm && accuracy >= threshold.accuracy;

      if (passed) {
        updateLevelProgress(user.uid, activeTest.difficulty, activeTest.level, {
          testPassed: true,
          testWpm: wpm,
          testAccuracy: accuracy,
        })
          .then(async () => {
            await refreshUserProgress();
            setActiveTest(null);
            setShowLessonComplete(true);
          })
          .catch(console.error);
      } else {
        setActiveTest(null);
      }
      return;
    }

    if (activeLesson && user) {
      setIsAdvancingExercise(true);
      completeExercise(
        user.uid,
        activeLesson.difficulty,
        activeLesson.level,
        activeLesson.lessonNum
      )
        .then(async ({ nextExerciseNumber }) => {
          await refreshUserProgress();

          const isLastExercise = activeLesson.exerciseNum >= EXERCISES_PER_LESSON;

          if (isLastExercise) {
            setIsAdvancingExercise(false);
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
            loadText(nextText);
          }
          setIsAdvancingExercise(false);
        })
        .catch((error) => {
          setIsAdvancingExercise(false);
          console.error(error);
        });
    }
  }, [
    activeLesson,
    activeTest,
    accuracy,
    checkBadges,
    difficulty,
    errors,
    isFinished,
    loadText,
    missedKeys,
    mode,
    playComplete,
    persistHistory,
    refreshUserProgress,
    reset,
    setActiveLesson,
    setActiveTest,
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
      if (isCorrect) playCorrect();
      else playError();
    }
    handleInput(value);
  };

  const handleStartLesson = (
    nextDifficulty: DifficultyKey,
    level: LessonLevelKey,
    lesson: number
  ) => {
    const currentProgress = userProgress?.[nextDifficulty]?.[level];
    const completedExercises = currentProgress?.lessonExercises?.[lesson] ?? 0;
    const exerciseNumber = Math.min(completedExercises + 1, 3);

    setActiveLesson({
      difficulty: nextDifficulty,
      level,
      lessonNum: lesson,
      exerciseNum: exerciseNumber,
    });
    setActiveTab('practice');
    setDifficulty(toDisplayDifficulty(nextDifficulty));
    setIsAdvancingExercise(true);

    getLessonText(nextDifficulty, level, lesson, exerciseNumber)
      .then((nextText) => {
        console.log('Supabase text fetched:', nextText, 'for exercise:', exerciseNumber);
        if (!nextText) {
          console.warn('No text found in Supabase for:', nextDifficulty, level, lesson, exerciseNumber);
          setIsAdvancingExercise(false);
          return;
        }
        setLessonText(nextText);
        setCustomText(nextText);
        setMode('Custom');
        loadText(nextText);
        setIsAdvancingExercise(false);
      })
      .catch((error) => {
        setIsAdvancingExercise(false);
        console.error(error);
      });
  };

  const handleStartTest = (
    nextDifficulty: DifficultyKey,
    level: LessonLevelKey
  ) => {
    setActiveLesson(null);
    setActiveTest({ difficulty: nextDifficulty, level });
    setActiveTab('practice');
    setDifficulty(toDisplayDifficulty(nextDifficulty));
    setIsAdvancingExercise(true);

    getLessonText(nextDifficulty, level, 0, 1)
      .then((testText) => {
        if (testText) {
          setCustomText(testText);
          setLessonText(testText);
          setMode('Custom');
          loadText(testText);
        } else {
          console.warn('No test text found in Supabase, falling back to Time Attack');
          setMode('Time Attack');
        }
        setIsAdvancingExercise(false);
      })
      .catch((error) => {
        console.error('Error fetching test text:', error);
        setMode('Time Attack');
        setIsAdvancingExercise(false);
      });
  };

  return {
    history,
    lessons,
    userProgress,
    progressLoading,
    lessonsLoading,
    showLessonComplete,
    setShowLessonComplete,
    showKeyboard,
    setShowKeyboard,
    isAdvancingExercise,
    personalBest,
    focusInput,
    onInputChange,
    handleStartLesson,
    handleStartTest,
    handleWatchTutorial: async (diff: DifficultyKey, level: LessonLevelKey) => {
      if (user) {
        await markTutorialAsWatched(user.uid, diff, level);
        await refreshUserProgress();
      }
    },
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
