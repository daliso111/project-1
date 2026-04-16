import { useMemo } from 'react';
import { SessionResult, Difficulty } from '../constants';

export function useAdaptiveDifficulty(history: SessionResult[]) {
  const adaptedLevel = useMemo((): Difficulty => {
    if (history.length === 0) return 'Beginner';
    
    // Last 5 sessions
    const recent = history.slice(-5);
    const avgWpm = recent.reduce((sum, s) => sum + s.wpm, 0) / recent.length;

    if (avgWpm < 30) return 'Beginner';
    if (avgWpm <= 60) return 'Intermediate';
    return 'Advanced';
  }, [history]);

  return adaptedLevel;
}
