'use client';
import { C, CROP_COLORS, LAYERS } from '@/lib/constants';
import type { Field, LayerId, Translation } from '@/types';

interface Props {
    t: Translation;
    regions: Field[];
    activeLayer: LayerId;
    selectedField: number | null;
    onLayerChange: (id: LayerId) => void;
    onFieldSelect: (id: number | null) => void;
}

export default function FieldMap({ t, regions, activeLayer, selectedField, onLayerChange, onFieldSelect }: Props) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ padding: '7px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                <span style={{ fontWeight: 600, fontSize: 12, color: '#c5ddf0' }}>{t.mapTitle}</span>
                <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {LAYERS.map(ly => {
                        const on = activeLayer === ly.id;
                        return (
                            <button key={ly.id} onClick={() => onLayerChange(ly.id as LayerId)}
                                style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, border: `1px solid ${on ? ly.c : C.border}`, cursor: 'pointer', background: on ? `${ly.c}1a` : 'transparent', color: on ? ly.c : C.muted, fontFamily: 'inherit' }}>
                                {t.layerLbls[ly.id as LayerId]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, position: 'relative', background: '#0b1724', overflow: 'hidden', cursor: 'crosshair', minHeight: 220 }}
                onClick={() => onFieldSelect(null)}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {Array.from({ length: 17 }, (_, i) => (
                        <g key={i}>
                            <line x1={`${i * 6.25}%`} y1="0" x2={`${i * 6.25}%`} y2="100%" stroke={C.sky} strokeWidth=".3" opacity=".1" />
                            <line x1="0" y1={`${i * 6.25}%`} x2="100%" y2={`${i * 6.25}%`} stroke={C.sky} strokeWidth=".3" opacity=".1" />
                        </g>
                    ))}
                </svg>

                {regions.map(r => {
                    const cc = CROP_COLORS[r.crop];
                    const sel = selectedField === r.id;
                    return (
                        <div key={r.id} onClick={e => { e.stopPropagation(); onFieldSelect(r.id); }}
                            style={{ position: 'absolute', left: r.l, top: r.t, width: r.w, height: r.h, background: `${cc}${sel ? '44' : '22'}`, border: `${sel ? 2 : 1.5}px solid ${cc}${sel ? 'cc' : '55'}`, borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: cc, boxShadow: sel ? `0 0 10px ${cc}55` : '' }}>
                            {t.cropNames[r.crop]}
                        </div>
                    );
                })}

                {/* Legend */}
                <div style={{ position: 'absolute', top: 8, insetInlineStart: 8, background: 'rgba(9,18,30,.9)', border: `1px solid ${C.border}`, borderRadius: 5, padding: '7px 9px' }}>
                    {Object.entries(t.cropNames).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                            <div style={{ width: 7, height: 7, borderRadius: 2, background: CROP_COLORS[k], flexShrink: 0 }} />
                            <span style={{ fontSize: 9, color: C.muted }}>{v}</span>
                        </div>
                    ))}
                </div>
                <div style={{ position: 'absolute', bottom: 7, insetInlineStart: 9, fontSize: 8.5, color: C.sky, opacity: .45, fontFamily: 'monospace' }}>30.80°N 31.19°E</div>
            </div>
        </div>
    );
}