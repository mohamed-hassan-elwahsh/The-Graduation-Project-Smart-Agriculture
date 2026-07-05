import { C, CROP_COLORS } from '@/core/constants/constants';
import type { Field, Lang, Translation } from '@/core/types';

interface Props { t: Translation; lang: Lang; field: Field | null; onViewFullReport: () => void; }

export default function FieldInspector({ t, lang, field, onViewFullReport }: Props) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '7px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
                <span style={{ fontWeight: 700, fontSize: 12, color: C.text }}>{t.inspTitle}</span>
            </div>

            {!field ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <span style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>{t.inspEmpty}</span>
                </div>
            ) : (
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: CROP_COLORS[field.crop] || C.muted }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                            {lang === 'ar' ? t.cropNames[field.crop] : field.crop} #{field.id}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <Stat label={t.healthLbl} value={`${field.health}%`} color={C.green} />
                        <Stat label={t.confLbl} value={`${field.conf}%`} color={C.sky} />
                        <Stat label={t.areaLbl} value={`${field.feddan} fd`} color={C.amber} />
                        <Stat label={t.ndviLbl} value={String(field.ndvi)} color={C.purple} />
                        <Stat label={t.yieldLbl} value={lang === 'ar' ? field.yieldAr : field.yieldEn} color={C.green} />
                        <Stat label={t.waterNeedLbl} value={lang === 'ar' ? field.wAr : field.wEn} color={C.sky} />
                    </div>

                    <div style={{ marginTop: 4, padding: '6px 10px', background: C.card2, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: C.muted }}>{t.stageLbl}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>
                            {field.stage !== undefined ? t.stages[field.stage] : '—'}
                        </span>
                    </div>

                    <button onClick={onViewFullReport} style={{ width: '100%', padding: 6, background: 'rgba(14,165,233,.07)', border: '1px solid rgba(14,165,233,.22)', borderRadius: 5, color: C.sky, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', marginTop: 'auto' }}>
                        {t.viewBtn}
                    </button>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{ background: C.card2, borderRadius: 6, padding: '5px 8px' }}>
            <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color }}>{value}</div>
        </div>
    );
}
