import {
  Home,
  Star,
  Search,
  User,
  CheckSquare,
  Calendar,
  Bell,
  Store,
} from "lucide-react";

type ProfileType = "candidato" | "recrutador" | "avaliador";

interface NavItem {
  icon: JSX.Element;
  label: string;
  route?: string;
  badge?: number;
}

export function getNavItems(profile: ProfileType): NavItem[] {
  switch (profile) {
    case "candidato":
      return [
        {
          icon: <Home size={20} />,
          label: "Dashboard",
          route: `/dashboard?perfil=${profile}`,
        },
        { icon: <Star size={20} />, label: "Minhas vagas", route: "/vagas" },
        { icon: <Search size={20} />, label: "Buscar vagas", route: "/buscar" },
        { icon: <User size={20} />, label: "Perfil", route: "/perfil" },
        {
          icon: <CheckSquare size={20} />,
          label: "Avaliações",
          route: "/avaliacoes",
        },
        { icon: <Calendar size={20} />, label: "Agenda", route: "/agenda" },
        {
          icon: <Bell size={20} />,
          label: "Notificações",
          route: "/notificacoes",
          badge: 3,
        },
      ];

    case "recrutador":
      return [
        {
          icon: <Home size={20} />,
          label: "Dashboard",
          route: `/dashboard?perfil=${profile}`,
        },
        {
          icon: <Star size={20} />,
          label: "Vagas abertas",
          route: `/dashboard/vagas?perfil=${profile}`,
        },
        {
          icon: <Store size={20} />,
          label: "Empresas",
          route: `/dashboard/empresa_dados?perfil=${profile}`,
        },
        { icon: <User size={20} />, label: "Perfil" },
        { icon: <Calendar size={20} />, label: "Agenda" },
        { icon: <Bell size={20} />, label: "Notificações", badge: 5 },
      ];

    case "avaliador":
      return [
        {
          icon: <Home size={20} />,
          label: "Dashboard",
          route: `/dashboard?perfil=${profile}`,
        },
        {
          icon: <CheckSquare size={20} />,
          label: "Minhas avaliações",
          route: "/avaliacoes",
        },
        { icon: <Calendar size={20} />, label: "Agenda", route: "/agenda" },
        {
          icon: <Bell size={20} />,
          label: "Notificações",
          route: "/notificacoes",
          badge: 2,
        },
      ];

    default:
      return [];
  }
}
