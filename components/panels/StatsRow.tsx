import { C, STAT_COLORS } from '@/lib/constants';
import type { Translation } from '@/types';

const ICONS = [
    <svg key="a" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" /></svg>,
    <svg key="b" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    <svg key="c" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>,
    <svg key="d" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    <svg key="e" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
];
const TRENDS = ['+12%', '+8%', '+5%', '+3%', '+15'];

export default function StatsRow({ t, stats }: { t: Translation; stats: number[] }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {stats.map((v, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 13px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', insetBlock: 0, insetInlineStart: 0, width: 3, background: STAT_COLORS[i], borderRadius: 2 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                        <span style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', letterSpacing: '.05em', lineHeight: 1.3 }}>{t.statLabels[i]}</span>
                        <span style={{ color: STAT_COLORS[i] }}>{ICONS[i]}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                        <span style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1 }}>{v}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>{t.statUnits[i]}</span>
                    </div>
                    <span style={{ fontSize: 10, color: C.green }}>▲ {TRENDS[i]}</span>
                </div>
            ))}
        </div>
    );
}