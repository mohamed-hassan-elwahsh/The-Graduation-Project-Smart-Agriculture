import type { AnalysisData } from '@/types';
import { MOCK } from '@/data/mockAnalysis';

export async function analyzeRegion(lat: float, lng: float, radius: float = 2.0): Promise<AnalysisData> {
    try {
        const res = await fetch('http://localhost:8000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lat, lng, radius_km: radius })
        });
        
        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }
        
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch from backend, falling back to MOCK data:", e);
        // Fallback to demo mode if backend is not running
        return new Promise(resolve => {
            setTimeout(() => resolve(MOCK), 2000);
        });
    }
}
