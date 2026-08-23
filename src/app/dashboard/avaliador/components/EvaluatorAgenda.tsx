"use client";

import { useTranslation } from "react-i18next";
import { AvaliadorDashboardAgenda } from "../../../lib/types/avaliador-dashboard";

interface Props {
  agendas: AvaliadorDashboardAgenda[];
}

export default function EvaluatorAgenda({ agendas }: Props) {
  const { t, i18n } = useTranslation("common");

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("dash_avaliador.agenda_titulo")}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {t("dash_avaliador.agenda_descricao")}
          </p>
        </div>

        <span className="text-xl">📅</span>
      </div>

      {agendas.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {agendas.map((agenda) => (
            <AgendaCard
              key={agenda.id}
              agenda={agenda}
              locale={i18n.language}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">
            {t("dash_avaliador.sem_agenda")}
          </p>
        </div>
      )}
    </section>
  );
}

function AgendaCard({
  agenda,
  locale,
}: {
  agenda: AvaliadorDashboardAgenda;
  locale: string;
}) {
  const { t } = useTranslation("common");

  const data = new Date(agenda.data_hora);

  const localeFormat =
    locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";

  const dataFormatada = new Intl.DateTimeFormat(localeFormat, {
    day: "2-digit",
    month: "short",
  })
    .format(data)
    .replace(".", "")
    .toUpperCase();

  const horaFormatada = new Intl.DateTimeFormat(localeFormat, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);

  return (
    <div
      className={`border rounded-xl p-4 transition-colors ${
        agenda.atrasada
          ? "border-red-100 bg-red-50/40"
          : "border-gray-100 hover:bg-gray-50"
      }`}
    >
      <div className="flex gap-3">
        <div className="w-16 shrink-0 text-center">
          <p
            className={`text-xs font-semibold uppercase ${
              agenda.atrasada ? "text-red-500" : "text-gray-500"
            }`}
          >
            {dataFormatada}
          </p>

          <p className="text-sm font-bold text-gray-900 mt-1">
            {horaFormatada}
          </p>
        </div>

        <div className="w-px bg-gray-100 shrink-0" />

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-gray-900">{agenda.skill}</p>

          <p className="text-xs text-gray-500 mt-1">{agenda.candidato}</p>

          <div className="mt-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                agenda.atrasada
                  ? "bg-red-100 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {agenda.atrasada
                ? t("dash_avaliador.agenda_atrasada")
                : t("dash_avaliador.agenda_confirmada")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
