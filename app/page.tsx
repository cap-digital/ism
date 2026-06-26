import Link from "next/link";
import { ArrowRight, Radio, MapPin, BarChart3, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CAMPAIGNS } from "@/lib/constants";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-ism-green-700 via-ism-green-800 to-ism-green-900 text-white">
      {/* decorative layers */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] ism-grid-bg" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-ism-green/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 h-[520px] w-[520px] rounded-full bg-ism-gold/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        {/* header */}
        <header className="flex items-center justify-between">
          <BrandMark light size="md" />
        </header>

        {/* hero */}
        <section className="flex flex-1 flex-col justify-center py-12">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-ism-gold ring-1 ring-white/10">
              <Sparkles className="h-3.5 w-3.5" /> Dashboard de Performance
            </span>
            <div className="mt-8">
              <span className="inline-block text-[7rem] font-black italic leading-none tracking-tight text-white sm:text-[11rem]">
                ism
              </span>
              <p className="mt-2 text-lg font-semibold uppercase tracking-[0.3em] text-ism-gold sm:text-2xl">
                Indústrias São Miguel
              </p>
            </div>
            <p className="mt-7 max-w-xl text-lg text-white/70">
              Visualize o desempenho das campanhas de mídia da ISM em um painel
              moderno e interativo. Selecione abaixo qual operação deseja
              analisar.
            </p>
          </div>

          {/* campaign selection */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <CampaignCard
              type="alwayson"
              icon={<Radio className="h-6 w-6" />}
              stat="3.220 registros · 3 marcas"
            />
            <CampaignCard
              type="geolocalizadas"
              icon={<MapPin className="h-6 w-6" />}
              stat="313 registros · lojas e bairros"
            />
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/45">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> ISM · Indústrias São Miguel
          </span>
          <span>Painel interno de mídia</span>
        </footer>
      </div>
    </main>
  );
}

function CampaignCard({
  type,
  icon,
  stat,
}: {
  type: keyof typeof CAMPAIGNS;
  icon: React.ReactNode;
  stat: string;
}) {
  const c = CAMPAIGNS[type];
  return (
    <Link
      href={`/dashboard/${type}/visao-geral`}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/[0.16] hover:shadow-float"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ism-gold/10 transition-transform group-hover:scale-150" />
      <div className="flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ism-gold text-ism-green-900 shadow-sm">
          {icon}
        </span>
        <ArrowRight className="h-6 w-6 -translate-x-2 text-ism-gold opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
      <h2 className="mt-5 text-2xl font-bold tracking-tight">{c.name}</h2>
      <p className="mt-1 text-sm font-medium text-ism-gold/90">{c.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/65">
        {c.description}
      </p>
      <div className="mt-5 flex items-center gap-2 text-xs font-medium text-white/50">
        <span className="h-1.5 w-1.5 rounded-full bg-ism-gold" />
        {stat}
      </div>
    </Link>
  );
}
