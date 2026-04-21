import { supabase } from '../lib/supabaseClient';

export interface LessonText {
  id: number;
  difficulty: string;
  level: string;
  lesson_number: number;
  exercise_number: number;
  text: string;
}

export async function getLessonTexts(difficulty: string, level: string) {
  const { data, error } = await supabase
    .from('lesson_texts')
    .select('*')
    .eq('difficulty', difficulty)
    .eq('level', level);

  if (error) {
    console.error('Error fetching lesson texts:', error);
    return [];
  }

  return data as LessonText[];
}
