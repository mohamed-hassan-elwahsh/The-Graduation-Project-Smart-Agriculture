'use client';
import { C } from '@/lib/constants';
import type { Lang, Translation } from '@/types';

interface Props {
    t: Translation; lang: Lang;
    location: string; date: string;
    onLangToggle: () => void;
    onNew: () => void;
    onExport: () => void;
}

const btn: React.CSSProperties = {
    background: 'transparent', border: '1px solid #334155', borderRadius: 5,
    padding: '4px 10px', cursor: 'pointer', color: '#94a3b8', fontSize: 11, fontFamily: 'inherit',
};

export default function Header({ t, location, date, onLangToggle, onNew, onExport }: Props) {
    return (
        <header style={{ height: 50, background: C.card2, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

            {/* Logo */}
            <div style={{ width: 30, height: 30, borderRadius: 7, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
            </div>
            <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{t.logo}</div>
                <div style={{ fontSize: 8, color: C.muted, letterSpacing: '.07em' }}>{t.logoSub}</div>
            </div>

            {/* Live dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginInlineStart: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, color: C.green }}>{t.live}</span>
            </div>

            {/* Location */}
            <div style={{ fontSize: 10, color: C.muted, paddingInlineStart: 10, borderInlineStart: `1px solid ${C.border}` }}>
                {location} · {date}
            </div>

            {/* Actions */}
            <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={onNew} style={btn}>{t.newBtn}</button>
                <button onClick={onExport} style={{ ...btn, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {t.exportBtn}
                </button>
                <button onClick={onLangToggle} style={{ ...btn, borderColor: C.sky, color: C.sky, background: 'rgba(14,165,233,.08)', fontWeight: 700 }}>
                    {t.langBtn}
                </button>
            </div>
        </header>
    );
}