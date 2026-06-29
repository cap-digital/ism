"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Radio, MapPin, ChevronRight, Menu, X } from "lucide-react";
import { NAV, navFor } from "@/lib/nav";
import { CAMPAIGNS } from "@/lib/constants";
import type { CampaignType } from "@/lib/types";
import { BrandMark } from "./brand-mark";

export function Sidebar({ type }: { type: CampaignType }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const other: CampaignType = type === "alwayson" ? "geolocalizadas" : "alwayson";

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {navFor(type).map((item) => {
        const href = `/dashboard/${type}/${item.slug}`;
        const active = pathname === href;
        const Icon = item.icon;
        return (
          <Link
            key={item.slug}
            href={href}
            onClick={() => setOpen(false)}
            className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition-all ${
              active
                ? "bg-white text-ism-green-900 shadow-md"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                active ? "bg-ism-green/12 text-ism-green-700" : "bg-white/10 text-white"
              }`}
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={2.1} />
            </span>
            <span className="flex flex-col">
              <span className="font-medium leading-tight">{item.label}</span>
              <span
                className={`text-[11px] leading-tight ${
                  active ? "text-ism-green-900/45" : "text-white/40"
                }`}
              >
                {item.desc}
              </span>
            </span>
            {active && <ChevronRight className="ml-auto h-4 w-4 text-ism-green/60" />}
          </Link>
        );
      })}
    </nav>
  );

  const panel = (
    <div className="flex h-full flex-col rounded-[28px] bg-gradient-to-b from-ism-green-700 via-ism-green-800 to-ism-green-900 p-4 shadow-float ring-1 ring-white/10">
      <div className="flex items-center justify-between px-2 pb-5 pt-2">
        <Link href="/">
          <BrandMark light size="md" showSub={false} />
        </Link>
        <button
          className="rounded-lg p-1 text-white/70 hover:bg-white/10 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* campaign switch */}
      <div className="mb-4 rounded-2xl bg-white/10 p-2">
        <div className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
          Campanha
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 rounded-xl bg-ism-gold px-3 py-2 text-ism-green-900 shadow-sm">
            {type === "alwayson" ? (
              <Radio className="h-4 w-4" strokeWidth={2.4} />
            ) : (
              <MapPin className="h-4 w-4" strokeWidth={2.4} />
            )}
            <span className="text-sm font-semibold">{CAMPAIGNS[type].name}</span>
          </div>
          <Link
            href={`/dashboard/${other}/${otherSlug(pathname, other)}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {other === "alwayson" ? (
              <Radio className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span>Ver {CAMPAIGNS[other].name}</span>
            <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
          </Link>
        </div>
      </div>

      {nav}

      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="mt-3 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Home className="h-[17px] w-[17px]" />
        Início
      </Link>
    </div>
  );

  return (
    <>
      {/* mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-ism-green-800 text-white shadow-float lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* desktop floating sidebar */}
      <aside className="fixed left-4 top-4 bottom-4 z-30 hidden w-[268px] lg:block">
        {panel}
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ism-green-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-3 top-3 bottom-3 w-[280px] animate-scale-in">
            {panel}
          </div>
        </div>
      )}
    </>
  );
}

/** Keep the same section when switching campaigns, unless it doesn't exist
 * for the target campaign (e.g. Vídeo only exists for Always ON). */
function otherSlug(pathname: string, other: CampaignType): string {
  const current = NAV.find((n) => pathname.endsWith(`/${n.slug}`));
  if (current && navFor(other).some((n) => n.slug === current.slug)) {
    return current.slug;
  }
  return "visao-geral";
}
