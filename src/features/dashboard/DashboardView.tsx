'use client';
import { useState } from 'react';
import { C } from '@/core/constants/constants';
import type { AnalysisData, Lang, LayerId, Translation } from '@/core/types';
import Header from '@/shared/layout/Header';
import StatsRow from '@/features/dashboard/StatsRow';
import MapWrapper from '@/features/map/MapWrapper';
import FieldInspector from '@/features/map/FieldInspector';
import CropPieChart from '@/features/insights/CropPieChart';
import VegLineChart from '@/features/insights/VegLineChart';
import WaterBarChart from '@/features/insights/WaterBarChart';
import AIInsightsPanel from '@/features/insights/AIInsightsPanel';
import AlertsPanel from '@/features/insights/AlertsPanel';
import ExportModal from '@/features/dashboard/ExportModal';
import FullReportModal from '@/features/dashboard/FullReportModal';

interface Props {
    t: Translation;
    lang: Lang;
    data: AnalysisData;
    governorate?: string;
    onLangToggle: () => void;
    onNew: () => void;
}

export default function DashboardView({ t, lang, data, governorate, onLangToggle, onNew }: Props) {
    const [selectedField, setSelectedField] = useState<number | null>(null);
    const [activeLayer, setActiveLayer] = useState<LayerId>('image');
    const [showExport, setShowExport] = useState(false);
    const [showFullReport, setShowFullReport] = useState(false);

    const field = selectedField ? data.regions.find(r => r.id === selectedField) ?? null : null;
    const location = lang === 'en' ? data.locEn : data.locAr;
    const date = lang === 'en' ? data.dateEn : data.dateAr;

    return (
        <div dir={t.dir} style={{ background: C.bg, color: C.text, fontFamily: "'Segoe UI',Tahoma,system-ui,sans-serif", fontSize: 13, minHeight: '100vh' }}>
            <Header t={t} lang={lang} location={location} date={date} governorate={governorate} onLangToggle={onLangToggle} onNew={onNew} onExport={() => setShowExport(true)} />

            <div id="dashboard-content" style={{ padding: '11px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <StatsRow t={t} stats={data.stats} />

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 9, minHeight: 270 }}>
                    <MapWrapper t={t} lang={lang} data={data} selectedField={selectedField} onFieldSelect={setSelectedField} activeLayer={activeLayer} onLayerChange={setActiveLayer} />
                    <FieldInspector t={t} lang={lang} field={field} onViewFullReport={() => setShowFullReport(true)} />
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
            <FullReportModal open={showFullReport} onClose={() => setShowFullReport(false)} t={t} lang={lang} data={data} field={field} />
        </div>
    );
}
