'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { C } from '@/lib/constants';
import type { CropDistItem, Lang } from '@/types';

const TT = { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11 } };

export default function CropPieChart({ data, lang, title }: { data: CropDistItem[]; lang: Lang; title: string }) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 11, color: '#b8d4e8', marginBottom: 9 }}>{title}</div>
            <div style={{ height: 148, position: 'relative' }} dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="v" cx="45%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2}>
                            {data.map((e, i) => <Cell key={i} fill={e.c} strokeWidth={0} />)}
                        </Pie>
                        <Tooltip formatter={(v) => `${v}%`} {...TT} />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: 8, insetInlineEnd: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {data.map(d => (
                        <div key={d.nEn} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.c, flexShrink: 0 }} />
                            <span style={{ fontSize: 10, color: C.muted }}>{lang === 'en' ? d.nEn : d.nAr} {d.v}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}