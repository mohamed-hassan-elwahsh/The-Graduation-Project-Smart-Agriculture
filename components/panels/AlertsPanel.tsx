import { C, SEV_COLORS } from '@/lib/constants';
import type { Alert, Lang, Translation } from '@/types';

interface Props { t: Translation; lang: Lang; alerts: Alert[]; }

export default function AlertsPanel({ t, lang, alerts }: Props) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span style={{ fontWeight: 600, fontSize: 12, color: '#c5ddf0' }}>{t.alertTitle}</span>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{alerts.length}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {alerts.map((a, i) => {
                    const sc = SEV_COLORS[a.sev];
                    return (
                        <div key={i} style={{ background: C.card2, borderRadius: 6, borderInlineStart: `3px solid ${sc}`, padding: '9px 11px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{lang === 'en' ? a.tEn : a.tAr}</span>
                                <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 10, background: `${sc}18`, border: `1px solid ${sc}40`, color: sc, fontWeight: 600 }}>{t.sevLbls[a.sev]}</span>
                            </div>
                            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{lang === 'en' ? a.dEn : a.dAr}</div>
                            <div style={{ fontSize: 9, color: C.dim }}>{a.time} ago</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}