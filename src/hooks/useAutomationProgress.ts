import { useCallback, useEffect, useRef, useState } from 'react';

export type AutomationStatus = 'idle' | 'running' | 'success' | 'error';

const TICK_MS = 100;

/**
 * Drives a smooth progress bar that runs from 0 → 99% over `expectedDurationSec`
 * and is "snapped" to 100% on success (or reset on error). The bar never reaches
 * 100% until the real webhook response arrives.
 */
export function useAutomationProgress() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<AutomationStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [expected, setExpected] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const start = useCallback((expectedDurationSec: number) => {
    clearTimers();
    startedAtRef.current = Date.now();
    setExpected(expectedDurationSec);
    setProgress(0);
    setElapsed(0);
    setStatus('running');

    intervalRef.current = setInterval(() => {
      const secs = (Date.now() - startedAtRef.current) / 1000;
      setElapsed(secs);
      // Asymptotic curve so we never hit 100% before response.
      const linear = (secs / expectedDurationSec) * 100;
      const capped = linear < 90 ? linear : 90 + (1 - Math.exp(-(linear - 90) / 30)) * 9;
      setProgress(Math.min(capped, 99));
    }, TICK_MS);
  }, [clearTimers]);

  const complete = useCallback(() => {
    clearTimers();
    setProgress(100);
    setStatus('success');
    hideTimeoutRef.current = setTimeout(() => {
      setStatus('idle');
      setProgress(0);
      setElapsed(0);
    }, 1500);
  }, [clearTimers]);

  const fail = useCallback(() => {
    clearTimers();
    setStatus('error');
    hideTimeoutRef.current = setTimeout(() => {
      setStatus('idle');
      setProgress(0);
      setElapsed(0);
    }, 2000);
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setStatus('idle');
    setProgress(0);
    setElapsed(0);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    progress,
    status,
    elapsed,
    expected,
    isActive: status === 'running' || status === 'success' || status === 'error',
    start,
    complete,
    fail,
    reset,
  };
}

/** Default expected durations (seconds) per automation. */
export const AUTOMATION_DURATIONS = {
  mondayPlanning: 15,
  seoKeywordResearch: 600,
  seoBlogGeneration: 90,
  seoPageUrl: 300,
  wpAltText: 15,
  copyrightBranding: 30,
  emailSignature: 15,
  landingspagina: 180,
  newsletterGenerate: 180,
  newsletterBrandColors: 20,
  newsletterCompanyInfo: 30,
  leadsGenerator: 300,
} as const;
