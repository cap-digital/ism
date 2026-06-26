import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-ism-green/10 bg-white shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={`flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-ism-green-900">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-ism-green-900/50">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className={`flex-1 px-2 pb-3 pt-3 ${bodyClassName}`}>{children}</div>
    </Card>
  );
}

export function EmptyState({ label = "Sem dados para os filtros atuais." }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[160px] items-center justify-center px-4 text-center text-sm text-ism-green-900/40">
      {label}
    </div>
  );
}
