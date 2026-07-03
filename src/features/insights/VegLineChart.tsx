'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { C } from '@/core/constants/constants';
import type { VegPoint } from '@/core/types';

const TT = { contentStyle: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11 } };

function formatTooltipValue(value: number | string | readonly (number | string)[] | undefined) {
    if (Array.isArray(value)) {
        return value.map(v => (typeof v === 'number' ? v.toFixed(2) : v ?? '–')).join(', ');
    }
    return typeof value === 'number' ? value.toFixed(2) : value ?? '–';
}

export default function VegLineChart({ data, title }: { data: VegPoint[]; title: string }) {
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 11, color: '#b8d4e8', marginBottom: 9 }}>{title}</div>
            <div style={{ height: 148 }} dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                        <XAxis dataKey="y" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                        <YAxis domain={[55, 80]} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                        <Tooltip {...TT} formatter={(value) => [formatTooltipValue(value), 'NDVI']} />
                        <Line type="monotone" dataKey="v" stroke={C.green} strokeWidth={2} dot={{ fill: C.green, r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}