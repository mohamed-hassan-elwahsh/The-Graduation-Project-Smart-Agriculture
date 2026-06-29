'use client';
import { useState } from 'react';
import { TR } from '@/core/constants/translations';
import { useAnalysis } from '@/core/hooks/useAnalysis';
import type { Lang } from '@/core/types';
import SearchView from '@/features/search/SearchView';
import AnalyzingView from '@/shared/ui/AnalyzingView';
import DashboardView from '@/features/dashboard/DashboardView';

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const { phase, location, governorate, progress, currentStep, data, startAnalysis, resetAnalysis } = useAnalysis();

  const t = TR[lang];
  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  if (phase === 'search') return <SearchView t={t} lang={lang} onLangToggle={toggleLang} onSearch={startAnalysis} />;
  if (phase === 'analyzing' || !data) return <AnalyzingView t={t} location={location} progress={progress} currentStep={currentStep} />;
  
  return <DashboardView t={t} lang={lang} data={data} onLangToggle={toggleLang} onNew={resetAnalysis} governorate={governorate} />;
}