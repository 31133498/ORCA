'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  RiDashboardLine,
  RiInboxLine,
  RiMicLine,
  RiPulseLine,
  RiBarChartGroupedLine,
  RiArrowLeftLine,
  RiCloseLine,
} from 'react-icons/ri';
import { FaXTwitter } from 'react-icons/fa6';

const NAV = [
  { href: '/dashboard', label: 'Overview', Icon: RiDashboardLine },
  { href: '/dashboard/queue', label: 'Agent queue', Icon: RiInboxLine, badge: true },
  { href: '/dashboard/mentions', label: 'Mentions', Icon: RiPulseLine },
  { href: '/dashboard/voice', label: 'Voice Agent', Icon: RiMicLine },
  { href: '/dashboard/reports', label: 'Reports', Icon: RiBarChartGroupedLine },
];

interface Props {
  queueCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ queueCount, isOpen = false, onClose }: Props) {
  const pathname = usePathname();
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-shrink-0 flex-col bg-black
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo row */}
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-bold tracking-[0.04em] text-mtn-yellow">ORCA</span>
          <span className="rounded-sm bg-white/10 px-1.5 py-0.5 font-data text-[10px] font-medium uppercase tracking-label text-white/40">
            X module
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-white/40 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          <RiCloseLine size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map(({ href, label, Icon, badge }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-[14px] font-medium transition-colors ${
                active
                  ? 'bg-mtn-yellow text-black'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
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

      <div className="space-y-1.5 border-t border-white/10 p-4 text-[12px] text-white/40">
        <div className="flex items-center gap-2">
          <FaXTwitter size={12} className="text-accent" />
          <span className="font-data uppercase tracking-label">Operator</span>
        </div>
        <div className="text-[13px] font-semibold text-white/80">MTN Nigeria</div>
        <div className="font-data text-[11px] text-white/30">@MTNNigeria</div>
        <Link
          href="/"
          onClick={onClose}
          className="mt-2 inline-flex items-center gap-1 text-[12px] text-white/30 hover:text-white"
        >
          <RiArrowLeftLine size={12} />
          Back to landing
        </Link>
      </div>
    </aside>
  );
}
