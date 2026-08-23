"use client";

import { AvaliadorDashboardResumo } from "../../../lib/types/avaliador-dashboard";
import { useTranslation } from "react-i18next";

interface Props {
  resumo: AvaliadorDashboardResumo;
}

export default function EvaluatorStats({ resumo }: Props) {
  const { t } = useTranslation("common");

  const stats = [
    {
      label: t("dash_avaliador.stats_pendente"),
      value: resumo.avaliacoes_pendentes,
      description: t("dash_avaliador.stats_pendente_msg"),
      icon: "📝",
    },
    {
      label: t("dash_avaliador.stats_agendada"),
      value: resumo.entrevistas_agendadas,
      description: t("dash_avaliador.stats_agendada_msg"),
      icon: "📅",
    },
    {
      label: t("dash_avaliador.stats_skill"),
      value: resumo.skills_avaliadas,
      description: t("dash_avaliador.stats_skill_msg"),
      icon: "⭐",
    },
    {
      label: t("dash_avaliador.stats_pontuacao"),
      value: resumo.pontuacao,
      description: t("dash_avaliador.stats_pontuacao_msg"),
      icon: "🏆",
    },
  ];

  return (
    <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>

              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>

              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </div>

            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center rounded-xl bg-blue-50 text-xl">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
