'use client';
import { useState, useRef } from 'react';
import { C } from '@/core/constants/constants';
import type { Lang, Translation } from '@/core/types';

interface Props {
    t: Translation;
    lang: Lang;
    onLangToggle: () => void;
    onImageUpload: (file: File) => void;
}

export default function SearchView({ t, lang, onLangToggle, onImageUpload }: Props) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        setUploadedFile(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleAnalyze = () => {
        if (uploadedFile) {
            onImageUpload(uploadedFile);
        }
    };

    return (
        <div dir={t.dir} style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Segoe UI',Tahoma,system-ui,sans-serif" }}>
            <div style={{ position: 'absolute', top: 14, insetInlineEnd: 14 }}>
                <button onClick={onLangToggle} style={{ border: `1px solid ${C.sky}`, borderRadius: 6, padding: '5px 13px', cursor: 'pointer', color: C.sky, background: 'rgba(14,165,233,.08)', fontSize: 12, fontWeight: 700 }}>{t.langBtn}</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                </div>
                <div style={{ fontSize: 12, color: C.sky, letterSpacing: '.08em', marginBottom: 6, fontWeight: 600 }}>{t.logoSub}</div>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 10, maxWidth: 480, lineHeight: 1.3 }}>{t.searchTitle}</h1>
                <p style={{ fontSize: 13, color: C.muted, maxWidth: 440, lineHeight: 1.7 }}>{t.searchDesc}</p>
            </div>

            <div style={{ width: '100%', maxWidth: 480 }}>
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        marginBottom: 14,
                        border: `2px dashed ${dragOver ? C.sky : C.border}`,
                        borderRadius: 10,
                        padding: uploadedFile ? '16px' : '36px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: dragOver ? 'rgba(14,165,233,.06)' : C.card,
                        transition: 'all .2s',
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/tiff,.tif,.tiff"
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                    />
                    {uploadedFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="2" strokeLinecap="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{uploadedFile.name}</span>
                            <span style={{ fontSize: 11, color: C.muted }}>({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16, padding: '0 4px', fontFamily: 'inherit' }}
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 12px' }}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            <div style={{ fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 6 }}>
                                {lang === 'ar' ? 'ارفع صورة قمر صناعي' : 'Upload Satellite Image'}
                            </div>
                            <div style={{ fontSize: 12, color: C.muted }}>
                                {lang === 'ar' ? 'اسحب الصورة هنا أو اضغط للاختيار (JPG, PNG, TIFF)' : 'Drag & drop or click to browse (JPG, PNG, TIFF)'}
                            </div>
                        </div>
                    )}
                </div>

                {uploadedFile && (
                    <button
                        onClick={handleAnalyze}
                        style={{
                            width: '100%',
                            background: C.sky,
                            border: 'none',
                            borderRadius: 7,
                            padding: '13px 20px',
                            cursor: 'pointer',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            fontFamily: 'inherit',
                        }}
                    >
                        {lang === 'ar' ? 'تحليل الصورة 🛰️' : 'Analyze Image 🛰️'}
                    </button>
                )}
            </div>
        </div>
    );
}
