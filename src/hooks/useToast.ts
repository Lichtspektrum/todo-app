import { useState, useRef, useCallback } from 'react';

export interface ToastPayload {
  message: string;
  onUndo?: () => void;
}

export interface ToastState extends ToastPayload {
  id: number;
}

const TOAST_DURATION = 2000;

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const counterRef = useRef(0);

  const startTimer = useCallback((onDismiss?: () => void) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToast(null);
      onDismiss?.();
    }, TOAST_DURATION);
  }, []);

  const showToast = useCallback((payload: ToastPayload, onDismiss?: () => void) => {
    clearTimeout(timerRef.current);
    counterRef.current += 1;
    setToast({ ...payload, id: counterRef.current });
    startTimer(onDismiss);
  }, [startTimer]);

  const dismissToast = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const pauseTimer = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  const resumeTimer = useCallback((onDismiss?: () => void) => {
    startTimer(onDismiss);
  }, [startTimer]);

  return { toast, showToast, dismissToast, pauseTimer, resumeTimer };
}
