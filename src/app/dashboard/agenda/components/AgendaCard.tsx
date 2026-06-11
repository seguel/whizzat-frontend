"use client";

import { useTranslation } from "react-i18next";
import { AgendaItemDTO } from "../dto/AgendaItemDTO";

interface Props {
  agenda: AgendaItemDTO;
  selected: boolean;
  perfil: string;
}

export default function AgendaCard({ agenda, selected, perfil }: Props) {
  const { t } = useTranslation("common");
  const dataCompara = new Date(agenda.data_hora);
  const [data] = agenda.data_hora.split("T");
  const hora = agenda.data_hora.substring(11, 16);

  const [ano, mes, dia] = data.split("-");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const atrasada = dataCompara.setHours(0, 0, 0, 0) < today.getTime();

  return (
    <div
      className={`
    bg-white
    rounded-xl
    border
    shadow-sm
    transition-all
    duration-200
    p-4

    ${
      selected
        ? perfil === "avaliador"
          ? agenda.status === "PENDENTE" || atrasada
            ? "border-orange-500 ring-2 ring-orange-100"
            : "border-blue-600 ring-2 ring-blue-100"
          : atrasada
            ? "border-orange-600 ring-2 ring-orange-100"
            : "border-blue-600 ring-2 ring-blue-100"
        : "border-gray-200 hover:border-blue-200"
    }
  `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Skill */}
          <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            {agenda.skill}
          </span>

          {/* Dados do candidato */}
          {perfil === "avaliador" && (
            <div className="mt-3">
              <p className="font-semibold text-gray-900 truncate">
                {agenda.nome}
              </p>

              <p className="text-sm text-gray-500">
                {agenda.cidade}/{agenda.estado}
              </p>
            </div>
          )}

          {/* Data/Hora */}
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span>📅</span>

            <span className="font-medium">
              {dia}/{mes}/{ano}
            </span>

            <span className="text-gray-300">•</span>

            <span>{hora}</span>
          </div>
        </div>

        {/* Status */}
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            perfil === "avaliador"
              ? agenda.status === "PENDENTE" || atrasada
                ? "bg-orange-100 text-orange-700"
                : "bg-blue-100 text-blue-700"
              : atrasada
                ? "bg-orange-100 text-orange-700"
                : "bg-blue-100 text-blue-700"
          }`}
        >
          {perfil === "avaliador"
            ? agenda.status === "PENDENTE"
              ? t("agenda.status_aguardando")
              : atrasada
                ? t("agenda.status_agendada_atrasada")
                : t("agenda.status_agendada")
            : atrasada
              ? t("agenda.status_atrasada")
              : t("agenda.status_agendada")}
        </span>
      </div>
    </div>
  );
}
