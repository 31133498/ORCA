'use client';

import { useState } from 'react';
import { FaXTwitter } from 'react-icons/fa6';
import {
  RiVerifiedBadgeFill,
  RiCheckLine,
  RiCloseLine,
  RiUserAddLine,
  RiRefreshLine,
  RiAlarmWarningLine,
} from 'react-icons/ri';

import type { QueueItem } from '@/lib/types';
import { api } from '@/lib/api';
import { compact, naira, timeAgo } from '@/lib/format';
import { CategoryChip, LanguageChip, PathwayBadge, RiskBadge, SentimentBadge, UrgencyBadge } from './Badge';

interface Props {
  item: QueueItem;
  onChanged: () => void;
}

const REPLY_LIMIT = 240;

export default function QueueCard({ item, onChanged }: Props) {
  const m = item.mention;
  const c = m.classification!;
  const cust = m.customer;
  const isFraud = c.category === 'Fraud & Security';

  const [draft, setDraft] = useState(c.ai_reply);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function action(kind: 'accept' | 'resolve' | 'dismiss') {
    setBusy(kind);
    setError(null);
    try {
      await api.queueAction(item.escalation_id, {
        action: kind,
        agent: 'agent.demo',
        final_reply: kind === 'resolve' ? draft : undefined,
      });
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function regenerate() {
    setBusy('draft');
    setError(null);
    try {
      const res = await api.draftReply(m.id);
      setDraft(res.ai_reply);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function postReply() {
    if (isFraud) return;
    setBusy('post');
    setError(null);
    try {
      await api.postReply(m.id, draft);
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const remaining = REPLY_LIMIT - draft.length;

  return (
    <article
      className={`grid grid-cols-1 gap-0 overflow-hidden rounded-lg border bg-canvas-elevated md:grid-cols-[1.4fr_1fr] ${
        c.risk_level === 'CRITICAL'
          ? 'border-status-critical/40 ring-1 ring-status-critical/10'
          : 'border-chrome-1'
      }`}
    >
      {/* Left: tweet + AI reply */}
      <div className="flex flex-col border-b border-chrome-1 p-5 md:border-b-0 md:border-r">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-canvas-sunken font-data text-[13px] font-semibold text-ink-2">
              {(cust?.display_name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-1">
                <span className="truncate">{cust?.display_name || 'Unknown'}</span>
                {cust?.verified ? (
                  <RiVerifiedBadgeFill size={13} className="text-status-info" aria-label="Verified" />
                ) : null}
              </div>
              <div className="font-data text-[11px] text-ink-3">
                @{cust?.handle || 'unknown'} · {timeAgo(m.posted_at)} · queued {timeAgo(item.queued_at)}
              </div>
            </div>
          </div>
          <RiskBadge level={c.risk_level} score={c.churn_risk} />
        </div>

        <p className="mt-4 text-[15px] leading-relaxed text-ink-1">{m.text}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <CategoryChip category={c.category} />
          <UrgencyBadge urgency={c.urgency} />
          <PathwayBadge pathway={c.pathway} />
          <SentimentBadge sentiment={c.sentiment} />
          <LanguageChip language={c.language} />
        </div>

        <div className="mt-4 flex items-center gap-3 font-data text-[11px] text-ink-3">
          <span>♥ {compact(m.likes)}</span>
          <span>↻ {compact(m.retweets)}</span>
          <span>💬 {compact(m.replies)}</span>
          <a
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 hover:text-ink-1"
          >
            <FaXTwitter size={11} />
            Open on X
          </a>
        </div>

        {/* AI reply editor */}
        <div className="mt-5 rounded-md border border-chrome-1 bg-canvas-sunken">
          <div className="flex items-center justify-between border-b border-chrome-1 px-3 py-2">
            <span className="font-data text-[10px] font-semibold uppercase tracking-label text-ink-3">
              AI-DRAFTED REPLY
            </span>
            <button
              onClick={regenerate}
              disabled={!!busy}
              className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-medium text-ink-2 hover:bg-canvas-elevated disabled:opacity-50"
              aria-label="Regenerate AI reply"
            >
              <RiRefreshLine size={11} className={busy === 'draft' ? 'animate-spin' : undefined} />
              Regenerate
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, REPLY_LIMIT))}
            rows={3}
            className="block w-full resize-none bg-canvas-elevated px-3 py-2 font-sans text-[13px] leading-relaxed text-ink-1 outline-none focus:ring-2 focus:ring-ink-1/10"
            aria-label="Reply body"
          />
          <div className="flex items-center justify-between border-t border-chrome-1 px-3 py-2">
            <span
              className={`font-data text-[10px] uppercase tracking-label ${
                remaining < 0 ? 'text-status-critical' : 'text-ink-3'
              }`}
            >
              {draft.length}/{REPLY_LIMIT}
            </span>
            <div className="flex items-center gap-2">
              {isFraud ? (
                <span className="inline-flex items-center gap-1 font-data text-[10px] uppercase tracking-label text-status-critical">
                  <RiAlarmWarningLine size={11} /> Fraud — DM only, no public reply
                </span>
              ) : null}
              <button
                disabled={!!busy || isFraud || draft.length === 0 || remaining < 0}
                onClick={postReply}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-ink-1 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaXTwitter size={11} />
                Post to X
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <p className="mt-2 font-data text-[11px] uppercase tracking-label text-status-critical">{error}</p>
        ) : null}
      </div>

      {/* Right: context + actions */}
      <div className="flex flex-col bg-canvas p-5">
        <section>
          <SectionLabel>AI summary</SectionLabel>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{c.ai_summary}</p>
        </section>

        <section className="mt-4">
          <SectionLabel>Subscriber</SectionLabel>
          <dl className="mt-1.5 grid grid-cols-2 gap-y-1.5 font-data text-[12px]">
            <Detail label="MSISDN" value={cust?.msisdn || '—'} />
            <Detail label="Region" value={cust?.region || '—'} />
            <Detail label="ARPU" value={cust ? naira(cust.arpu_naira) : '—'} />
            <Detail label="Tenure" value={cust ? `${cust.tenure_months} mo` : '—'} />
            <Detail label="Followers" value={compact(cust?.followers || 0)} />
            <Detail label="Verified" value={cust?.verified ? 'Yes' : 'No'} />
          </dl>
        </section>

        <section className="mt-4">
          <SectionLabel>Risk factors</SectionLabel>
          <ul className="mt-1.5 space-y-1 text-[12px] text-ink-2">
            {c.risk_factors.slice(0, 5).map((f) => (
              <li key={f} className="flex gap-1.5">
                <span className="text-ink-3">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {c.suggested_offer ? (
          <section className="mt-4 rounded-md bg-status-clear-bg p-3 ring-1 ring-status-clear/20">
            <SectionLabel className="text-status-clear">Suggested retention offer</SectionLabel>
            <p className="mt-1 text-[13px] font-medium text-ink-1">{c.suggested_offer}</p>
          </section>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <button
            disabled={!!busy || item.status === 'ACCEPTED'}
            onClick={() => action('accept')}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-chrome-1 bg-canvas-elevated text-[13px] font-medium text-ink-1 hover:bg-canvas-sunken disabled:opacity-50"
          >
            <RiUserAddLine size={14} />
            {item.status === 'ACCEPTED' ? `Owned by ${item.assigned_to}` : 'Accept'}
          </button>
          <button
            disabled={!!busy}
            onClick={() => action('resolve')}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-status-clear text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            <RiCheckLine size={14} />
            Resolve
          </button>
          <button
            disabled={!!busy}
            onClick={() => action('dismiss')}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-chrome-1 px-3 text-[13px] font-medium text-ink-2 hover:bg-canvas-sunken disabled:opacity-50"
          >
            <RiCloseLine size={14} />
            Dismiss
          </button>
        </div>
      </div>
    </article>
  );
}

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-data text-[10px] font-semibold uppercase tracking-label text-ink-3 ${className}`}>
      {children}
    </p>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] uppercase tracking-label text-ink-3">{label}</dt>
      <dd className="text-[12px] text-ink-1">{value}</dd>
    </div>
  );
}
