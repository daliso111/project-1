import { useState, useCallback, useEffect } from 'react';

interface StreakData {
  lastPracticeDate: string | null;
  currentStreak: number;
}

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData>(() => {
    const stored = localStorage.getItem('swifttype_streak');
    return stored ? JSON.parse(stored) : { lastPracticeDate: null, currentStreak: 0 };
  });

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    
    setStreakData(prev => {
      let newStreak = prev.currentStreak;
      
      if (prev.lastPracticeDate === today) {
        // Already practiced today, keep streak
        return prev;
      }

      const lastDate = prev.lastPracticeDate ? new Date(prev.lastPracticeDate) : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
        // Practiced yesterday, increment
        newStreak += 1;
      } else {
        // Gap of more than a day, reset to 1
        newStreak = 1;
      }

      const newData = { lastPracticeDate: today, currentStreak: newStreak };
      localStorage.setItem('swifttype_streak', JSON.stringify(newData));
      return newData;
    });
  }, []);

  return { streak: streakData.currentStreak, updateStreak };
}
