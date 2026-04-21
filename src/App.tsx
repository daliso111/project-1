import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db, auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { ProfileSetup } from './components/ProfileSetup';
import { Difficulty, PracticeMode, TimeLimit, SessionResult } from './constants';
import { useTypingEngine, MissedKey } from './hooks/useTypingEngine';
import { CustomTextModal } from './components/CustomTextModal';
import { CODE_SNIPPETS } from './codeSnippets';
import { Toaster } from 'react-hot-toast';
import { useStreak } from './hooks/useStreak';
import { useBadges } from './hooks/useBadges';
import { useTheme } from './contexts/ThemeContext';
import { THEMES } from './themes';
import { useSounds } from './hooks/useSounds';
import { useAdaptiveDifficulty } from './hooks/useAdaptiveDifficulty';
import { getLessons, Lesson, LessonKey } from './services/lessonService';
import { LearningPath } from './components/LearningPath';
import { getUserProgress, updateLevelProgress, UserProgress, DifficultyKey } from './services/progressService';
import { Header } from './components/Header';
import { PracticeTab } from './components/PracticeTab';
import { StatsTab } from './components/StatsTab';
import { ResultsModal } from './components/ResultsModal';

export const isLoggingInRef = { current: false };

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isProfilePending, setIsProfilePending] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('signup');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const isLoggingOut = useRef(false);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (isLoggingInRef.current || isInitialLoad.current) {
          setUser(currentUser);
          setIsProfilePending(!currentUser.displayName);
          isLoggingInRef.current = false;
        }
      } else {
        if (isLoggingOut.current) {
          setUser(null);
          setIsProfilePending(false);
          isLoggingOut.current = false;
        }
      }
      setIsAuthChecking(false);
      isInitialLoad.current = false;
    });

    // Fallback to ensure we don't get stuck in auth checking state
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Persistence
  const [history, setHistory] = useState<SessionResult[]>([]);

  const { theme, setTheme } = useTheme();
  const { isMuted, setIsMuted, playCorrect, playError, playComplete } = useSounds();
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Settings
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [mode, setMode] = useState<PracticeMode>('Time Attack');
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(60);
  const [activeTab, setActiveTab] = useState<'practice' | 'stats' | 'learn'>('learn');

  // Adaptive Difficulty logic
  const adaptedLevel = useAdaptiveDifficulty(history);
  const effectiveDifficulty = difficulty === 'Adaptive' ? adaptedLevel : difficulty;

  // New Modes States
  const [punctMode, setPunctMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [customText, setCustomText] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [lessons, setLessons] = useState<Record<LessonKey, Lesson> | null>(null);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);


  const { streak, updateStreak } = useStreak(user?.uid);
  const { unlockedIds, checkBadges } = useBadges(user?.uid);

  const saveUserStats = async (wpm: number, accuracy: number) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          wpm,
          accuracy,
          lastUpdated: new Date()
        });
        console.log('Stats saved successfully');
      } catch (e) {
        console.error('Error saving stats:', e);
      }
    }
  };

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
    timeElapsed
  } = useTypingEngine(mode, effectiveDifficulty, timeLimit, selectedLanguage, punctMode, customText);

  useEffect(() => {
    if (isFinished) {
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
        missedKeys
      };
      const newHistory = [...history, result];
      setHistory(newHistory);
      if (user) {
        localStorage.setItem(`swifttype_history_${user.uid}`, JSON.stringify(newHistory));
      }
      
      // Update streak and check achievements
      updateStreak();
      
      const today = new Date().toDateString();
      const codeSessions = newHistory.filter(s => s.mode === 'Code').length;
      
      checkBadges({
        wpm,
        accuracy,
        streak: streak + 1, // Current session increments streak
        codeSessions
      });

      // Save stats to Firestore
      saveUserStats(wpm, accuracy);
    }
  }, [isFinished]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setLessonsLoading(true);
      getLessons()
        .then(setLessons)
        .catch(console.error)
        .finally(() => setLessonsLoading(false));

      setProgressLoading(true);
      getUserProgress(currentUser.uid)
        .then(setUserProgress)
        .catch(console.error)
        .finally(() => setProgressLoading(false));
    } else if (user) {
      setLessonsLoading(true);
      getLessons()
        .then(setLessons)
        .catch(console.error)
        .finally(() => setLessonsLoading(false));
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFinished) return;

      if (sessionEndReason === 'completed') {
        if (e.key === 'Enter') {
          e.preventDefault();
          reset(false); // Continue: new text
        } else if (e.key === 'Tab') {
          e.preventDefault();
          reset(true); // Try Again: same text
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          reset();
          setActiveTab('stats');
        }
      } else if (sessionEndReason === 'timeout') {
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          reset(false); // Try Again: fresh prompt
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          reset();
          setActiveTab('stats');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, reset, sessionEndReason]);

  const personalBest = history.reduce((max, s) => Math.max(max, s.wpm), 0);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleStartLesson = (difficulty: DifficultyKey, level: 'level1' | 'level2' | 'level3', lesson: number) => {
    setActiveTab('practice');
    setDifficulty(difficulty.charAt(0).toUpperCase() + difficulty.slice(1) as any);
  };

  const handleStartTest = (difficulty: DifficultyKey, level: 'level1' | 'level2' | 'level3') => {
    setActiveTab('practice');
    setDifficulty(difficulty.charAt(0).toUpperCase() + difficulty.slice(1) as any);
  };

  const handleLogout = async () => {
    try {
      isLoggingOut.current = true;
      setHistory([]);
      setIsZenMode(false);
      await signOut(auth);
      // Explicitly clear local state in case the observer doesn't fire (e.g., if already signed out)
      setUser(null);
      setIsProfilePending(false);
      isLoggingOut.current = false;
    } catch (e) {
      console.error('Logout error:', e);
      isLoggingOut.current = false;
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user || isProfilePending) {
    return (
      <div className="min-h-screen bg-bg transition-colors duration-300">
        <header className="fixed top-0 w-full z-50 px-10 py-6 flex justify-between items-center border-b border-border-theme bg-bg/80 backdrop-blur-md">
          <div className="flex items-center gap-2 cursor-default">
            <div className="text-2xl font-extrabold tracking-tighter text-text-main">
              Type<span className="text-accent-blue">Flow</span>
            </div>
          </div>
        </header>
        <main className="container mx-auto max-w-[900px] pt-40 pb-20 px-6">
          {isProfilePending && user ? (
            <ProfileSetup user={user} onComplete={() => setIsProfilePending(false)} />
          ) : authView === 'login' ? (
            <Login onSwitchToSignup={() => setAuthView('signup')} />
          ) : (
            <Signup onSwitchToLogin={() => setAuthView('login')} />
          )}
        </main>
        <Toaster />
      </div>
    );
  }

  const onInputChange = (val: string) => {
    if (val.length > userInput.length) {
      const isCorrect = val[val.length - 1] === text[val.length - 1];
      if (isCorrect) playCorrect();
      else playError();
    }
    handleInput(val);
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Header
        user={user}
        streak={streak}
        mode={mode}
        setMode={(m) => {
          if (m === 'Custom') setIsCustomModalOpen(true);
          setMode(m);
        }}
        timeLimit={timeLimit}
        setTimeLimit={setTimeLimit}
        difficulty={difficulty}
        adaptedLevel={adaptedLevel}
        setDifficulty={setDifficulty}
        punctMode={punctMode}
        setPunctMode={setPunctMode}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        theme={theme}
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isStarted={isStarted}
        isFinished={isFinished}
      />

      <main className="container mx-auto max-w-[900px] pt-40 pb-20 px-6">
        {activeTab === 'learn' ? (
          <LearningPath
            progress={userProgress}
            isLoading={progressLoading}
            onStartLesson={handleStartLesson}
            onStartTest={handleStartTest}
          />
        ) : activeTab === 'practice' ? (
          <PracticeTab
            mode={mode}
            effectiveDifficulty={effectiveDifficulty}
            timeLimit={timeLimit}
            wpm={wpm}
            accuracy={accuracy}
            timeLeft={timeLeft}
            errors={errors}
            text={text}
            userInput={userInput}
            isStarted={isStarted}
            isFinished={isFinished}
            handleInput={onInputChange}
            reset={reset}
            lessons={lessons}
            lessonsLoading={lessonsLoading}
            onCustomTextClick={() => setIsCustomModalOpen(true)}
          />
        ) : (
          <StatsTab
            history={history}
            streak={streak}
            personalBest={personalBest}
            unlockedIds={unlockedIds}
            missedKeys={missedKeys}
            userId={user?.uid}
          />
        )}
      </main>

      <CustomTextModal 
        isOpen={isCustomModalOpen} 
        onClose={() => setIsCustomModalOpen(false)} 
        onConfirm={(text) => {
          setCustomText(text);
          setMode('Custom');
        }} 
      />

      <Toaster />

      <ResultsModal
        isFinished={isFinished}
        sessionEndReason={sessionEndReason}
        wpm={wpm}
        accuracy={accuracy}
        errors={errors}
        timeElapsed={timeElapsed}
        timeLeft={timeLeft}
        mode={mode}
        punctMode={punctMode}
        reset={reset}
        setActiveTab={setActiveTab}
      />

      <footer className="fixed bottom-0 w-full px-8 py-4 flex items-center justify-center pointer-events-none opacity-20">
        <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-text-dim">
          geometric balance &middot; typeflow precision
        </p>
      </footer>
    </div>
  );
}
