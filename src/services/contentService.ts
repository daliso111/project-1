import { supabase } from '../lib/supabaseClient';

export interface LessonText {
  id: number;
  difficulty: string;
  level: string;
  lesson_number: number;
  exercise_number: number;
  text: string;
}

export const getLessonTexts = async (
  difficulty: string,
  level: string,
  lessonNumber: number
): Promise<LessonText[]> => {
  const { data, error } = await supabase
    .from('lesson_texts')
    .select('*')
    .eq('difficulty', difficulty)
    .eq('level', level)
    .eq('lesson_number', lessonNumber)
    .order('exercise_number', { ascending: true });

  if (error) {
    console.error('Error fetching lesson texts:', error);
    return [];
  }

  return data || [];
};

export const getLessonText = async (
  difficulty: string,
  level: string,
  lessonNumber: number,
  exerciseNumber: number
): Promise<string | null> => {
  const { data, error } = await supabase
    .from('lesson_texts')
    .select('text')
    .eq('difficulty', difficulty)
    .eq('level', level)
    .eq('lesson_number', lessonNumber)
    .eq('exercise_number', exerciseNumber)
    .single();

  if (error) {
    console.error('Error fetching lesson text:', error);
    return null;
  }

  return data?.text || null;
};
