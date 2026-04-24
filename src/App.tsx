import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Difficulty, PracticeMode, TimeLimit } from './constants';
import { useTypingEngine } from './hooks/useTypingEngine';
import { useStreak } from './hooks/useStreak';
import { useBadges } from './hooks/useBadges';
import { useTheme } from './contexts/ThemeContext';
import { useSounds } from './hooks/useSounds';
import { useAdaptiveDifficulty } from './hooks/useAdaptiveDifficulty';
import { useAuthSession } from './hooks/useAuthSession';
import { DifficultyKey } from './services/progressService';
import { AuthGate } from './components/AuthGate';
import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { ResultsModal } from './components/ResultsModal';
import { CustomTextModal } from './components/CustomTextModal';
import { LessonCompleteModal } from './components/LessonCompleteModal';
import { useSessionCoordinator } from './hooks/useSessionCoordinator';

const LearningPath = lazy(() =>
  import('./components/LearningPath').then((module) => ({ default: module.LearningPath }))
);
const PracticeTab = lazy(() =>
  import('./components/PracticeTab').then((module) => ({ default: module.PracticeTab }))
);
const StatsTab = lazy(() =>
  import('./components/StatsTab').then((module) => ({ default: module.StatsTab }))
);

type ActiveTab = 'practice' | 'stats' | 'learn';
type ActiveLesson = {
  difficulty: DifficultyKey;
  level: 'level1' | 'level2' | 'level3';
  lessonNum: number;
  exerciseNum: number;
} | null;

type ActiveTest = {
  difficulty: DifficultyKey;
  level: 'level1' | 'level2' | 'level3';
} | null;

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isProfilePending, isAuthChecking, setIsProfilePending, handleLogout } = useAuthSession();

  const { theme, setTheme } = useTheme();
  const { isMuted, setIsMuted, volume, setVolume, playCorrect, playError, playComplete } = useSounds();

  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [mode, setMode] = useState<PracticeMode>('Time Attack');
  const [timeLimit] = useState<TimeLimit>(60);
  const [activeTab, setActiveTab] = useState<ActiveTab>('learn');
  const [activeLesson, setActiveLesson] = useState<ActiveLesson>(null);
  const [activeTest, setActiveTest] = useState<ActiveTest>(null);
  const [lessonText, setLessonText] = useState<string | null>(null);
  const [punctMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [customText, setCustomText] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab !== 'practice') {
      setLessonText(null);
      setActiveLesson(null);
      setActiveTest(null);
    }
  }, [activeTab]);

  const { streak, updateStreak } = useStreak(user?.uid);
  const { unlockedIds, checkBadges } = useBadges(user?.uid);

  const {
    text,
    userInput,
    isStarted,
    isFinished,
    sessionEndReason,
    timeLeft,
    wpm,
    accuracy,
    errors,
    missedKeys,
    handleInput,
    reset,
    loadText,
    timeElapsed,
  } = useTypingEngine(mode, difficulty, timeLimit, selectedLanguage, punctMode, customText);

  const {
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
    handleWatchTutorial,
    setHistory,
    isAdvancingExercise,
  } = useSessionCoordinator({
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
    isStarted,
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
  });

  const adaptedLevel = useAdaptiveDifficulty(history);
  const effectiveDifficulty = difficulty === 'Adaptive' ? adaptedLevel : difficulty;
  const headerActiveTab =
    activeTab === 'practice' && activeLesson ? 'learn' : activeTab;
  const headerMode =
    activeTab === 'practice' && activeLesson ? 'Word Sprint' : mode;
  const latestSessionMissedKeys = history.length > 0 ? history[history.length - 1].missedKeys : missedKeys;

  return (
    <>
      <AuthGate
        user={user}
        isAuthChecking={isAuthChecking}
        isProfilePending={isProfilePending}
        onProfileComplete={() => setIsProfilePending(false)}
      >
        <AppShell
          header={
            user && (
              <Header
                streak={streak}
                isStarted={isStarted}
                isFinished={isFinished}
                mode={headerMode}
                setMode={setMode}
                setIsCustomModalOpen={setIsCustomModalOpen}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                volume={volume}
                setVolume={setVolume}
                theme={theme}
                setTheme={setTheme}
                activeTab={headerActiveTab}
                setActiveTab={setActiveTab}
                user={user}
                handleLogout={() => handleLogout(() => setHistory([]))}
              />
            )
          }
        >
          <Suspense fallback={<TabSectionFallback />}>
            {user && activeTab === 'learn' && (
              <LearningPath
                progress={userProgress}
                lessons={lessons}
                isLoading={progressLoading}
                onStartLesson={handleStartLesson}
                onStartTest={handleStartTest}
                onWatchTutorial={handleWatchTutorial}
              />
            )}

            {user && activeTab === 'practice' && (
              <PracticeTab
                effectiveDifficulty={effectiveDifficulty}
                wpm={wpm}
                accuracy={accuracy}
                timeLeft={timeLeft}
                errors={errors}
                userInput={userInput}
                isFinished={isFinished}
                text={text}
                onInputChange={onInputChange}
                focusInput={focusInput}
                inputRef={inputRef}
                isStarted={isStarted}
                reset={reset}
                isAdvancingExercise={isAdvancingExercise}
              />
            )}

            {user && activeTab === 'stats' && (
              <StatsTab
                streak={streak}
                personalBest={personalBest}
                history={history}
                user={user}
                unlockedIds={unlockedIds}
                missedKeys={latestSessionMissedKeys}
                activeLesson={
                  activeLesson
                    ? {
                        difficulty: activeLesson.difficulty,
                        level: activeLesson.level,
                      }
                    : null
                }
              />
            )}
          </Suspense>
        </AppShell>

        <CustomTextModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onConfirm={(nextText) => {
            setCustomText(nextText);
            setMode('Custom');
          }}
        />

        <LessonCompleteModal
          isOpen={showLessonComplete}
          onBackToLearningPath={() => {
            setShowLessonComplete(false);
            setActiveTab('learn');
          }}
        />

        <ResultsModal
          isFinished={isFinished}
          wpm={wpm}
          accuracy={accuracy}
          errors={errors}
          mode={mode}
          timeLimit={timeLimit}
          timeLeft={timeLeft}
          timeElapsed={timeElapsed}
          punctMode={punctMode}
          sessionEndReason={sessionEndReason}
          reset={reset}
          setActiveTab={setActiveTab}
        />
      </AuthGate>
      <Toaster />
    </>
  );
}

function TabSectionFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-2xl border border-border-theme bg-surface/60" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl border border-border-theme bg-surface/60" />
        ))}
      </div>
      <div className="h-80 rounded-2xl border border-border-theme bg-surface/60" />
    </div>
  );
}
