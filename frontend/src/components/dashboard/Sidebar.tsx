'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  RiDashboardLine,
  RiInboxLine,
  RiPulseLine,
  RiBarChartGroupedLine,
  RiArrowLeftLine,
} from 'react-icons/ri';
import { FaXTwitter } from 'react-icons/fa6';

const NAV = [
  { href: '/dashboard', label: 'Overview', Icon: RiDashboardLine },
  { href: '/dashboard/queue', label: 'Agent queue', Icon: RiInboxLine, badge: true },
  { href: '/dashboard/mentions', label: 'Mentions', Icon: RiPulseLine },
  { href: '/dashboard/reports', label: 'Reports', Icon: RiBarChartGroupedLine },
];

export default function Sidebar({ queueCount }: { queueCount?: number }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-chrome-1 bg-canvas-elevated">
      <div className="flex h-16 items-center gap-2 border-b border-chrome-1 px-5">
        <span className="text-[15px] font-bold tracking-[0.04em] text-ink-1">ORCA</span>
        <span className="rounded-sm bg-canvas-sunken px-1.5 py-0.5 font-data text-[10px] font-medium uppercase tracking-label text-ink-3">
          X module
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map(({ href, label, Icon, badge }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-[14px] font-medium transition-colors ${
                active
                  ? 'bg-canvas-sunken text-ink-1'
                  : 'text-ink-2 hover:bg-canvas-sunken hover:text-ink-1'
              }`}
            >
              <Icon size={18} aria-hidden />
              <span className="flex-1">{label}</span>
              {badge && queueCount !== undefined && queueCount > 0 ? (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-status-critical px-1.5 font-data text-[11px] font-semibold text-white">
                  {queueCount > 99 ? '99+' : queueCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-chrome-1 p-4 text-[12px] text-ink-3">
        <div className="flex items-center gap-2">
          <FaXTwitter size={12} />
          <span className="font-data uppercase tracking-label">Operator</span>
        </div>
        <div className="text-[13px] font-semibold text-ink-1">MTN Nigeria</div>
        <div className="font-data text-[11px] text-ink-3">@MTNNigeria</div>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1 text-[12px] text-ink-3 hover:text-ink-1"
        >
          <RiArrowLeftLine size={12} />
          Back to landing
        </Link>
      </div>
    </aside>
  );
}
