import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const LESSON_KEYS = ['beginner', 'intermediate', 'advanced'] as const;
export type LessonKey = typeof LESSON_KEYS[number];

export interface Lesson {
  level: LessonKey;
  title: string;
  description: string;
  videoUrl: string;
}

export const DEFAULT_LESSONS: Record<LessonKey, Lesson> = {
  beginner: {
    level: 'beginner',
    title: 'Getting Started with Touch Typing',
    description: 'Learn home keys, finger placement, and basic typing technique.',
    videoUrl: ''
  },
  intermediate: {
    level: 'intermediate',
    title: 'Good Habits for Touch Typing',
    description: 'Learn proper posture, speed techniques, and good typing habits.',
    videoUrl: ''
  },
  advanced: {
    level: 'advanced',
    title: 'Advanced Touch Typing Mastery',
    description: 'Master speed, accuracy, and professional typing techniques.',
    videoUrl: ''
  }
};

export const getLessons = async (): Promise<Record<LessonKey, Lesson>> => {
  const lessons: Partial<Record<LessonKey, Lesson>> = {};
  for (const key of LESSON_KEYS) {
    const docRef = doc(db, 'lessons', key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      lessons[key] = docSnap.data() as Lesson;
    } else {
      await setDoc(docRef, DEFAULT_LESSONS[key]);
      lessons[key] = DEFAULT_LESSONS[key];
    }
  }
  return lessons as Record<LessonKey, Lesson>;
};
