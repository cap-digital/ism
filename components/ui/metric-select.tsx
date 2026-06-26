"use client";

import { METRICS, type MetricKey } from "@/lib/aggregate";

export function MetricSelect({
  value,
  onChange,
  options,
}: {
  value: MetricKey;
  onChange: (k: MetricKey) => void;
  options: MetricKey[];
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full bg-ism-green/[0.06] p-1">
      {options.map((k) => {
        const on = k === value;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              on
                ? "bg-white text-ism-green-700 shadow-sm"
                : "text-ism-green-900/55 hover:text-ism-green-900"
            }`}
          >
            {METRICS[k].short}
          </button>
        );
      })}
    </div>
  );
}
