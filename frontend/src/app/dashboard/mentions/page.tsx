'use client';

import { useCallback, useEffect, useState } from 'react';
import { RiSearchLine, RiAddLine } from 'react-icons/ri';
import { FaXTwitter, FaFacebook, FaInstagram, FaReddit } from 'react-icons/fa6';

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

const PLATFORMS = [
  { id: 'all',       label: 'All',       Icon: null,         color: '' },
  { id: 'x',        label: 'X',         Icon: FaXTwitter,   color: 'text-white' },
  { id: 'facebook',  label: 'Facebook',  Icon: FaFacebook,   color: 'text-[#1877F2]' },
  { id: 'instagram', label: 'Instagram', Icon: FaInstagram,  color: 'text-[#E1306C]' },
  { id: 'reddit',    label: 'Reddit',    Icon: FaReddit,     color: 'text-[#FF4500]' },
];

export default function MentionsPage() {
  const [items, setItems] = useState<Mention[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('All categories');
  const [pathway, setPathway] = useState('All pathways');
  const [risk, setRisk] = useState('All risks');
  const [platform, setPlatform] = useState('all');
  const [hours, setHours] = useState(72);
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.mentions({
        category: category === 'All categories' ? undefined : category,
        pathway: pathway === 'All pathways' ? undefined : pathway,
        risk_level: risk === 'All risks' ? undefined : risk,
        platform: platform === 'all' ? undefined : platform,
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
  }, [category, pathway, risk, platform, hours, search]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, [refresh]);

  async function generate(p: string) {
    setGenerating(p);
    try {
      await api.generatePosts(p, 3);
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(null);
    }
  }

  const activePlatform = platform === 'all' ? null : PLATFORMS.find(p => p.id === platform);

  return (
    <>
      <Topbar
        title="Mentions stream"
        subtitle={`${total} mentions · MTN Nigeria · multi-platform`}
        onRefresh={refresh}
        liveCount={total}
      />

      <main className="space-y-4 p-4 sm:p-6 md:p-8">
        {/* Platform selector tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-chrome-1 bg-canvas-elevated p-1">
            {PLATFORMS.map(({ id, label, Icon, color }) => (
              <button
                key={id}
                onClick={() => setPlatform(id)}
                className={`inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded-md px-3 font-data text-[11px] font-semibold uppercase tracking-label transition-colors ${
                  platform === id
                    ? 'bg-mtn-yellow text-black'
                    : 'text-ink-2 hover:bg-canvas-sunken hover:text-ink-1'
                }`}
              >
                {Icon ? <Icon size={12} className={platform === id ? 'text-black' : color} /> : null}
                {label}
              </button>
            ))}
          </div>

          {/* Generate sample posts button */}
          {activePlatform && activePlatform.Icon ? (
            <button
              onClick={() => generate(activePlatform.id)}
              disabled={!!generating}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-chrome-1 bg-canvas-elevated px-3 font-data text-[11px] font-semibold uppercase tracking-label text-ink-2 transition-colors hover:border-mtn-yellow hover:text-mtn-yellow disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RiAddLine size={13} className={generating ? 'animate-spin' : undefined} />
              {generating ? 'Generating…' : `Inject ${activePlatform.label} posts`}
            </button>
          ) : null}
        </div>

        {/* Filter bar */}
        <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:min-w-[200px] sm:flex-1">
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
            <div className="grid grid-cols-2 gap-2 sm:contents">
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
                  <option key={h.v} value={h.v}>{h.l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg border border-chrome-1 bg-canvas-elevated" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-chrome-1 bg-canvas-elevated p-10 text-center">
            <p className="text-[14px] font-semibold text-ink-1">No mentions match these filters</p>
            <p className="mt-1 text-[12px] text-ink-3">Try widening the time window or clearing the search.</p>
            {activePlatform && activePlatform.Icon ? (
              <button
                onClick={() => generate(activePlatform.id)}
                disabled={!!generating}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-mtn-yellow px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-mtn-yellow-dark disabled:opacity-50"
              >
                <RiAddLine size={14} />
                Generate {activePlatform.label} posts
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-chrome-1 bg-canvas px-3 text-[13px] text-ink-1 outline-none focus:border-ink-2 sm:w-auto"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
