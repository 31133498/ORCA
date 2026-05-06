'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Topbar from '@/components/dashboard/Topbar';
import HeatmapView from '@/components/dashboard/Heatmap';
import PriorityMatrix from '@/components/dashboard/PriorityMatrix';
import { api } from '@/lib/api';
import type { Heatmap, LiveStats, PriorityRow } from '@/lib/types';

const PATHWAY_COLOR: Record<string, string> = {
  AUTO_REPLY: '#059669',
  AGENT_PING: '#D97706',
  ESCALATE_FLAG: '#DC2626',
};

export default function ReportsPage() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [matrix, setMatrix] = useState<PriorityRow[]>([]);
  const [heatmap, setHeatmap] = useState<Heatmap | null>(null);
  const [days, setDays] = useState(7);

  const refresh = useCallback(async () => {
    try {
      const [s, m, h] = await Promise.all([
        api.liveStats(),
        api.priorityMatrix(days),
        api.heatmap(),
      ]);
      setStats(s);
      setMatrix(m.rows);
      setHeatmap(h);
    } catch (e) {
      console.error(e);
    }
  }, [days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <Topbar
        title="Intelligence reports"
        subtitle={`Priority issue matrix · churn heatmap · pathway split — ${days}-day window`}
        onRefresh={refresh}
      />

      <main className="space-y-6 p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-data text-[10px] font-semibold uppercase tracking-label text-ink-3">
            Window
          </span>
          <div className="flex items-center gap-1 rounded-md border border-chrome-1 bg-canvas-elevated p-0.5">
            {[1, 7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`h-7 rounded-sm px-3 font-data text-[11px] font-semibold uppercase tracking-label transition-colors ${
                  days === d ? 'bg-ink-1 text-white' : 'text-ink-2 hover:bg-canvas-sunken'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <section>
          <h2 className="text-[16px] font-semibold text-ink-1">Priority issue matrix</h2>
          <p className="mt-0.5 text-[12px] text-ink-3">
            Score = volume × urgency × (1 + sentiment Δ) ÷ (1 + resolution rate). Highest = act first.
          </p>
          <div className="mt-3">
            <PriorityMatrix rows={matrix} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-ink-1">Churn risk heatmap</h2>
              <span className="font-data text-[11px] uppercase tracking-label text-ink-3">
                Region × ARPU band
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-ink-3">
              Avg churn risk per cell. Numbers below = customer count · {' '}
              <span className="text-status-critical">!</span> = customers in CRITICAL band.
            </p>
            <div className="mt-4">
              {heatmap ? <HeatmapView data={heatmap} /> : <Skeleton h={220} />}
            </div>
          </div>

          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-5">
            <h2 className="text-[16px] font-semibold text-ink-1">Resolution pathway split</h2>
            <p className="mt-0.5 text-[12px] text-ink-3">
              How ORCA routed every classified mention in the last 24h.
            </p>
            <div className="mt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.by_pathway ?? []}
                    dataKey="count"
                    nameKey="pathway"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {(stats?.by_pathway ?? []).map((p) => (
                      <Cell key={p.pathway} fill={PATHWAY_COLOR[p.pathway] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: 'DM Mono, monospace',
                    }}
                  />
                  <Legend
                    iconType="square"
                    wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#4B5563' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-chrome-1 bg-canvas-elevated p-5">
          <h2 className="text-[16px] font-semibold text-ink-1">Category volume · 24h</h2>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.by_category ?? []} margin={{ left: 0, right: 8, top: 8, bottom: 36 }}>
                <CartesianGrid stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#4B5563', fontSize: 10, fontFamily: 'Inter' }}
                  angle={-18}
                  height={60}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 10, fontFamily: 'DM Mono' }} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: 'DM Mono, monospace',
                  }}
                />
                <Bar dataKey="count" fill="#111111" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </>
  );
}

function Skeleton({ h = 200 }: { h?: number }) {
  return <div className="animate-pulse rounded-md bg-canvas-sunken" style={{ height: h }} />;
}
