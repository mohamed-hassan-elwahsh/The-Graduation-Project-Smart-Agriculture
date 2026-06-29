import type { AnalysisData } from '@/types';

// ─── SWAP THIS FILE WITH REAL API RESPONSE WHEN BACKEND IS READY ───
export const MOCK: AnalysisData = {
  locEn: 'Kafr El-Sheikh, Egypt', locAr: 'كفر الشيخ، مصر',
  dateEn: 'Apr 12, 2026 · 09:42 UTC', dateAr: '12 أبريل 2026 · 09:42',

  // [areaKm², riceKm², waterMm³, vegHealth%, fieldsCount]
  stats: [120, 41.2, 1.84, 76, 127],

  regions: [
    { id:1, l:'6%',  t:'8%',  w:'22%', h:'23%', crop:'Rice',  conf:94, health:82, feddan:3381, ndvi:0.72, stage: 3, yieldEn:'4.1 ton/fd', yieldAr:'4.1 طن/فدان', wEn:'2,100 m³/ton', wAr:'2,100 م³/طن' },
    { id:2, l:'35%', t:'6%',  w:'25%', h:'21%', crop:'Wheat', conf:88, health:71, feddan:2048, ndvi:0.65, stage: 3, yieldEn:'2.8 ton/fd', yieldAr:'2.8 طن/فدان', wEn:'850 m³/ton',   wAr:'850 م³/طن'   },
    { id:3, l:'11%', t:'43%', w:'19%', h:'25%', crop:'Corn',  conf:91, health:78, feddan:2690, ndvi:0.69, stage: 3, yieldEn:'3.5 ton/fd', yieldAr:'3.5 طن/فدان', wEn:'1,200 m³/ton', wAr:'1,200 م³/طن' },
    { id:4, l:'62%', t:'10%', w:'22%', h:'31%', crop:'Rice',  conf:96, health:85, feddan:2333, ndvi:0.74, stage: 4, yieldEn:'4.4 ton/fd', yieldAr:'4.4 طن/فدان', wEn:'2,050 m³/ton', wAr:'2,050 م³/طن' },
    { id:5, l:'70%', t:'54%', w:'16%', h:'21%', crop:'Other', conf:79, health:62, feddan:976,  ndvi:0.55, stage: 2, yieldEn:'—',          yieldAr:'—',           wEn:'—',            wAr:'—'            },
    { id:6, l:'34%', t:'47%', w:'16%', h:'18%', crop:'Water', conf:99, health:100,feddan:762,  ndvi:-0.10, stage: 0, yieldEn:'—',          yieldAr:'—',           wEn:'—',            wAr:'—'            },
    { id:7, l:'4%',  t:'68%', w:'20%', h:'21%', crop:'Wheat', conf:87, health:74, feddan:1786, ndvi:0.67, stage: 3, yieldEn:'2.9 ton/fd', yieldAr:'2.9 طن/فدان', wEn:'820 m³/ton',   wAr:'820 م³/طن'   },
  ],

  cropDist: [
    { nEn:'Rice',  nAr:'أرز',  v:34, c:'#0ea5e9' },
    { nEn:'Wheat', nAr:'قمح',  v:28, c:'#f59e0b' },
    { nEn:'Corn',  nAr:'ذرة',  v:22, c:'#10b981' },
    { nEn:'Other', nAr:'أخرى', v:16, c:'#8b5cf6' },
  ],

  vegTrend: [
    { y:'2019', v:62 }, { y:'2020', v:67 }, { y:'2021', v:64 },
    { y:'2022', v:70 }, { y:'2023', v:68 }, { y:'2024', v:74 },
  ],

  waterTrend: [
    { y:'2019', w:1.65 }, { y:'2020', w:1.72 }, { y:'2021', w:1.58 },
    { y:'2022', w:1.90 }, { y:'2023', w:1.75 }, { y:'2024', w:1.84 },
  ],

  insights: [
    {
      type:'warning', icon:'💧',
      iEn:'High water consumption — Rice fields #1 & #4',
      iAr:'استهلاك مياه مرتفع — حقول الأرز #1 و #4',
      rEn:'Apply Alternate Wetting & Drying (AWD). Reduces water use 30–40% with zero yield impact.',
      rAr:'تطبيق تقنية التجفيف والري المتناوب (AWD). تُقلل الاستهلاك 30–40٪ دون تأثير على الإنتاج.',
      mEn:'Saves ~550,000 m³ per season', mAr:'توفر ~550,000 م³ في الموسم',
    },
    {
      type:'success', icon:'🌾',
      iEn:'Optimal harvest window — Rice fields #1 & #4',
      iAr:'نافذة الحصاد المثلى — حقول الأرز #1 و #4',
      rEn:'NDVI at peak maturity. Harvest within 14–18 days for maximum grain quality.',
      rAr:'NDVI عند النضج الأقصى. الحصاد خلال 14–18 يوماً لأعلى جودة حبوب.',
      mEn:'Expected: 4.1–4.4 ton/feddan', mAr:'متوقع: 4.1–4.4 طن/فدان',
    },
    {
      type:'error', icon:'⚠️',
      iEn:'Crop stress detected — Field #5 (eastern sector)',
      iAr:'إجهاد محاصيل — الحقل #5 (القطاع الشرقي)',
      rEn:'NDVI is 18% below seasonal average. Apply nitrogen (30 kg/feddan) and irrigate within 48h.',
      rAr:'NDVI أقل 18٪ من المتوسط. أضف سماد نيتروجين (30 كجم/فدان) وري خلال 48 ساعة.',
      mEn:'Prevents ~20% yield loss', mAr:'يمنع ~20٪ خسارة في المنطقة',
    },
    {
      type:'info', icon:'📊',
      iEn:'Field #3 has highest land quality score (92/100)',
      iAr:'الحقل #3 يملك أعلى جودة تربة (92/100)',
      rEn:'Superior nitrogen retention & drainage. Expand rice cultivation here next season.',
      rAr:'احتباس نيتروجين ممتاز وصرف جيد. وسّع زراعة الأرز هنا الموسم القادم.',
      mEn:'Projected +15% yield vs. current fields', mAr:'إنتاجية أعلى +15٪ مقارنة بالحقول الحالية',
    },
  ],

  alerts: [
    { sev:'critical', tEn:'Water Stress — Fields #1, #4', tAr:'إجهاد مائي — الحقول #1 و #4',  dEn:'Moisture 25% below threshold',    dAr:'رطوبة أقل 25٪ من الحد الأمثل', time:'2h' },
    { sev:'warning',  tEn:'Pest Activity — Field #5',    tAr:'نشاط آفات — الحقل #5',           dEn:'Unusual spectral signature',       dAr:'توقيع طيفي غير عادي',           time:'6h' },
    { sev:'info',     tEn:'Rain forecast in 48h',        tAr:'توقعات بأمطار خلال 48 ساعة',    dEn:'Delay irrigation in fields #2, #7', dAr:'أخر ري الحقول #2 و #7',         time:'1h' },
  ],
};