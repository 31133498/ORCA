'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [queueCount, setQueueCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const q = await api.queue();
        if (mounted) setQueueCount(q.total);
      } catch {
        /* ignore - sidebar badge is non-critical */
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
    <div className="grid min-h-screen grid-cols-[240px_minmax(0,1fr)] bg-canvas">
      <Sidebar queueCount={queueCount} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
