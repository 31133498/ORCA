'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  data: Array<{ hour: string; count: number }>;
  height?: number;
  color?: string;
}

export default function Sparkline({ data, height = 80, color = '#111111' }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis dataKey="hour" hide />
        <YAxis hide />
        <Tooltip
          cursor={{ stroke: '#E5E7EB' }}
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'DM Mono, monospace',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
