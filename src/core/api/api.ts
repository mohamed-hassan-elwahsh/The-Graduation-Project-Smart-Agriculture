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
            const errText = await res.text().catch(() => 'Unknown error');
            throw new Error(`Backend error ${res.status}: ${errText}`);
        }

        return await res.json();
    } catch (e: any) {
        const errMsg = e?.message || String(e);
        console.error('analyzeImage failed:', errMsg);
        alert('Failed to connect to backend\n' + errMsg + '\n\nMake sure backend is running on http://localhost:8000');
        return new Promise(resolve => {
            setTimeout(() => resolve(generateAnalysisData(30.0, 31.0)), 2000);
        });
    }
}
