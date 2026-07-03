import type { CampaignType, Dataset, Row } from "./types";

const ENDPOINT = "https://cqrpbiepyeypbkizwacu.supabase.co/functions/v1/ism2026";
const KEY = "sb_publishable_YN9YKLw6sludrgf9T2i_1g_Dcm8dIiK";

interface RawRow {
  date?: string;
  campaign?: string;
  adset_name?: string;
  ad_name?: string;
  age?: string;
  gender?: string;
  thumbnail_url?: string;
  instagram_permalink_url?: string;
  spend?: number | string;
  impressions?: number | string;
  clicks?: number | string;
  actions_post_engagement?: number | string;
  reach?: number | string;
  video_thruplay_watched_actions_video_view?: number | string;
  video_p25_watched_actions_video_view?: number | string;
  video_p50_watched_actions_video_view?: number | string;
  video_p75_watched_actions_video_view?: number | string;
  video_p100_watched_actions_video_view?: number | string;
  actions_post_reaction?: number | string;
  Marca?: string;
  Objetivo?: string;
  "Mês"?: string;
  Investimento?: number | string;
}

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

const FORMAT_KEYS = new Set([
  "REELS",
  "STORY",
  "STORIES",
  "FEED",
  "IG",
  "AUTO",
  "REELS/STORY",
  "FEED/STORY",
  "FEED/STORIES",
]);
const BRANDS = new Set(["ENERUP", "GOOB", "YULO"]);

// Cidades (praças de mídia). FSA = Feira de Santana.
const CITY_MAP: Record<string, string> = {
  SALVADOR: "Salvador",
  FEIRA: "Feira de Santana",
  FSA: "Feira de Santana",
  ARACAJU: "Aracaju",
  MACEIO: "Maceió",
};
// Empreendimentos (redes/lojas) — NÃO são praças.
const STORE_MAP: Record<string, string> = {
  ATACADAO: "Atacadão",
  "ATACADÃO": "Atacadão",
  ATAKADAO: "Atacadão",
  ATAKAREJO: "Atakarejo",
  MERCANTIL: "Mercantil",
  ASSAI: "Assaí",
  "ASSAÍ": "Assaí",
  "CENTRO SUL": "Centro Sul",
};
const STORE_KEYS = Object.keys(STORE_MAP);

function brackets(s: string): string[] {
  return (s.match(/\[([^\]]*)\]/g) ?? []).map((t) => t.slice(1, -1).trim());
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|\s|\/)\p{L}/gu, (c) => c.toUpperCase())
    .trim();
}

export interface Location {
  praca: string; // cidade / mercado
  empreendimento: string; // rede de loja (ou "Institucional")
  ponto: string; // rótulo granular: empreendimento + bairro
  format: string;
}

/**
 * Classifica o nome do adset em cidade (praça), empreendimento (rede) e
 * ponto (bairro). Os nomes misturam cidades e lojas na primeira posição, então
 * a classificação é feita por listas conhecidas — nunca por posição.
 */
function parseLocation(adset: string): Location {
  const cities = new Set<string>();
  let store = "";
  let format = "";
  const bairros: string[] = [];

  const classify = (rawToken: string) => {
    const t = rawToken.trim();
    if (!t) return;
    const up = t.toUpperCase();
    if (FORMAT_KEYS.has(up)) {
      if (!format) format = up;
      return;
    }
    if (BRANDS.has(up)) return;
    if (/^\d+%?$/.test(t)) return; // percentuais / números soltos
    if (up.includes("/")) {
      // ex.: "SALVADOR/FEIRA" — pode conter duas cidades
      const parts = up.split("/");
      if (parts.every((p) => CITY_MAP[p])) {
        parts.forEach((p) => cities.add(CITY_MAP[p]));
        return;
      }
    }
    if (CITY_MAP[up]) {
      cities.add(CITY_MAP[up]);
      return;
    }
    // empreendimento pode aparecer como token isolado ou dentro de um texto
    const hitStore = STORE_KEYS.find((k) => up === k || up.startsWith(k + " ") || up.includes(" " + k));
    if (hitStore) {
      if (!store) store = STORE_MAP[hitStore];
      const remainder = up.replace(hitStore, "").trim();
      if (remainder && remainder !== "PTO" && remainder.length > 1) bairros.push(titleCase(remainder));
      return;
    }
    // resto = bairro/ponto descritivo (PIATA, PARIPE, "PTO DISTRIB"...)
    bairros.push(titleCase(t));
  };

  for (const tok of brackets(adset)) classify(tok);
  // texto fora dos colchetes (ex.: "- MERCANTIL PAU DA LIMA -")
  adset
    .replace(/\[[^\]]*\]/g, "|")
    .split("|")
    .flatMap((s) => s.split(/[-–]/))
    .forEach((s) => classify(s.replace(/\s+/g, " ").trim()));

  // Os adsets liderados por loja/bairro são todos da região de Salvador.
  const praca =
    cities.size > 0 ? [...cities].sort().join(" / ") : "Salvador";
  const empreendimento = store || "Institucional";
  const bairro = bairros[0] ?? "";
  const ponto =
    empreendimento !== "Institucional"
      ? `${empreendimento}${bairro ? " · " + bairro : ""}`
      : bairro
        ? bairro
        : praca;

  return { praca, empreendimento, ponto, format: format || "OUTROS" };
}

function cleanLabel(s: string): string {
  return s.replace(/[[\]]/g, "").replace(/\s+/g, " ").trim();
}

function toISODate(d?: string): string {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

function compact(type: CampaignType, raw: RawRow[]): Dataset {
  const thumbs: string[] = [];
  const perms: string[] = [];
  const thumbIdx = new Map<string, number>();
  const permIdx = new Map<string, number>();

  const intern = (
    url: string | undefined,
    arr: string[],
    map: Map<string, number>,
  ): number => {
    if (!url) return -1;
    const hit = map.get(url);
    if (hit !== undefined) return hit;
    const i = arr.length;
    arr.push(url);
    map.set(url, i);
    return i;
  };

  const rows: Row[] = raw.map((r) => {
    const adset = r.adset_name ?? "";
    const loc = parseLocation(adset);
    return {
      date: toISODate(r.date),
      marca: (r.Marca || "—").toUpperCase(),
      objetivo: (r.Objetivo || "—").toUpperCase(),
      mes: (r["Mês"] || "").toLowerCase(),
      age: r.age || "Unknown",
      gender: (r.gender || "unknown").toLowerCase(),
      praca: loc.praca,
      empreendimento: loc.empreendimento,
      ponto: loc.ponto,
      format: loc.format,
      ad: cleanLabel(r.ad_name ?? "—") || "—",
      campaign: cleanLabel(r.campaign ?? "—"),
      ti: intern(r.thumbnail_url, thumbs, thumbIdx),
      pi: intern(r.instagram_permalink_url, perms, permIdx),
      impressions: num(r.impressions),
      clicks: num(r.clicks),
      reach: num(r.reach),
      engagement: num(r.actions_post_engagement),
      reactions: num(r.actions_post_reaction),
      v25: num(r.video_p25_watched_actions_video_view),
      v50: num(r.video_p50_watched_actions_video_view),
      v75: num(r.video_p75_watched_actions_video_view),
      v100: num(r.video_p100_watched_actions_video_view),
      vtp: num(r.video_thruplay_watched_actions_video_view),
      investimento: num(r.Investimento),
    };
  });

  return {
    type,
    rows,
    thumbs,
    perms,
    updatedAt: new Date().toISOString(),
  };
}

let cache: { data: Awaited<ReturnType<typeof load>>; at: number } | null = null;
const TTL = 1000 * 60 * 30; // 30 min

async function load(force = false) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Functions" }),
    // Ao forçar, ignora qualquer cache de fetch e busca o dado mais recente
    // (ex.: coeficiente de investimento recém-alterado na origem).
    ...(force ? { cache: "no-store" as const } : { next: { revalidate: 1800 } }),
  });
  if (!res.ok) throw new Error(`ISM endpoint ${res.status}`);
  const json = (await res.json()) as {
    alwayson?: RawRow[];
    geolocalizadas?: RawRow[];
  };
  return {
    alwayson: compact("alwayson", json.alwayson ?? []),
    geolocalizadas: compact("geolocalizadas", json.geolocalizadas ?? []),
  };
}

export async function getPayload(force = false) {
  if (!force && cache && Date.now() - cache.at < TTL) return cache.data;
  const data = await load(force);
  cache = { data, at: Date.now() };
  return data;
}
