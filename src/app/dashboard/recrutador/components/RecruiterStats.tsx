"use client";

import { useTranslation } from "react-i18next";
import { RecrutadorDashboardResumo } from "../../../lib/types/recrutador-dashboard";

interface Props {
  resumo: RecrutadorDashboardResumo;
}

export default function RecruiterStats({ resumo }: Props) {
  const { t } = useTranslation("common");

  const stats = [
    {
      label: t("dash_recrutador.stats_vagas"),
      value: resumo.vagas_abertas,
      description: t("dash_recrutador.stats_vagas_msg"),
      icon: "📋",
    },
    {
      label: t("dash_recrutador.stats_convites"),
      value: resumo.convites_pendentes,
      description: t("dash_recrutador.stats_convites_msg"),
      icon: "✉️",
    },
    {
      label: t("dash_recrutador.stats_andamento"),
      value: resumo.processos_andamento,
      description: t("dash_recrutador.stats_andamento_msg"),
      icon: "💼",
    },
    {
      label: t("dash_recrutador.stats_agendada"),
      value: resumo.entrevistas_agendadas,
      description: t("dash_recrutador.stats_agendada_msg"),
      icon: "📅",
    },
    {
      label: t("dash_recrutador.stats_finalizados"),
      value: resumo.processos_finalizados,
      description: t("dash_recrutador.stats_finalizados_msg"),
      icon: "✅",
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
        >
          <div className="min-h-[40px] flex items-center pr-12">
            <p className="text-xs sm:text-sm text-gray-500 leading-5">
              {stat.label}
            </p>
          </div>

          <div className="text-center mt-1">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {stat.value}
            </p>

            <div className="min-h-[36px] flex items-center justify-center">
              <p className="text-xs text-gray-400 leading-4">
                {stat.description}
              </p>
            </div>
          </div>

          <div className="absolute top-4 right-4 w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-green-50 text-xl">
            {stat.icon}
          </div>
        </div>
      ))}
    </section>
  );
}
