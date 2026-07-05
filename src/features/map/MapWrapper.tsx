'use client';
import dynamic from 'next/dynamic';
import { C } from '@/core/constants/constants';

const ImageViewer = dynamic(() => import('./ImageViewer'), {
    ssr: false,
    loading: () => (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 270 }}>
            <div style={{ color: C.sky, fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <style>{`@keyframes spinMap { 100% { transform: rotate(360deg) } }`}</style>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spinMap 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Loading...</span>
            </div>
        </div>
    )
});

export default ImageViewer;
