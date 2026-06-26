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

function brackets(s: string): string[] {
  return (s.match(/\[([^\]]*)\]/g) ?? []).map((t) => t.slice(1, -1).trim());
}

/** Extract a primary region/location and ad format from the adset name. */
function parseAdset(adset: string): { region: string; format: string } {
  let region = "";
  let format = "";
  for (const t of brackets(adset)) {
    const up = t.toUpperCase();
    if (FORMAT_KEYS.has(up)) {
      if (!format) format = up;
      continue;
    }
    if (BRANDS.has(up)) continue;
    if (/^\d+%$/.test(t)) continue;
    if (!region) region = t.toUpperCase();
  }
  return { region: region || "OUTROS", format: format || "OUTROS" };
}

/** Human-friendly label: strip brackets, brand & format tokens, collapse dashes. */
function cleanPraca(adset: string): string {
  const parts = brackets(adset).filter((t) => {
    const up = t.toUpperCase();
    return !FORMAT_KEYS.has(up) && !BRANDS.has(up) && !/^\d+%$/.test(t);
  });
  // also capture text living between brackets (e.g. "- MERCANTIL PAU DA LIMA -")
  const between = adset
    .replace(/\[[^\]]*\]/g, "|")
    .split("|")
    .map((s) => s.replace(/[-–]/g, " ").trim())
    .filter((s) => s.length > 1);
  const label = [...parts, ...between].join(" · ").trim();
  return label || adset.replace(/[[\]]/g, "").trim() || "—";
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
    const { region, format } = parseAdset(adset);
    return {
      date: toISODate(r.date),
      marca: (r.Marca || "—").toUpperCase(),
      objetivo: (r.Objetivo || "—").toUpperCase(),
      mes: (r["Mês"] || "").toLowerCase(),
      age: r.age || "Unknown",
      gender: (r.gender || "unknown").toLowerCase(),
      region,
      praca: cleanPraca(adset),
      format,
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

async function load() {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Functions" }),
    next: { revalidate: 1800 },
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

export async function getPayload() {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const data = await load();
  cache = { data, at: Date.now() };
  return data;
}
