import { useState, useCallback, useEffect } from 'react';

interface StreakData {
  lastPracticeDate: string | null;
  currentStreak: number;
}

const DEFAULT_STREAK: StreakData = { lastPracticeDate: null, currentStreak: 0 };

export function useStreak(userId?: string) {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK);

  useEffect(() => {
    if (!userId) {
      setStreakData(DEFAULT_STREAK);
      return;
    }

    const stored = localStorage.getItem(`swifttype_streak_${userId}`);
    if (stored) {
      try {
        setStreakData(JSON.parse(stored));
      } catch (e) {
        setStreakData(DEFAULT_STREAK);
      }
    } else {
      setStreakData(DEFAULT_STREAK);
    }
  }, [userId]);

  const updateStreak = useCallback(() => {
    if (!userId) return;

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
      localStorage.setItem(`swifttype_streak_${userId}`, JSON.stringify(newData));
      return newData;
    });
  }, [userId]);

  return { streak: streakData.currentStreak, updateStreak };
}
