"use client";

import { useState } from "react";

export interface HeatCell {
  row: string;
  col: string;
  value: number;
}

/** CSS-grid heatmap with ISM-green intensity scale. */
export function Heatmap({
  rows,
  cols,
  cells,
  format,
  rowLabel,
  colLabel,
}: {
  rows: string[];
  cols: string[];
  cells: HeatCell[];
  format: (v: number) => string;
  rowLabel?: string;
  colLabel?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const map = new Map(cells.map((c) => [`${c.row}__${c.col}`, c.value]));
  const max = Math.max(1, ...cells.map((c) => c.value));

  const color = (v: number) => {
    if (v <= 0) return "rgba(46,158,63,0.04)";
    const t = Math.pow(v / max, 0.6); // gamma for visual balance
    return `rgba(46,158,63,${0.1 + t * 0.85})`;
  };

  return (
    <div className="overflow-x-auto px-3 pb-1">
      <div
        className="grid min-w-[420px] gap-1.5"
        style={{ gridTemplateColumns: `120px repeat(${cols.length}, minmax(54px, 1fr))` }}
      >
        <div className="flex items-end pb-1 text-[10px] font-medium uppercase tracking-wide text-ism-green-900/40">
          {rowLabel} {colLabel && `× ${colLabel}`}
        </div>
        {cols.map((c) => (
          <div
            key={c}
            className="pb-1 text-center text-[11px] font-medium text-ism-green-900/55"
          >
            {c}
          </div>
        ))}

        {rows.map((r) => (
          <div key={r} className="contents">
            <div className="flex items-center text-xs font-medium text-ism-green-900/70">
              {r}
            </div>
            {cols.map((c) => {
              const v = map.get(`${r}__${c}`) ?? 0;
              const id = `${r}__${c}`;
              const intense = v / max > 0.55;
              return (
                <div
                  key={c}
                  onMouseEnter={() => setHover(id)}
                  onMouseLeave={() => setHover(null)}
                  className="relative flex aspect-[1.4/1] items-center justify-center rounded-xl text-[11px] font-semibold tabular-nums transition-transform hover:scale-[1.04] hover:ring-2 hover:ring-ism-green/30"
                  style={{
                    background: color(v),
                    color: intense ? "white" : "#103F1Dcc",
                  }}
                >
                  {v > 0 ? format(v) : ""}
                  {hover === id && (
                    <div className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-lg bg-ism-green-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-float">
                      {r} · {c}: {format(v)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
