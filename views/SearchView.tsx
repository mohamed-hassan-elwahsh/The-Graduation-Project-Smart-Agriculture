'use client';
import { useState } from 'react';
import { C } from '@/lib/constants';
import type { Lang, Translation } from '@/types';

interface Props { t: Translation; lang: Lang; onLangToggle: () => void; onSearch: (lat: number, lng: number) => void; }

export default function SearchView({ t, onLangToggle, onSearch }: Props) {
    const [lat, setLat] = useState('30.5877');
    const [lng, setLng] = useState('31.0127');
    const go = () => {
        const _lat = parseFloat(lat);
        const _lng = parseFloat(lng);
        if (!isNaN(_lat) && !isNaN(_lng)) {
            onSearch(_lat, _lng);
        }
    };

    return (
        <div dir={t.dir} style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Segoe UI',Tahoma,system-ui,sans-serif" }}>
            <div style={{ position: 'absolute', top: 14, insetInlineEnd: 14 }}>
                <button onClick={onLangToggle} style={{ border: `1px solid ${C.sky}`, borderRadius: 6, padding: '5px 13px', cursor: 'pointer', color: C.sky, background: 'rgba(14,165,233,.08)', fontSize: 12, fontWeight: 700 }}>{t.langBtn}</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                </div>
                <div style={{ fontSize: 12, color: C.sky, letterSpacing: '.08em', marginBottom: 6, fontWeight: 600 }}>{t.logoSub}</div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 10, maxWidth: 480, lineHeight: 1.3 }}>{t.searchTitle}</h1>
                <p style={{ fontSize: 13, color: C.muted, maxWidth: 440, lineHeight: 1.7 }}>{t.searchDesc}</p>
            </div>

            <div style={{ width: '100%', maxWidth: 480 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input value={lat} onChange={e => setLat(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()}
                        placeholder="Latitude (e.g. 30.58)" type="number" step="any"
                        style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: '11px 14px', color: C.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                    <input value={lng} onChange={e => setLng(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()}
                        placeholder="Longitude (e.g. 31.01)" type="number" step="any"
                        style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: '11px 14px', color: C.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                    <button onClick={go} style={{ background: C.sky, border: 'none', borderRadius: 7, padding: '0 20px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                        {t.searchBtn}
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: C.dim }}>{t.examplesLbl}</span>
                    {t.examples.map(e => (
                        <button key={e} onClick={() => {
                            // Example coordinates mapping roughly to cities
                            if (e.includes('Kafr') || e.includes('كفر')) { setLat('31.1107'); setLng('30.9388'); }
                            else if (e.includes('Sharq') || e.includes('الشرق')) { setLat('30.7065'); setLng('31.6366'); }
                            else if (e.includes('Dakah') || e.includes('الدقهل')) { setLat('31.0364'); setLng('31.3807'); }
                            else { setLat('30.0444'); setLng('31.2357'); }
                        }}
                            style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 5, padding: '3px 10px', cursor: 'pointer', color: C.muted, fontSize: 11, fontFamily: 'inherit' }}>
                            {e}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}