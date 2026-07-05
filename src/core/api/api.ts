import type { AnalysisData } from '@/core/types';
import { generateAnalysisData } from '@/data/mockAnalysis';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export async function analyzeRegion(lat: number, lng: number, radius: number = 2.0): Promise<AnalysisData> {
    try {
        const res = await fetch(`${API_BASE}/api/analyze`, {
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
            setTimeout(() => resolve(generateAnalysisData(lat, lng)), 2000);
        });
    }
}

export async function analyzeImage(
    file: File,
    lat?: number,
    lng?: number,
    radius_km: number = 2.0
): Promise<AnalysisData> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        if (lat !== undefined) formData.append('lat', String(lat));
        if (lng !== undefined) formData.append('lng', String(lng));
        formData.append('radius_km', String(radius_km));

        const res = await fetch(`${API_BASE}/api/analyze-image`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }

        return await res.json();
    } catch (e) {
        console.error("Failed to analyze image, falling back to MOCK data:", e);
        // Fallback to mock data with default coordinates
        return new Promise(resolve => {
            setTimeout(() => resolve(generateAnalysisData(lat || 30.0, lng || 31.0)), 2000);
        });
    }
}
