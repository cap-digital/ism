import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "green",
  progress,
  highlightComplete = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: "green" | "gold" | "red";
  /** Optional progress bar toward a goal. */
  progress?: { pct: number; label?: string };
  /** When true, the bar turns gold once the goal is reached (≥ 100%). */
  highlightComplete?: boolean;
}) {
  const over = highlightComplete && !!progress && progress.pct >= 1;
  const accents = {
    green: "bg-ism-green/10 text-ism-green-700",
    gold: "bg-ism-gold/15 text-ism-gold-600",
    red: "bg-ism-red/10 text-ism-red",
  } as const;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-ism-green/10 bg-white p-5 shadow-card transition-shadow hover:shadow-float">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ism-green-900/45">
          {label}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accents[accent]}`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-ism-green-900 sm:text-3xl">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-ism-green-900/45">{sub}</div>}
      {progress && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-ism-green-900/45">
            <span className="truncate">{progress.label}</span>
            <span
              className={`ml-2 shrink-0 rounded-full px-1.5 font-semibold tabular-nums ${
                over ? "bg-ism-gold/20 text-ism-gold-600" : "text-ism-green-700"
              }`}
            >
              {Math.round(progress.pct * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ism-green/10">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                over ? "bg-ism-gold" : "bg-ism-green"
              }`}
              style={{ width: `${Math.min(progress.pct * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-ism-green/[0.04] transition-transform group-hover:scale-125" />
    </div>
  );
}
