import { useState, useEffect, useRef, useCallback } from 'react';

interface UseFocusTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  elapsed: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  percentComplete: number;
}

export function useFocusTimer(totalSeconds: number): UseFocusTimerReturn {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const elapsed = totalSeconds - timeLeft;
  const percentComplete = totalSeconds > 0 ? Math.round((elapsed / totalSeconds) * 100) : 0;

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    setTimeLeft(totalSeconds);
    setIsRunning(false);
    clear();
  }, [totalSeconds]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clear();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clear();
    }
    return clear;
  }, [isRunning]);

  const start = useCallback(() => {
    setTimeLeft(totalSeconds);
    setIsRunning(true);
  }, [totalSeconds]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const reset = useCallback(() => {
    clear();
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => () => clear(), []);

  return { timeLeft, isRunning, elapsed, start, pause, resume, reset, percentComplete };
}
