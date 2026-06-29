export type CampaignType = "alwayson" | "geolocalizadas";

/** Compact, client-friendly row. Long thumbnail/permalink URLs are de-duped
 * into the dataset-level `thumbs`/`perms` arrays and referenced by index. */
export interface Row {
  date: string; // YYYY-MM-DD
  marca: string;
  objetivo: string;
  mes: string; // "" when missing
  age: string;
  gender: string; // female | male | unknown
  praca: string; // cidade / mercado (Salvador, Feira de Santana, ...)
  empreendimento: string; // rede de loja (Atacadão, Atakarejo, ...) ou "Institucional"
  ponto: string; // rótulo granular: empreendimento · bairro
  format: string; // REELS/STORY, FEED/STORY, IG, ...
  ad: string; // cleaned creative name
  campaign: string; // cleaned campaign label
  ti: number; // thumbnail index (-1 = none)
  pi: number; // permalink index (-1 = none)
  // Monetary value is always `investimento`; the raw `spend` column is dropped.
  impressions: number;
  clicks: number;
  reach: number;
  engagement: number;
  reactions: number;
  v25: number;
  v50: number;
  v75: number;
  v100: number;
  vtp: number; // thruplay
  investimento: number;
}

export interface Dataset {
  type: CampaignType;
  rows: Row[];
  thumbs: string[];
  perms: string[];
  updatedAt: string;
}

export interface ApiPayload {
  alwayson: Dataset;
  geolocalizadas: Dataset;
}
