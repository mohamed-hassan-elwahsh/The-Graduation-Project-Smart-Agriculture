'use client';
import { useState, useEffect } from 'react';
import { C } from '@/lib/constants';
import type { Translation } from '@/types';

interface Props { t: Translation; open: boolean; onClose: () => void; }

export default function ExportModal({ t, open, onClose }: Props) {
    const [pct, setPct] = useState(0);
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!open) return;
        setPct(0); setStep(0); setDone(false);
        let p = 0;
        const tm = setInterval(() => {
            p = Math.min(p + 3.5, 100);
            setPct(Math.round(p));
            setStep(Math.min(Math.floor(p / 26), 3));
            if (p >= 100) { clearInterval(tm); setDone(true); }
        }, 120);
        return () => clearInterval(tm);
    }, [open]);

    if (!open) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,12,22,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
            onClick={onClose}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: 20, width: 300 }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 15 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(14,165,233,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{t.expTitle}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{t.expSub}</div>
                    </div>
                    <button onClick={onClose} style={{ marginInlineStart: 'auto', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
                </div>

                {!done ? (
                    <>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{t.genLbl} {pct}%</div>
                        <div style={{ height: 4, borderRadius: 2, background: C.border, marginBottom: 12 }}>
                            <div style={{ height: '100%', borderRadius: 2, background: C.sky, width: `${pct}%`, transition: 'width .2s' }} />
                        </div>
                        {t.expSteps.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                <span style={{ fontSize: 11, color: i < step ? C.green : C.dim }}>{i < step ? '✓' : '○'}</span>
                                <span style={{ fontSize: 11, color: i <= step ? '#a7f3d0' : C.muted }}>{s}</span>
                            </div>
                        ))}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                        <div style={{ fontWeight: 600, color: C.text, marginBottom: 2 }}>{t.expDone}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginBottom: 14 }}>agrisat_kafr_elsheikh_2026.pdf</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button style={{ flex: 1, padding: 7, background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.3)', borderRadius: 5, color: C.sky, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t.dlBtn}</button>
                            <button onClick={onClose} style={{ flex: 1, padding: 7, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{t.closeBtn}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}