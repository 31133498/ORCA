import { FaXTwitter } from 'react-icons/fa6';
import { RiHeart3Line, RiRepeatLine, RiChat3Line, RiVerifiedBadgeFill } from 'react-icons/ri';
import type { Mention } from '@/lib/types';
import { compact, timeAgo } from '@/lib/format';
import {
  CategoryChip,
  LanguageChip,
  PathwayBadge,
  RiskBadge,
  SentimentBadge,
  UrgencyBadge,
} from './Badge';

export default function MentionCard({ mention, compact: dense = false }: { mention: Mention; compact?: boolean }) {
  const c = mention.classification;
  const cust = mention.customer;
  return (
    <article className="rounded-lg border border-chrome-1 bg-canvas-elevated p-4 transition-shadow hover:shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-canvas-sunken font-data text-[12px] font-semibold text-ink-2">
            {(cust?.display_name || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-1">
              <span className="truncate">{cust?.display_name || 'Unknown'}</span>
              {cust?.verified ? (
                <RiVerifiedBadgeFill size={12} className="text-status-info" aria-label="Verified" />
              ) : null}
            </div>
            <div className="font-data text-[11px] text-ink-3">
              @{cust?.handle || 'unknown'} · {timeAgo(mention.posted_at)} · {cust?.region || '—'}
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {c ? <RiskBadge level={c.risk_level} score={c.churn_risk} /> : null}
        </div>
      </header>

      <p className="mt-3 text-[14px] leading-relaxed text-ink-1">{mention.text}</p>

      {!dense ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {c ? <CategoryChip category={c.category} /> : null}
          {c ? <UrgencyBadge urgency={c.urgency} /> : null}
          {c ? <PathwayBadge pathway={c.pathway} /> : null}
          {c ? <SentimentBadge sentiment={c.sentiment} /> : null}
          {c ? <LanguageChip language={c.language} /> : null}
        </div>
      ) : null}

      <footer className="mt-3 flex items-center justify-between text-[12px] text-ink-3">
        <div className="flex items-center gap-3 font-data">
          <span className="inline-flex items-center gap-1">
            <RiHeart3Line size={12} /> {compact(mention.likes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <RiRepeatLine size={12} /> {compact(mention.retweets)}
          </span>
          <span className="inline-flex items-center gap-1">
            <RiChat3Line size={12} /> {compact(mention.replies)}
          </span>
        </div>
        <a
          href={mention.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] text-ink-3 hover:text-ink-1"
        >
          <FaXTwitter size={11} />
          View on X
        </a>
      </footer>
    </article>
  );
}
