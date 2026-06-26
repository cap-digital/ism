import type { CampaignType } from "./types";

export const ISM = {
  green: "#2E9E3F",
  green600: "#268A37",
  green700: "#1E7A30",
  green800: "#155E26",
  green900: "#103F1D",
  gold: "#F4B740",
  gold600: "#E3A52E",
  red: "#E2231A",
  mist: "#EAF4EC",
};

/** Ordered categorical palette built around the ISM identity. */
export const PALETTE = [
  "#2E9E3F",
  "#F4B740",
  "#1E7A30",
  "#7BC86C",
  "#E2231A",
  "#155E26",
  "#C2902A",
  "#8FD19E",
];

export const BRAND_COLORS: Record<string, string> = {
  ENERUP: "#2E9E3F",
  GOOB: "#F4B740",
  YULO: "#1E7A30",
};

export const GENDER_COLORS: Record<string, string> = {
  female: "#E2231A",
  male: "#2E9E3F",
  unknown: "#B6C2BA",
};

export interface CampaignMeta {
  type: CampaignType;
  name: string;
  short: string;
  tagline: string;
  description: string;
}

export const CAMPAIGNS: Record<CampaignType, CampaignMeta> = {
  alwayson: {
    type: "alwayson",
    name: "Always ON",
    short: "Always ON",
    tagline: "Presença de marca contínua",
    description:
      "Campanhas de alcance sempre ativas, sustentando a lembrança de marca ao longo dos meses.",
  },
  geolocalizadas: {
    type: "geolocalizadas",
    name: "Geolocalizadas",
    short: "Geo",
    tagline: "Impacto por praça e ponto de venda",
    description:
      "Campanhas com segmentação geográfica em lojas e bairros estratégicos para conversão local.",
  },
};

export const isCampaignType = (v: string): v is CampaignType =>
  v === "alwayson" || v === "geolocalizadas";
