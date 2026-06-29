import { useState, useCallback } from 'react';
import type { Phase, AnalysisData } from '@/core/types';
import { analyzeRegion } from '@/core/api/api';

interface UseAnalysisReturn {
  phase: Phase;
  location: string;
  governorate: string;
  progress: number;
  currentStep: number;
  data: AnalysisData | null;
  startAnalysis: (lat: number, lng: number, governorate?: string) => void;
  resetAnalysis: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [phase,       setPhase]       = useState<Phase>('search');
  const [location,    setLocation]    = useState('');
  const [governorate, setGovernorate] = useState('');
  const [progress,    setProgress]    = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [data,        setData]        = useState<AnalysisData | null>(null);

  const startAnalysis = useCallback(async (lat: number, lng: number, gov?: string) => {
    setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setGovernorate(gov ?? '');
    setPhase('analyzing');
    setProgress(0);
    setCurrentStep(0);
    setData(null);

    // Fake progress for UX while API runs
    let p = 0;
    const tm = setInterval(() => {
      p = Math.min(p + Math.random() * 1.5 + 0.5, 90);
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
        setPhase('search');
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setPhase('search');
    setLocation('');
    setGovernorate('');
    setProgress(0);
    setCurrentStep(0);
    setData(null);
  }, []);

  return { phase, location, governorate, progress, currentStep, data, startAnalysis, resetAnalysis };
}
