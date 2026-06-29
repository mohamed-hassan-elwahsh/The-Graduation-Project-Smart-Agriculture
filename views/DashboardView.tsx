'use client';
import { useState } from 'react';
import { C } from '@/lib/constants';
import type { AnalysisData, Lang, LayerId, Translation } from '@/types';
import Header from '@/components/layout/Header';
import StatsRow from '@/components/panels/StatsRow';
import FieldMap from '@/components/map/FieldMap';
import FieldInspector from '@/components/panels/FieldInspector';
import CropPieChart from '@/components/charts/CropPieChart';
import VegLineChart from '@/components/charts/VegLineChart';
import WaterBarChart from '@/components/charts/WaterBarChart';
import AIInsightsPanel from '@/components/panels/AIInsightsPanel';
import AlertsPanel from '@/components/panels/AlertsPanel';
import ExportModal from '@/components/ui/ExportModal';

interface Props {
    t: Translation; lang: Lang; data: AnalysisData;
    onLangToggle: () => void; onNew: () => void;
}

export default function DashboardView({ t, lang, data, onLangToggle, onNew }: Props) {
    const [selectedField, setSelectedField] = useState<number | null>(null);
    const [activeLayer, setActiveLayer] = useState<LayerId>('agri');
    const [showExport, setShowExport] = useState(false);

    const field = selectedField ? data.regions.find(r => r.id === selectedField) ?? null : null;
    const location = lang === 'en' ? data.locEn : data.locAr;
    const date = lang === 'en' ? data.dateEn : data.dateAr;

    return (
        <div dir={t.dir} style={{ background: C.bg, color: C.text, fontFamily: "'Segoe UI',Tahoma,system-ui,sans-serif", fontSize: 13, minHeight: '100vh' }}>
            <Header t={t} lang={lang} location={location} date={date} onLangToggle={onLangToggle} onNew={onNew} onExport={() => setShowExport(true)} />

            <div style={{ padding: '11px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <StatsRow t={t} stats={data.stats} />

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 9, minHeight: 270 }}>
                    <FieldMap t={t} regions={data.regions} activeLayer={activeLayer} selectedField={selectedField} onLayerChange={setActiveLayer} onFieldSelect={setSelectedField} />
                    <FieldInspector t={t} lang={lang} field={field} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr .95fr', gap: 9 }}>
                    <CropPieChart data={data.cropDist} lang={lang} title={t.cropChartTitle} />
                    <VegLineChart data={data.vegTrend} title={t.vegChartTitle} />
                    <WaterBarChart data={data.waterTrend} title={t.waterChartTitle} />
                </div>

                <AIInsightsPanel t={t} lang={lang} insights={data.insights} />
                <AlertsPanel t={t} lang={lang} alerts={data.alerts} />
            </div>

            <ExportModal t={t} open={showExport} onClose={() => setShowExport(false)} />
        </div>
    );
}