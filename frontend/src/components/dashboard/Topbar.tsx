'use client';

import { useEffect, useState } from 'react';
import { RiRefreshLine, RiDownloadLine } from 'react-icons/ri';
import { api } from '@/lib/api';

interface Props {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  liveCount?: number;
}

export default function Topbar({ title, subtitle, onRefresh, liveCount }: Props) {
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState<string | null>(null);

  async function trigger() {
    setScraping(true);
    setScrapeMsg(null);
    try {
      const res = await api.scrape();
      setScrapeMsg(
        res.live
          ? `Apify: ${res.scraped} fetched, ${res.inserted} new, ${res.classified} classified`
          : 'Apify token not configured — running on seeded MTN dataset'
      );
      onRefresh?.();
    } catch (e) {
      setScrapeMsg(`Scrape failed: ${(e as Error).message}`);
    } finally {
      setScraping(false);
    }
  }

  useEffect(() => {
    if (!scrapeMsg) return;
    const t = setTimeout(() => setScrapeMsg(null), 6000);
    return () => clearTimeout(t);
  }, [scrapeMsg]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-chrome-1 bg-canvas-elevated/90 px-8 backdrop-blur">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-semibold text-ink-1">{title}</h1>
          <LiveDot count={liveCount} />
        </div>
        {subtitle ? <p className="mt-0.5 text-[12px] text-ink-3">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-2">
        {scrapeMsg ? (
          <span className="hidden font-data text-[11px] uppercase tracking-label text-ink-3 md:inline">
            {scrapeMsg}
          </span>
        ) : null}
        <button
          onClick={trigger}
          disabled={scraping}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-chrome-1 bg-canvas-elevated px-3 text-[13px] font-medium text-ink-1 transition-colors hover:bg-canvas-sunken disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Run Apify X scrape now"
        >
          <RiRefreshLine size={14} className={scraping ? 'animate-spin' : undefined} />
          {scraping ? 'Scraping…' : 'Scrape X now'}
        </button>
        <button
          onClick={onRefresh}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-ink-1 px-3 text-[13px] font-medium text-white transition-colors hover:bg-black"
          aria-label="Refresh data"
        >
          <RiDownloadLine size={14} />
          Refresh
        </button>
      </div>
    </header>
  );
}

function LiveDot({ count }: { count?: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-status-clear-bg px-2 py-0.5 font-data text-[11px] font-semibold uppercase tracking-label text-status-clear"
      aria-label="Live monitoring"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-clear opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-status-clear" />
      </span>
      LIVE
      {count !== undefined ? <span className="text-status-clear/80">· {count}</span> : null}
    </span>
  );
}
