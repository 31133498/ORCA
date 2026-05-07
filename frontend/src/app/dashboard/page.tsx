'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiPulseLine,
  RiTimerLine,
  RiUserUnfollowLine,
} from 'react-icons/ri';
import { FaXTwitter, FaFacebook, FaInstagram, FaReddit } from 'react-icons/fa6';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

      <main className="space-y-5 p-4 sm:p-6 md:p-8">
        {/* KPI strip */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
            label="Escalated"
            value={stats?.escalated_24h ?? '—'}
            hint={stats ? `${stats.by_pathway.find((p) => p.pathway === 'ESCALATE_FLAG')?.count ?? 0} hard-flagged` : 'loading…'}
            emphasis="warning"
            icon={<RiUserUnfollowLine size={16} />}
          />
          <StatCard
            label="Avg resolve time"
            value={stats ? durationSeconds(stats.avg_response_seconds) : '—'}
            hint="queued → resolved"
            icon={<RiTimerLine size={16} />}
          />
        </section>

        {/* Stream + category mix */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-4 sm:p-5 lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-data text-[10px] font-semibold uppercase tracking-label text-ink-3">
                  Mentions per hour · 24h
                </p>
                <p className="mt-1 hidden text-[13px] text-ink-2 sm:block">
                  Live ingestion volume from Apify scraper.
                </p>
              </div>
              <span className="font-data text-[11px] uppercase tracking-label text-ink-3">
                Total {stats?.total_mentions_24h ?? 0}
              </span>
            </div>
            <div className="mt-4">
              <Sparkline data={stats?.timeseries ?? []} height={120} color="#FFCC00" />
            </div>
          </div>

          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-4 sm:p-5">
            <p className="font-data text-[10px] font-semibold uppercase tracking-label text-ink-3">
              Category mix · 24h
            </p>
            <div className="mt-3 h-[120px] sm:h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.by_category ?? []}
                  layout="vertical"
                  margin={{ left: 4, right: 8, top: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#1C1C1C" />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'DM Mono' }} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={120}
                    tick={{ fill: '#A3A3A3', fontSize: 11, fontFamily: 'Inter' }}
                  />
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
                  <Bar dataKey="count" fill="#FFCC00" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Platform breakdown */}
        <section>
          <SectionHeader title="Complaints by platform · 24h" />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { key: 'facebook',  label: 'Facebook',  Icon: FaFacebook,  color: '#1877F2', reach: '38–47M users' },
              { key: 'x',         label: 'X',         Icon: FaXTwitter,  color: '#FFFFFF',  reach: '7.5M users' },
              { key: 'instagram', label: 'Instagram', Icon: FaInstagram, color: '#E1306C', reach: '10M users' },
              { key: 'reddit',    label: 'Reddit',    Icon: FaReddit,    color: '#FF4500', reach: 'Niche/vocal' },
            ].map(({ key, label, Icon, color, reach }) => {
              const entry = stats?.by_platform?.find(p => p.platform === key);
              const count = entry?.count ?? 0;
              const total = stats?.by_platform?.reduce((s, p) => s + p.count, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} className="rounded-lg border border-chrome-1 bg-canvas-elevated p-3">
                  <div className="flex items-center gap-2">
                    <Icon size={14} style={{ color }} />
                    <span className="font-data text-[11px] font-semibold uppercase tracking-label text-ink-3">{label}</span>
                  </div>
                  <p className="mt-2 font-data text-[24px] font-semibold tabular-nums text-ink-1">{count}</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-chrome-1">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <p className="mt-1.5 font-data text-[10px] text-ink-3">{pct}% · {reach}</p>
                </div>
              );
            })}
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
          <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-4 sm:p-5">
            <p className="font-data text-[10px] font-semibold uppercase tracking-label text-ink-3">
              Top churn-risk subscribers
            </p>
            <ul className="mt-3 space-y-2">
              {(stats?.top_risk ?? []).map((c, i) => (
                <li
                  key={c.handle}
                  className="flex items-center gap-3 rounded-md border border-chrome-1 bg-canvas-sunken p-2.5"
                >
                  <span className="font-data text-[12px] text-accent">#{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink-1">{c.display_name}</p>
                    <p className="truncate font-data text-[11px] text-ink-3">
                      @{c.handle} · {c.region} · {naira(c.arpu_naira)}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-md px-2 py-0.5 font-data text-[12px] font-semibold ${
                      c.risk >= 90
                        ? 'bg-status-critical text-white'
                        : c.risk >= 70
                        ? 'bg-status-critical/15 text-status-high ring-1 ring-status-high/30'
                        : 'bg-accent/15 text-accent ring-1 ring-accent/30'
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
      <h2 className="text-[15px] font-semibold text-ink-1 sm:text-[16px]">{title}</h2>
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
