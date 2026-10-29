"use client";

import { useEffect, useState } from "react";
import { DashboardEntrevista } from "../../../lib/types/candidato-dashboard";
import { useTranslation } from "react-i18next";
import { Video, Lock } from "lucide-react";

interface Props {
  entrevistas: DashboardEntrevista[];
}

// Verifica se a entrevista já pode ser acessada
function verificarAcessoEntrevista(dataHora: string, agora: number) {
  const dataEntrevista = new Date(dataHora).getTime();

  if (!Number.isFinite(dataEntrevista)) {
    return {
      liberado: false,
      horarioLiberacao: null,
    };
  }

  const horarioLiberacao = dataEntrevista - 5 * 60 * 1000;

  return {
    liberado: agora >= horarioLiberacao,
    horarioLiberacao,
  };
}

export default function UpcomingInterviews({ entrevistas }: Props) {
  const { t } = useTranslation("common");

  const [agora, setAgora] = useState<number | null>(null);

  // Atualiza o horário automaticamente
  useEffect(() => {
    setAgora(Date.now());

    const intervalo = window.setInterval(() => {
      setAgora(Date.now());
    }, 15000);

    return () => window.clearInterval(intervalo);
  }, []);

  return (
    <section className="h-fit rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("dash_candidato.stats_agendada")}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {t("dash_candidato.agenda_descricao")}
          </p>
        </div>

        <span className="shrink-0 text-xl">📅</span>
      </div>

      {entrevistas.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {entrevistas.map((entrevista) => (
            <InterviewCard
              key={entrevista.id}
              entrevista={entrevista}
              agora={agora}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">
            {t("dash_candidato.sem_agenda")}
          </p>
        </div>
      )}
    </section>
  );
}

function InterviewCard({
  entrevista,
  agora,
}: {
  entrevista: DashboardEntrevista;
  agora: number | null;
}) {
  const { t, i18n } = useTranslation("common");

  const locale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "es"
        ? "es-ES"
        : "pt-BR";

  const data = new Date(entrevista.data_hora);

  //const entrevistaRecrutador = entrevista.tipo === "RECRUTADOR";

  const aguardandoLink =
    entrevista.status === "AGENDADO" && !entrevista.link_reuniao;

  const entrevistaConfirmada =
    entrevista.status === "ENTREVISTA_CONFIRMADA" &&
    Boolean(entrevista.link_reuniao);

  // Controle individual de acesso à entrevista
  const { liberado: acessoLiberado, horarioLiberacao } =
    verificarAcessoEntrevista(entrevista.data_hora, agora ?? 0);

  const getTipoEntrevista = () => {
    if (entrevista.tipo === "AVALIACAO_SKILL") {
      return t("dash_candidato.agenda_skill");
    }

    switch (entrevista.tipo_convite) {
      case "VAGA":
        return t("dash_candidato.agenda_vaga");

      case "PALESTRA_EVENTO":
        return t("dash_candidato.agenda_palestra_evento");

      case "MENTORIA":
        return t("dash_candidato.agenda_mentoria");

      case "PROJETO_CONSULTORIA":
        return t("dash_candidato.agenda_projeto_consultoria");

      case "NETWORKING":
        return t("dash_candidato.agenda_networking");

      default:
        return t("dash_candidato.agenda_outro");
    }
  };

  const getPlataformaLabel = () => {
    if (!entrevista.plataforma) return "";

    return t(
      `dash_candidato.plataforma_${entrevista.plataforma.toLowerCase()}`,
    );
  };

  const dataFormatada = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  })
    .format(data)
    .replace(".", "")
    .toUpperCase();

  const horaFormatada = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data);

  // Horário em que o acesso será liberado
  const horaLiberacaoFormatada =
    horarioLiberacao !== null
      ? new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        }).format(new Date(horarioLiberacao))
      : null;

  return (
    <div
      className={`rounded-xl border p-3 transition-colors sm:p-4 ${
        entrevista.atrasada
          ? "border-red-100 bg-red-50/40"
          : "border-gray-100 hover:bg-gray-50"
      }`}
    >
      <div className="flex gap-3">
        {/* DATA / HORA */}
        <div className="flex w-16 shrink-0 flex-col text-center">
          <p
            className={`text-xs font-semibold uppercase ${
              entrevista.atrasada ? "text-red-500" : "text-gray-500"
            }`}
          >
            {dataFormatada}
          </p>

          <p className="mt-1 text-sm font-bold text-gray-900">
            {horaFormatada}
          </p>

          {entrevista.atrasada && (
            <p className="mt-auto pt-3 text-[11px] font-medium text-red-600">
              {t("dash_candidato.agenda_atrasada")}
            </p>
          )}
        </div>

        <div className="w-px shrink-0 bg-gray-100" />

        {/* CONTEÚDO */}
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold text-gray-900">
            {entrevista.titulo}
          </p>

          <p className="mt-1 text-xs text-gray-500">{getTipoEntrevista()}</p>

          {entrevista.subtitulo && (
            <p className="mt-1 break-words text-xs text-gray-400">
              {entrevista.subtitulo}
            </p>
          )}

          {/* STATUS E ACESSO À ENTREVISTA */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              {aguardandoLink && (
                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                  {t("dash_candidato.agenda_aguardando_link")}
                </span>
              )}

              {entrevistaConfirmada && (
                <>
                  <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700">
                    {t("dash_candidato.agenda_confirmada")}
                  </span>

                  {entrevista.plataforma && (
                    <p className="mt-1 text-[11px] font-medium text-gray-500">
                      {getPlataformaLabel()}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* BOTÃO DE ACESSO À ENTREVISTA */}
            {entrevistaConfirmada && entrevista.link_reuniao && (
              <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                {acessoLiberado && agora !== null ? (
                  <a
                    href={entrevista.link_reuniao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 sm:w-auto"
                  >
                    <Video className="h-4 w-4" />

                    {t("oportunidades_candidato.acessar_entrevista")}
                  </a>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled
                      className="inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 sm:w-auto"
                    >
                      <Lock className="h-4 w-4" />

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
    </div>
  );
}
