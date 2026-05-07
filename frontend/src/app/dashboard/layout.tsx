'use client';

import { useEffect, useState } from 'react';
import { RiMenuLine } from 'react-icons/ri';
import Sidebar from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [queueCount, setQueueCount] = useState<number | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const q = await api.queue();
        if (mounted) setQueueCount(q.total);
      } catch {
        /* ignore — sidebar badge is non-critical */
      }
    }
    load();
    const t = setInterval(load, 10_000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-canvas">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        queueCount={queueCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile-only top bar with hamburger */}
        <div className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-white/10 bg-black px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Open navigation"
          >
            <RiMenuLine size={20} />
          </button>
          <span className="text-[15px] font-bold tracking-[0.04em] text-mtn-yellow">ORCA</span>
          {queueCount !== undefined && queueCount > 0 && (
            <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-status-critical px-1.5 font-data text-[11px] font-semibold text-white">
              {queueCount > 99 ? '99+' : queueCount}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
