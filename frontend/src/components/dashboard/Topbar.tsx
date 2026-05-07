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
          : 'Apify not configured — using seeded MTN data'
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
    <header className="sticky top-0 z-40 flex h-14 flex-shrink-0 items-center justify-between border-b border-white/10 bg-black px-4 sm:px-6 backdrop-blur">
      <div className="min-w-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="truncate text-[15px] font-semibold text-white sm:text-[17px]">{title}</h1>
          <LiveDot count={liveCount} />
        </div>
        {subtitle ? (
          <p className="mt-0.5 hidden truncate text-[11px] text-white/40 sm:block">{subtitle}</p>
        ) : null}
      </div>

      <div className="ml-3 flex flex-shrink-0 items-center gap-2">
        {scrapeMsg ? (
          <span className="hidden max-w-[200px] truncate font-data text-[10px] uppercase tracking-label text-white/40 lg:inline">
            {scrapeMsg}
          </span>
        ) : null}
        <button
          onClick={trigger}
          disabled={scraping}
          className="hidden h-8 items-center gap-1.5 rounded-md border border-white/20 px-3 text-[12px] font-medium text-white/60 transition-colors hover:border-mtn-yellow hover:text-mtn-yellow disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
          aria-label="Run Apify X scrape now"
        >
          <RiRefreshLine size={13} className={scraping ? 'animate-spin' : undefined} />
          {scraping ? 'Scraping…' : 'Scrape X'}
        </button>
        <button
          onClick={onRefresh}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-mtn-yellow px-3 text-[12px] font-semibold text-black transition-colors hover:bg-mtn-yellow-dark"
          aria-label="Refresh data"
        >
          <RiDownloadLine size={13} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}

function LiveDot({ count }: { count?: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-mtn-yellow/15 px-2 py-0.5 font-data text-[10px] font-semibold uppercase tracking-label text-mtn-yellow"
      aria-label="Live monitoring"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mtn-yellow opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mtn-yellow" />
      </span>
      LIVE
      {count !== undefined ? <span className="text-mtn-yellow/60">· {count}</span> : null}
    </span>
  );
}
