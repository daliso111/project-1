import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './firebase'; // This imports the file you just created
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { ProfileSetup } from './components/ProfileSetup';
import { 
  Trophy, 
} from 'lucide-react';
import { Difficulty, PracticeMode, TimeLimit, SessionResult } from './constants';
import { useTypingEngine } from './hooks/useTypingEngine';
import { CustomTextModal } from './components/CustomTextModal';
import { Toaster } from 'react-hot-toast';
import { useStreak } from './hooks/useStreak';
import { useBadges } from './hooks/useBadges';
import { useTheme } from './contexts/ThemeContext';
import { useSounds } from './hooks/useSounds';
import { useAdaptiveDifficulty } from './hooks/useAdaptiveDifficulty';
import { getLessons, Lesson, LessonKey } from './services/lessonService';
import { LearningPath } from './components/LearningPath';
import { getUserProgress, UserProgress, DifficultyKey, completeExercise } from './services/progressService';
import { getLessonText } from './services/contentService';

// New Components
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
  const { isMuted, setIsMuted, volume, setVolume, playCorrect, playError, playComplete } = useSounds();

  // Settings
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [mode, setMode] = useState<PracticeMode>('Time Attack');
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(60);
  const [activeTab, setActiveTab] = useState<'practice' | 'stats' | 'learn'>('learn');
  const [activeLesson, setActiveLesson] = useState<{
    difficulty: DifficultyKey;
    level: 'level1' | 'level2' | 'level3';
    lessonNum: number;
  } | null>(null);
  const [lessonText, setLessonText] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'practice') {
      setLessonText(null);
    }
  }, [activeTab]);

  // Adaptive Difficulty logic
  const adaptedLevel = useAdaptiveDifficulty(history);
  const effectiveDifficulty = difficulty === 'Adaptive' ? adaptedLevel : difficulty;

  // New Modes States
  const [punctMode, setPunctMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [customText, setCustomText] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [lessons, setLessons] = useState<Record<LessonKey, Lesson> | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [showLessonComplete, setShowLessonComplete] = useState(false);


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
  } = useTypingEngine(mode, effectiveDifficulty, timeLimit, selectedLanguage, punctMode, customText, lessonText || undefined);

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

      if (activeLesson && user) {
        completeExercise(
          user.uid,
          activeLesson.difficulty,
          activeLesson.level,
          activeLesson.lessonNum
        ).then(({ lessonCompleted, allLessonsCompleted }) => {
          getUserProgress(user.uid).then(setUserProgress);
          if (lessonCompleted) {
            setShowLessonComplete(true);
            setActiveLesson(null);
          } else {
            // Fetch next exercise text
            const currentProgress = userProgress?.[activeLesson.difficulty]?.[activeLesson.level];
            const nextExercise = (currentProgress?.lessonExercises?.[activeLesson.lessonNum] ?? 0) + 1;
            getLessonText(
              activeLesson.difficulty,
              activeLesson.level,
              activeLesson.lessonNum,
              Math.min(nextExercise, 3)
            ).then((text) => {
              if (text) {
                setCustomText(text);
              }
            });
          }
        }).catch(console.error);
      }
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

      setProgressLoading(true);
      getUserProgress(user.uid)
        .then(setUserProgress)
        .catch(console.error)
        .finally(() => setProgressLoading(false));
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

  const handleStartLesson = async (difficulty: DifficultyKey, level: 'level1' | 'level2' | 'level3', lesson: number) => {
    const currentProgress = userProgress?.[difficulty]?.[level];
    const exerciseNumber = Math.min((currentProgress?.lessonExercises?.[lesson] ?? 0) + 1, 3);

    try {
      const text = await getLessonText(difficulty, level, lesson, exerciseNumber);
      if (text) {
        setCustomText(text);
        setLessonText(text);
        setMode('Custom');
        setActiveLesson({ difficulty, level, lessonNum: lesson });
        setDifficulty(difficulty.charAt(0).toUpperCase() + difficulty.slice(1) as any);
      } else {
        console.warn('No text found in Supabase for this lesson');
      }
    } catch (error) {
      console.error('Error fetching lesson text:', error);
    }
    // Do NOT call setActiveTab here — user stays on Learn tab
  };

  const handleStartTest = (difficulty: DifficultyKey, level: 'level1' | 'level2' | 'level3') => {
    setActiveLesson(null);
    setActiveTab('practice');
    setDifficulty(difficulty.charAt(0).toUpperCase() + difficulty.slice(1) as any);
    setMode('Time Attack');
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
        streak={streak}
        isStarted={isStarted}
        isFinished={isFinished}
        mode={mode}
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        handleLogout={handleLogout}
      />

      <main className="container mx-auto max-w-[900px] pt-40 pb-20 px-6">
        {activeTab === 'learn' ? (
          <LearningPath
            progress={userProgress}
            isLoading={progressLoading}
            onStartLesson={handleStartLesson}
            onStartTest={handleStartTest}
            onBeginPractice={() => setActiveTab('practice')}
          />
        ) : activeTab === 'practice' ? (
          <PracticeTab
            lessons={lessons}
            effectiveDifficulty={effectiveDifficulty}
            lessonsLoading={lessonsLoading}
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
          />
        ) : (
          <StatsTab
            streak={streak}
            personalBest={personalBest}
            history={history}
            user={user}
            unlockedIds={unlockedIds}
            missedKeys={missedKeys}
            setActiveTab={setActiveTab}
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

      {/* Lesson Complete Modal */}
      <AnimatePresence>
        {showLessonComplete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-bg/95 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-surface border border-border-theme rounded-3xl p-10 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} className="text-accent-green" />
              </div>
              <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">Lesson Complete!</h2>
              <p className="text-text-dim mb-8 font-medium leading-relaxed">
                You've mastered all the exercises in this lesson. Your progress has been saved.
              </p>
              <button
                onClick={() => {
                  setShowLessonComplete(false);
                  setActiveTab('learn');
                }}
                className="w-full py-4 bg-accent-blue text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
              >
                Back to Learning Path
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      <footer className="fixed bottom-0 w-full px-8 py-4 flex items-center justify-center pointer-events-none opacity-20">
        <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-text-dim">
          geometric balance &middot; typeflow precision
        </p>
      </footer>
    </div>
  );
}
