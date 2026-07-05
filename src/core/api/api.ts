import type { AnalysisData } from '@/core/types';
import { generateAnalysisData } from '@/data/mockAnalysis';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export async function analyzeImage(file: File): Promise<AnalysisData> {
    try {
        const formData = new FormData();
        formData.append('file', file);

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
        return new Promise(resolve => {
            setTimeout(() => resolve(generateAnalysisData(30.0, 31.0)), 2000);
        });
    }
}
