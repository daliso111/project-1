import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function calculateWPM(chars: number, timeInSeconds: number): number {
  if (timeInSeconds <= 0) return 0;
  // Standard WPM: (characters / 5) / (minutes)
  const minutes = timeInSeconds / 60;
  return Math.round((chars / 5) / minutes);
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
