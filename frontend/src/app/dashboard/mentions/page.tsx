'use client';

import { useCallback, useEffect, useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';

import Topbar from '@/components/dashboard/Topbar';
import MentionCard from '@/components/dashboard/MentionCard';
import { api } from '@/lib/api';
import type { Mention } from '@/lib/types';

const CATEGORIES = [
  'All categories',
  'Data Depletion',
  'Network / Connectivity',
  'Billing & Charges',
  'SIM & Account Issues',
  'Recharge & Vouchers',
  'Service Activation',
  'Fraud & Security',
  'Customer Service Complaint',
  'General Rant / Feedback',
];

const PATHWAYS = ['All pathways', 'AUTO_REPLY', 'AGENT_PING', 'ESCALATE_FLAG'];
const RISKS = ['All risks', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const HOURS = [
  { v: 6, l: 'Last 6h' },
  { v: 24, l: 'Last 24h' },
  { v: 72, l: 'Last 3d' },
  { v: 168, l: 'Last 7d' },
];

export default function MentionsPage() {
  const [items, setItems] = useState<Mention[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('All categories');
  const [pathway, setPathway] = useState('All pathways');
  const [risk, setRisk] = useState('All risks');
  const [hours, setHours] = useState(72);
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.mentions({
        category: category === 'All categories' ? undefined : category,
        pathway: pathway === 'All pathways' ? undefined : pathway,
        risk_level: risk === 'All risks' ? undefined : risk,
        search: search || undefined,
        hours,
        limit: 50,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, pathway, risk, hours, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // light polling for new items every 15s
  useEffect(() => {
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <>
      <Topbar
        title="Mentions stream"
        subtitle={`${total} mentions · MTN Nigeria · X (Twitter)`}
        onRefresh={refresh}
        liveCount={total}
      />

      <main className="space-y-5 p-8">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-chrome-1 bg-canvas-elevated p-3">
          <div className="relative flex-1 min-w-[220px]">
            <RiSearchLine
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mention text…"
              aria-label="Search mention text"
              className="h-9 w-full rounded-md border border-chrome-1 bg-canvas pl-9 pr-3 text-[13px] text-ink-1 outline-none focus:border-ink-2"
            />
          </div>
          <Select value={category} onChange={setCategory} options={CATEGORIES} />
          <Select value={pathway} onChange={setPathway} options={PATHWAYS} />
          <Select value={risk} onChange={setRisk} options={RISKS} />
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="h-9 rounded-md border border-chrome-1 bg-canvas px-3 text-[13px] text-ink-1 outline-none focus:border-ink-2"
            aria-label="Time window"
          >
            {HOURS.map((h) => (
              <option key={h.v} value={h.v}>
                {h.l}
              </option>
            ))}
          </select>
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg border border-chrome-1 bg-canvas-elevated" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-chrome-1 bg-canvas-elevated p-10 text-center">
            <p className="text-[14px] font-semibold text-ink-1">No mentions match these filters</p>
            <p className="mt-1 text-[12px] text-ink-3">Try widening the time window or clearing the search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {items.map((m) => (
              <MentionCard key={m.id} mention={m} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-chrome-1 bg-canvas px-3 text-[13px] text-ink-1 outline-none focus:border-ink-2"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
