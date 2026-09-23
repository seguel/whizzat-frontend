"use client";

import { useTranslation } from "react-i18next";
import { AgendaItemDTO } from "../dto/AgendaItemDTO";
import { AgendaRecrutadorItemDTO } from "../dto/AgendaRecrutadorItemDTO";
import { AgendaCandidatoItemDTO } from "../dto/AgendaCandidatoItemDTO";

interface Props {
  agenda: AgendaItemDTO | AgendaRecrutadorItemDTO | AgendaCandidatoItemDTO;

  selected: boolean;
  perfil: string;
}

type AgendaDTO =
  | AgendaItemDTO
  | AgendaRecrutadorItemDTO
  | AgendaCandidatoItemDTO;

function isAgendaRecrutador(
  agenda: AgendaDTO,
): agenda is AgendaRecrutadorItemDTO {
  return "conviteId" in agenda;
}

function isAgendaCandidato(
  agenda: AgendaDTO,
): agenda is AgendaCandidatoItemDTO {
  return "origem" in agenda;
}

export default function AgendaCard({ agenda, selected, perfil }: Props) {
  const { t } = useTranslation("common");

  // const isRecrutador = isAgendaRecrutador(agenda);

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
            : perfil === "recrutador"
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
          {isAgendaRecrutador(agenda) ? (
            <>
              {/* Recrutador */}
              <span className="inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                {agenda.tipo.replaceAll("_", " ")}
              </span>

              <div className="mt-3">
                <p className="font-semibold text-gray-900">{agenda.titulo}</p>

                {agenda.empresa && (
                  <p className="mt-1 text-sm text-gray-500">
                    {agenda.empresa.nome_empresa}
                  </p>
                )}
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium text-gray-800">
                  {agenda.candidato.nome}
                </p>

                <p className="text-sm text-gray-500">
                  {agenda.candidato.cidade}/{agenda.candidato.estado}
                </p>
              </div>
            </>
          ) : isAgendaCandidato(agenda) ? (
            <>
              {/* Candidato */}
              {agenda.origem === "AVALIACAO" ? (
                <>
                  <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    {agenda.skill}
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                    {agenda.tipo.replaceAll("_", " ")}
                  </span>

                  <div className="mt-3">
                    <p className="font-semibold text-gray-900">
                      {agenda.titulo}
                    </p>

                    {agenda.empresa && (
                      <p className="mt-1 text-sm text-gray-500">
                        {agenda.empresa.nome_empresa}
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Formato antigo - candidato/avaliador */}
              <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                {agenda.skill}
              </span>

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
            </>
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
            perfil === "avaliador" || perfil === "recrutador"
              ? agenda.status === "PENDENTE" || atrasada
                ? "bg-orange-100 text-orange-700"
                : "bg-blue-100 text-blue-700"
              : atrasada
                ? "bg-orange-100 text-orange-700"
                : "bg-blue-100 text-blue-700"
          }`}
        >
          {perfil === "avaliador" || perfil === "recrutador"
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
