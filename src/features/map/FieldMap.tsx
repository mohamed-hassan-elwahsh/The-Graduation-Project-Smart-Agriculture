'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { C, CROP_COLORS, LAYERS } from '@/core/constants/constants';
import type { Field, LayerId, Translation } from '@/core/types';

interface Props {
    t: Translation;
    center: [number, number];
    regions: Field[];
    activeLayer: LayerId;
    selectedField: number | null;
    onLayerChange: (id: LayerId) => void;
    onFieldSelect: (id: number | null) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 14);
    }, [center, map]);
    return null;
}

export default function LeafletMap({ t, center, regions, activeLayer, selectedField, onLayerChange, onFieldSelect }: Props) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 270 }}>
            {/* Toolbar */}
            <div style={{ padding: '7px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', zIndex: 10, background: C.card }}>
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

            {/* Map Container */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                <MapContainer center={center} zoom={14} style={{ width: '100%', height: '100%', zIndex: 1 }} zoomControl={false} attributionControl={false}>
                    <MapUpdater center={center} />
                    
                    {/* Esri World Imagery (Free Satellite Map) */}
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles &copy; Esri"
                    />

                    {/* Render Fields as Polygons */}
                    {regions.map(r => {
                        let strokeCol = '#ffffff';
                        let fillCol = '#ffffff';
                        
                        if (activeLayer === 'agri') {
                            fillCol = 'rgba(255, 255, 255, 0)'; // Mostly transparent
                            strokeCol = '#ffffff';
                        } else if (activeLayer === 'crop') {
                            fillCol = CROP_COLORS[r.crop] || '#ffffff';
                            strokeCol = fillCol;
                        } else if (activeLayer === 'veg') {
                            // Map NDVI (e.g. 0.2 to 0.9) to a green scale
                            const intensity = Math.min(255, Math.max(0, Math.floor(r.ndvi * 255)));
                            fillCol = `rgb(0, ${intensity}, 0)`;
                            strokeCol = '#00ff00';
                        } else if (activeLayer === 'water') {
                            // Map NDWI (if missing, use NDVI as fallback) to blue scale
                            const val = r.ndwi !== undefined ? r.ndwi : (r.ndvi * 0.8);
                            const intensity = Math.min(255, Math.max(50, Math.floor(val * 255)));
                            fillCol = `rgb(0, ${intensity}, 255)`;
                            strokeCol = '#00aaff';
                        }
                        
                        const isSelected = selectedField === r.id;
                        
                        return (
                            <Polygon
                                key={r.id}
                                positions={r.polygon}
                                pathOptions={{
                                    color: isSelected ? strokeCol : (activeLayer === 'agri' ? '#ffffff' : strokeCol),
                                    weight: isSelected ? 3 : 1,
                                    fillColor: fillCol,
                                    fillOpacity: isSelected ? 0.75 : (activeLayer === 'agri' ? 0.1 : 0.45),
                                }}
                                eventHandlers={{
                                    click: () => onFieldSelect(r.id),
                                }}
                            />
                        );
                    })}
                </MapContainer>

                {/* Legend Overlay */}
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(9,18,30,.85)', border: `1px solid ${C.border}`, borderRadius: 5, padding: '7px 9px', zIndex: 10 }}>
                    {Object.entries(t.cropNames).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                            <div style={{ width: 7, height: 7, borderRadius: 2, background: CROP_COLORS[k as keyof typeof CROP_COLORS] || C.muted, flexShrink: 0 }} />
                            <span style={{ fontSize: 9, color: C.muted }}>{v}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
