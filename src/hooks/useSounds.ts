import { useState, useCallback, useRef, useEffect } from 'react';

export function useSounds() {
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('swifttype_muted');
    return stored === 'false' ? false : true; // Default to true if null or 'true'
  });

  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem('swifttype_volume');
    return stored ? parseFloat(stored) : 0.5;
  });
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem('swifttype_muted', String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('swifttype_volume', String(volume));
  }, [volume]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playCorrect = useCallback(() => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

    const v = Math.max(0.0001, volume);
    gain.gain.setValueAtTime(0.1 * v, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * v, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [isMuted, volume]);

  const playError = useCallback(() => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);

    const v = Math.max(0.0001, volume);
    gain.gain.setValueAtTime(0.1 * v, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01 * v, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [isMuted, volume]);

  const playComplete = useCallback(() => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current!;
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const v = Math.max(0.0001, volume);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.1 * v, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01 * v, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(440, 0, 0.5); // A4
    playTone(554.37, 0.1, 0.5); // C#5
    playTone(659.25, 0.2, 0.6); // E5
  }, [isMuted, volume]);

  return { isMuted, setIsMuted, volume, setVolume, playCorrect, playError, playComplete };
}
