export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: { wpm: number; accuracy: number; streak: number; codeSessions: number }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Reach 50 WPM in a session',
    icon: '🥇',
    condition: (stats) => stats.wpm >= 50
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Achieve 100% accuracy in a session',
    icon: '🎯',
    condition: (stats) => stats.accuracy === 100 && stats.wpm > 10
  },
  {
    id: 'on-fire',
    title: 'On Fire',
    description: 'Maintain a 7-day practice streak',
    icon: '🔥',
    condition: (stats) => stats.streak >= 7
  },
  {
    id: 'code-monkey',
    title: 'Code Monkey',
    description: 'Complete 5 sessions in Code mode',
    icon: '💻',
    condition: (stats) => stats.codeSessions >= 5
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Reach 100 WPM in a session',
    icon: '⚡',
    condition: (stats) => stats.wpm >= 100
  }
];
