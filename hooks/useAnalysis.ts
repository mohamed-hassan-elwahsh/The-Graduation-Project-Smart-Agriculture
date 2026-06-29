import { useState, useCallback } from 'react';
import type { Phase, AnalysisData } from '@/types';
import { analyzeRegion } from '@/lib/api';

interface UseAnalysisReturn {
  phase: Phase;
  location: string;
  progress: number;
  currentStep: number;
  data: AnalysisData | null;
  startAnalysis: (lat: number, lng: number) => void;
  resetAnalysis: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [phase,       setPhase]       = useState<Phase>('search');
  const [location,    setLocation]    = useState('');
  const [progress,    setProgress]    = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [data,        setData]        = useState<AnalysisData | null>(null);

  const startAnalysis = useCallback(async (lat: number, lng: number) => {
    setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setPhase('analyzing');
    setProgress(0);
    setCurrentStep(0);
    setData(null);

    // Fake progress for UX while API runs
    let p = 0;
    const tm = setInterval(() => {
      p = Math.min(p + Math.random() * 1.5 + 0.5, 90); // Cap at 90% until done
      setProgress(Math.round(p));
      setCurrentStep(Math.min(Math.floor(p / (100 / 6)), 5));
    }, 150);

    try {
        const result = await analyzeRegion(lat, lng);
        clearInterval(tm);
        setProgress(100);
        setCurrentStep(6);
        setData(result);
        setTimeout(() => setPhase('dashboard'), 600);
    } catch (e) {
        clearInterval(tm);
        console.error("Analysis failed", e);
        setPhase('search'); // fallback on error
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setPhase('search');
    setLocation('');
    setProgress(0);
    setCurrentStep(0);
    setData(null);
  }, []);

  return { phase, location, progress, currentStep, data, startAnalysis, resetAnalysis };
}