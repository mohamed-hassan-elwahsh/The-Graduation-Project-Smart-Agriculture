'use client';
import { useState } from 'react';
import { TR } from '@/lib/translations';
import { MOCK } from '@/data/mockAnalysis';
import { useAnalysis } from '@/hooks/useAnalysis';
import type { Lang } from '@/types';
import SearchView from '@/views/SearchView';
import AnalyzingView from '@/views/AnalyzingView';
import DashboardView from '@/views/DashboardView';

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const { phase, location, progress, currentStep, data, startAnalysis, resetAnalysis } = useAnalysis();

  const t = TR[lang];
  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  if (phase === 'search') return <SearchView t={t} lang={lang} onLangToggle={toggleLang} onSearch={startAnalysis} />;
  if (phase === 'analyzing') return <AnalyzingView t={t} location={location} progress={progress} currentStep={currentStep} />;
  return <DashboardView t={t} lang={lang} data={data || MOCK} onLangToggle={toggleLang} onNew={resetAnalysis} />;
}