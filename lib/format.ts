export const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const NUM = new Intl.NumberFormat("pt-BR");

export function fmtCurrency(v: number): string {
  return BRL.format(v || 0);
}

export function fmtInt(v: number): string {
  return NUM.format(Math.round(v || 0));
}

/** Compact thousands/millions, pt-BR. */
export function fmtCompact(v: number): string {
  const n = v || 0;
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1).replace(".", ",") + "k";
  return NUM.format(Math.round(n));
}

export function fmtPct(v: number, digits = 2): string {
  return (v * 100).toFixed(digits).replace(".", ",") + "%";
}

export function fmtDecimal(v: number, digits = 2): string {
  return (v || 0).toFixed(digits).replace(".", ",");
}

const MONTH_ORDER = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export function monthRank(m: string): number {
  const i = MONTH_ORDER.indexOf((m || "").toLowerCase());
  return i === -1 ? 99 : i;
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const GENDER_LABEL: Record<string, string> = {
  female: "Feminino",
  male: "Masculino",
  unknown: "Não inform.",
};
