import type { PriorityRow } from '@/lib/types';

export default function PriorityMatrix({ rows }: { rows: PriorityRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-chrome-1 bg-canvas-elevated">
      <table className="min-w-[680px] w-full text-left text-[13px]">
        <thead className="border-b border-chrome-1 bg-canvas-sunken">
          <tr>
            <Th>Category</Th>
            <Th align="right">Volume</Th>
            <Th align="right">Avg urg</Th>
            <Th align="right">Sentiment Δ</Th>
            <Th align="right">Resolution</Th>
            <Th align="right">Priority</Th>
            <Th>Recommended action</Th>
            <Th>Owner</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.category}
              className="border-b border-chrome-1/60 transition-colors last:border-b-0 hover:bg-canvas-sunken/40"
            >
              <td className="px-4 py-3 font-medium text-ink-1">{r.category}</td>
              <Td>{r.volume}</Td>
              <Td>{r.avg_urgency.toFixed(1)}</Td>
              <Td>
                <SentimentDelta value={r.sentiment_trend} />
              </Td>
              <Td>{Math.round(r.resolution_rate * 100)}%</Td>
              <Td emphasis>{r.score.toFixed(1)}</Td>
              <td className="max-w-[260px] px-4 py-3 text-ink-2">{r.recommended_action}</td>
              <td className="px-4 py-3 font-data text-[11px] uppercase tracking-label text-ink-3">
                {r.owner_team}
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-[13px] text-ink-3">
                No data in window yet — trigger a scrape to populate.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-4 py-2 font-data text-[10px] font-semibold uppercase tracking-label text-ink-3 ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      {children}
    </th>
  );
}

function Td({ children, emphasis = false }: { children: React.ReactNode; emphasis?: boolean }) {
  return (
    <td
      className={`px-4 py-3 text-right font-data tabular-nums ${
        emphasis ? 'font-semibold text-accent' : 'text-ink-2'
      }`}
    >
      {children}
    </td>
  );
}

function SentimentDelta({ value }: { value: number }) {
  if (Math.abs(value) < 0.01) return <span className="text-ink-3">·</span>;
  const cls = value > 0 ? 'text-status-critical' : 'text-status-clear';
  const arrow = value > 0 ? '↑' : '↓';
  return (
    <span className={cls}>
      {arrow} {Math.abs(value).toFixed(2)}
    </span>
  );
}
