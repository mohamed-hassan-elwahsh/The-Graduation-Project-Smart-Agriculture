'use client';
import { C, CROP_COLORS } from '@/core/constants/constants';
import type { AnalysisData, Lang, Translation, Field } from '@/core/types';

interface Props {
    open: boolean;
    onClose: () => void;
    t: Translation;
    lang: Lang;
    data: AnalysisData;
    field: Field | null;
}

export default function FullReportModal({ open, onClose, lang, data, field }: Props) {
    if (!open) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,12,22,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}
            onClick={onClose}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
                onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: C.card, zIndex: 10 }}>
                    <div>
                        <h2 style={{ margin: 0, color: C.text, fontSize: 20 }}>
                            {field ? `${lang === 'en' ? 'Field' : 'حقل'} #${field.id} - ${lang === 'en' ? 'Full Report' : 'تقرير كامل'}` : 'Region Full Report'}
                        </h2>
                        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: 13 }}>
                            {lang === 'en' ? data.locEn : data.locAr}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: C.card2, border: `1px solid ${C.border}`, color: C.muted, width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: 24 }}>
                    {field ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Key Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                {[
                                    { label: 'Crop', val: field.crop, c: CROP_COLORS[field.crop as keyof typeof CROP_COLORS] || C.muted },
                                    { label: 'Health', val: `${field.health}%`, c: field.health > 70 ? C.green : '#f59e0b' },
                                    { label: 'Area', val: `${field.feddan} Feddan`, c: C.text },
                                    { label: 'Yield Est.', val: lang === 'en' ? field.yieldEn : field.yieldAr, c: C.sky }
                                ].map((m, i) => (
                                    <div key={i} style={{ background: C.card2, padding: 16, borderRadius: 8, border: `1px solid ${C.border}` }}>
                                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{m.label}</div>
                                        <div style={{ fontSize: 18, fontWeight: 600, color: m.c }}>{m.val}</div>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{ background: 'rgba(14,165,233,.05)', padding: 16, borderRadius: 8, border: '1px solid rgba(14,165,233,.2)', color: C.sky, fontSize: 14, lineHeight: 1.6 }}>
                                Detailed analysis for this field indicates that the crop is in good health with a confidence score of {field.conf}%. Ensure adequate watering based on the estimated requirement of {lang === 'en' ? field.wEn : field.wAr}.
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: C.muted, textAlign: 'center', padding: 40 }}>
                            Please select a field to view its full report.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}