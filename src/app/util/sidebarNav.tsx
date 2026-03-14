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
  activeRoutes?: string[];
}

export function useNavItems(
  profile: ProfileType,
  notificationCount: number,
): NavItem[] {
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
          activeRoutes: ["/dashboard"],
        },
        {
          icon: <Star size={20} />,
          label: t("sidebar.menu_minhas_vagas"),
          route: "/vagas",
          activeRoutes: ["/dashboard/notificacao"],
        },
        {
          icon: <Search size={20} />,
          label: t("sidebar.menu_buscar_vagas"),
          route: `/dashboard/candidato/vagas?perfil=${profile}`,
          activeRoutes: ["/dashboard/candidato"],
        },
        {
          icon: <User size={20} />,
          label: t("sidebar.menu_meu_perfil"),
          route: `/dashboard/perfil?perfil=${profile}`,
          activeRoutes: ["/dashboard/perfil"],
        },
        {
          icon: <CheckSquare size={20} />,
          label: t("sidebar.menu_avaliacoes"),
          route: "/avaliacoes",
          activeRoutes: ["/dashboard/notificacao"],
        },
        {
          icon: <Calendar size={20} />,
          label: t("sidebar.menu_agenda"),
          route: "/agenda",
          activeRoutes: ["/dashboard/agenda"],
        },
        {
          icon: <Bell size={20} />,
          label: t("sidebar.menu_notificacoes"),
          route: `/dashboard/notificacao?perfil=${profile}`,
          badge: notificationCount > 0 ? notificationCount : undefined,
          activeRoutes: ["/dashboard/notificacao"],
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
          activeRoutes: ["/dashboard"],
        },
        {
          icon: <Star size={20} />,
          label: t("sidebar.menu_vagas_abertas"),
          route: `/dashboard/vagas?perfil=${profile}`,
          activeRoutes: ["/dashboard/vagas"],
        },
        {
          icon: <Store size={20} />,
          label: t("sidebar.menu_empresas"),
          route: `/dashboard/empresa?perfil=${profile}`,
          activeRoutes: ["/dashboard/empresa"],
        },
        {
          icon: <ClipboardCheck size={20} />,
          label: t("sidebar.menu_avaliadores"),
          route: `/dashboard/especialista?perfil=${profile}`,
          activeRoutes: ["/dashboard/especialista"],
        },
        {
          icon: <User size={20} />,
          label: t("sidebar.menu_meu_perfil"),
          route: `/dashboard/perfil?perfil=${profile}`,
          activeRoutes: ["/dashboard/perfil"],
        },
        {
          icon: <Calendar size={20} />,
          label: t("sidebar.menu_agenda"),
          route: "/agenda",
          activeRoutes: ["/dashboard/agenda"],
        },
        {
          icon: <Bell size={20} />,
          label: t("sidebar.menu_notificacoes"),
          route: `/dashboard/notificacao?perfil=${profile}`,
          badge: notificationCount > 0 ? notificationCount : undefined,
          activeRoutes: ["/dashboard/notificacao"],
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
          activeRoutes: ["/dashboard"],
        },
        {
          icon: <CheckSquare size={20} />,
          label: t("sidebar.menu_avaliacoes"),
          route: `/dashboard/avaliacao?perfil=${profile}`,
          activeRoutes: ["/dashboard/avaliacao"],
        },
        {
          icon: <ClipboardCheck size={20} />,
          label: t("sidebar.menu_questionario"),
          route: `/dashboard/questionario?perfil=${profile}`,
          activeRoutes: ["/dashboard/questionario"],
        },
        {
          icon: <User size={20} />,
          label: t("sidebar.menu_meu_perfil"),
          route: `/dashboard/perfil?perfil=${profile}`,
          activeRoutes: ["/dashboard/perfil"],
        },
        {
          icon: <Calendar size={20} />,
          label: t("sidebar.menu_agenda"),
          route: "/agenda",
          activeRoutes: ["/dashboard/agenda"],
        },
        {
          icon: <Bell size={20} />,
          label: t("sidebar.menu_notificacoes"),
          route: `/dashboard/notificacao?perfil=${profile}`,
          badge: notificationCount > 0 ? notificationCount : undefined,
          activeRoutes: ["/dashboard/notificacao"],
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
