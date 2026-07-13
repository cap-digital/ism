import type { CampaignType } from "./types";
import { monthRank } from "./format";

/** Meta contratada pelo cliente para um (mês · marca). */
export interface Meta {
  investimento: number;
  impressoes: number;
}

/**
 * Metas contratadas por campanha → mês → marca.
 * São os valores contratados pelo cliente (o "planejado"). Meses em andamento
 * (ex.: julho) ainda podem crescer conforme novas contratações.
 */
export const METAS: Record<CampaignType, Record<string, Record<string, Meta>>> = {
  alwayson: {
    junho: {
      GOOB: { investimento: 7800, impressoes: 975_000 },
      ENERUP: { investimento: 9450, impressoes: 1_181_250 },
      YULO: { investimento: 3900, impressoes: 487_500 },
    },
    julho: {
      GOOB: { investimento: 5000, impressoes: 625_000 },
      ENERUP: { investimento: 4500, impressoes: 562_500 },
      YULO: { investimento: 3120, impressoes: 390_000 },
    },
    agosto: {
      ENERUP: { investimento: 4000, impressoes: 500_000 },
      GOOB: { investimento: 4000, impressoes: 500_000 },
    },
  },
  geolocalizadas: {
    junho: {
      ENERUP: { investimento: 4050, impressoes: 506_250 },
      GOOB: { investimento: 5200, impressoes: 650_000 },
      YULO: { investimento: 2600, impressoes: 325_000 },
    },
    julho: {
      ENERUP: { investimento: 2000, impressoes: 250_000 },
      GOOB: { investimento: 1000, impressoes: 125_000 },
      YULO: { investimento: 1040, impressoes: 130_000 },
    },
    agosto: {
      ENERUP: { investimento: 4000, impressoes: 500_000 },
      GOOB: { investimento: 4000, impressoes: 500_000 },
      YULO: { investimento: 3300, impressoes: 412_500 },
    },
  },
};

export const emptyMeta = (): Meta => ({ investimento: 0, impressoes: 0 });

/** Meses com meta contratada para a campanha, em ordem de calendário. */
export function metaMonths(type: CampaignType): string[] {
  return Object.keys(METAS[type]).sort((a, b) => monthRank(a) - monthRank(b));
}

/** União das marcas com meta ao longo de todos os meses da campanha. */
export function metaBrands(type: CampaignType): string[] {
  const s = new Set<string>();
  for (const month of Object.values(METAS[type]))
    for (const brand of Object.keys(month)) s.add(brand);
  return [...s];
}

/** Soma das metas contratadas sobre um conjunto de meses × marcas. */
export function sumMetas(
  type: CampaignType,
  months: string[],
  brands: string[],
): Meta {
  const out = emptyMeta();
  for (const month of months) {
    const mm = METAS[type][month.toLowerCase()];
    if (!mm) continue;
    for (const brand of brands) {
      const g = mm[brand];
      if (!g) continue;
      out.investimento += g.investimento;
      out.impressoes += g.impressoes;
    }
  }
  return out;
}

/** Investimento total contratado num mês (todas as marcas). */
export function metaInvestimentoMes(type: CampaignType, month: string): number {
  const mm = METAS[type][(month || "").toLowerCase()];
  if (!mm) return 0;
  return Object.values(mm).reduce((s, g) => s + g.investimento, 0);
}
