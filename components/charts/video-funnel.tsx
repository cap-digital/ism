"use client";

import { fmtCompact, fmtPct } from "@/lib/format";

export interface FunnelStage {
  label: string;
  value: number;
}

/** Video retention funnel — horizontal tapering bars vs. the first stage. */
export function VideoFunnel({ stages }: { stages: FunnelStage[] }) {
  const base = stages[0]?.value || 1;
  return (
    <div className="space-y-2.5 px-4 py-2">
      {stages.map((s, i) => {
        const pct = s.value / base;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-24 shrink-0 text-right text-xs font-medium text-ism-green-900/70">
              {s.label}
            </div>
            <div className="relative h-9 flex-1 overflow-hidden rounded-xl bg-ism-green/[0.06]">
              <div
                className="flex h-full items-center rounded-xl px-3 text-xs font-semibold text-white transition-all"
                style={{
                  width: `${Math.max(pct * 100, 6)}%`,
                  background: `linear-gradient(90deg, #1E7A30, #2E9E3F ${60 + i * 6}%, #7BC86C)`,
                }}
              >
                {fmtCompact(s.value)}
              </div>
            </div>
            <div className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-ism-green-900/55">
              {i === 0 ? "100%" : fmtPct(pct, 0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
