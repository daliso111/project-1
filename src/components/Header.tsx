import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Settings,
  Volume2,
  VolumeX,
  Palette,
  LogOut,
  User as UserIcon,
  Flame,
  Layout,
  BarChart3,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { PracticeMode } from '../constants';
import { Theme } from '../themes';
import { THEMES } from '../themes';
import { cn } from '../lib/utils';

interface HeaderProps {
  streak: number;
  isStarted: boolean;
  isFinished: boolean;
  mode: PracticeMode;
  setMode: (mode: PracticeMode) => void;
  setIsCustomModalOpen: (open: boolean) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  showKeyboard: boolean;
  setShowKeyboard: (show: boolean) => void;
  activeTab: 'practice' | 'stats' | 'learn';
  setActiveTab: (tab: 'practice' | 'stats' | 'learn') => void;
  user: User;
  handleLogout: () => void;
}

export function Header({
  streak,
  isStarted,
  isFinished,
  mode,
  setMode,
  setIsCustomModalOpen,
  selectedLanguage,
  setSelectedLanguage,
  isMuted,
  setIsMuted,
  volume,
  setVolume,
  theme,
  setTheme,
  showKeyboard,
  setShowKeyboard,
  activeTab,
  setActiveTab,
  user,
  handleLogout,
}: HeaderProps) {
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

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

        <div className="relative">
          <button
            disabled={isStarted || isFinished}
            onClick={() => setShowSectionDropdown(!showSectionDropdown)}
            className={cn(
              'btn-toggle flex items-center gap-2',
              showSectionDropdown && 'btn-toggle-active'
            )}
          >
            Section
            <ChevronDown size={14} className={cn('transition-transform', showSectionDropdown && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showSectionDropdown && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowSectionDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-2 p-2 bg-surface border border-border-theme rounded-xl shadow-xl z-[70] min-w-[140px]"
                >
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { label: 'Word', mode: 'Word Sprint' },
                      { label: 'Code', mode: 'Code' },
                      { label: 'Custom', mode: 'Custom' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (item.mode === 'Custom') setIsCustomModalOpen(true);
                          setMode(item.mode as PracticeMode);
                          setShowSectionDropdown(false);
                        }}
                        className={cn(
                          'flex items-center px-3 py-2 rounded-lg text-left transition-colors font-bold text-[11px] uppercase tracking-wider',
                          mode === item.mode ? 'bg-accent-blue/10 text-accent-blue' : 'hover:bg-bg text-text-dim'
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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

        <div className="relative">
          <button
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            className={cn(
              'p-2 text-text-dim hover:text-text-main transition-colors',
              showSettingsDropdown && 'text-accent-blue'
            )}
            title="Settings"
          >
            <Settings size={20} />
          </button>

          <AnimatePresence>
            {showSettingsDropdown && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowSettingsDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 p-4 bg-surface border border-border-theme rounded-xl shadow-xl z-[70] min-w-[200px]"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-text-dim">
                          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          <span className="text-[10px] font-bold uppercase tracking-wider">Volume</span>
                        </div>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-[10px] font-bold text-accent-blue hover:underline"
                        >
                          {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-bg rounded-lg appearance-none cursor-pointer accent-accent-blue"
                      />
                    </div>

                    <div className="h-px bg-border-theme" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-text-dim">
                        <Palette size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Theme</span>
                      </div>
                      <div className="flex gap-3 pt-1">
                        {['dark', 'light', 'ocean'].map((themeId) => {
                          const nextTheme = THEMES.find((item) => item.id === themeId);
                          if (!nextTheme) return null;

                          return (
                            <button
                              key={nextTheme.id}
                              onClick={() => setTheme(nextTheme)}
                              className={cn(
                                'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110',
                                theme.id === nextTheme.id ? 'border-accent-blue scale-110' : 'border-white/10'
                              )}
                              style={{ backgroundColor: nextTheme.colors.accentBlue }}
                              title={nextTheme.name}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-border-theme" />

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim">
                        Virtual Keyboard
                      </span>
                      <button
                        onClick={() => setShowKeyboard(!showKeyboard)}
                        className={cn(
                          "w-8 h-4 rounded-full transition-all relative",
                          showKeyboard ? "bg-accent-blue" : "bg-border-theme"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                          showKeyboard ? "left-4" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-border-theme" />

        <div className="relative">
          <button
            onClick={() => setShowClassDropdown(!showClassDropdown)}
            className={cn(
              'btn-toggle flex items-center gap-2',
              showClassDropdown && 'btn-toggle-active'
            )}
          >
            Class
            <ChevronDown size={14} className={cn('transition-transform', showClassDropdown && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showClassDropdown && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowClassDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 p-2 bg-surface border border-border-theme rounded-xl shadow-xl z-[70] min-w-[140px]"
                >
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { label: 'Learn', tab: 'learn', icon: UserIcon },
                      { label: 'Practice', tab: 'practice', icon: Layout },
                      { label: 'Stats', tab: 'stats', icon: BarChart3 },
                    ].map((item) => (
                      <button
                        key={item.tab}
                        onClick={() => {
                          setActiveTab(item.tab as 'practice' | 'stats' | 'learn');
                          setShowClassDropdown(false);
                        }}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors font-bold text-[11px] uppercase tracking-wider',
                          activeTab === item.tab ? 'bg-accent-blue/10 text-accent-blue' : 'hover:bg-bg text-text-dim'
                        )}
                      >
                        <item.icon size={14} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
  );
}
