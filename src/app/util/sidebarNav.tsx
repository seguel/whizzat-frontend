// util/useNavItems.ts
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
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
  ClipboardCheck,
} from "lucide-react";

export type ProfileType = "candidato" | "recrutador" | "avaliador";
export type NavAction = "logout";

export interface NavItem {
  icon: JSX.Element;
  label: string;
  route?: string;
  badge?: number;
  action?: NavAction;
}

export function useNavItems(profile: ProfileType): NavItem[] {
  const { t, i18n } = useTranslation("common");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
    } else {
      const onInit = () => setReady(true);
      i18n.on("initialized", onInit);
      return () => i18n.off("initialized", onInit);
    }
  }, [i18n]);

  if (!ready) return [];

  switch (profile) {
    case "candidato":
      return [
        {
          icon: <Home size={20} />,
          label: t("sidebar.menu_dashboard"),
          route: `/dashboard?perfil=${profile}`,
        },
        {
          icon: <Star size={20} />,
          label: t("sidebar.menu_minhas_vagas"),
          route: "/vagas",
        },
        {
          icon: <Search size={20} />,
          label: t("sidebar.menu_buscar_vagas"),
          route: "/buscar",
        },
        {
          icon: <User size={20} />,
          label: t("sidebar.menu_meu_perfil"),
          route: `/dashboard/perfil?perfil=${profile}`,
        },
        {
          icon: <CheckSquare size={20} />,
          label: t("sidebar.menu_avaliacoes"),
          route: "/avaliacoes",
        },
        {
          icon: <Calendar size={20} />,
          label: t("sidebar.menu_agenda"),
          route: "/agenda",
        },
        {
          icon: <Bell size={20} />,
          label: t("sidebar.menu_notificacoes"),
          route: "/notificacoes",
          badge: 3,
        },
        {
          icon: <LogOut size={20} />,
          label: t("sidebar.menu_sair"),
          action: "logout",
        },
      ];

    case "recrutador":
      return [
        {
          icon: <Home size={20} />,
          label: t("sidebar.menu_dashboard"),
          route: `/dashboard?perfil=${profile}`,
        },
        {
          icon: <Star size={20} />,
          label: t("sidebar.menu_vagas_abertas"),
          route: `/dashboard/vagas?perfil=${profile}`,
        },
        {
          icon: <Store size={20} />,
          label: t("sidebar.menu_empresas"),
          route: `/dashboard/empresa?perfil=${profile}`,
        },
        {
          icon: <ClipboardCheck size={20} />,
          label: t("sidebar.menu_avaliadores"),
          route: `/dashboard/especialista?perfil=${profile}`,
        },
        {
          icon: <User size={20} />,
          label: t("sidebar.menu_meu_perfil"),
          route: `/dashboard/perfil?perfil=${profile}`,
        },
        {
          icon: <Calendar size={20} />,
          label: t("sidebar.menu_agenda"),
          route: "/agenda",
        },
        {
          icon: <Bell size={20} />,
          label: t("sidebar.menu_notificacoes"),
          route: "/notificacoes",
          badge: 5,
        },
        {
          icon: <LogOut size={20} />,
          label: t("sidebar.menu_sair"),
          action: "logout",
        },
      ];

    case "avaliador":
      return [
        {
          icon: <Home size={20} />,
          label: t("sidebar.menu_dashboard"),
          route: `/dashboard?perfil=${profile}`,
        },
        {
          icon: <CheckSquare size={20} />,
          label: t("sidebar.menu_avaliacoes"),
          route: "/avaliacoes",
        },
        {
          icon: <User size={20} />,
          label: t("sidebar.menu_meu_perfil"),
          route: `/dashboard/perfil?perfil=${profile}`,
        },
        {
          icon: <Calendar size={20} />,
          label: t("sidebar.menu_agenda"),
          route: "/agenda",
        },
        {
          icon: <Bell size={20} />,
          label: t("sidebar.menu_notificacoes"),
          route: "/notificacoes",
          badge: 2,
        },
        {
          icon: <LogOut size={20} />,
          label: t("sidebar.menu_sair"),
          action: "logout",
        },
      ];

    default:
      return [];
  }
}
