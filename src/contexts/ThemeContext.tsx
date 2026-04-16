import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, Theme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('swifttype_active_theme');
    return THEMES.find(t => t.id === stored) || THEMES[0];
  });

  useEffect(() => {
    const root = document.documentElement;
    const { colors } = theme;
    root.style.setProperty('--bg', colors.bg);
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--border-theme', colors.border);
    root.style.setProperty('--text-main', colors.textMain);
    root.style.setProperty('--text-dim', colors.textDim);
    root.style.setProperty('--accent-green', colors.accentGreen);
    root.style.setProperty('--accent-red', colors.accentRed);
    root.style.setProperty('--accent-blue', colors.accentBlue);
    
    localStorage.setItem('swifttype_active_theme', theme.id);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
