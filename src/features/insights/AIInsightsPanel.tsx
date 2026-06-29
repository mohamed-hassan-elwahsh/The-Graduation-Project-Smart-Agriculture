import { C, TYPE_COLORS } from '@/core/constants/constants';
import type { Insight, Lang, Translation } from '@/core/types';

interface Props { t: Translation; lang: Lang; insights: Insight[]; }

export default function AIInsightsPanel({ t, lang, insights }: Props) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
                <span style={{ fontSize: 14 }}>🤖</span>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#c5ddf0' }}>{t.aiTitle}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{t.aiSub}</div>
                </div>
                <span style={{ fontSize: 9, padding: '2px 9px', borderRadius: 10, background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)', color: C.purple, fontWeight: 600, marginInlineStart: 'auto' }}>AI</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {insights.map((ins, i) => {
                    const tc = TYPE_COLORS[ins.type];
                    return (
                        <div key={i} style={{ background: C.card2, borderRadius: 7, border: `1px solid ${tc}25`, overflow: 'hidden' }}>
                            <div style={{ height: 2, background: tc }} />
                            <div style={{ padding: '10px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 8 }}>
                                    <span style={{ fontSize: 14, flexShrink: 0 }}>{ins.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 9, color: tc, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{t.issueLbl}</div>
                                        <div style={{ fontSize: 11, color: C.text, fontWeight: 600, lineHeight: 1.4 }}>{lang === 'en' ? ins.iEn : ins.iAr}</div>
                                    </div>
                                </div>
                                <div style={{ background: C.card, borderRadius: 5, padding: '8px 10px', marginBottom: 7 }}>
                                    <div style={{ fontSize: 9, color: C.sky, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{t.recLbl}</div>
                                    <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>{lang === 'en' ? ins.rEn : ins.rAr}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.green }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                    <span style={{ fontWeight: 600 }}>{t.impactLbl}:</span>
                                    <span style={{ color: '#a7f3d0' }}>{lang === 'en' ? ins.mEn : ins.mAr}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}