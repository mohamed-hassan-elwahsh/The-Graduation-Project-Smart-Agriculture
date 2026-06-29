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
                <span style={{ fontWeight: 600, fontSize: 12, color: '#c5ddf0' }}>{t.inspTitle}</span>
            </div>

            {!field ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 18, textAlign: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" opacity=".35">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{t.inspEmpty}</span>
                </div>
            ) : (
                <div style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: CROP_COLORS[field.crop], boxShadow: `0 0 6px ${CROP_COLORS[field.crop]}90`, flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: C.text }}>Field #{field.id}</span>
                        <span style={{ marginInlineStart: 'auto', fontSize: 9, padding: '2px 9px', borderRadius: 10, background: `${CROP_COLORS[field.crop]}22`, border: `1px solid ${CROP_COLORS[field.crop]}55`, color: CROP_COLORS[field.crop], fontWeight: 600 }}>
                            {t.cropNames[field.crop]}
                        </span>
                    </div>

                    {[
                        [t.confLbl, `${field.conf}%`, field.conf, C.sky],
                        [t.healthLbl, `${field.health}%`, field.health, field.health > 75 ? C.green : field.health > 55 ? C.amber : C.red],
                        [t.stageLbl, field.stage !== undefined ? t.stages[field.stage] : '—', field.stage !== undefined ? (field.stage + 1) * 20 : 0, C.purple],
                    ].map(([lb, vt, p, col]) => (
                        <div key={String(lb)} style={{ marginBottom: 9 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 10, color: C.muted }}>{lb}</span>
                                <span style={{ fontSize: 10, fontWeight: 600, color: String(col) }}>{vt}</span>
                            </div>
                            <div style={{ height: 3, borderRadius: 2, background: C.border }}>
                                <div style={{ height: '100%', borderRadius: 2, background: String(col), width: `${p}%`, transition: 'width .4s' }} />
                            </div>
                        </div>
                    ))}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, borderTop: `1px solid ${C.border}`, paddingTop: 10, marginBottom: 10 }}>
                        {[
                            [t.areaLbl, String(field.feddan)],
                            [t.ndviLbl, field.ndvi.toFixed(2)],
                            [t.yieldLbl, lang === 'en' ? field.yieldEn : field.yieldAr],
                            [t.waterNeedLbl, lang === 'en' ? field.wEn : field.wAr],
                        ].map(([lb, vt]) => (
                            <div key={lb} style={{ background: C.card2, borderRadius: 5, padding: '7px 9px' }}>
                                <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{lb}</div>
                                <div style={{ fontWeight: 600, fontSize: 11, color: C.sky }}>{vt}</div>
                            </div>
                        ))}
                    </div>

                    <button onClick={onViewFullReport} style={{ width: '100%', padding: 6, background: 'rgba(14,165,233,.07)', border: '1px solid rgba(14,165,233,.22)', borderRadius: 5, color: C.sky, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {t.viewBtn}
                    </button>
                </div>
            )}
        </div>
    );
}