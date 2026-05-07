import { FaXTwitter, FaFacebook, FaInstagram, FaReddit } from 'react-icons/fa6';
import { RiHeart3Line, RiRepeatLine, RiChat3Line, RiVerifiedBadgeFill } from 'react-icons/ri';
import type { Mention, Platform } from '@/lib/types';
import { compact, timeAgo } from '@/lib/format';
import {
  CategoryChip,
  LanguageChip,
  PathwayBadge,
  RiskBadge,
  SentimentBadge,
  UrgencyBadge,
} from './Badge';

const PLATFORM_META: Record<Platform, { Icon: React.ElementType; label: string; color: string }> = {
  x:         { Icon: FaXTwitter,   label: 'View on X',         color: 'text-ink-3 hover:text-white' },
  facebook:  { Icon: FaFacebook,   label: 'View on Facebook',  color: 'text-ink-3 hover:text-[#1877F2]' },
  instagram: { Icon: FaInstagram,  label: 'View on Instagram', color: 'text-ink-3 hover:text-[#E1306C]' },
  reddit:    { Icon: FaReddit,     label: 'View on Reddit',    color: 'text-ink-3 hover:text-[#FF4500]' },
};

const PLATFORM_BADGE: Record<Platform, string> = {
  x:         'bg-white/10 text-white/60',
  facebook:  'bg-[#1877F2]/15 text-[#1877F2]',
  instagram: 'bg-[#E1306C]/15 text-[#E1306C]',
  reddit:    'bg-[#FF4500]/15 text-[#FF4500]',
};

export default function MentionCard({ mention, compact: dense = false }: { mention: Mention; compact?: boolean }) {
  const c = mention.classification;
  const cust = mention.customer;
  const platform = (mention.platform ?? 'x') as Platform;
  const { Icon, label, color } = PLATFORM_META[platform];

  return (
    <article className="rounded-lg border border-chrome-1 bg-canvas-elevated p-4 transition-colors hover:border-chrome-2">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-canvas-sunken font-data text-[12px] font-semibold text-accent ring-1 ring-chrome-1">
            {(cust?.display_name || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-1">
              <span className="truncate">{cust?.display_name || 'Unknown'}</span>
              {cust?.verified ? (
                <RiVerifiedBadgeFill size={12} className="text-accent" aria-label="Verified" />
              ) : null}
              <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-data text-[9px] font-semibold uppercase tracking-wide ${PLATFORM_BADGE[platform]}`}>
                <Icon size={9} />
                {platform}
              </span>
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
          className={`inline-flex items-center gap-1 text-[12px] transition-colors ${color}`}
        >
          <Icon size={11} />
          {label}
        </a>
      </footer>
    </article>
  );
}
