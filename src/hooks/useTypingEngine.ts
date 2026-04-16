import { useState, useEffect, useCallback, useRef } from 'react';
import { QUOTES, COMMON_WORDS, Difficulty, PracticeMode, TimeLimit } from '../constants';
import { calculateWPM, calculateAccuracy } from '../lib/utils';

interface TypingState {
  text: string;
  userInput: string;
  isStarted: boolean;
  isFinished: boolean;
  timeLeft: number;
  startTime: number | null;
  errors: number;
  missedKeys: Record<string, number>;
  correctChars: number;
}

import { CODE_SNIPPETS } from '../codeSnippets';

export function useTypingEngine(
  mode: PracticeMode,
  difficulty: Difficulty,
  timeLimit: TimeLimit,
  selectedLanguage: string = 'All',
  punctMode: boolean = false,
  customText: string = ''
) {
  const [state, setState] = useState<TypingState>({
    text: '',
    userInput: '',
    isStarted: false,
    isFinished: false,
    timeLeft: timeLimit,
    startTime: null,
    errors: 0,
    missedKeys: {},
    correctChars: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateText = useCallback(() => {
    let result = '';
    if (mode === 'Code') {
      const filtered = selectedLanguage === 'All' 
        ? CODE_SNIPPETS 
        : CODE_SNIPPETS.filter(s => s.language === selectedLanguage);
      const snippet = filtered[Math.floor(Math.random() * filtered.length)];
      result = snippet?.code || 'No snippets found.';
    } else if (mode === 'Custom') {
      result = customText || 'No custom text provided.';
    } else if (mode === 'Time Attack') {
      const quotes = QUOTES[difficulty];
      result = quotes[Math.floor(Math.random() * quotes.length)];
    } else {
      // Word Sprint - Fixed set of words
      const wordCount = difficulty === 'Beginner' ? 20 : difficulty === 'Intermediate' ? 40 : 60;
      const shuffled = [...COMMON_WORDS].sort(() => 0.5 - Math.random());
      result = shuffled.slice(0, wordCount).join(' ');
    }

    if (punctMode && (mode === 'Time Attack' || mode === 'Word Sprint')) {
      const punct = "!,.;:?'\"";
      const nums = "0123456789";
      const chars = punct + nums;
      result = result.split(' ').map(word => {
        if (Math.random() > 0.7) {
          const randomChar = chars[Math.floor(Math.random() * chars.length)];
          return word + randomChar;
        }
        return word;
      }).join(' ');
    }

    return result;
  }, [mode, difficulty, selectedLanguage, punctMode, customText]);

  const reset = useCallback(() => {
    const newText = generateText();
    setState({
      text: newText,
      userInput: '',
      isStarted: false,
      isFinished: false,
      timeLeft: mode === 'Time Attack' ? timeLimit : 0,
      startTime: null,
      errors: 0,
      missedKeys: {},
      correctChars: 0,
    });
    if (timerRef.current) clearInterval(timerRef.current);
  }, [generateText, mode, timeLimit]);

  useEffect(() => {
    reset();
  }, [reset]);

  const endSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(prev => ({ ...prev, isFinished: true, isStarted: false }));
  }, []);

  const handleInput = useCallback((value: string) => {
    if (state.isFinished) return;

    setState(prev => {
      let { isStarted, startTime, timeLeft, errors, missedKeys, correctChars } = prev;

      if (!isStarted) {
        isStarted = true;
        startTime = Date.now();
      }

      const lastChar = value[value.length - 1];
      const expectedChar = prev.text[value.length - 1];

      // Track errors only for new characters (not backspaces)
      if (value.length > prev.userInput.length) {
        if (lastChar !== expectedChar) {
          errors += 1;
          const key = expectedChar || 'space';
          missedKeys[key] = (missedKeys[key] || 0) + 1;
        } else {
          correctChars += 1;
        }
      }

      // Check if finished
      const isFinished = value.length === prev.text.length;
      if (isFinished) {
        if (timerRef.current) clearInterval(timerRef.current);
      }

      return {
        ...prev,
        userInput: value,
        isStarted,
        startTime,
        errors,
        missedKeys,
        correctChars,
        isFinished
      };
    });
  }, [state.isFinished]);

  useEffect(() => {
    if (state.isStarted && !state.isFinished && mode === 'Time Attack') {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeLeft: 0, isFinished: true, isStarted: false };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [state.isStarted, state.isFinished, mode]);

  const elapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;
  const currentWpm = calculateWPM(state.correctChars, mode === 'Time Attack' ? (timeLimit - state.timeLeft) : elapsed);
  const currentAccuracy = calculateAccuracy(state.correctChars, state.userInput.length);

  return {
    ...state,
    wpm: currentWpm,
    accuracy: currentAccuracy,
    handleInput,
    reset,
    timeElapsed: elapsed
  };
}
