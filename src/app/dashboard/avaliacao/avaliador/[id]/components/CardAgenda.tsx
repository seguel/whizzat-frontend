"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { ptBR, enUS, es } from "date-fns/locale";

import { useTranslation } from "react-i18next";
import { CalendarDays, Video, X } from "lucide-react";

type PlataformaEntrevista =
  | "GOOGLE_MEET"
  | "MICROSOFT_TEAMS"
  | "ZOOM"
  | "LINK_EXTERNO";

type Agenda = {
  id: number;
  data_hora_agenda: string;
  status: string;
  plataforma?: string | null;
  link_reuniao?: string | null;
  data_envio_link?: string | null;
};

type Props = {
  habilitado: boolean;
  avaliacaoId: string;
  agenda?: Agenda | null;
  status: string;

  entrevistaRealizada: boolean;
  setEntrevistaRealizada: (value: boolean) => void;
  finalizarSemEntrevista: boolean;
};

export default function CardAgenda({
  habilitado,
  avaliacaoId,
  agenda,
  status,
  entrevistaRealizada,
  setEntrevistaRealizada,
  finalizarSemEntrevista,
}: Props) {
  const { t, i18n } = useTranslation("common");

  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>();

  const [horarioSelecionado, setHorarioSelecionado] = useState<string>("");

  const [loadingEnviar, setLoadingEnviar] = useState(false);
  const [modalLinkAberto, setModalLinkAberto] = useState(false);
  const [plataformaEntrevista, setPlataformaEntrevista] = useState<
    PlataformaEntrevista | ""
  >("");
  const [gerarReuniaoAutomaticamente, setGerarReuniaoAutomaticamente] =
    useState(true);
  const [linkEntrevista, setLinkEntrevista] = useState("");
  const [erroLinkEntrevista, setErroLinkEntrevista] = useState("");
  const [salvandoLinkEntrevista, setSalvandoLinkEntrevista] = useState(false);

  const horarioSelecionadoRef = useRef<HTMLButtonElement | null>(null);

  // 👇 locale calendário
  const currentLocale =
    i18n.language === "en" ? enUS : i18n.language === "es" ? es : ptBR;

  // 👇 locale formatação data
  const currentLocaleCode =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "es"
        ? "es-ES"
        : "pt-BR";

  // 👇 helper formatador
  const formatarDataHora = (data: string | Date) => {
    return new Intl.DateTimeFormat(currentLocaleCode, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data));
  };

  const hoje = new Date();

  const limite = new Date();
  limite.setMonth(limite.getMonth() + 3);

  // 👇 status agenda
  const agendaPendente = agenda?.status === "PENDENTE";
  const agendaAceita = agenda?.status === "ACEITO";
  const agendaRecusada = agenda?.status === "RECUSADO";

  // 👇 bloqueia somente quando existe agenda válida
  const bloqueado = agendaPendente || agendaAceita || finalizarSemEntrevista;

  // 👇 permite reagendar quando recusada
  const podeReagendar = agendaRecusada;

  // 👇 carrega agenda existente
  useEffect(() => {
    if (agenda?.data_hora_agenda) {
      const data = new Date(agenda.data_hora_agenda);

      setDataSelecionada(data);

      setHorarioSelecionado(
        data.toLocaleTimeString(currentLocaleCode, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }
  }, [agenda, currentLocaleCode]);

  useEffect(() => {
    if (horarioSelecionadoRef.current) {
      horarioSelecionadoRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [horarioSelecionado]);

  // 👇 gera horários 08:00 → 19:45
  const horarios = useMemo(() => {
    const lista: string[] = [];

    for (let h = 8; h <= 18; h++) {
      ["00", "15", "30", "45"].forEach((m) => {
        lista.push(`${String(h).padStart(2, "0")}:${m}`);
      });
    }

    return lista;
  }, []);

  const dataHoraCompleta =
    dataSelecionada && horarioSelecionado
      ? new Date(
          `${dataSelecionada.toISOString().split("T")[0]}T${horarioSelecionado}:00`,
        )
      : null;

  const handleEnviarAgenda = async () => {
    if (!dataHoraCompleta) return;

    try {
      setLoadingEnviar(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avaliador/avaliacoes/agendar`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avaliacao_id: Number(avaliacaoId),
            data: dataHoraCompleta.toISOString(),
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Erro ao enviar agenda");
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEnviar(false);
    }
  };

  const permiteGeracaoAutomatica =
    plataformaEntrevista === "GOOGLE_MEET" || plataformaEntrevista === "ZOOM";
  const automatico = permiteGeracaoAutomatica && gerarReuniaoAutomaticamente;
  const linkJaEnviado = Boolean(
    agenda?.link_reuniao || agenda?.data_envio_link,
  );
  const podeEnviarLink =
    agendaAceita &&
    status === "AGENDADO" &&
    !linkJaEnviado &&
    !finalizarSemEntrevista;

  function abrirModalLinkEntrevista() {
    if (!podeEnviarLink) return;
    setPlataformaEntrevista("");
    setLinkEntrevista("");
    setErroLinkEntrevista("");
    setGerarReuniaoAutomaticamente(true);
    setModalLinkAberto(true);
  }

  function fecharModalLinkEntrevista() {
    if (salvandoLinkEntrevista) return;
    setModalLinkAberto(false);
    setPlataformaEntrevista("");
    setLinkEntrevista("");
    setErroLinkEntrevista("");
    setGerarReuniaoAutomaticamente(true);
  }

  async function enviarLinkEntrevista() {
    if (
      !podeEnviarLink ||
      !plataformaEntrevista ||
      (!automatico && !linkEntrevista.trim()) ||
      salvandoLinkEntrevista
    )
      return;

    try {
      setSalvandoLinkEntrevista(true);
      setErroLinkEntrevista("");
      const payload = automatico
        ? { plataforma: plataformaEntrevista, gerar_automaticamente: true }
        : {
            plataforma: plataformaEntrevista,
            link_reuniao: linkEntrevista.trim(),
            gerar_automaticamente: false,
          };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avaliador/avaliacoes/${avaliacaoId}/link-entrevista`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const mensagem = Array.isArray(data?.message)
          ? data.message
              .map((erro: unknown) =>
                typeof erro === "string"
                  ? erro
                  : erro && typeof erro === "object" && "constraints" in erro
                    ? Object.values(
                        (erro as { constraints?: Record<string, string> })
                          .constraints ?? {},
                      ).join(", ")
                    : String(erro),
              )
              .join("; ")
          : data?.message;
        throw new Error(
          typeof mensagem === "string" && mensagem
            ? mensagem
            : t("processos_recrutador.modal_link_entrevista.erro"),
        );
      }
      setModalLinkAberto(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao enviar link da entrevista:", error);
      setErroLinkEntrevista(
        error instanceof Error
          ? error.message
          : t("processos_recrutador.modal_link_entrevista.erro"),
      );
    } finally {
      setSalvandoLinkEntrevista(false);
    }
  }

  // 👇 status traduzido
  const statusAgendaLabel = {
    PENDENTE: t("minha_avaliacao.status_agenda.pendente"),
    ACEITO: t("minha_avaliacao.status_agenda.aceito"),
    RECUSADO: t("minha_avaliacao.status_agenda.recusado"),
  }[agenda?.status ?? ""];

  return (
    <>
      <div className="bg-white p-1 border rounded-xl shadow-sm flex flex-col gap-2 min-h-[525px]">
        <h2 className="font-semibold">
          {t("minha_avaliacao.data_entrevista")}
        </h2>

        {/* 👇 agenda enviada */}
        {agenda && (
          <div
            className={`rounded-lg px-3 py-2 text-sm shadow-sm border
          ${
            agendaRecusada
              ? "border-red-200 bg-red-50"
              : agendaAceita
                ? "border-green-200 bg-green-50"
                : "border-yellow-200 bg-yellow-50"
          }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-700">
                {t("minha_avaliacao.data_sugestao")}:
              </span>

              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap
              ${
                agendaRecusada
                  ? "bg-red-100 text-red-700"
                  : agendaAceita
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
              >
                {statusAgendaLabel}
              </span>
            </div>

            <div
              className={`mt-1 font-bold whitespace-nowrap
                ${
                  agendaRecusada
                    ? "text-red-700"
                    : agendaAceita
                      ? "text-green-700"
                      : "text-yellow-700"
                }`}
            >
              {formatarDataHora(agenda.data_hora_agenda)}
            </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row items-start">
          {/* 👇 calendário */}
          <div
            className="flex-1 min-w-0"
            style={
              {
                "--rdp-cell-size": "15px",
              } as React.CSSProperties
            }
          >
            <DayPicker
              locale={currentLocale}
              mode="single"
              selected={dataSelecionada}
              onSelect={setDataSelecionada}
              disabled={
                !habilitado || bloqueado
                  ? true
                  : { before: hoje, after: limite }
              }
              className="text-[13px]"
              styles={{
                month_grid: {
                  width: "100%",
                },
                day: {
                  margin: 0,
                },
              }}
              classNames={{
                months: "flex justify-center",
                caption: "flex justify-center mb-2",
                table: "border-collapse",
                head_cell: "text-xs text-gray-500 font-medium p-0",
                cell: "p-0",
                day: "text-[12px] rounded-md hover:bg-gray-100",
                day_selected: "bg-blue-600 text-white hover:bg-blue-600",
              }}
            />
          </div>

          {/* 👇 horários */}
          <div className="w-24 border-l overflow-y-auto max-h-[290px] bg-gray-50">
            <div className="sticky top-0 bg-white px-2 py-2 text-xs font-medium text-gray-500">
              {t("minha_avaliacao.horarios")}
            </div>

            <div className="p-2 flex flex-col gap-1">
              {horarios.map((horario) => (
                <button
                  key={horario}
                  ref={
                    horarioSelecionado === horario
                      ? horarioSelecionadoRef
                      : null
                  }
                  disabled={!habilitado || bloqueado}
                  onClick={() => setHorarioSelecionado(horario)}
                  className={`text-sm rounded-md py-1 transition
                ${
                  horarioSelecionado === horario
                    ? "bg-blue-600 text-white"
                    : habilitado && !bloqueado
                      ? "hover:bg-blue-100 text-gray-700"
                      : "text-gray-300 cursor-not-allowed"
                }`}
                >
                  {horario}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 👇 preview */}
        {dataHoraCompleta && !bloqueado && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm shadow-sm">
            <span className="text-gray-700">
              {t("minha_avaliacao.sugestao_selecionada")}:
            </span>{" "}
            <span className="font-bold text-indigo-700 whitespace-nowrap">
              {formatarDataHora(dataHoraCompleta)}
            </span>
          </div>
        )}

        <button
          onClick={handleEnviarAgenda}
          disabled={
            !habilitado ||
            !dataSelecionada ||
            !horarioSelecionado ||
            loadingEnviar ||
            bloqueado
          }
          className={`rounded-lg py-1 text-sm font-semibold transition border border-transparent
        ${
          !habilitado ||
          !dataSelecionada ||
          !horarioSelecionado ||
          loadingEnviar ||
          bloqueado
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "text-indigo-900 bg-blue-100 hover:bg-blue-200 hover:border-blue-300 cursor-pointer"
        }`}
        >
          {loadingEnviar
            ? t("minha_avaliacao.enviando")
            : podeReagendar
              ? t("minha_avaliacao.nova_sugestao")
              : agendaPendente
                ? t("minha_avaliacao.enviada_sugestao")
                : t("minha_avaliacao.enviar_sugestao")}
        </button>

        {!habilitado && !agenda && (
          <p className="text-xs text-gray-400">
            {t("minha_avaliacao.msg_agenda")}.
          </p>
        )}

        {podeEnviarLink && (
          <button
            type="button"
            onClick={abrirModalLinkEntrevista}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            <Video className="h-4 w-4" />
            {t("processos_recrutador.btn_enviar_link")}
          </button>
        )}

        {agendaAceita && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={entrevistaRealizada || status == "FINALIZADO"}
                onChange={(e) => setEntrevistaRealizada(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />

              <span className="font-medium text-gray-700">
                {t("minha_avaliacao.confirmar_entrevista")}
              </span>
            </label>
          </div>
        )}
      </div>

      {modalLinkAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-link-titulo"
            className="flex max-h-[calc(100dvh-24px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:max-h-[calc(100dvh-32px)]"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2
                  id="modal-link-titulo"
                  className="text-lg font-bold text-gray-900"
                >
                  {t("processos_recrutador.modal_link_entrevista.titulo")}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t("processos_recrutador.modal_link_entrevista.descricao")}
                </p>
              </div>
              <button
                type="button"
                onClick={fecharModalLinkEntrevista}
                disabled={salvandoLinkEntrevista}
                aria-label={t(
                  "processos_recrutador.modal_link_entrevista.btn_cancelar",
                )}
                className="shrink-0 cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-5 sm:px-6">
              {agenda && (
                <div className="mb-5 rounded-xl bg-gray-50 p-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                    <span>{formatarDataHora(agenda.data_hora_agenda)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {t("processos_recrutador.modal_link_entrevista.plataforma")}
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      "GOOGLE_MEET",
                      "MICROSOFT_TEAMS",
                      "ZOOM",
                      "LINK_EXTERNO",
                    ] as PlataformaEntrevista[]
                  ).map((plataforma) => {
                    const selecionada = plataformaEntrevista === plataforma;
                    return (
                      <button
                        key={plataforma}
                        type="button"
                        disabled={salvandoLinkEntrevista}
                        onClick={() => {
                          setPlataformaEntrevista(plataforma);
                          setGerarReuniaoAutomaticamente(
                            plataforma === "GOOGLE_MEET" ||
                              plataforma === "ZOOM",
                          );
                          setLinkEntrevista("");
                          setErroLinkEntrevista("");
                        }}
                        className={`cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${selecionada ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 bg-white text-gray-600 hover:border-purple-300"} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selecionada ? "border-purple-600" : "border-gray-300"}`}
                          >
                            {selecionada && (
                              <span className="h-2 w-2 rounded-full bg-purple-600" />
                            )}
                          </span>
                          <span>
                            {t(
                              `processos_recrutador.plataforma_${plataforma.toLowerCase()}`,
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {permiteGeracaoAutomatica && (
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {t("processos_recrutador.modal_link_entrevista.tipo_meet")}
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={salvandoLinkEntrevista}
                      onClick={() => {
                        setGerarReuniaoAutomaticamente(true);
                        setLinkEntrevista("");
                        setErroLinkEntrevista("");
                      }}
                      className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-left transition ${gerarReuniaoAutomaticamente ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-purple-300"} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${gerarReuniaoAutomaticamente ? "border-purple-600" : "border-gray-300"}`}
                        >
                          {gerarReuniaoAutomaticamente && (
                            <span className="h-2 w-2 rounded-full bg-purple-600" />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {t(
                              "processos_recrutador.modal_link_entrevista.meet_automatico",
                            )}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {plataformaEntrevista === "ZOOM"
                              ? t(
                                  "processos_recrutador.modal_link_entrevista.zoom_automatico_descricao",
                                )
                              : t(
                                  "processos_recrutador.modal_link_entrevista.meet_automatico_descricao",
                                )}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      disabled={salvandoLinkEntrevista}
                      onClick={() => {
                        setGerarReuniaoAutomaticamente(false);
                        setErroLinkEntrevista("");
                      }}
                      className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-left transition ${!gerarReuniaoAutomaticamente ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-purple-300"} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${!gerarReuniaoAutomaticamente ? "border-purple-600" : "border-gray-300"}`}
                        >
                          {!gerarReuniaoAutomaticamente && (
                            <span className="h-2 w-2 rounded-full bg-purple-600" />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {t(
                              "processos_recrutador.modal_link_entrevista.meet_manual",
                            )}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {plataformaEntrevista === "ZOOM"
                              ? t(
                                  "processos_recrutador.modal_link_entrevista.zoom_manual_descricao",
                                )
                              : t(
                                  "processos_recrutador.modal_link_entrevista.meet_manual_descricao",
                                )}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {!automatico && (
                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {t("processos_recrutador.modal_link_entrevista.link")}
                  </label>
                  <input
                    type="url"
                    value={linkEntrevista}
                    disabled={salvandoLinkEntrevista}
                    onChange={(event) => {
                      setLinkEntrevista(event.target.value);
                      if (erroLinkEntrevista) setErroLinkEntrevista("");
                    }}
                    placeholder={t(
                      "processos_recrutador.modal_link_entrevista.link_placeholder",
                    )}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50"
                  />
                  <p className="mt-1.5 text-xs leading-5 text-gray-400">
                    {t(
                      "processos_recrutador.modal_link_entrevista.link_descricao",
                    )}
                  </p>
                </div>
              )}

              {erroLinkEntrevista && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs font-medium text-red-600">
                    {erroLinkEntrevista}
                  </p>
                </div>
              )}
              <div className="mt-5 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-xs leading-5 text-blue-700">
                  {t("processos_recrutador.modal_link_entrevista.aviso")}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={fecharModalLinkEntrevista}
                disabled={salvandoLinkEntrevista}
                className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {t("processos_recrutador.modal_link_entrevista.btn_cancelar")}
              </button>
              <button
                type="button"
                onClick={enviarLinkEntrevista}
                disabled={
                  !plataformaEntrevista ||
                  salvandoLinkEntrevista ||
                  (!automatico && !linkEntrevista.trim())
                }
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <CalendarDays className="h-4 w-4" />
                {salvandoLinkEntrevista
                  ? t("processos_recrutador.modal_link_entrevista.btn_enviando")
                  : t("processos_recrutador.modal_link_entrevista.btn_enviar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
