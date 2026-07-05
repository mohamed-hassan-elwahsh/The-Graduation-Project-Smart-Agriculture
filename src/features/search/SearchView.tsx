'use client';
import { useState, useRef } from 'react';
import { C } from '@/core/constants/constants';
import type { Lang, Translation } from '@/core/types';

interface Props {
    t: Translation;
    lang: Lang;
    onLangToggle: () => void;
    onSearch: (lat: number, lng: number, governorate?: string) => void;
    onImageUpload?: (file: File, lat?: number, lng?: number) => void;
}

const GOVERNORATES = [
    { nameAr: 'القاهرة',       nameEn: 'Cairo',           lat: 30.0444, lng: 31.2357 },
    { nameAr: 'الجيزة',        nameEn: 'Giza',            lat: 30.0131, lng: 31.2089 },
    { nameAr: 'الإسكندرية',    nameEn: 'Alexandria',      lat: 31.2001, lng: 29.9187 },
    { nameAr: 'الدقهلية',      nameEn: 'Dakahlia',        lat: 31.0364, lng: 31.3807 },
    { nameAr: 'الشرقية',       nameEn: 'Sharqia',         lat: 30.7065, lng: 31.6366 },
    { nameAr: 'كفر الشيخ',     nameEn: 'Kafr El-Sheikh',  lat: 31.1107, lng: 30.9388 },
    { nameAr: 'الغربية',       nameEn: 'Gharbia',         lat: 30.8782, lng: 31.0333 },
    { nameAr: 'المنوفية',      nameEn: 'Menoufia',        lat: 30.5977, lng: 30.9876 },
    { nameAr: 'البحيرة',       nameEn: 'Beheira',         lat: 30.8480, lng: 30.3436 },
    { nameAr: 'الإسماعيلية',   nameEn: 'Ismailia',        lat: 30.5965, lng: 32.2715 },
    { nameAr: 'بورسعيد',       nameEn: 'Port Said',       lat: 31.2565, lng: 32.2841 },
    { nameAr: 'السويس',        nameEn: 'Suez',            lat: 29.9668, lng: 32.5498 },
    { nameAr: 'دمياط',         nameEn: 'Damietta',        lat: 31.4165, lng: 31.8133 },
    { nameAr: 'الفيوم',        nameEn: 'Fayoum',          lat: 29.3084, lng: 30.8428 },
    { nameAr: 'بني سويف',      nameEn: 'Beni Suef',       lat: 29.0661, lng: 31.0994 },
    { nameAr: 'المنيا',        nameEn: 'Minya',           lat: 28.1099, lng: 30.7503 },
    { nameAr: 'أسيوط',         nameEn: 'Asyut',           lat: 27.1783, lng: 31.1859 },
    { nameAr: 'سوهاج',         nameEn: 'Sohag',           lat: 26.5591, lng: 31.6966 },
    { nameAr: 'قنا',           nameEn: 'Qena',            lat: 26.1551, lng: 32.7160 },
    { nameAr: 'الأقصر',        nameEn: 'Luxor',           lat: 25.6872, lng: 32.6396 },
    { nameAr: 'أسوان',         nameEn: 'Aswan',           lat: 24.0889, lng: 32.8998 },
    { nameAr: 'البحر الأحمر',  nameEn: 'Red Sea',         lat: 26.9136, lng: 33.9942 },
    { nameAr: 'الوادي الجديد', nameEn: 'New Valley',      lat: 25.4456, lng: 29.6189 },
    { nameAr: 'مطروح',         nameEn: 'Matrouh',         lat: 31.3543, lng: 27.2373 },
    { nameAr: 'شمال سيناء',    nameEn: 'North Sinai',     lat: 30.2847, lng: 33.6116 },
    { nameAr: 'جنوب سيناء',    nameEn: 'South Sinai',     lat: 28.6040, lng: 33.9250 },
    { nameAr: 'القليوبية',     nameEn: 'Qalyubia',        lat: 30.3292, lng: 31.2192 },
];

export default function SearchView({ t, lang, onLangToggle, onSearch, onImageUpload }: Props) {
    const [lat, setLat]   = useState('30.5877');
    const [lng, setLng]   = useState('31.0127');
    const [selected, setSelected] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelected(val);
        if (val) {
            const gov = GOVERNORATES.find(g => g.nameEn === val);
            if (gov) { setLat(String(gov.lat)); setLng(String(gov.lng)); }
        }
    };

    const go = () => {
        const _lat = parseFloat(lat);
        const _lng = parseFloat(lng);
        if (!isNaN(_lat) && !isNaN(_lng)) {
            const gov = GOVERNORATES.find(g => g.nameEn === selected);
            const govName = gov ? (lang === 'ar' ? gov.nameAr : gov.nameEn) : undefined;
            onSearch(_lat, _lng, govName);
        }
    };

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

    const handleUploadAnalyze = () => {
        if (uploadedFile && onImageUpload) {
            const _lat = parseFloat(lat);
            const _lng = parseFloat(lng);
            onImageUpload(uploadedFile, isNaN(_lat) ? undefined : _lat, isNaN(_lng) ? undefined : _lng);
        }
    };

    const inputStyle = {
        flex: 1, background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 7, padding: '11px 14px', color: C.text, fontSize: 13,
        outline: 'none', fontFamily: 'inherit'
    } as React.CSSProperties;

    return (
        <div dir={t.dir} style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Segoe UI',Tahoma,system-ui,sans-serif" }}>
            <div style={{ position: 'absolute', top: 14, insetInlineEnd: 14 }}>
                <button onClick={onLangToggle} style={{ border: `1px solid ${C.sky}`, borderRadius: 6, padding: '5px 13px', cursor: 'pointer', color: C.sky, background: 'rgba(14,165,233,.08)', fontSize: 12, fontWeight: 700 }}>{t.langBtn}</button>
            </div>

            {/* Logo + Title */}
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
                {/* Image Upload Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        marginBottom: 14,
                        border: `2px dashed ${dragOver ? C.sky : C.border}`,
                        borderRadius: 10,
                        padding: uploadedFile ? '16px' : '28px 20px',
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
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 10px' }}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 4 }}>
                                {lang === 'ar' ? 'ارفع صورة قمر صناعي' : 'Upload Satellite Image'}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted }}>
                                {lang === 'ar' ? 'اسحب الصورة هنا أو اضغط للاختيار (JPG, PNG, TIFF)' : 'Drag & drop or click to browse (JPG, PNG, TIFF)'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Analyze Button */}
                {uploadedFile && (
                    <button
                        onClick={handleUploadAnalyze}
                        style={{
                            width: '100%',
                            background: C.sky,
                            border: 'none',
                            borderRadius: 7,
                            padding: '12px 20px',
                            cursor: 'pointer',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            marginBottom: 14,
                            fontFamily: 'inherit',
                        }}
                    >
                        {lang === 'ar' ? 'تحليل الصورة المرفوعة 🛰️' : 'Analyze Uploaded Image 🛰️'}
                    </button>
                )}

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <span style={{ fontSize: 11, color: C.dim, fontWeight: 600 }}>
                        {lang === 'ar' ? 'أو أدخل الإحداثيات' : 'OR ENTER COORDINATES'}
                    </span>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>

                {/* Governorate Dropdown */}
                <div style={{ marginBottom: 10 }}>
                    <select
                        value={selected}
                        onChange={handleGovChange}
                        style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: '11px 14px', color: selected ? C.text : C.muted, fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: `${lang === 'ar' ? 'left' : 'right'} 14px center` }}
                    >
                        <option value="">{lang === 'ar' ? '— اختر المحافظة —' : '— Select Governorate —'}</option>
                        {GOVERNORATES.map(g => (
                            <option key={g.nameEn} value={g.nameEn}>
                                {lang === 'ar' ? g.nameAr : g.nameEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Lat / Lng Inputs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input value={lat} onChange={e => setLat(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()}
                        placeholder="Latitude (e.g. 30.58)" type="number" step="any" style={inputStyle} />
                    <input value={lng} onChange={e => setLng(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()}
                        placeholder="Longitude (e.g. 31.01)" type="number" step="any" style={inputStyle} />
                    <button onClick={go} style={{ background: C.sky, border: 'none', borderRadius: 7, padding: '0 20px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                        {t.searchBtn}
                    </button>
                </div>

                {/* Quick examples */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: C.dim }}>{t.examplesLbl}</span>
                    {[
                        { label: lang === 'ar' ? 'كفر الشيخ' : 'Kafr El-Sheikh', gov: 'Kafr El-Sheikh' },
                        { label: lang === 'ar' ? 'الشرقية'   : 'Sharqia',        gov: 'Sharqia' },
                        { label: lang === 'ar' ? 'الدقهلية'  : 'Dakahlia',       gov: 'Dakahlia' },
                    ].map(ex => (
                        <button key={ex.gov} onClick={() => {
                            const gov = GOVERNORATES.find(g => g.nameEn === ex.gov)!;
                            setSelected(ex.gov);
                            setLat(String(gov.lat));
                            setLng(String(gov.lng));
                        }}
                            style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 5, padding: '3px 10px', cursor: 'pointer', color: C.muted, fontSize: 11, fontFamily: 'inherit' }}>
                            {ex.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
