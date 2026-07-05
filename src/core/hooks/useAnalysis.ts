import { useState, useCallback } from 'react';
import type { Phase, AnalysisData, Lang } from '@/core/types';
import { analyzeRegion, analyzeImage } from '@/core/api/api';

export function useAnalysis() {
  const [phase, setPhase] = useState<Phase>('search');
  const [location, setLocation] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<AnalysisData | null>(null);

  const startAnalysis = useCallback(async (lat: number, lng: number, radius?: number) => {
    setPhase('analyzing');
    setProgress(0);
    setCurrentStep(0);

    // Simulate progress steps
    const steps = [
      { p: 15, s: 0 },
      { p: 35, s: 1 },
      { p: 55, s: 2 },
      { p: 75, s: 3 },
      { p: 90, s: 4 },
    ];
    steps.forEach(({ p, s }) => {
      setTimeout(() => { setProgress(p); setCurrentStep(s); }, 400 * (s + 1));
    });

    try {
      const result = await analyzeRegion(lat, lng, radius);
      setData(result);
      setProgress(100);
      setTimeout(() => setPhase('dashboard'), 500);
    } catch (e) {
      console.error('Analysis failed:', e);
      setPhase('search');
    }
  }, []);

  const startImageAnalysis = useCallback(async (file: File, lat?: number, lng?: number, radius?: number) => {
    setPhase('analyzing');
    setProgress(0);
    setCurrentStep(0);

    // Simulate progress steps
    const steps = [
      { p: 15, s: 0 },
      { p: 35, s: 1 },
      { p: 55, s: 2 },
      { p: 75, s: 3 },
      { p: 90, s: 4 },
    ];
    steps.forEach(({ p, s }) => {
      setTimeout(() => { setProgress(p); setCurrentStep(s); }, 400 * (s + 1));
    });

    try {
      const result = await analyzeImage(file, lat, lng, radius);
      setData(result);
      setProgress(100);
      setTimeout(() => setPhase('dashboard'), 500);
    } catch (e) {
      console.error('Image analysis failed:', e);
      setPhase('search');
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setPhase('search');
    setData(null);
    setProgress(0);
    setCurrentStep(0);
    setLocation('');
    setGovernorate('');
  }, []);

  return {
    phase,
    location,
    setLocation,
    governorate,
    setGovernorate,
    progress,
    currentStep,
    data,
    startAnalysis,
    startImageAnalysis,
    resetAnalysis,
  };
}
