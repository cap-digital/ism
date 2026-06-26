import {
  LayoutDashboard,
  Images,
  Users,
  MapPin,
  Tag,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  slug: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

export const NAV: NavItem[] = [
  { slug: "visao-geral", label: "Visão Geral", icon: LayoutDashboard, desc: "Resumo e KPIs" },
  { slug: "criativos", label: "Criativos", icon: Images, desc: "Ranking de anúncios" },
  { slug: "demografia", label: "Demografia", icon: Users, desc: "Idade e gênero" },
  { slug: "pracas", label: "Praças", icon: MapPin, desc: "Desempenho por local" },
  { slug: "marcas", label: "Marcas", icon: Tag, desc: "Comparativo de marcas" },
  { slug: "video", label: "Vídeo", icon: PlayCircle, desc: "Retenção e funil" },
];
