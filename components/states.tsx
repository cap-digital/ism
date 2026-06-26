"use client";

import { AlertTriangle } from "lucide-react";
import { useData } from "./data-provider";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-3xl bg-ism-green/[0.07] ${className}`}
    />
  );
}

export function LoadingGrid() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-ism-red/15 bg-ism-red/[0.04] px-6 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-ism-red" />
      <p className="font-semibold text-ism-green-900">Não foi possível carregar os dados</p>
      <p className="max-w-md text-sm text-ism-green-900/55">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 rounded-full bg-ism-green px-4 py-2 text-sm font-medium text-white hover:bg-ism-green-600"
      >
        Tentar novamente
      </button>
    </div>
  );
}

/** Gate that shows loading/error states before rendering a page's content. */
export function PageGate({ children }: { children: React.ReactNode }) {
  const { loading, error, dataset } = useData();
  if (error) return <ErrorState message={error} />;
  if (loading) return <LoadingGrid />;
  if (!dataset.rows.length)
    return (
      <div className="rounded-3xl border border-ism-green/10 bg-white px-6 py-16 text-center text-sm text-ism-green-900/50">
        Nenhum dado disponível para esta campanha.
      </div>
    );
  return <>{children}</>;
}
