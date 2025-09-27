// util/sidebarNav.ts
import {
  Home,
  Star,
  Search,
  User,
  CheckSquare,
  Calendar,
  Bell,
  Store,
  LogOut,
} from "lucide-react";

export type ProfileType = "candidato" | "recrutador" | "avaliador";
export type NavAction = "logout";

export interface NavItem {
  icon: JSX.Element;
  label: string;
  route?: string;
  badge?: number;
  action?: NavAction; // 👈 novo: item de ação (ex: logout)
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
        {
          icon: <User size={20} />,
          label: "Meu Perfil",
          route: `/dashboard/perfil?perfil=${profile}`,
        },
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
        { icon: <LogOut size={20} />, label: "Sair", action: "logout" }, // 👈 ação
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
        {
          icon: <User size={20} />,
          label: "Meu Perfil",
          route: `/dashboard/perfil?perfil=${profile}`,
        },
        { icon: <Calendar size={20} />, label: "Agenda", route: "/agenda" },
        {
          icon: <Bell size={20} />,
          label: "Notificações",
          route: "/notificacoes",
          badge: 5,
        },
        { icon: <LogOut size={20} />, label: "Sair", action: "logout" }, // 👈 ação
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
          label: "Avaliações",
          route: "/avaliacoes",
        },
        {
          icon: <User size={20} />,
          label: "Meu Perfil",
          route: `/dashboard/perfil?perfil=${profile}`,
        },
        { icon: <Calendar size={20} />, label: "Agenda", route: "/agenda" },
        {
          icon: <Bell size={20} />,
          label: "Notificações",
          route: "/notificacoes",
          badge: 2,
        },
        { icon: <LogOut size={20} />, label: "Sair", action: "logout" }, // 👈 ação
      ];

    default:
      return [];
  }
}
