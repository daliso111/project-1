import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ACHIEVEMENTS, Achievement } from '../achievements';

export function useBadges(userId?: string) {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      setUnlockedIds([]);
      return;
    }

    const stored = localStorage.getItem(`swifttype_badges_${userId}`);
    if (stored) {
      try {
        setUnlockedIds(JSON.parse(stored));
      } catch (e) {
        setUnlockedIds([]);
      }
    } else {
      setUnlockedIds([]);
    }
  }, [userId]);

  const checkBadges = useCallback((stats: { wpm: number; accuracy: number; streak: number; codeSessions: number }) => {
    if (!userId) return;

    const newlyUnlocked: Achievement[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedIds.includes(achievement.id) && achievement.condition(stats)) {
        newlyUnlocked.push(achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      const newIds = [...unlockedIds, ...newlyUnlocked.map(a => a.id)];
      setUnlockedIds(newIds);
      localStorage.setItem(`swifttype_badges_${userId}`, JSON.stringify(newIds));

      newlyUnlocked.forEach(a => {
        toast.success(`Achievement Unlocked: ${a.title} ${a.icon}`, {
          duration: 5000,
          position: 'top-center',
          icon: a.icon,
          style: {
            borderRadius: '16px',
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155'
          }
        });
      });
    }
  }, [unlockedIds, userId]);

  return { unlockedIds, checkBadges };
}
