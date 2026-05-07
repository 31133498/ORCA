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
  AUTO_REPLY: '#22C55E',
  AGENT_PING: '#FACC15',
  ESCALATE_FLAG: '#EF4444',
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
        subtitle={`Priority matrix · churn heatmap · pathway split — ${days}-day window`}
        onRefresh={refresh}
      />

      <main className="space-y-5 p-4 sm:p-6 md:p-8">
        {/* Window selector */}
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
                  days === d ? 'bg-mtn-yellow text-black' : 'text-ink-2 hover:bg-canvas-sunken'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <section>
          <h2 className="text-[15px] font-semibold text-ink-1 sm:text-[16px]">Priority issue matrix</h2>
          <p className="mt-0.5 text-[12px] text-ink-3">
            Score = volume × urgency × (1 + sentiment Δ) ÷ (1 + resolution rate). Highest = act first.
          </p>
          <div className="mt-3">
            <PriorityMatrix rows={matrix} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-4 sm:p-5 lg:col-span-2">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-ink-1 sm:text-[16px]">Churn risk heatmap</h2>
              <span className="flex-shrink-0 font-data text-[10px] uppercase tracking-label text-ink-3">
                Region × ARPU
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-ink-3">
              Avg churn risk per cell.{' '}
              <span className="text-status-critical">!</span> = CRITICAL customers.
            </p>
            <div className="mt-4 overflow-x-auto">
              {heatmap ? <HeatmapView data={heatmap} /> : <Skeleton h={200} />}
            </div>
          </div>

          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-4 sm:p-5">
            <h2 className="text-[15px] font-semibold text-ink-1 sm:text-[16px]">Pathway split</h2>
            <p className="mt-0.5 text-[12px] text-ink-3">How ORCA routed mentions · last 24h.</p>
            <div className="mt-4 h-[200px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.by_pathway ?? []}
                    dataKey="count"
                    nameKey="pathway"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {(stats?.by_pathway ?? []).map((p) => (
                      <Cell key={p.pathway} fill={PATHWAY_COLOR[p.pathway] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0A0A0A',
                      border: '1px solid #262626',
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: 'DM Mono, monospace',
                      color: '#FAFAFA',
                    }}
                  />
                  <Legend
                    iconType="square"
                    wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#A3A3A3' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-chrome-1 bg-canvas-elevated p-4 sm:p-5">
          <h2 className="text-[15px] font-semibold text-ink-1 sm:text-[16px]">Category volume · 24h</h2>
          <div className="mt-3 h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.by_category ?? []} margin={{ left: 0, right: 8, top: 8, bottom: 36 }}>
                <CartesianGrid stroke="#1C1C1C" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#A3A3A3', fontSize: 10, fontFamily: 'Inter' }}
                  angle={-18}
                  height={60}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'DM Mono' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(250,204,21,0.06)' }}
                  contentStyle={{
                    background: '#0A0A0A',
                    border: '1px solid #262626',
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: 'DM Mono, monospace',
                    color: '#FAFAFA',
                  }}
                />
                <Bar dataKey="count" fill="#FFCC00" radius={[3, 3, 0, 0]} />
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
