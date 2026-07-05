'use client';
import { useState } from 'react';
import { C } from '@/core/constants/constants';
import { TR } from '@/core/constants/translations';
import type { Lang } from '@/core/types';
import { useAnalysis } from '@/core/hooks/useAnalysis';
import SearchView from '@/features/search/SearchView';
import AnalyzingView from '@/shared/ui/AnalyzingView';
import DashboardView from '@/features/dashboard/DashboardView';

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const { phase, location, governorate, progress, currentStep, data, startImageAnalysis, resetAnalysis } = useAnalysis();

  const t = TR[lang];
  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  if (phase === 'search') return <SearchView t={t} lang={lang} onLangToggle={toggleLang} onImageUpload={startImageAnalysis} />;
  if (phase === 'analyzing' || !data) return <AnalyzingView t={t} location={location} progress={progress} currentStep={currentStep} />;
  
  return <DashboardView t={t} lang={lang} data={data} onLangToggle={toggleLang} onNew={resetAnalysis} governorate={governorate} />;
}
