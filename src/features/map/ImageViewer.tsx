'use client';
import { C, CROP_COLORS, LAYERS } from '@/core/constants/constants';
import type { AnalysisData, Field, Lang, LayerId, Translation } from '@/core/types';

interface Props {
    t: Translation;
    lang: Lang;
    data: AnalysisData;
    selectedField: number | null;
    onFieldSelect: (id: number | null) => void;
    activeLayer: LayerId;
    onLayerChange: (id: LayerId) => void;
}

export default function ImageViewer({ t, lang, data, selectedField, onFieldSelect, activeLayer, onLayerChange }: Props) {
    const imageSrc = activeLayer === 'image' ? data.imageBase64
        : activeLayer === 'segmentation' ? data.segmentationBase64
        : activeLayer === 'classification' ? data.classificationBase64
        : data.ndviBase64;

    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 270, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                {LAYERS.map(l => (
                    <button key={l.id} onClick={() => onLayerChange(l.id)}
                        style={{
                            flex: 1, padding: '5px 8px', borderRadius: 5, cursor: 'pointer', fontSize: 10, fontWeight: 600,
                            fontFamily: 'inherit', border: 'none',
                            background: activeLayer === l.id ? `${l.c}22` : 'transparent',
                            color: activeLayer === l.id ? l.c : C.muted,
                            border: `1px solid ${activeLayer === l.id ? l.c : 'transparent'}`,
                            transition: 'all .2s',
                        }}>
                        {t.layerLbls[l.id]}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {imageSrc ? (
                    <img src={imageSrc} alt="Satellite" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                    <div style={{ color: C.muted, fontSize: 12 }}>No image data</div>
                )}

                {(activeLayer === 'image' || activeLayer === 'classification') && imageSrc && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                        {data.regions.map(field => {
                            const isSelected = field.id === selectedField;
                            const color = CROP_COLORS[field.crop] || C.muted;
                            return (
                                <div key={field.id}
                                    onClick={() => onFieldSelect(isSelected ? null : field.id)}
                                    style={{
                                        position: 'absolute',
                                        top: `${field.bbox.top}%`,
                                        left: `${field.bbox.left}%`,
                                        height: `${field.bbox.height}%`,
                                        width: `${field.bbox.width}%`,
                                        border: `2px solid ${color}`,
                                        borderRadius: 3,
                                        cursor: 'pointer',
                                        pointerEvents: 'auto',
                                        background: isSelected ? `${color}33` : 'transparent',
                                        transition: 'all .2s',
                                        boxShadow: isSelected ? `0 0 12px ${color}66` : 'none',
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: 2, insetInlineStart: 2,
                                        background: `${color}ee`, color: '#fff',
                                        fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        #{field.id}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
