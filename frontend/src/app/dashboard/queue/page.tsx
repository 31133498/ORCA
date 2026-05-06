'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiFilterLine, RiInboxArchiveLine } from 'react-icons/ri';

import Topbar from '@/components/dashboard/Topbar';
import QueueCard from '@/components/dashboard/QueueCard';
import { api } from '@/lib/api';
import type { QueueItem, RiskLevel } from '@/lib/types';

const RISK_FILTERS: Array<RiskLevel | 'ALL'> = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [openOnly, setOpenOnly] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const q = await api.queue();
      setItems(q.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 10_000);
    return () => clearInterval(t);
  }, [refresh]);

  const filtered = useMemo(() => {
    let out = items;
    if (openOnly) out = out.filter((i) => i.status === 'QUEUED' || i.status === 'ACCEPTED');
    if (filter !== 'ALL') out = out.filter((i) => i.mention.classification?.risk_level === filter);
    return out;
  }, [items, filter, openOnly]);

  const counts = useMemo(() => {
    const out = { ALL: items.length, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<string, number>;
    items.forEach((i) => {
      const lvl = i.mention.classification?.risk_level;
      if (lvl) out[lvl] = (out[lvl] || 0) + 1;
    });
    return out;
  }, [items]);

  return (
    <>
      <Topbar
        title="Unified agent queue"
        subtitle={`Sorted by urgency × churn risk · ${filtered.length} of ${items.length} open`}
        onRefresh={refresh}
      />

      <main className="space-y-5 p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-data text-[11px] uppercase tracking-label text-ink-3">
            <RiFilterLine size={12} /> Risk
          </span>
          <div className="flex items-center gap-1 rounded-md border border-chrome-1 bg-canvas-elevated p-0.5">
            {RISK_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 font-data text-[11px] font-semibold uppercase tracking-label transition-colors ${
                  filter === r
                    ? 'bg-ink-1 text-white'
                    : 'text-ink-2 hover:bg-canvas-sunken'
                }`}
              >
                {r}
                <span className="opacity-70">{counts[r] ?? 0}</span>
              </button>
            ))}
          </div>
          <label className="ml-auto inline-flex items-center gap-2 text-[12px] text-ink-2">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded-sm accent-ink-1"
            />
            Show only open
          </label>
        </div>

        {loading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-chrome-1 bg-canvas-elevated p-10 text-center">
            <RiInboxArchiveLine size={28} className="mx-auto text-ink-3" />
            <p className="mt-2 text-[14px] font-semibold text-ink-1">Queue is clear</p>
            <p className="mt-1 text-[12px] text-ink-3">No open escalations match your filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <QueueCard key={item.escalation_id} item={item} onChanged={refresh} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-44 animate-pulse rounded-lg border border-chrome-1 bg-canvas-elevated" />
      ))}
    </div>
  );
}
