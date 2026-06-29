"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { METRICS, type MetricKey } from "@/lib/aggregate";

export function MetricDropdown({
  value,
  onChange,
  options,
}: {
  value: MetricKey;
  onChange: (k: MetricKey) => void;
  options: MetricKey[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-ism-green/15 bg-white px-3 py-1.5 text-xs font-medium text-ism-green-900/75 transition-colors hover:border-ism-green/30"
      >
        {METRICS[value].label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-2xl border border-ism-green/10 bg-white p-1.5 shadow-float">
          {options.map((k) => {
            const on = k === value;
            return (
              <button
                key={k}
                onClick={() => {
                  onChange(k);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm text-ism-green-900/80 hover:bg-ism-green/[0.06]"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                    on ? "border-ism-green bg-ism-green text-white" : "border-ism-green/25"
                  }`}
                >
                  {on && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                {METRICS[k].label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
