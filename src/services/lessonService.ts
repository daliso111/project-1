import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { LessonLevelKey } from '../constants';

export const LESSON_KEYS = ['beginner', 'intermediate', 'advanced'] as const;
export type LessonKey = typeof LESSON_KEYS[number];

export interface Lesson {
  title: string;
  description: string;
  videoUrl: string;
}

export const DEFAULT_LESSONS: Record<LessonKey, Record<LessonLevelKey, Lesson>> = {
  beginner: {
    level1: {
      title: 'Home Row Mastery',
      description: 'Master the home row keys (ASDF JKL;)',
      videoUrl: 'https://www.youtube.com/watch?v=1ArVtHy5K2w'
    },
    level2: {
      title: 'Top Row Extension',
      description: 'Learn to reach for the top row keys (QWERTY UIOP)',
      videoUrl: 'https://www.youtube.com/watch?v=1ArVtHy5K2w'
    },
    level3: {
      title: 'Bottom Row Mastery',
      description: 'Complete the alphabet with the bottom row (ZXCV BNM,.)',
      videoUrl: 'https://www.youtube.com/watch?v=1ArVtHy5K2w'
    }
  },
  intermediate: {
    level1: {
      title: 'Number Row & Symbols',
      description: 'Incorporate numbers and common symbols into your typing.',
      videoUrl: 'https://www.youtube.com/watch?v=1ArVtHy5K2w'
    },
    level2: {
      title: 'Capitalization & Punctuation',
      description: 'Master Shift keys and advanced punctuation.',
      videoUrl: 'https://www.youtube.com/watch?v=1ArVtHy5K2w'
    },
    level3: {
      title: 'Speed Building Techniques',
      description: 'Learn techniques to increase your words per minute.',
      videoUrl: 'https://www.youtube.com/watch?v=1ArVtHy5K2w'
    }
  },
  advanced: {
    level1: {
      title: 'Programming Syntax',
      description: 'Master typing common programming brackets and symbols.',
      videoUrl: 'https://www.youtube.com/watch?v=1ArVtHy5K2w'
    },
    level2: {
      title: 'Complex Terminology',
      description: 'Practice with long and unusual words.',
      videoUrl: 'https://www.youtube.com/watch?v=1ArVtHy5K2w'
    },
    level3: {
      title: 'Full Mastery',
      description: 'The ultimate test of speed and accuracy.',
      videoUrl: 'https://www.youtube.com/watch?v=1ArVtHy5K2w'
    }
  }
};

export const getLessons = async (): Promise<Record<LessonKey, Record<LessonLevelKey, Lesson>>> => {
  const lessons: Partial<Record<LessonKey, Record<LessonLevelKey, Lesson>>> = {};
  for (const key of LESSON_KEYS) {
    const docRef = doc(db, 'lessons', key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      lessons[key] = docSnap.data() as Record<LessonLevelKey, Lesson>;
    } else {
      await setDoc(docRef, DEFAULT_LESSONS[key]);
      lessons[key] = DEFAULT_LESSONS[key];
    }
  }
  return lessons as Record<LessonKey, Record<LessonLevelKey, Lesson>>;
};
