export type Lang        = 'en' | 'ar';
export type Phase       = 'search' | 'analyzing' | 'dashboard';
export type LayerId     = 'agri' | 'crop' | 'veg' | 'water';
export type Severity    = 'critical' | 'warning' | 'info';
export type InsightType = 'error' | 'warning' | 'success' | 'info';
export type CropType    = 'Rice' | 'Wheat' | 'Corn' | 'Other' | 'Water';

export interface Field {
  id: number;
  l: string; t: string; w: string; h: string;
  crop: CropType;
  conf: number; health: number; feddan: number; ndvi: number;
  stage?: number; // 0: Bare, 1: Emergence, 2: Vegetative, 3: Reproductive, 4: Maturity
  yieldEn: string; yieldAr: string;
  wEn: string; wAr: string;
}

export interface CropDistItem { nEn: string; nAr: string; v: number; c: string; }
export interface VegPoint     { y: string; v: number; }
export interface WaterPoint   { y: string; w: number; }

export interface Insight {
  type: InsightType; icon: string;
  iEn: string; iAr: string;
  rEn: string; rAr: string;
  mEn: string; mAr: string;
}

export interface Alert {
  sev: Severity;
  tEn: string; tAr: string;
  dEn: string; dAr: string;
  time: string;
}

export interface AnalysisData {
  locEn: string; locAr: string;
  dateEn: string; dateAr: string;
  stats: number[];
  regions: Field[];
  cropDist: CropDistItem[];
  vegTrend: VegPoint[];
  waterTrend: WaterPoint[];
  insights: Insight[];
  alerts: Alert[];
}

export interface Translation {
  dir: 'ltr' | 'rtl';
  logo: string; logoSub: string;
  searchTitle: string; searchDesc: string; searchPh: string;
  searchBtn: string; examplesLbl: string; examples: string[];
  analyzingTitle: string; steps: string[];
  live: string; langBtn: string; newBtn: string; exportBtn: string;
  statLabels: string[]; statUnits: string[];
  mapTitle: string; inspTitle: string;
  layerLbls: Record<LayerId, string>;
  cropNames: Record<CropType, string>;
  inspEmpty: string;
  cropLbl: string; confLbl: string; healthLbl: string;
  areaLbl: string; ndviLbl: string; yieldLbl: string; waterNeedLbl: string;
  stageLbl: string; stages: string[];
  viewBtn: string;
  cropChartTitle: string; vegChartTitle: string; waterChartTitle: string;
  aiTitle: string; aiSub: string;
  issueLbl: string; recLbl: string; impactLbl: string;
  alertTitle: string;
  sevLbls: Record<Severity, string>;
  expTitle: string; expSub: string; expDone: string;
  dlBtn: string; closeBtn: string; genLbl: string; expSteps: string[];
}