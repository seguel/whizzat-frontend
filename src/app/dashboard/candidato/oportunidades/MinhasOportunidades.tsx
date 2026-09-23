"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Handshake,
  MessageSquareText,
  Network,
  Presentation,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type Aba = "convites" | "entrevistas" | "finalizados";

type TipoConvite =
  | "VAGA"
  | "OPORTUNIDADE"
  | "PALESTRA_EVENTO"
  | "MENTORIA"
  | "PROJETO_CONSULTORIA"
  | "NETWORKING"
  | "OUTRO";

interface Convite {
  id: number;
  tipo: TipoConvite;
  titulo: string;
  mensagem: string;
  data_convite: string;

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
    tipo_oportunidade: string;
  } | null;
}

interface ProcessoFinalizado {
  id: number;
  tipo: TipoConvite;
  titulo: string;
  mensagem: string;
  aprovado: boolean | null;
  parecer: string | null;
  data_convite: string;
  data_aceite: string | null;
  data_finalizacao: string | null;

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
    tipo_oportunidade: string;
  } | null;
}

type StatusProcesso =
  | "CONVITE_ACEITO"
  | "AGENDA_ENVIADA"
  | "AGENDADO"
  | "ENTREVISTA_REALIZADA";

type StatusAgenda =
  | "PENDENTE"
  | "RECUSADO"
  | "ACEITO"
  | "REALIZADO"
  | "CANCELADO";

interface Processo {
  id: number;
  tipo: TipoConvite;
  titulo: string;
  mensagem: string;
  status: StatusProcesso;
  data_convite: string;
  data_aceite: string | null;

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
    tipo_oportunidade: string;
  } | null;

  agenda: {
    id: number;
    data_hora_agenda: string;
    status: StatusAgenda;
    data_criacao: string;
    data_resposta: string | null;
  } | null;
}

export default function MinhasOportunidadesPage() {
  const { t, i18n } = useTranslation("common");

  const router = useRouter();
  const searchParams = useSearchParams();

  const processoParam = searchParams.get("processo");
  const tabParam = searchParams.get("tab");

  const processoDestacadoId = processoParam ? Number(processoParam) : null;

  const deepLinkProcessadoRef = useRef(false);

  const [processoDestacado, setProcessoDestacado] = useState<number | null>(
    null,
  );

  const abaInicial: Aba =
    tabParam === "entrevistas" || tabParam === "finalizados"
      ? tabParam
      : "convites";

  const [aba, setAba] = useState<Aba>(abaInicial);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loadingConvites, setLoadingConvites] = useState(true);
  const [erroConvites, setErroConvites] = useState(false);

  const [conviteProcessando, setConviteProcessando] = useState<number | null>(
    null,
  );
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loadingProcessos, setLoadingProcessos] = useState(true);
  const [erroProcessos, setErroProcessos] = useState(false);
  const [agendaProcessando, setAgendaProcessando] = useState<number | null>(
    null,
  );
  const [finalizados, setFinalizados] = useState<ProcessoFinalizado[]>([]);
  const [loadingFinalizados, setLoadingFinalizados] = useState(true);
  const [erroFinalizados, setErroFinalizados] = useState(false);

  const quantidade = useMemo(
    () => ({
      convites: convites.length,
      entrevistas: processos.length,
      finalizados: finalizados.length,
    }),
    [convites, processos, finalizados],
  );

  async function carregarConvites() {
    try {
      setLoadingConvites(true);
      setErroConvites(false);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/candidato/convites`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar convites.");
      }

      const data = await response.json();

      setConvites(data);
    } catch (error) {
      console.error("Erro ao carregar convites:", error);

      setErroConvites(true);
      setConvites([]);
    } finally {
      setLoadingConvites(false);
    }
  }

  useEffect(() => {
    carregarConvites();
    carregarProcessos();
    carregarFinalizados();
  }, []);

  useEffect(() => {
    if (
      deepLinkProcessadoRef.current ||
      tabParam !== "entrevistas" ||
      !processoDestacadoId ||
      loadingProcessos
    ) {
      return;
    }

    const processoExiste = processos.some(
      (processo) => processo.id === processoDestacadoId,
    );

    if (!processoExiste) {
      return;
    }

    deepLinkProcessadoRef.current = true;

    setAba("entrevistas");
    setProcessoDestacado(processoDestacadoId);

    const scrollTimer = window.setTimeout(() => {
      const elemento = document.getElementById(
        `processo-${processoDestacadoId}`,
      );

      elemento?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);

    const destaqueTimer = window.setTimeout(() => {
      setProcessoDestacado(null);

      router.replace("/dashboard/candidato/oportunidades?perfil=candidato", {
        scroll: false,
      });
    }, 3000);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(destaqueTimer);
    };
  }, [tabParam, processoDestacadoId, loadingProcessos, processos, router]);

  useEffect(() => {
    if (
      deepLinkProcessadoRef.current ||
      tabParam !== "finalizados" ||
      !processoDestacadoId ||
      loadingFinalizados
    ) {
      return;
    }

    const processoExiste = finalizados.some(
      (processo) => processo.id === processoDestacadoId,
    );

    if (!processoExiste) {
      return;
    }

    deepLinkProcessadoRef.current = true;

    setAba("finalizados");
    setProcessoDestacado(processoDestacadoId);

    const scrollTimer = window.setTimeout(() => {
      const elemento = document.getElementById(
        `processo-finalizado-${processoDestacadoId}`,
      );

      elemento?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);

    const destaqueTimer = window.setTimeout(() => {
      setProcessoDestacado(null);

      router.replace("/dashboard/candidato/oportunidades?perfil=candidato", {
        scroll: false,
      });
    }, 3000);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(destaqueTimer);
    };
  }, [tabParam, processoDestacadoId, loadingFinalizados, finalizados, router]);

  async function trocarAba(novaAba: Aba) {
    setAba(novaAba);

    if (novaAba === "convites") {
      await carregarConvites();
      return;
    }

    if (novaAba === "entrevistas") {
      await carregarProcessos();
      return;
    }

    if (novaAba === "finalizados") {
      await carregarFinalizados();
    }
  }

  async function responderConvite(
    conviteId: number,
    resposta: "ACEITAR" | "RECUSAR",
  ) {
    try {
      setConviteProcessando(conviteId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/candidato/convites/${conviteId}/resposta`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resposta,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao responder convite.");
      }

      setConvites((atual) =>
        atual.filter((convite) => convite.id !== conviteId),
      );
    } catch (error) {
      console.error("Erro ao responder convite:", error);
    } finally {
      setConviteProcessando(null);
    }
  }

  async function carregarProcessos() {
    try {
      setLoadingProcessos(true);
      setErroProcessos(false);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/candidato/processos`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar processos.");
      }

      const data = await response.json();

      setProcessos(data);
    } catch (error) {
      console.error("Erro ao carregar processos:", error);

      setErroProcessos(true);
      setProcessos([]);
    } finally {
      setLoadingProcessos(false);
    }
  }

  async function carregarFinalizados() {
    try {
      setLoadingFinalizados(true);
      setErroFinalizados(false);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/candidato/finalizados`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar processos finalizados.");
      }

      const data = await response.json();

      setFinalizados(data);
    } catch (error) {
      console.error("Erro ao carregar processos finalizados:", error);

      setErroFinalizados(true);
      setFinalizados([]);
    } finally {
      setLoadingFinalizados(false);
    }
  }
  //   const formatarData = (data?: string | null) => {
  //     if (!data) return "-";

  //     return new Intl.DateTimeFormat(currentLocale, {
  //       day: "2-digit",
  //       month: "2-digit",
  //       year: "numeric",
  //     }).format(new Date(data));
  //   };

  async function responderAgenda(
    conviteId: number,
    resposta: "ACEITAR" | "RECUSAR",
  ) {
    try {
      setAgendaProcessando(conviteId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/candidato/processos/${conviteId}/agenda/resposta`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resposta,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao responder agenda.");
      }

      const atualizado = await response.json();

      setProcessos((atual) =>
        atual.map((processo) =>
          processo.id === conviteId
            ? {
                ...processo,
                status: atualizado.status,
                agenda: atualizado.agenda,
              }
            : processo,
        ),
      );
    } catch (error) {
      console.error("Erro ao responder agenda:", error);
    } finally {
      setAgendaProcessando(null);
    }
  }

  const locale = i18n.language?.startsWith("en") ? "en-US" : "pt-BR";

  function formatarDataHora(data: string) {
    return new Date(data).toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("oportunidades_candidato.titulo")}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {t("oportunidades_candidato.descricao")}
        </p>
      </div>

      {/* Abas */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          <TabButton
            ativo={aba === "convites"}
            onClick={() => trocarAba("convites")}
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            label={t("oportunidades_candidato.convites")}
            quantidade={quantidade.convites}
            loading={loadingConvites}
          />

          <TabButton
            ativo={aba === "entrevistas"}
            onClick={() => trocarAba("entrevistas")}
            icon={<CalendarDays className="h-4 w-4" />}
            label={t("oportunidades_candidato.entrevistas")}
            quantidade={quantidade.entrevistas}
            loading={loadingProcessos}
          />

          <TabButton
            ativo={aba === "finalizados"}
            onClick={() => trocarAba("finalizados")}
            icon={<CheckCircle2 className="h-4 w-4" />}
            label={t("oportunidades_candidato.finalizados")}
            quantidade={quantidade.finalizados}
            loading={loadingFinalizados}
          />
        </div>
      </div>

      {/* CONVITES */}
      {aba === "convites" && (
        <div className="space-y-4">
          {loadingConvites ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                {t("oportunidades_candidato.carregando_convites")}
              </p>
            </div>
          ) : erroConvites ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                {t("oportunidades_candidato.erro_convites")}
              </p>
            </div>
          ) : convites.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <BriefcaseBusiness className="mx-auto mb-3 h-8 w-8 text-gray-300" />

              <p className="text-sm font-semibold text-gray-700">
                {t("oportunidades_candidato.sem_convites")}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {t("oportunidades_candidato.sem_convites_msg")}
              </p>
            </div>
          ) : (
            convites.map((convite) => (
              <div
                key={convite.id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <TipoConviteBadge tipo={convite.tipo} />

                    <h2 className="mt-3 text-base font-semibold text-gray-900">
                      {convite.titulo}
                    </h2>

                    {convite.empresa && (
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        {convite.empresa.nome_empresa}
                      </p>
                    )}

                    {convite.mensagem?.trim() && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                        <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                        <p className="leading-6">{convite.mensagem}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {t("oportunidades_candidato.recebido_em")}{" "}
                      {new Date(convite.data_convite).toLocaleDateString(
                        locale,
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:self-center">
                    <button
                      type="button"
                      onClick={() => responderConvite(convite.id, "RECUSAR")}
                      disabled={conviteProcessando === convite.id}
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />

                      {t("oportunidades_candidato.btn_recusar")}
                    </button>

                    <button
                      type="button"
                      onClick={() => responderConvite(convite.id, "ACEITAR")}
                      disabled={conviteProcessando === convite.id}
                      className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />

                      {t("oportunidades_candidato.btn_aceitar")}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ENTREVISTAS */}
      {aba === "entrevistas" && (
        <div className="space-y-4">
          {loadingProcessos ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                {t("oportunidades_candidato.carregando_entrevistas")}
              </p>
            </div>
          ) : erroProcessos ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                {t("oportunidades_candidato.erro_entrevistas")}
              </p>
            </div>
          ) : processos.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <CalendarDays className="mx-auto mb-3 h-8 w-8 text-gray-300" />

              <p className="text-sm font-semibold text-gray-700">
                {t("oportunidades_candidato.sem_entrevistas")}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {t("oportunidades_candidato.sem_entrevistas_msg")}
              </p>
            </div>
          ) : (
            processos.map((entrevista) => {
              const destacado = processoDestacado === entrevista.id;

              return (
                <div
                  key={entrevista.id}
                  id={`processo-${entrevista.id}`}
                  className={`rounded-xl border bg-white p-5 transition-all duration-500 ${
                    destacado
                      ? "border-purple-400 ring-4 ring-purple-100 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <TipoConviteBadge tipo={entrevista.tipo} />

                      <h2 className="mt-3 text-base font-semibold text-gray-900">
                        {entrevista.titulo}
                      </h2>

                      {entrevista.empresa && (
                        <p className="mt-1 text-sm text-gray-600">
                          {entrevista.empresa.nome_empresa}
                        </p>
                      )}

                      {/* Entrevista já realizada */}
                      {entrevista.status === "ENTREVISTA_REALIZADA" ? (
                        <div className="mt-4">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                            <CheckCircle2 className="h-4 w-4" />

                            {t("oportunidades_candidato.entrevista_realizada")}
                          </div>

                          <p className="mt-2 text-xs text-gray-500">
                            {t(
                              "oportunidades_candidato.aguardando_finalizacao",
                            )}
                          </p>
                        </div>
                      ) : /* Horário recusado pelo candidato */
                      entrevista.agenda?.status === "RECUSADO" ? (
                        <div className="mt-4">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                            <XCircle className="h-4 w-4" />

                            {t("oportunidades_candidato.horario_recusado")}
                          </div>

                          <p className="mt-2 text-xs text-gray-500">
                            {t(
                              "oportunidades_candidato.aguardando_nova_agenda",
                            )}
                          </p>
                        </div>
                      ) : /* Existe uma agenda */
                      entrevista.agenda ? (
                        <>
                          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700">
                            <CalendarDays className="h-4 w-4" />

                            {formatarDataHora(
                              entrevista.agenda.data_hora_agenda,
                            )}
                          </div>

                          {/* Aguardando candidato responder */}
                          {entrevista.status === "AGENDA_ENVIADA" &&
                            entrevista.agenda.status === "PENDENTE" && (
                              <p className="mt-2 text-xs text-amber-600">
                                {t(
                                  "oportunidades_candidato.aguardando_resposta_agenda",
                                )}
                              </p>
                            )}

                          {/* Agenda aceita */}
                          {entrevista.status === "AGENDADO" &&
                            entrevista.agenda.status === "ACEITO" && (
                              <p className="mt-2 text-xs font-medium text-green-600">
                                {t(
                                  "oportunidades_candidato.entrevista_confirmada",
                                )}
                              </p>
                            )}
                        </>
                      ) : (
                        /* Convite aceito, mas recrutador ainda não enviou agenda */
                        <p className="mt-4 text-sm text-gray-500">
                          {t("oportunidades_candidato.aguardando_agenda")}
                        </p>
                      )}
                    </div>

                    {/* Botões aparecem somente enquanto a agenda aguarda resposta */}
                    {entrevista.status === "AGENDA_ENVIADA" &&
                      entrevista.agenda?.status === "PENDENTE" && (
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() =>
                              responderAgenda(entrevista.id, "RECUSAR")
                            }
                            disabled={agendaProcessando === entrevista.id}
                            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />

                            {t("oportunidades_candidato.btn_recusar_horario")}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              responderAgenda(entrevista.id, "ACEITAR")
                            }
                            disabled={agendaProcessando === entrevista.id}
                            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />

                            {t("oportunidades_candidato.btn_aceitar_horario")}
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FINALIZADOS */}
      {aba === "finalizados" && (
        <div className="space-y-4">
          {loadingFinalizados ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                {t("oportunidades_candidato.carregando_finalizados")}
              </p>
            </div>
          ) : erroFinalizados ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                {t("oportunidades_candidato.erro_finalizados")}
              </p>
            </div>
          ) : finalizados.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-gray-300" />

              <p className="text-sm font-semibold text-gray-700">
                {t("oportunidades_candidato.sem_finalizados")}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {t("oportunidades_candidato.sem_finalizados_msg")}
              </p>
            </div>
          ) : (
            finalizados.map((processo) => (
              <div
                key={processo.id}
                id={`processo-finalizado-${processo.id}`}
                className={`rounded-xl border bg-white p-5 transition-all duration-500 ${
                  processoDestacado === processo.id
                    ? "border-purple-400 ring-4 ring-purple-100 shadow-md"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <TipoConviteBadge tipo={processo.tipo} />

                      <h2 className="mt-3 text-base font-semibold text-gray-900">
                        {processo.titulo}
                      </h2>

                      {processo.empresa && (
                        <p className="mt-1 text-sm text-gray-600">
                          {processo.empresa.nome_empresa}
                        </p>
                      )}
                    </div>

                    {processo.aprovado === true ? (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 className="h-4 w-4" />

                        {t("oportunidades_candidato.aprovado")}
                      </span>
                    ) : processo.aprovado === false ? (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                        <XCircle className="h-4 w-4" />

                        {t("oportunidades_candidato.nao_aprovado")}
                      </span>
                    ) : (
                      <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                        {t("oportunidades_candidato.processo_finalizado")}
                      </span>
                    )}
                  </div>

                  {processo.parecer?.trim() && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="mb-1 text-xs font-semibold text-gray-500">
                        {t("oportunidades_candidato.parecer")}
                      </p>

                      <p className="text-sm leading-6 text-gray-600">
                        {processo.parecer}
                      </p>
                    </div>
                  )}

                  {processo.data_finalizacao && (
                    <div className="text-xs text-gray-400">
                      {t("oportunidades_candidato.finalizado_em")}{" "}
                      {new Date(processo.data_finalizacao).toLocaleDateString(
                        locale,
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  ativo,
  label,
  quantidade,
  loading,
  onClick,
  icon,
}: {
  ativo: boolean;
  label: string;
  quantidade: number;
  loading: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition cursor-pointer ${
        ativo
          ? "border-purple-600 text-purple-700"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {icon}

      {label}

      {!loading && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] ${
            ativo ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {quantidade}
        </span>
      )}
    </button>
  );
}

function TipoConviteBadge({ tipo }: { tipo: TipoConvite }) {
  const { t } = useTranslation("common");

  const config = {
    VAGA: {
      icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
      label: t("oportunidades_candidato.tipo_vaga"),
    },

    OPORTUNIDADE: {
      icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
      label: t("oportunidades_candidato.tipo_oportunidade"),
    },

    PALESTRA_EVENTO: {
      icon: <Presentation className="h-3.5 w-3.5" />,
      label: t("oportunidades_candidato.tipo_evento"),
    },

    MENTORIA: {
      icon: <Handshake className="h-3.5 w-3.5" />,
      label: t("oportunidades_candidato.tipo_mentoria"),
    },

    PROJETO_CONSULTORIA: {
      icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
      label: t("oportunidades_candidato.tipo_projeto"),
    },

    NETWORKING: {
      icon: <Network className="h-3.5 w-3.5" />,
      label: t("oportunidades_candidato.tipo_networking"),
    },

    OUTRO: {
      icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
      label: t("oportunidades_candidato.tipo_outro"),
    },
  };

  const item = config[tipo];

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
      {item.icon}
      {item.label}
    </span>
  );
}
