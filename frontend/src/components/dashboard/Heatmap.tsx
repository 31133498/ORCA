import type { Heatmap } from '@/lib/types';

const ALL_BANDS = ['LOW', 'MID', 'HIGH', 'PREMIUM'];

export default function HeatmapView({ data }: { data: Heatmap }) {
  const regions = data.regions;
  const cells = new Map<string, (typeof data.cells)[number]>();
  data.cells.forEach((c) => cells.set(`${c.region}__${c.arpu_band}`, c));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="bg-canvas-elevated text-left font-data text-[10px] font-semibold uppercase tracking-label text-ink-3" />
            {ALL_BANDS.map((b) => (
              <th
                key={b}
                className="px-3 py-2 text-left font-data text-[10px] font-semibold uppercase tracking-label text-ink-3"
              >
                {b} ARPU
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => (
            <tr key={region}>
              <th
                scope="row"
                className="bg-canvas-elevated px-3 py-2 text-left text-[12px] font-medium text-ink-1"
              >
                {region}
              </th>
              {ALL_BANDS.map((band) => {
                const cell = cells.get(`${region}__${band}`);
                if (!cell) {
                  return (
                    <td
                      key={band}
                      className="rounded-sm bg-canvas-sunken/40 px-3 py-2 text-center font-data text-[11px] text-ink-3"
                    >
                      —
                    </td>
                  );
                }
                const risk = cell.avg_risk;
                const bg = riskColor(risk);
                const textColor = risk >= 60 ? '#FFFFFF' : '#111111';
                return (
                  <td
                    key={band}
                    className="rounded-sm px-3 py-2 text-center transition-shadow hover:shadow-sm"
                    style={{ background: bg, color: textColor }}
                    title={`${cell.customers} customer(s) · avg risk ${cell.avg_risk} · ${cell.critical_count} critical`}
                  >
                    <div className="font-data text-[14px] font-semibold tabular-nums">{cell.avg_risk}</div>
                    <div className="font-data text-[10px] uppercase tracking-label opacity-75">
                      {cell.customers}c{cell.critical_count > 0 ? ` · ${cell.critical_count}!` : ''}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center gap-3 font-data text-[10px] uppercase tracking-label text-ink-3">
        <span>SCALE</span>
        {[10, 30, 50, 70, 90].map((v) => (
          <span key={v} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-6 rounded-sm ring-1 ring-chrome-1"
              style={{ background: riskColor(v) }}
            />
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function riskColor(score: number): string {
  // 0 → light gray, 100 → status-critical. Stops at MEDIUM/HIGH/CRITICAL bands.
  if (score < 1) return '#F3F4F6';
  if (score < 40) return '#ECFDF5'; // clear-bg
  if (score < 55) return '#D1FAE5';
  if (score < 70) return '#FFFBEB'; // watch-bg
  if (score < 80) return '#FED7AA';
  if (score < 90) return '#FCA5A5';
  return '#DC2626';
}
