import { C } from '@/core/constants/constants';
import type { Translation } from '@/core/types';

interface Props { t: Translation; location: string; progress: number; currentStep: number; }

export default function AnalyzingView({ t, location, progress, currentStep }: Props) {
    return (
        <div dir={t.dir} style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Segoe UI',Tahoma,system-ui,sans-serif" }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 74, height: 74, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.sky, animation: 'spin 1s linear infinite', marginBottom: 24 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6 }}>{t.analyzingTitle}</h2>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>{location}</div>

            <div style={{ width: '100%', maxWidth: 420, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{Math.round(progress)}%</div>
                <div style={{ height: 4, borderRadius: 2, background: C.border }}>
                    <div style={{ height: '100%', borderRadius: 2, background: C.sky, width: `${progress}%`, transition: 'width .2s' }} />
                </div>
            </div>

            <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {t.steps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i > currentStep + 1 ? .3 : 1, transition: 'opacity .3s' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < currentStep ? C.green : i === currentStep ? C.sky : C.border, fontSize: 10, color: '#fff', fontWeight: 700, transition: 'background .3s' }}>
                            {i < currentStep ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 12, color: i <= currentStep ? C.text : C.muted }}>{s}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}