'use client';
import { useState, useEffect } from 'react';
import { C } from '@/core/constants/constants';
import type { Translation } from '@/core/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props { t: Translation; open: boolean; onClose: () => void; }

export default function ExportModal({ t, open, onClose }: Props) {
    const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

    useEffect(() => {
        if (!open) {
            setStatus('idle');
            setPdfBlob(null);
            return;
        }

        const generatePDF = async () => {
            try {
                setStatus('generating');
                const element = document.getElementById('dashboard-content');
                if (!element) throw new Error('Dashboard not found');

                await new Promise(r => setTimeout(r, 500)); 

                const canvas = await html2canvas(element, {
                    scale: 2, 
                    useCORS: true, 
                    logging: false,
                    backgroundColor: '#070c14'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const pdf = new jsPDF({
                    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });

                pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
                const blob = pdf.output('blob');
                setPdfBlob(blob);
                setStatus('done');
            } catch (err) {
                console.error('PDF Generation failed:', err);
                setStatus('idle'); 
                onClose();
            }
        };

        generatePDF();
    }, [open, onClose]);

    const handleDownload = () => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agrisat_report_${new Date().toISOString().slice(0,10)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        onClose();
    };

    if (!open) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,12,22,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
            onClick={onClose}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: 20, width: 300, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 15 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(14,165,233,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{t.expTitle}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{t.expSub}</div>
                    </div>
                    <button onClick={onClose} style={{ marginInlineStart: 'auto', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
                </div>

                {status === 'generating' ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="3" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                        </div>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Generating...</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Snapshotting dashboard</div>
                    </div>
                ) : status === 'done' ? (
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                        <div style={{ fontWeight: 600, color: C.text, marginBottom: 2 }}>Export Ready</div>
                        <div style={{ fontSize: 10, color: C.muted, marginBottom: 14 }}>agrisat_report.pdf</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={handleDownload} style={{ flex: 1, padding: 7, background: 'rgba(14,165,233,.1)', border: '1px solid rgba(14,165,233,.3)', borderRadius: 5, color: C.sky, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Download</button>
                            <button onClick={onClose} style={{ flex: 1, padding: 7, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}