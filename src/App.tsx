import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './firebase'; // This imports the file you just created
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { ProfileSetup } from './components/ProfileSetup';
import { 
  Timer, 
  Settings, 
  RotateCcw, 
  Trophy, 
  Zap, 
  Target, 
  AlertCircle, 
  ChevronRight,
  BarChart3,
  Flame,
  Layout,
  Volume2,
  VolumeX,
  Palette,
 LogOut,
  User as UserIcon,
  Leaf
} from 'lucide-react';
import { Difficulty, PracticeMode, TimeLimit, SessionResult } from './constants';
import { useTypingEngine } from './hooks/useTypingEngine';
import { KeyboardHeatmap } from './components/KeyboardHeatmap';
import { HistoryChart } from './components/HistoryChart';
import { CustomTextModal } from './components/CustomTextModal';
import { CODE_SNIPPETS } from './codeSnippets';
import { cn, formatTime } from './lib/utils';
import { Toaster } from 'react-hot-toast';
import { useStreak } from './hooks/useStreak';
import { useBadges } from './hooks/useBadges';
import { DailyGoals } from './components/DailyGoals';
import { BadgeGrid } from './components/BadgeGrid';
import { useTheme } from './contexts/ThemeContext';
import { THEMES } from './themes';
import { useSounds } from './hooks/useSounds';
import { useAdaptiveDifficulty } from './hooks/useAdaptiveDifficulty';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isProfilePending, setIsProfilePending] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('signup');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsProfilePending(!!currentUser && !currentUser.displayName);
      } else {
        if (isLoggingOut.current) {
          setUser(null);
          setIsProfilePending(false);
          isLoggingOut.current = false;
        }
        // Logout was triggered in another tab — ignore it and stay logged in
      }
      setIsAuthChecking(false);
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
  const [activeTab, setActiveTab] = useState<'practice' | 'stats'>('practice');

  // Adaptive Difficulty logic
  const adaptedLevel = useAdaptiveDifficulty(history);
  const effectiveDifficulty = difficulty === 'Adaptive' ? adaptedLevel : difficulty;

  // New Modes States
  const [punctMode, setPunctMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [customText, setCustomText] = useState('');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  useEffect(() => {
    if (user) {
      const storedHistory = localStorage.getItem(`swifttype_history_${user.uid}`);
      if (storedHistory) {
        try {
          const parsed: SessionResult[] = JSON.parse(storedHistory);
          setHistory(parsed.map(s => ({
            ...s,
            accuracy: Math.min(100, s.accuracy)
          })));
        } catch (e) {
          setHistory([]);
        }
      } else {
        setHistory([]);
      }

      const storedZen = localStorage.getItem(`swifttype_zen_mode_${user.uid}`);
      setIsZenMode(storedZen === 'true');
    } else {
      setHistory([]);
      setIsZenMode(false);
    }
  }, [user]);

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

  const inputRef = useRef<HTMLInputElement>(null);
  const isLoggingOut = useRef(false);

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

  const handleLogout = async () => {
    try {
      isLoggingOut.current = true;
      setHistory([]);
      setIsZenMode(false);
      await signOut(auth);
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
      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-10 py-6 flex justify-between items-center border-b border-border-theme bg-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-default">
          <div className="text-2xl font-extrabold tracking-tighter text-text-main">
            Type<span className="text-accent-blue">Flow</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-red/10 border border-accent-red/20 rounded-full">
              <Flame size={14} className="text-accent-red fill-accent-red/20 animate-pulse" />
              <span className="text-[12px] font-black text-accent-red">{streak}</span>
            </div>
          )}
          <div className="flex gap-2">
             {(['Time Attack', 'Word Sprint', 'Code', 'Custom'] as PracticeMode[]).map((m) => (
               <button
                 key={m}
                 disabled={isStarted || isFinished}
                 onClick={() => {
                   if (m === 'Custom') setIsCustomModalOpen(true);
                   setMode(m);
                 }}
                 className={cn("btn-toggle", mode === m && "btn-toggle-active")}
               >
                 {m.split(' ')[0]}
               </button>
             ))}
          </div>

          {mode === 'Time Attack' && (
            <>
              <div className="w-px h-6 bg-border-theme" />
              <div className="flex gap-2">
                 {([30, 60, 120] as TimeLimit[]).map((t) => (
                   <button
                     key={t}
                     disabled={isStarted || isFinished}
                     onClick={() => setTimeLimit(t)}
                     className={cn(
                       "px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all border",
                       timeLimit === t 
                         ? "bg-accent-blue/10 border-accent-blue text-accent-blue ring-1 ring-accent-blue/20" 
                         : "bg-surface border-border-theme text-text-dim hover:text-text-main"
                     )}
                   >
                     {t}s
                   </button>
                 ))}
              </div>
            </>
          )}

          <div className="w-px h-6 bg-border-theme" />

          <div className="flex gap-2">
             {(['Beginner', 'Intermediate', 'Advanced', 'Adaptive'] as Difficulty[]).map((d) => (
               <button
                 key={d}
                 disabled={isStarted || isFinished}
                 onClick={() => setDifficulty(d)}
                 className={cn(
                   "flex flex-col items-center justify-center px-3 py-1.5 rounded-md transition-all", 
                   difficulty === d ? "bg-accent-blue text-white" : "text-text-dim hover:text-text-main"
                 )}
               >
                 <span className="text-[11px] font-bold uppercase tracking-wider">{d[0]}</span>
                 {d === 'Adaptive' && (
                   <span className="text-[7px] font-bold opacity-60 uppercase leading-none mt-0.5">
                     {adaptedLevel[0]}
                   </span>
                 )}
               </button>
             ))}
          </div>

          {(mode === 'Time Attack' || mode === 'Word Sprint') && (
            <>
              <div className="w-px h-6 bg-border-theme" />
              <button
                disabled={isStarted || isFinished}
                onClick={() => setPunctMode(!punctMode)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all border",
                  punctMode 
                    ? "bg-accent-green/20 border-accent-green text-accent-green" 
                    : "bg-surface border-border-theme text-text-dim"
                )}
              >
                #&!
              </button>
            </>
          )}

          {mode === 'Code' && (
            <>
              <div className="w-px h-6 bg-border-theme" />
              <select
                disabled={isStarted || isFinished}
                className="bg-bg border border-border-theme text-text-main text-[11px] font-bold px-2 py-1 rounded-md outline-none focus:border-accent-blue cursor-pointer"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="All">ALL</option>
                <option value="JavaScript">JS</option>
                <option value="Python">PY</option>
                <option value="HTML">HTML</option>
              </select>
            </>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newVal = !isZenMode;
                setIsZenMode(newVal);
                if (user) {
                  localStorage.setItem(`swifttype_zen_mode_${user.uid}`, newVal.toString());
                }
              }}
              className={cn(
                "p-2 transition-colors",
                isZenMode ? "text-accent-green" : "text-text-dim hover:text-text-main"
              )}
              title={isZenMode ? "Disable Zen Mode" : "Enable Zen Mode"}
            >
              <Leaf size={18} fill={isZenMode ? "currentColor" : "none"} fillOpacity={0.2} />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-text-dim hover:text-text-main transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="p-2 text-text-dim hover:text-text-main transition-colors"
                title="Change Theme"
              >
                <Palette size={18} />
              </button>
              
              <AnimatePresence>
                {showThemePicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-[60]" 
                      onClick={() => setShowThemePicker(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 p-2 bg-surface border border-border-theme rounded-xl shadow-xl z-[70] min-w-[140px]"
                    >
                      <div className="grid grid-cols-1 gap-1">
                        {THEMES.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTheme(t);
                              setShowThemePicker(false);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                              theme.id === t.id ? "bg-accent-blue/10 text-accent-blue" : "hover:bg-bg text-text-dim"
                            )}
                          >
                            <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.colors.accentBlue }} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-px h-6 bg-border-theme" />

          <button 
            onClick={() => setActiveTab(activeTab === 'practice' ? 'stats' : 'practice')}
            className="text-text-dim hover:text-text-main transition-colors flex items-center gap-2"
          >
            {activeTab === 'practice' ? <BarChart3 size={20} /> : <Layout size={20} />}
            <span className="text-[13px] font-semibold hidden sm:inline">{activeTab === 'practice' ? 'Stats' : 'Practice'}</span>
          </button>

          <div className="w-px h-6 bg-border-theme" />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-theme rounded-lg">
              <UserIcon size={14} className="text-text-dim" />
              <span className="text-[11px] font-bold text-text-main truncate max-w-[100px]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-text-dim hover:text-accent-red transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-[900px] pt-40 pb-20 px-6">
        {activeTab === 'practice' ? (
          <div className="space-y-6">
            {/* Stats Row */}
            <AnimatePresence>
              {!(isZenMode && isStarted && !isFinished) && (
                <motion.div
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-4 gap-6"
                >
                  <div className="stat-card">
                    <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2">WPM</div>
                    <div className="text-3xl font-bold font-mono text-accent-green">{wpm}</div>
                  </div>
                  <div className="stat-card">
                    <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2">Accuracy</div>
                    <div className="text-3xl font-bold font-mono">{accuracy}%</div>
                  </div>
                  <div className="stat-card">
                    <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2">Timer</div>
                    <div className="text-3xl font-bold font-mono">{formatTime(timeLeft)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-2">Errors</div>
                    <div className="text-3xl font-bold font-mono text-accent-red">{errors}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Typing Canvas */}
            <div 
              className="relative group cursor-text"
              onClick={focusInput}
            >
              <input
                ref={inputRef}
                type="text"
                className="absolute inset-0 opacity-0 pointer-events-none"
                autoFocus
                value={userInput}
                onChange={(e) => onInputChange(e.target.value)}
                disabled={isFinished}
              />
              
              <div className="typing-canvas" onClick={focusInput}>
                <div className="text-[26px] font-mono leading-relaxed text-text-dim select-none relative whitespace-pre-wrap">
                  {text.split('').map((char, index) => {
                    let status = 'pending';
                    if (index < userInput.length) {
                      status = userInput[index] === char ? 'correct' : 'incorrect';
                    }
                    const isCursor = index === userInput.length;

                    return (
                      <span
                        key={index}
                        className={cn(
                          "typing-char",
                          status === 'correct' && "text-text-main",
                          status === 'incorrect' && "text-accent-red bg-accent-red/20 underline",
                          status === 'pending' && "text-text-dim"
                        )}
                      >
                        {isCursor && <span className="cursor" />}
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>

              {!isStarted && !isFinished && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-2xl">
                  <motion.p 
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-text-dim font-medium"
                  >
                    Start typing to begin...
                  </motion.p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <AnimatePresence>
              {!(isZenMode && isStarted && !isFinished) && (
                <motion.div
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center pt-4"
                >
                  <button
                    onClick={reset}
                    className="btn-toggle flex items-center gap-2 px-8 py-3 !text-text-main hover:border-accent-blue/50"
                  >
                    <RotateCcw size={16} />
                    Reset (Tab)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Stats Tab */
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="stat-card flex flex-row items-center justify-between p-6">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-text-dim uppercase tracking-widest">Current Streak</p>
                        <p className="text-4xl font-black text-accent-red flex items-center gap-2">
                          {streak} <Flame className="fill-accent-red/10" size={24} />
                        </p>
                      </div>
                      <div className="p-3 bg-bg rounded-xl border border-border-theme">
                        <Trophy size={20} className="text-text-dim" />
                      </div>
                   </div>
                   <div className="stat-card flex flex-row items-center justify-between p-6">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-text-dim uppercase tracking-widest">All-Time Best</p>
                        <p className="text-4xl font-black text-accent-blue">{personalBest}</p>
                      </div>
                      <div className="p-3 bg-bg rounded-xl border border-border-theme text-text-dim">
                        <Zap size={20} strokeWidth={3} />
                      </div>
                   </div>
                 </div>

                 <DailyGoals history={history} userId={user?.uid} />
                 <HistoryChart history={history} />
                 <BadgeGrid unlockedIds={unlockedIds} />
                 <KeyboardHeatmap missedKeys={missedKeys} />
              </div>
              
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-surface border border-border-theme p-6 rounded-xl shadow-sm">
                  <div className="text-[11px] font-bold text-text-dim uppercase tracking-[0.1em] mb-4">Recent Sessions</div>
                  <div className="space-y-4">
                    {history.slice(-8).reverse().map((s) => (
                      <div key={s.id} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-0">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-text-main">{s.mode}</span>
                          <span className="text-[10px] text-text-dim">{new Date(s.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-text-main text-[13px]">{s.wpm} WPM</span>
                          <p className="text-[10px] text-text-dim">{s.accuracy}% Acc</p>
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <p className="text-center text-text-dim py-10 italic text-[13px]">No history yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Results Modal */}
      <AnimatePresence>
        {isFinished && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-surface border border-border-theme rounded-2xl p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-accent-blue" />
              
              <div className="text-center mb-10">
                <p className="text-text-dim font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Session Complete</p>
                <h2 className="text-3xl font-black tracking-tight text-text-main">Practice Summary</h2>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="text-center p-6 bg-bg/50 rounded-xl border border-border-theme">
                  <p className="text-text-dim font-bold uppercase tracking-wider text-[10px] mb-1">Words Per Minute</p>
                  <p className="text-4xl font-black text-accent-green leading-none">{wpm}</p>
                </div>
                <div className="text-center p-6 bg-bg/50 rounded-xl border border-border-theme">
                  <p className="text-text-dim font-bold uppercase tracking-wider text-[10px] mb-1">Accuracy</p>
                  <p className="text-4xl font-black text-accent-blue leading-none">{accuracy}%</p>
                </div>
              </div>

              <div className="space-y-4 mb-10 text-[13px]">
                <div className="flex justify-between items-center px-2">
                  <span className="text-text-dim font-medium">Errors</span>
                  <span className="font-bold text-accent-red px-2 py-0.5 bg-accent-red/10 rounded">{errors}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-text-dim font-medium">Time Taken</span>
                  <span className="font-bold text-text-main">{Math.round(mode === 'Time Attack' ? timeLimit - timeLeft : timeElapsed)}s</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-text-dim font-medium">Mode</span>
                  <span className="font-bold text-text-main uppercase tracking-widest text-[11px]">{mode} {punctMode && '+ Punct'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {sessionEndReason === 'completed' ? (
                  <>
                    <div className="flex-1 space-y-2">
                      <button
                        onClick={() => reset(false)}
                        className="w-full py-4 bg-accent-blue text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                      >
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        Continue
                      </button>
                      <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">↵ Enter</p>
                    </div>

                    <div className="flex-1 space-y-2">
                      <button
                        onClick={() => reset(true)}
                        className="w-full py-4 bg-transparent border-2 border-accent-blue/30 text-accent-blue rounded-xl font-bold uppercase tracking-widest hover:bg-accent-blue/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={18} />
                        Try Again
                      </button>
                      <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">⇥ Tab</p>
                    </div>

                    <div className="flex-1 space-y-2">
                      <button
                        onClick={() => {
                          reset();
                          setActiveTab('stats');
                        }}
                        className="w-full py-4 bg-transparent text-text-dim/60 rounded-xl font-bold uppercase tracking-widest hover:text-text-main active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <BarChart3 size={18} />
                        View Stats
                      </button>
                      <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">S Key</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 space-y-2">
                      <button
                        onClick={() => reset(false)}
                        className="w-full py-4 bg-accent-blue text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={18} />
                        Try Again
                      </button>
                      <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">↵ Enter or ⇥ Tab</p>
                    </div>

                    <div className="flex-1 space-y-2">
                      <button
                        onClick={() => {
                          reset();
                          setActiveTab('stats');
                        }}
                        className="w-full py-4 bg-transparent border-2 border-border-theme text-text-dim rounded-xl font-bold uppercase tracking-widest hover:text-text-main hover:border-text-dim/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <BarChart3 size={18} />
                        View Stats
                      </button>
                      <p className="text-[9px] text-text-dim/60 text-center font-bold uppercase tracking-wider">S Key</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 w-full px-8 py-4 flex items-center justify-center pointer-events-none opacity-20">
        <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-text-dim">
          geometric balance &middot; typeflow precision
        </p>
      </footer>
      <Analytics />
    </div>
  );
}
