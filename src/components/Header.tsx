import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame,
  Volume2,
  VolumeX,
  Palette,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { PracticeMode, TimeLimit, Difficulty } from '../constants';
import { cn } from '../lib/utils';
import { THEMES } from '../themes';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User;
  streak: number;
  mode: PracticeMode;
  setMode: (mode: PracticeMode) => void;
  timeLimit: TimeLimit;
  setTimeLimit: (limit: TimeLimit) => void;
  difficulty: Difficulty;
  adaptedLevel: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  punctMode: boolean;
  setPunctMode: (enabled: boolean) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  theme: typeof THEMES[0];
  setTheme: (theme: typeof THEMES[0]) => void;
  activeTab: 'practice' | 'stats' | 'learn';
  setActiveTab: (tab: 'practice' | 'stats' | 'learn') => void;
  onLogout: () => void;
  isStarted: boolean;
  isFinished: boolean;
}

export function Header({
  user,
  streak,
  mode,
  setMode,
  timeLimit,
  setTimeLimit,
  difficulty,
  adaptedLevel,
  setDifficulty,
  punctMode,
  setPunctMode,
  selectedLanguage,
  setSelectedLanguage,
  isMuted,
  setIsMuted,
  theme,
  setTheme,
  activeTab,
  setActiveTab,
  onLogout,
  isStarted,
  isFinished,
}: HeaderProps) {
  const [showThemePicker, setShowThemePicker] = React.useState(false);

  return (
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
                if (m === 'Custom') {
                  // Parent will handle modal
                  setMode(m);
                } else {
                  setMode(m);
                }
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
          onClick={() => setActiveTab('learn')}
          className={cn("btn-toggle", activeTab === 'learn' && "btn-toggle-active")}
        >
          Learn
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={cn("btn-toggle", activeTab === 'practice' && "btn-toggle-active")}
        >
          Practice
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={cn("btn-toggle", activeTab === 'stats' && "btn-toggle-active")}
        >
          Stats
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
            onClick={onLogout}
            className="p-2 text-text-dim hover:text-accent-red transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
