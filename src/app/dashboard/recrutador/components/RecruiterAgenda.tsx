"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { RecrutadorDashboardAgenda } from "../../../lib/types/recrutador-dashboard";
import { Video } from "lucide-react";

interface Props {
  agendas: RecrutadorDashboardAgenda[];
}

export default function RecruiterAgenda({ agendas }: Props) {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  const locale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "es"
        ? "es-ES"
        : "pt-BR";

  function getPlataformaLabel(
    plataforma: RecrutadorDashboardAgenda["plataforma"],
  ) {
    if (!plataforma) return "";

    return t(`dash_recrutador.plataforma_${plataforma.toLowerCase()}`);
  }

  function irParaProcesso(conviteId: number) {
    router.push(
      `/dashboard/recrutador/processos?perfil=recrutador&processo=${conviteId}`,
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("dash_recrutador.agenda_titulo")}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {t("dash_recrutador.agenda_descricao")}
          </p>
        </div>

        <span className="shrink-0 text-xl">📅</span>
      </div>

      {agendas.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {agendas.map((agenda) => {
            const data = new Date(agenda.data_hora);

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

            const aguardandoLink = agenda.status_processo === "AGENDADO";

            const entrevistaConfirmada =
              agenda.status_processo === "ENTREVISTA_CONFIRMADA";

            return (
              <div
                key={agenda.id}
                className={`rounded-xl border p-4 transition-colors ${
                  agenda.atrasada
                    ? "border-red-100 bg-red-50/40"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex w-16 shrink-0 flex-col text-center">
                    <p
                      className={`text-xs font-semibold uppercase ${
                        agenda.atrasada ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {dataFormatada}
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {horaFormatada}
                    </p>

                    {agenda.atrasada && (
                      <p className="mt-auto pt-3 text-[11px] font-medium text-red-600">
                        {t("dash_recrutador.agenda_atrasada")}
                      </p>
                    )}
                  </div>

                  <div className="w-px shrink-0 bg-gray-100" />

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-gray-900">
                      {agenda.titulo}
                    </p>

                    <p className="mt-1 break-words text-xs text-gray-500">
                      {agenda.candidato.nome}
                    </p>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        {aguardandoLink && (
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                            {t("dash_recrutador.agenda_aguardando_link")}
                          </span>
                        )}

                        {entrevistaConfirmada && (
                          <>
                            <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700">
                              {t("dash_recrutador.agenda_confirmada")}
                            </span>

                            {agenda.plataforma && (
                              <p className="mt-1 text-[11px] font-medium text-gray-500">
                                {getPlataformaLabel(agenda.plataforma)}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {aguardandoLink && (
                        <button
                          type="button"
                          onClick={() => irParaProcesso(agenda.convite_id)}
                          className="inline-flex min-h-8 shrink-0 cursor-pointer items-center justify-center self-start rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700 sm:self-auto"
                        >
                          {t("dash_recrutador.btn_enviar_link")}
                        </button>
                      )}

                      {entrevistaConfirmada && agenda.link_reuniao && (
                        <a
                          href={agenda.link_reuniao}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 sm:w-auto"
                        >
                          <Video className="h-4 w-4" />

                          {t("processos_recrutador.btn_acessar_entrevista")}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">
            {t("dash_recrutador.sem_agenda")}
          </p>
        </div>
      )}
    </section>
  );
}
