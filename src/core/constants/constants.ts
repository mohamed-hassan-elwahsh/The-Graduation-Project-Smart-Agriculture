export const C = {
  bg:     '#0f172a',
  card:   '#1e293b',
  card2:  '#0f1f33',
  border: '#334155',
  text:   '#f1f5f9',
  muted:  '#94a3b8',
  dim:    '#475569',
  sky:    '#0ea5e9',
  green:  '#10b981',
  amber:  '#f59e0b',
  red:    '#ef4444',
  purple: '#8b5cf6',
} as const;

export const CROP_COLORS: Record<string, string> = {
  Rice: '#0ea5e9', Wheat: '#f59e0b', Corn: '#10b981',
  Other: '#8b5cf6', Water: '#3b82f6',
};

export const SEV_COLORS: Record<string, string> = {
  critical: '#ef4444', warning: '#f59e0b', info: '#0ea5e9',
};

export const TYPE_COLORS: Record<string, string> = {
  error: '#ef4444', warning: '#f59e0b', success: '#10b981', info: '#0ea5e9',
};

export const STAT_COLORS = ['#0ea5e9', '#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6'];

export const LAYERS = [
  { id: 'image' as const,          c: '#0ea5e9' },
  { id: 'segmentation' as const,   c: '#10b981' },
  { id: 'classification' as const, c: '#f59e0b' },
  { id: 'ndvi' as const,           c: '#8b5cf6' },
] as const;
