'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiPulseLine,
  RiTimerLine,
  RiUserUnfollowLine,
} from 'react-icons/ri';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import Sparkline from '@/components/dashboard/Sparkline';
import PriorityMatrix from '@/components/dashboard/PriorityMatrix';
import MentionCard from '@/components/dashboard/MentionCard';
import { api } from '@/lib/api';
import { compact, durationSeconds, naira, pct } from '@/lib/format';
import type { LiveStats, Mention, PriorityRow } from '@/lib/types';

export default function OverviewPage() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [matrix, setMatrix] = useState<PriorityRow[]>([]);
  const [recent, setRecent] = useState<Mention[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [s, m, r] = await Promise.all([
        api.liveStats(),
        api.priorityMatrix(7),
        api.mentions({ limit: 6, hours: 24 }),
      ]);
      setStats(s);
      setMatrix(m.rows);
      setRecent(r.items);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 12_000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <>
      <Topbar
        title="Operations overview"
        subtitle="MTN Nigeria · X (Twitter) channel · last 24h"
        onRefresh={refresh}
        liveCount={stats?.total_mentions_24h}
      />

      <main className="space-y-6 p-8">
        {/* KPI strip */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Mentions · 24h"
            value={stats?.total_mentions_24h ?? '—'}
            hint={stats ? 'across all categories' : 'loading…'}
            icon={<RiPulseLine size={16} />}
          />
          <StatCard
            label="Auto-resolved"
            value={stats ? pct(stats.auto_resolve_rate, 0) : '—'}
            hint={stats ? `${stats.auto_resolved_24h} replies posted` : 'loading…'}
            emphasis="positive"
            icon={<RiCheckDoubleLine size={16} />}
          />
          <StatCard
            label="Escalated to agent"
            value={stats?.escalated_24h ?? '—'}
            hint={stats ? `${stats.by_pathway.find((p) => p.pathway === 'ESCALATE_FLAG')?.count ?? 0} hard-flagged` : 'loading…'}
            emphasis="warning"
            icon={<RiUserUnfollowLine size={16} />}
          />
          <StatCard
            label="Avg time to resolve"
            value={stats ? durationSeconds(stats.avg_response_seconds) : '—'}
            hint="from queued → resolved"
            icon={<RiTimerLine size={16} />}
          />
        </section>

        {/* Stream + category mix */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-data text-[10px] font-semibold uppercase tracking-label text-ink-3">
                  Mentions per hour · 24h
                </p>
                <p className="mt-1 text-[14px] text-ink-2">
                  Live ingestion volume from Apify scraper into ORCA's classification pipeline.
                </p>
              </div>
              <span className="font-data text-[11px] uppercase tracking-label text-ink-3">
                Total {stats?.total_mentions_24h ?? 0}
              </span>
            </div>
            <div className="mt-4">
              <Sparkline data={stats?.timeseries ?? []} height={140} />
            </div>
          </div>

          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-5">
            <p className="font-data text-[10px] font-semibold uppercase tracking-label text-ink-3">
              Category mix · 24h
            </p>
            <div className="mt-3 h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.by_category ?? []}
                  layout="vertical"
                  margin={{ left: 4, right: 8, top: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 10, fontFamily: 'DM Mono' }} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={120}
                    tick={{ fill: '#4B5563', fontSize: 11, fontFamily: 'Inter' }}
                  />
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
                  <Bar dataKey="count" fill="#111111" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Priority matrix */}
        <section>
          <SectionHeader
            title="Priority issue matrix · last 7 days"
            link={{ href: '/dashboard/reports', label: 'Full report' }}
          />
          <div className="mt-3">
            <PriorityMatrix rows={matrix} />
          </div>
        </section>

        {/* Top risk + recent stream */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-5">
            <p className="font-data text-[10px] font-semibold uppercase tracking-label text-ink-3">
              Top churn-risk subscribers
            </p>
            <ul className="mt-3 space-y-3">
              {(stats?.top_risk ?? []).map((c, i) => (
                <li
                  key={c.handle}
                  className="flex items-center gap-3 rounded-md border border-chrome-1 bg-canvas-sunken p-3"
                >
                  <span className="font-data text-[12px] text-ink-3">#{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink-1">{c.display_name}</p>
                    <p className="font-data text-[11px] text-ink-3">
                      @{c.handle} · {c.region} · {naira(c.arpu_naira)}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 font-data text-[12px] font-semibold ${
                      c.risk >= 90
                        ? 'bg-status-critical text-white'
                        : c.risk >= 70
                        ? 'bg-status-critical-bg text-status-high'
                        : 'bg-status-watch-bg text-status-watch'
                    }`}
                  >
                    {c.risk}
                  </span>
                </li>
              ))}
              {!stats?.top_risk?.length ? <Empty label="No risk data yet" /> : null}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <SectionHeader
              title="Recent mentions"
              link={{ href: '/dashboard/mentions', label: 'See all' }}
            />
            <div className="mt-3 space-y-3">
              {recent.map((m) => (
                <Link key={m.id} href={`/dashboard/queue`}>
                  <MentionCard mention={m} compact />
                </Link>
              ))}
              {!recent.length ? <Empty label="No mentions in last 24h" /> : null}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function SectionHeader({
  title,
  link,
}: {
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="text-[16px] font-semibold text-ink-1">{title}</h2>
      {link ? (
        <Link
          href={link.href}
          className="inline-flex items-center gap-1 font-data text-[11px] uppercase tracking-label text-ink-3 hover:text-ink-1"
        >
          {link.label}
          <RiArrowRightLine size={12} />
        </Link>
      ) : null}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-chrome-1 bg-canvas px-4 py-6 text-center text-[12px] text-ink-3">
      {label}
    </div>
  );
}
