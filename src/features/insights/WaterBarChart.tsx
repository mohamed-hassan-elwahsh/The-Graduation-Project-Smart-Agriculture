'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { C } from '@/core/constants/constants';
import type { WaterPoint } from '@/core/types';

const TT = { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11 } };

export default function WaterBarChart({ data, title }: { data: WaterPoint[]; title: string }) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 11, color: '#b8d4e8', marginBottom: 9 }}>{title}</div>
            <div style={{ height: 148 }} dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 4, right: 10, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                        <XAxis dataKey="y" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                        <YAxis domain={[1.4, 2.1]} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                        <Tooltip {...TT} formatter={(value: any) => [
                            typeof value === 'number' ? value.toFixed(2) : value,
                            'M m³'
                        ]} />
                        <Bar dataKey="w" fill={C.sky} radius={[3, 3, 0, 0]} maxBarSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}