export interface Theme {
  id: string;
  name: string;
  colors: {
    bg: string;
    surface: string;
    border: string;
    textMain: string;
    textDim: string;
    accentGreen: string;
    accentRed: string;
    accentBlue: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      bg: '#0f172a',
      surface: '#1e293b',
      border: '#334155',
      textMain: '#f8fafc',
      textDim: '#94a3b8',
      accentGreen: '#10b981',
      accentRed: '#ef4444',
      accentBlue: '#3b82f6',
    }
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      bg: '#f8fafc',
      surface: '#ffffff',
      border: '#e2e8f0',
      textMain: '#0f172a',
      textDim: '#64748b',
      accentGreen: '#10b981',
      accentRed: '#ef4444',
      accentBlue: '#3b82f6',
    }
  },
  {
    id: 'retro',
    name: 'Retro Green',
    colors: {
      bg: '#0a0a0a',
      surface: '#121212',
      border: '#2a2a2a',
      textMain: '#00ff41',
      textDim: '#008f11',
      accentGreen: '#00ff41',
      accentRed: '#ff3131',
      accentBlue: '#00ff41',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      bg: '#081c34',
      surface: '#0d2b4f',
      border: '#16437a',
      textMain: '#e0f2fe',
      textDim: '#7dd3fc',
      accentGreen: '#34d399',
      accentRed: '#fb7185',
      accentBlue: '#38bdf8',
    }
  }
];
