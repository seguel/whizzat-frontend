"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Video, Lock } from "lucide-react";

import { AgendaItemDTO } from "../dto/AgendaItemDTO";
import { AgendaRecrutadorItemDTO } from "../dto/AgendaRecrutadorItemDTO";
import { AgendaCandidatoItemDTO } from "../dto/AgendaCandidatoItemDTO";

import {
  getAgendaDateParts,
  getAgendaTime,
  isAgendaPastDay,
} from "./agendaDate";

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

function isAgendaCandidatoRecrutador(
  agenda: AgendaDTO,
): agenda is AgendaCandidatoItemDTO {
  return isAgendaCandidato(agenda) && agenda.origem === "RECRUTADOR";
}

export default function AgendaCard({ agenda, selected, perfil }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();

  const [agora, setAgora] = useState<number | null>(null);

  useEffect(() => {
    const atualizarHorario = () => setAgora(Date.now());

    atualizarHorario();

    const intervalo = window.setInterval(atualizarHorario, 15000);

    return () => window.clearInterval(intervalo);
  }, []);

  const dataEntrevista = new Date(agenda.data_hora).getTime();

  const horarioLiberacao = Number.isFinite(dataEntrevista)
    ? dataEntrevista - 15 * 60 * 1000
    : null;

  const acessoLiberado =
    agora !== null && horarioLiberacao !== null && agora >= horarioLiberacao;

  const horaLiberacaoFormatada =
    horarioLiberacao !== null
      ? new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        }).format(new Date(horarioLiberacao))
      : null;

  // =========================================================
  // CANDIDATO / RECRUTADOR
  // =========================================================

  const candidatoRecrutador =
    perfil === "candidato" && isAgendaCandidatoRecrutador(agenda);

  const aguardandoLink = candidatoRecrutador && agenda.status === "AGENDADO";

  const entrevistaConfirmada =
    candidatoRecrutador && agenda.status === "ENTREVISTA_CONFIRMADA";

  // =========================================================
  // RECRUTADOR
  // =========================================================

  const agendaRecrutador =
    perfil === "recrutador" && isAgendaRecrutador(agenda);

  const recrutadorAguardandoAceite =
    agendaRecrutador &&
    agenda.status === "PENDENTE" &&
    agenda.status_processo === "AGENDA_ENVIADA";

  const recrutadorAguardandoLink =
    agendaRecrutador &&
    agenda.status === "ACEITO" &&
    agenda.status_processo === "AGENDADO";

  const recrutadorEntrevistaConfirmada =
    agendaRecrutador &&
    agenda.status === "ACEITO" &&
    agenda.status_processo === "ENTREVISTA_CONFIRMADA";

  // =========================================================
  // DATA / HORA
  // =========================================================

  const { ano, mes, dia } = getAgendaDateParts(agenda.data_hora);
  const hora = getAgendaTime(agenda.data_hora);
  const atrasada = isAgendaPastDay(agenda.data_hora);

  // =========================================================
  // PLATAFORMA
  // =========================================================

  const getPlataformaLabel = () => {
    const agendaComPlataforma =
      isAgendaCandidatoRecrutador(agenda) || isAgendaRecrutador(agenda);

    if (!agendaComPlataforma || !agenda.plataforma) {
      return "";
    }

    switch (agenda.plataforma) {
      case "GOOGLE_MEET":
        return t("agenda.plataforma_google_meet");

      case "MICROSOFT_TEAMS":
        return t("agenda.plataforma_microsoft_teams");

      case "ZOOM":
        return t("agenda.plataforma_zoom");

      case "LINK_EXTERNO":
        return t("agenda.plataforma_link_externo");

      default:
        return "";
    }
  };

  // =========================================================
  // NAVEGAÇÃO
  // =========================================================

  function abrirProcessoRecrutador() {
    if (!isAgendaRecrutador(agenda)) return;

    router.push(
      `/dashboard/recrutador/processos?perfil=recrutador&processo=${agenda.conviteId}`,
    );
  }

  return (
    <div
      className={`
        rounded-xl
        border
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-200

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
      <div className="flex flex-col gap-4">
        {/* =====================================================
            CONTEÚDO + STATUS
        ===================================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Conteúdo */}
          <div className="min-w-0 flex-1">
            {isAgendaRecrutador(agenda) ? (
              <>
                {/* Recrutador */}
                <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
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
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {agenda.skill}
                  </span>
                ) : (
                  <>
                    <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
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
                {/* Formato antigo - candidato / avaliador */}
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {agenda.skill}
                </span>

                {perfil === "avaliador" && (
                  <div className="mt-3">
                    <p className="truncate font-semibold text-gray-900">
                      {agenda.nome}
                    </p>

                    <p className="text-sm text-gray-500">
                      {agenda.cidade}/{agenda.estado}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* =====================================================
              STATUS
          ===================================================== */}
          <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
            {/* Recrutador - aguardando aceite */}
            {recrutadorAguardandoAceite ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {t("agenda.status_aguardando_aceite")}
              </span>
            ) : recrutadorAguardandoLink ? (
              <>
                {/* Recrutador - horário aceito / aguardando link */}
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  {t("agenda.status_horario_confirmado")}
                </span>

                <span className="text-[11px] font-medium text-gray-500">
                  {t("agenda.status_aguardando_envio_link")}
                </span>
              </>
            ) : recrutadorEntrevistaConfirmada ? (
              <>
                {/* Recrutador - link enviado */}
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  {t("agenda.status_entrevista_confirmada")}
                </span>

                {isAgendaRecrutador(agenda) && agenda.plataforma && (
                  <span className="text-[11px] font-medium text-gray-500">
                    {getPlataformaLabel()}
                  </span>
                )}
              </>
            ) : aguardandoLink ? (
              /* Candidato - aguardando link */
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {t("agenda.status_aguardando_link")}
              </span>
            ) : entrevistaConfirmada ? (
              <>
                {/* Candidato - entrevista confirmada */}
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  {t("agenda.status_entrevista_confirmada")}
                </span>

                {isAgendaCandidatoRecrutador(agenda) && agenda.plataforma && (
                  <span className="text-[11px] font-medium text-gray-500">
                    {getPlataformaLabel()}
                  </span>
                )}
              </>
            ) : (
              /* Avaliador / comportamento antigo */
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
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
            )}
          </div>
        </div>

        {/* =====================================================
            FOOTER - DATA/HORA + AÇÃO
        ===================================================== */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Data/Hora */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📅</span>

            <span className="font-medium">
              {dia}/{mes}/{ano}
            </span>

            <span className="text-gray-300">•</span>

            <span>{hora}</span>
          </div>

          {/* Recrutador - enviar link */}
          {recrutadorAguardandoLink && (
            <button
              type="button"
              onClick={abrirProcessoRecrutador}
              className="inline-flex min-h-8 cursor-pointer items-center justify-center self-start rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700 sm:self-auto"
            >
              {t("agenda.btn_enviar_link")}
            </button>
          )}

          {/* Recrutador - acessar entrevista */}
          {recrutadorEntrevistaConfirmada &&
            isAgendaRecrutador(agenda) &&
            agenda.link_reuniao && (
              <a
                href={agenda.link_reuniao}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 sm:w-auto"
              >
                <Video className="h-4 w-4 shrink-0" />

                {t("processos_recrutador.btn_acessar_entrevista")}
              </a>
            )}

          {/* Candidato - acessar entrevista */}
          {entrevistaConfirmada &&
            isAgendaCandidatoRecrutador(agenda) &&
            agenda.link_reuniao && (
              <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                {acessoLiberado ? (
                  <a
                    href={agenda.link_reuniao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 sm:w-auto"
                  >
                    <Video className="h-4 w-4 shrink-0" />

                    {t("oportunidades_candidato.acessar_entrevista")}
                  </a>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 sm:w-auto"
                    >
                      <Lock className="h-4 w-4 shrink-0" />

                      {t("oportunidades_candidato.acessar_entrevista")}
                    </button>

                    {horaLiberacaoFormatada && (
                      <span className="text-xs text-gray-500 sm:text-right">
                        {t("oportunidades_candidato.acesso_liberado_as")}{" "}
                        {horaLiberacaoFormatada}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
