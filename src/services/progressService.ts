import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export type DifficultyKey = 'beginner' | 'intermediate' | 'advanced';

export interface LevelProgress {
  lessonsCompleted: number;
  testPassed: boolean;
  testWpm: number;
  testAccuracy: number;
}

export interface UserProgress {
  beginner: {
    level1: LevelProgress;
    level2: LevelProgress;
    level3: LevelProgress;
  };
  intermediate: {
    level1: LevelProgress;
    level2: LevelProgress;
    level3: LevelProgress;
  };
  advanced: {
    level1: LevelProgress;
    level2: LevelProgress;
    level3: LevelProgress;
  };
}

export const DEFAULT_LEVEL_PROGRESS: LevelProgress = {
  lessonsCompleted: 0,
  testPassed: false,
  testWpm: 0,
  testAccuracy: 0
};

export const DEFAULT_PROGRESS: UserProgress = {
  beginner: {
    level1: { ...DEFAULT_LEVEL_PROGRESS },
    level2: { ...DEFAULT_LEVEL_PROGRESS },
    level3: { ...DEFAULT_LEVEL_PROGRESS }
  },
  intermediate: {
    level1: { ...DEFAULT_LEVEL_PROGRESS },
    level2: { ...DEFAULT_LEVEL_PROGRESS },
    level3: { ...DEFAULT_LEVEL_PROGRESS }
  },
  advanced: {
    level1: { ...DEFAULT_LEVEL_PROGRESS },
    level2: { ...DEFAULT_LEVEL_PROGRESS },
    level3: { ...DEFAULT_LEVEL_PROGRESS }
  }
};

export const PASS_THRESHOLDS = {
  beginner: { wpm: 25, accuracy: 80 },
  intermediate: { wpm: 40, accuracy: 80 },
  advanced: { wpm: 60, accuracy: 80 }
};

export const getUserProgress = async (userId: string): Promise<UserProgress> => {
  const docRef = doc(db, 'progress', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProgress;
  } else {
    await setDoc(docRef, DEFAULT_PROGRESS);
    return DEFAULT_PROGRESS;
  }
};

export const updateLevelProgress = async (
  userId: string,
  difficulty: DifficultyKey,
  level: 'level1' | 'level2' | 'level3',
  progress: Partial<LevelProgress>
): Promise<void> => {
  const docRef = doc(db, 'progress', userId);
  const docSnap = await getDoc(docRef);
  const current = docSnap.exists() ? docSnap.data() as UserProgress : DEFAULT_PROGRESS;

  const updated = {
    ...current,
    [difficulty]: {
      ...current[difficulty],
      [level]: {
        ...current[difficulty][level],
        ...progress
      }
    }
  };

  await setDoc(docRef, updated);
};

export const isLevelUnlocked = (
  progress: UserProgress,
  difficulty: DifficultyKey,
  level: 'level1' | 'level2' | 'level3'
): boolean => {
  if (level === 'level1' && difficulty === 'beginner') return true;
  if (level === 'level1') {
    const prevDifficulty = difficulty === 'intermediate' ? 'beginner' : 'intermediate';
    return progress[prevDifficulty].level3.testPassed;
  }
  const prevLevel = level === 'level2' ? 'level1' : 'level2';
  return progress[difficulty][prevLevel].testPassed;
};
