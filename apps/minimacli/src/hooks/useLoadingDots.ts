import { useEffect, useState } from 'react';

export function useLoadingDots(running: boolean, intervalMs = 400): string {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!running) {
      setStep(0);
      return;
    }
    const timer = setInterval(() => setStep((s) => (s + 1) % 4), intervalMs);
    return () => clearInterval(timer);
  }, [running, intervalMs]);
  return '.'.repeat(step);
}
