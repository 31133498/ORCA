import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: { value: string; direction: 'up' | 'down' | 'flat' };
  icon?: ReactNode;
  emphasis?: 'default' | 'positive' | 'warning' | 'critical' | 'accent';
}

const EMPHASIS = {
  default: 'text-ink-1',
  positive: 'text-status-clear',
  warning: 'text-status-watch',
  critical: 'text-status-critical',
  accent: 'text-accent',
};

export default function StatCard({ label, value, hint, trend, icon, emphasis = 'default' }: Props) {
  return (
    <div className="rounded-lg border border-chrome-1 bg-canvas-elevated p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="font-data text-[11px] font-semibold uppercase tracking-label text-ink-3">{label}</p>
        {icon ? <span className="text-accent">{icon}</span> : null}
      </div>
      <p className={`mt-2 font-data text-[28px] font-semibold leading-none tabular-nums sm:mt-3 sm:text-[32px] ${EMPHASIS[emphasis]}`}>
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2 text-[12px] text-ink-3">
        {trend ? (
          <span
            className={`font-data ${
              trend.direction === 'up'
                ? 'text-status-clear'
                : trend.direction === 'down'
                ? 'text-status-critical'
                : 'text-ink-3'
            }`}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '·'} {trend.value}
          </span>
        ) : null}
        {hint ? <span>{hint}</span> : null}
      </div>
    </div>
  );
}
