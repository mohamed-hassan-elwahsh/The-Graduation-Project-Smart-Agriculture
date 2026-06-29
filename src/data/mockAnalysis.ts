import type { AnalysisData, Field, CropType } from '@/core/types';

function generateRandomPolygon(centerLat: number, centerLng: number, radiusKm: number, points: number = 5): [number, number][] {
    const coords: [number, number][] = [];
    const radiusDeg = radiusKm / 111.32; // Rough conversion from km to degrees
    
    // Add some randomness to the center
    const cx = centerLat + (Math.random() - 0.5) * radiusDeg * 1.5;
    const cy = centerLng + (Math.random() - 0.5) * radiusDeg * 1.5;
    
    // Generate a somewhat regular polygon
    const angleStep = (Math.PI * 2) / points;
    for (let i = 0; i < points; i++) {
        const angle = i * angleStep + (Math.random() * 0.5);
        const dist = (radiusDeg * 0.2) + Math.random() * (radiusDeg * 0.3); // Size of the field
        coords.push([
            cx + Math.cos(angle) * dist,
            cy + Math.sin(angle) * dist
        ]);
    }
    return coords;
}

export function generateAnalysisData(lat: number, lng: number): AnalysisData {
    const crops: CropType[] = ['Wheat', 'Rice', 'Corn', 'Other'];
    
    // Generate 12 random fields around the requested lat/lng
    const regions: Field[] = Array.from({ length: 12 }, (_, i) => {
        const crop = crops[Math.floor(Math.random() * crops.length)];
        const health = Math.floor(Math.random() * 40) + 55; // 55-95
        return {
            id: i + 1,
            polygon: generateRandomPolygon(lat, lng, 2.0, Math.floor(Math.random() * 3) + 4),
            crop,
            conf: Math.floor(Math.random() * 20) + 80,
            health,
            feddan: parseFloat((Math.random() * 10 + 2).toFixed(1)),
            ndvi: parseFloat((0.4 + Math.random() * 0.4).toFixed(2)),
            stage: Math.floor(Math.random() * 5),
            yieldEn: `${Math.floor(Math.random() * 5) + 3} Tons/Feddan`,
            yieldAr: `${Math.floor(Math.random() * 5) + 3} طن/فدان`,
            wEn: 'Requires +15% Water',
            wAr: 'يحتاج +15% مياه',
        };
    });

    return {
        center: [lat, lng],
        locEn: `Selected Region (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        locAr: `المنطقة المحددة (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        dateEn: new Date().toISOString().slice(0, 10),
        dateAr: new Date().toISOString().slice(0, 10),
        stats: [85, 42.5, 92, 14],
        regions,
        cropDist: [
            { nEn: 'Wheat', nAr: 'قمح', v: 45, c: '#eab308' },
            { nEn: 'Rice', nAr: 'أرز', v: 30, c: '#3b82f6' },
            { nEn: 'Corn', nAr: 'ذرة', v: 15, c: '#f59e0b' },
            { nEn: 'Other', nAr: 'أخرى', v: 10, c: '#94a3b8' }
        ],
        vegTrend: [
            { y: 'Jan', v: 0.3 }, { y: 'Feb', v: 0.4 }, { y: 'Mar', v: 0.6 },
            { y: 'Apr', v: 0.75 }, { y: 'May', v: 0.82 }, { y: 'Jun', v: 0.85 }
        ],
        waterTrend: [
            { y: 'Jan', w: 120 }, { y: 'Feb', w: 130 }, { y: 'Mar', w: 180 },
            { y: 'Apr', w: 220 }, { y: 'May', w: 250 }, { y: 'Jun', w: 280 }
        ],
        insights: [
            {
                type: 'success', icon: '🌱',
                iEn: 'Optimal Growth', iAr: 'نمو مثالي',
                rEn: 'Wheat fields in northern sector showing excellent NDVI progression.',
                rAr: 'حقول القمح في القطاع الشمالي تظهر تقدماً ممتازاً في مؤشر الغطاء النباتي.',
                mEn: 'Continue current irrigation schedule.', mAr: 'الاستمرار في جدول الري الحالي.'
            },
            {
                type: 'warning', icon: '💧',
                iEn: 'Water Stress', iAr: 'إجهاد مائي',
                rEn: 'Slight decrease in soil moisture detected in southern corn fields.',
                rAr: 'انخفاض طفيف في رطوبة التربة في حقول الذرة الجنوبية.',
                mEn: 'Increase watering by 10% for next 3 days.', mAr: 'زيادة الري بنسبة 10٪ للأيام الثلاثة القادمة.'
            }
        ],
        alerts: [
            {
                sev: 'warning', time: '2 hours ago',
                tEn: 'Pest Risk Detected', tAr: 'اكتشاف خطر آفات',
                dEn: 'Anomaly pattern suggests potential aphid activity in Sector 4.',
                dAr: 'نمط غير طبيعي يشير إلى نشاط محتمل للمن في القطاع 4.'
            }
        ]
    };
}