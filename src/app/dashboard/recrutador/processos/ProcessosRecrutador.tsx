"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

type Aba = "convites" | "andamento" | "finalizados" | "recusados";

type StatusProcesso =
  | "CONVITE_ACEITO"
  | "AGENDA_ENVIADA"
  | "AGENDADO"
  | "ENTREVISTA_REALIZADA"
  | "FINALIZADO"
  | "CONVITE_RECUSADO";

type StatusAgenda =
  | "PENDENTE"
  | "RECUSADO"
  | "ACEITO"
  | "REALIZADO"
  | "CANCELADO";

type TipoConvite =
  | "VAGA"
  | "OPORTUNIDADE"
  | "PALESTRA_EVENTO"
  | "MENTORIA"
  | "PROJETO_CONSULTORIA"
  | "NETWORKING"
  | "OUTRO";

interface Processo {
  id: number;
  candidato: {
    id: number;
    nome: string;
    logo: string | null;
  };

  tipo: TipoConvite;
  titulo: string;
  mensagem: string;
  status: StatusProcesso;

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
  } | null;

  agenda: {
    id: number;
    data_hora_agenda: string;
    status: StatusAgenda;
  } | null;

  data_convite: string;
  data_aceite: string | null;
  data_recusa: string | null;

  aprovado: boolean | null;
  parecer: string | null;
  data_finalizacao: string | null;
}

interface Props {
  processoId?: string;
}

export default function ProcessosRecrutador({ processoId }: Props) {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  const processoIdInicial =
    processoId && !Number.isNaN(Number(processoId)) ? Number(processoId) : null;

  const [processoIdSelecionado, setProcessoIdSelecionado] = useState<
    number | null
  >(processoIdInicial);

  const [aba, setAba] = useState<Aba>("convites");
  const [processoAgenda, setProcessoAgenda] = useState<Processo | null>(null);
  const [salvandoAgenda, setSalvandoAgenda] = useState(false);
  const [convites, setConvites] = useState<Processo[]>([]);
  const [loadingConvites, setLoadingConvites] = useState(true);
  const [erroAgenda, setErroAgenda] = useState("");

  const [dataEntrevista, setDataEntrevista] = useState("");
  const [horaEntrevista, setHoraEntrevista] = useState("");

  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loadingProcessos, setLoadingProcessos] = useState(true);
  const [erroProcessos, setErroProcessos] = useState("");
  const [processoRealizando, setProcessoRealizando] = useState<number | null>(
    null,
  );

  const [processoFinalizacao, setProcessoFinalizacao] =
    useState<Processo | null>(null);

  const [aprovadoFinalizacao, setAprovadoFinalizacao] = useState<
    boolean | null
  >(null);

  const [parecerFinalizacao, setParecerFinalizacao] = useState("");

  const [salvandoFinalizacao, setSalvandoFinalizacao] = useState(false);

  const locale = i18n.language?.startsWith("en") ? "en-US" : "pt-BR";

  const processosAndamento = useMemo(
    () =>
      processos.filter((processo) =>
        [
          "CONVITE_ACEITO",
          "AGENDA_ENVIADA",
          "AGENDADO",
          "ENTREVISTA_REALIZADA",
        ].includes(processo.status),
      ),
    [processos],
  );

  const processosFinalizados = useMemo(
    () => processos.filter((processo) => processo.status === "FINALIZADO"),
    [processos],
  );

  const processosRecusados = useMemo(
    () =>
      processos.filter((processo) => processo.status === "CONVITE_RECUSADO"),
    [processos],
  );

  async function carregarConvites() {
    try {
      setLoadingConvites(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/recrutador/convites`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar convites");
      }

      const data = await response.json();

      setConvites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
      setConvites([]);
    } finally {
      setLoadingConvites(false);
    }
  }

  async function marcarEntrevistaRealizada(processoId: number) {
    if (processoRealizando !== null) {
      return;
    }

    try {
      setProcessoRealizando(processoId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/recrutador/processos/${processoId}/realizada`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || t("processos_recrutador.erro_marcar_realizada"),
        );
      }

      setProcessos((processosAtuais) =>
        processosAtuais.map((processo) => {
          if (processo.id !== processoId) {
            return processo;
          }

          return {
            ...processo,
            status: "ENTREVISTA_REALIZADA",
            agenda: processo.agenda
              ? {
                  ...processo.agenda,
                  status: "REALIZADO",
                }
              : null,
          };
        }),
      );
      toast.success(t("processos_recrutador.sucesso_marcar_realizada"));
    } catch (error) {
      console.error("Erro ao marcar entrevista como realizada:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : t("processos_recrutador.erro_marcar_realizada"),
      );
    } finally {
      setProcessoRealizando(null);
    }
  }

  function abrirModalFinalizacao(processo: Processo) {
    setProcessoFinalizacao(processo);
    setAprovadoFinalizacao(null);
    setParecerFinalizacao("");
  }

  function fecharModalFinalizacao() {
    if (salvandoFinalizacao) return;

    setProcessoFinalizacao(null);
    setAprovadoFinalizacao(null);
    setParecerFinalizacao("");
  }

  function abrirModalAgenda(processo: Processo) {
    setProcessoAgenda(processo);
    setDataEntrevista("");
    setHoraEntrevista("");
    setErroAgenda("");
  }

  function fecharModalAgenda() {
    if (salvandoAgenda) return;

    setProcessoAgenda(null);
    setDataEntrevista("");
    setHoraEntrevista("");
    setErroAgenda("");
  }

  async function finalizarProcesso() {
    if (
      !processoFinalizacao ||
      aprovadoFinalizacao === null ||
      !parecerFinalizacao.trim() ||
      salvandoFinalizacao
    ) {
      return;
    }

    try {
      setSalvandoFinalizacao(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/recrutador/processos/${processoFinalizacao.id}/finalizar`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aprovado: aprovadoFinalizacao,
            parecer: parecerFinalizacao.trim(),
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || t("processos_recrutador.modal_finalizacao.erro"),
        );
      }

      setProcessos((processosAtuais) =>
        processosAtuais.map((processo) => {
          if (processo.id !== processoFinalizacao.id) {
            return processo;
          }

          return {
            ...processo,
            status: "FINALIZADO",
            aprovado: data.aprovado,
            parecer: data.parecer,
            data_finalizacao: data.data_finalizacao,
          };
        }),
      );

      toast.success(t("processos_recrutador.modal_finalizacao.sucesso"));

      setProcessoFinalizacao(null);
      setAprovadoFinalizacao(null);
      setParecerFinalizacao("");
    } catch (error) {
      console.error("Erro ao finalizar processo:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : t("processos_recrutador.modal_finalizacao.erro"),
      );
    } finally {
      setSalvandoFinalizacao(false);
    }
  }

  async function carregarProcessos({
    mostrarLoading = true,
  }: {
    mostrarLoading?: boolean;
  } = {}) {
    try {
      if (mostrarLoading) {
        setLoadingProcessos(true);
      }

      setErroProcessos("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/recrutador/processos`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || t("processos_recrutador.erro_carregar"),
        );
      }

      setProcessos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar processos:", error);

      setErroProcessos(
        error instanceof Error
          ? error.message
          : t("processos_recrutador.erro_carregar"),
      );
    } finally {
      if (mostrarLoading) {
        setLoadingProcessos(false);
      }
    }
  }

  useEffect(() => {
    carregarConvites();
    carregarProcessos();
  }, []);

  useEffect(() => {
    if (!processoIdSelecionado || loadingProcessos) {
      return;
    }

    const processo = processos.find(
      (item) => item.id === processoIdSelecionado,
    );

    if (!processo) {
      return;
    }

    if (
      [
        "CONVITE_ACEITO",
        "AGENDA_ENVIADA",
        "AGENDADO",
        "ENTREVISTA_REALIZADA",
      ].includes(processo.status)
    ) {
      setAba("andamento");
      return;
    }

    if (processo.status === "FINALIZADO") {
      setAba("finalizados");
      return;
    }

    if (processo.status === "CONVITE_RECUSADO") {
      setAba("recusados");
    }
  }, [processoIdSelecionado, processos, loadingProcessos]);

  useEffect(() => {
    if (!processoIdSelecionado || loadingProcessos) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const elemento = document.getElementById(
        `processo-${processoIdSelecionado}`,
      );

      if (!elemento) {
        return;
      }

      elemento.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const params = new URLSearchParams(searchParams.toString());

      params.delete("processo");

      const query = params.toString();

      router.replace(
        query
          ? `/dashboard/recrutador/processos?${query}`
          : "/dashboard/recrutador/processos",
        {
          scroll: false,
        },
      );
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [processoIdSelecionado, aba, loadingProcessos, router, searchParams]);

  useEffect(() => {
    if (!processoIdSelecionado) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setProcessoIdSelecionado(null);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [processoIdSelecionado]);

  function trocarAba(novaAba: Aba) {
    setAba(novaAba);

    if (novaAba === "convites") {
      void carregarConvites();
      return;
    }

    void carregarProcessos({ mostrarLoading: false });
  }

  async function confirmarAgenda() {
    if (!processoAgenda || !horarioEntrevistaValido() || salvandoAgenda) {
      return;
    }

    try {
      setSalvandoAgenda(true);
      setErroAgenda("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/recrutador/processos/${processoAgenda.id}/agenda`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data_hora_agenda: `${dataEntrevista}T${horaEntrevista}:00`,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || t("processos_recrutador.modal_agenda.erro"),
        );
      }

      setProcessos((processosAtuais) =>
        processosAtuais.map((processo) => {
          if (processo.id !== processoAgenda.id) {
            return processo;
          }

          return {
            ...processo,

            status: "AGENDA_ENVIADA",

            agenda: {
              id: data.agenda.id,
              data_hora_agenda: data.agenda.data_hora_agenda,
              status: data.agenda.status,
            },
          };
        }),
      );

      console.log("Agenda enviada:", data);

      setProcessoAgenda(null);
      setDataEntrevista("");
      setHoraEntrevista("");
      setErroAgenda("");
    } catch (error) {
      console.error(error);

      setErroAgenda(
        error instanceof Error
          ? error.message
          : t("processos_recrutador.modal_agenda.erro"),
      );
    } finally {
      setSalvandoAgenda(false);
    }
  }

  function getDataHoje() {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  function horarioEntrevistaValido() {
    if (!dataEntrevista || !horaEntrevista) {
      return false;
    }

    const dataHoraSelecionada = new Date(
      `${dataEntrevista}T${horaEntrevista}:00`,
    );

    return dataHoraSelecionada.getTime() > Date.now();
  }

  function formatarDataHora(data: string) {
    return new Date(data).toLocaleString(locale, {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString(locale);
  }

  function TipoBadge({ tipo }: { tipo: TipoConvite }) {
    const labels: Record<TipoConvite, string> = {
      VAGA: t("processos_recrutador.tipo_vaga"),
      OPORTUNIDADE: t("processos_recrutador.tipo_oportunidade"),
      PALESTRA_EVENTO: t("processos_recrutador.tipo_evento"),
      MENTORIA: t("processos_recrutador.tipo_mentoria"),
      PROJETO_CONSULTORIA: t("processos_recrutador.tipo_projeto"),
      NETWORKING: t("processos_recrutador.tipo_networking"),
      OUTRO: t("processos_recrutador.tipo_outro"),
    };

    return (
      <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
        {labels[tipo]}
      </span>
    );
  }

  function Candidato({ processo }: { processo: Processo }) {
    return (
      <div className="flex items-center gap-3">
        {processo.candidato.logo ? (
          <img
            src={processo.candidato.logo}
            alt={processo.candidato.nome}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <UserRound className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {processo.candidato.nome}
          </p>

          {processo.empresa && (
            <p className="truncate text-xs text-gray-500">
              {processo.empresa.nome_empresa}
            </p>
          )}
        </div>
      </div>
    );
  }

  function ProcessoAndamentoCard({ processo }: { processo: Processo }) {
    const agendaRecusada =
      processo.status === "CONVITE_ACEITO" &&
      processo.agenda?.status === "RECUSADO";

    return (
      <div
        id={`processo-${processo.id}`}
        className={`rounded-xl border bg-white p-5 transition-all ${
          processo.id === processoIdSelecionado
            ? "border-purple-400 ring-2 ring-purple-100"
            : "border-gray-200"
        }`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Candidato processo={processo} />

            <div className="mt-4">
              <TipoBadge tipo={processo.tipo} />

              <h2 className="mt-2 text-base font-semibold text-gray-900">
                {processo.titulo}
              </h2>
            </div>

            {processo.status === "CONVITE_ACEITO" && !agendaRecusada && (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("processos_recrutador.convite_aceito")}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {t("processos_recrutador.sugerir_entrevista_msg")}
                </p>
              </div>
            )}

            {agendaRecusada && (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                  <XCircle className="h-4 w-4" />
                  {t("processos_recrutador.horario_recusado")}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {t("processos_recrutador.sugerir_novo_horario_msg")}
                </p>
              </div>
            )}

            {processo.status === "AGENDA_ENVIADA" && processo.agenda && (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                  <Clock3 className="h-4 w-4" />
                  {formatarDataHora(processo.agenda.data_hora_agenda)}
                </div>

                <p className="mt-2 text-xs text-amber-600">
                  {t("processos_recrutador.aguardando_confirmacao_candidato")}
                </p>
              </div>
            )}

            {processo.status === "AGENDADO" && processo.agenda && (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                  <CalendarDays className="h-4 w-4" />
                  {formatarDataHora(processo.agenda.data_hora_agenda)}
                </div>

                <p className="mt-2 text-xs font-medium text-green-600">
                  {t("processos_recrutador.entrevista_confirmada")}
                </p>
              </div>
            )}

            {processo.status === "ENTREVISTA_REALIZADA" && (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("processos_recrutador.entrevista_realizada")}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {t("processos_recrutador.finalizar_processo_msg")}
                </p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {processo.status === "CONVITE_ACEITO" && (
              <button
                type="button"
                onClick={() => abrirModalAgenda(processo)}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                <CalendarDays className="h-4 w-4" />

                {agendaRecusada
                  ? t("processos_recrutador.btn_novo_horario")
                  : t("processos_recrutador.btn_sugerir_entrevista")}
              </button>
            )}

            {processo.status === "AGENDADO" && (
              <button
                type="button"
                onClick={() => marcarEntrevistaRealizada(processo.id)}
                disabled={processoRealizando === processo.id}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />

                {processoRealizando === processo.id
                  ? t("processos_recrutador.btn_marcando_realizada")
                  : t("processos_recrutador.btn_realizada")}
              </button>
            )}
            {processo.status === "ENTREVISTA_REALIZADA" && (
              <button
                type="button"
                onClick={() => abrirModalFinalizacao(processo)}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                <BriefcaseBusiness className="h-4 w-4" />
                {t("processos_recrutador.btn_finalizar")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {t("processos_recrutador.titulo")}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {t("processos_recrutador.descricao")}
        </p>
      </div>

      {loadingConvites && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            {t("processos_recrutador.carregando_convites")}
          </p>
        </div>
      )}

      {!loadingProcessos && erroProcessos && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-600">{erroProcessos}</p>
        </div>
      )}
      {!loadingProcessos && !erroProcessos && (
        <>
          <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
            <TabButton
              ativo={aba === "convites"}
              onClick={() => trocarAba("convites")}
              //   icon={<Clock3 className="h-4 w-4" />}
              label={t("processos_recrutador.convites")}
              quantidade={convites.length}
            />

            <TabButton
              ativo={aba === "andamento"}
              label={t("processos_recrutador.em_andamento")}
              quantidade={processosAndamento.length}
              onClick={() => trocarAba("andamento")}
            />

            <TabButton
              ativo={aba === "finalizados"}
              label={t("processos_recrutador.finalizados")}
              quantidade={processosFinalizados.length}
              onClick={() => trocarAba("finalizados")}
            />

            <TabButton
              ativo={aba === "recusados"}
              label={t("processos_recrutador.recusados")}
              quantidade={processosRecusados.length}
              onClick={() => trocarAba("recusados")}
            />
          </div>

          {aba === "convites" && (
            <>
              {loadingConvites ? (
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
                  <p className="text-sm text-gray-500">
                    {t("processos_recrutador.carregando_convites")}
                  </p>
                </div>
              ) : convites.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
                  <Clock3 className="mx-auto h-8 w-8 text-gray-300" />

                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    {t("processos_recrutador.sem_convites")}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {t("processos_recrutador.sem_convites_descricao")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {convites.map((convite) => (
                    <div
                      key={convite.id}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <UserRound className="h-5 w-5 shrink-0 text-purple-600" />

                            <p className="truncate font-semibold text-gray-900">
                              {convite.candidato.nome}
                            </p>
                          </div>

                          <p className="mt-2 text-sm font-semibold text-gray-800">
                            {convite.titulo}
                          </p>

                          {convite.empresa?.nome_empresa && (
                            <p className="mt-1 text-sm text-gray-500">
                              {convite.empresa.nome_empresa}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                              <Clock3 className="h-3.5 w-3.5" />
                              {t("processos_recrutador.aguardando_resposta")}
                            </span>

                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                              {convite.tipo}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-left sm:text-right">
                          <p className="text-xs text-gray-400">
                            {t("processos_recrutador.enviado_em")}
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-600">
                            {formatarData(convite.data_convite)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {aba === "andamento" && (
            <div className="space-y-4">
              {processosAndamento.map((processo) => (
                <ProcessoAndamentoCard key={processo.id} processo={processo} />
              ))}
            </div>
          )}

          {aba === "finalizados" && (
            <div className="space-y-4">
              {processosFinalizados.map((processo) => (
                <div
                  key={processo.id}
                  id={`processo-${processo.id}`}
                  className={`rounded-xl border bg-white p-5 transition-all ${
                    processo.id === processoIdSelecionado
                      ? "border-purple-400 ring-2 ring-purple-100"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Candidato processo={processo} />

                        <div className="mt-4">
                          <TipoBadge tipo={processo.tipo} />

                          <h2 className="mt-2 text-base font-semibold text-gray-900">
                            {processo.titulo}
                          </h2>
                        </div>
                      </div>

                      {processo.aprovado === true ? (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          {t("processos_recrutador.aprovado")}
                        </span>
                      ) : processo.aprovado === false ? (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                          <XCircle className="h-4 w-4" />
                          {t("processos_recrutador.nao_aprovado")}
                        </span>
                      ) : null}
                    </div>

                    {processo.parecer?.trim() && (
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                          <MessageSquareText className="h-4 w-4" />
                          {t("processos_recrutador.parecer")}
                        </div>

                        <p className="text-sm leading-6 text-gray-600">
                          {processo.parecer}
                        </p>
                      </div>
                    )}

                    {processo.data_finalizacao && (
                      <p className="text-xs text-gray-400">
                        {t("processos_recrutador.finalizado_em")}{" "}
                        {formatarData(processo.data_finalizacao)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {aba === "recusados" && (
            <div className="space-y-4">
              {processosRecusados.map((processo) => (
                <div
                  key={processo.id}
                  id={`processo-${processo.id}`}
                  className={`rounded-xl border bg-white p-5 transition-all ${
                    processo.id === processoIdSelecionado
                      ? "border-purple-400 ring-2 ring-purple-100"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Candidato processo={processo} />

                      <div className="mt-4">
                        <TipoBadge tipo={processo.tipo} />

                        <h2 className="mt-2 text-base font-semibold text-gray-900">
                          {processo.titulo}
                        </h2>

                        {processo.data_recusa && (
                          <p className="mt-2 text-xs text-gray-400">
                            {t("processos_recrutador.recusado_em")}{" "}
                            {formatarData(processo.data_recusa)}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                      <XCircle className="h-4 w-4" />
                      {t("processos_recrutador.convite_recusado")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {processoAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {processoAgenda.agenda?.status === "RECUSADO"
                    ? t("processos_recrutador.modal_agenda.titulo_novo")
                    : t("processos_recrutador.modal_agenda.titulo")}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {t("processos_recrutador.modal_agenda.descricao")}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModalAgenda}
                className="cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="mb-6 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  {processoAgenda.candidato.logo ? (
                    <img
                      src={processoAgenda.candidato.logo}
                      alt={processoAgenda.candidato.nome}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
                      <UserRound className="h-5 w-5 text-gray-400" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {processoAgenda.candidato.nome}
                    </p>

                    <p className="truncate text-sm text-gray-500">
                      {processoAgenda.titulo}
                    </p>

                    {processoAgenda.empresa && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {processoAgenda.empresa.nome_empresa}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {processoAgenda.agenda?.status === "RECUSADO" && (
                <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex gap-2">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <div>
                      <p className="text-sm font-semibold text-amber-700">
                        {t(
                          "processos_recrutador.modal_agenda.horario_anterior_recusado",
                        )}
                      </p>

                      <p className="mt-1 text-xs text-amber-600">
                        {formatarDataHora(
                          processoAgenda.agenda.data_hora_agenda,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {t("processos_recrutador.modal_agenda.data")}
                  </label>

                  <input
                    type="date"
                    min={getDataHoje()}
                    value={dataEntrevista}
                    onChange={(e) => setDataEntrevista(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {t("processos_recrutador.modal_agenda.hora")}
                  </label>

                  <input
                    type="time"
                    value={horaEntrevista}
                    onChange={(e) => setHoraEntrevista(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              {/* AQUI */}
              {dataEntrevista &&
                horaEntrevista &&
                !horarioEntrevistaValido() && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {t("processos_recrutador.modal_agenda.data_invalida")}
                  </p>
                )}

              {erroAgenda && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs font-medium text-red-600">
                    {erroAgenda}
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                <p className="text-xs leading-5 text-blue-700">
                  {t("processos_recrutador.modal_agenda.aviso")}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fecharModalAgenda}
                disabled={salvandoAgenda}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                {t("processos_recrutador.modal_agenda.btn_cancelar")}
              </button>

              <button
                type="button"
                disabled={!horarioEntrevistaValido() || salvandoAgenda}
                onClick={confirmarAgenda}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CalendarDays className="h-4 w-4" />

                {salvandoAgenda
                  ? t("processos_recrutador.modal_agenda.btn_enviando")
                  : processoAgenda.agenda?.status === "RECUSADO"
                    ? t("processos_recrutador.modal_agenda.btn_novo")
                    : t("processos_recrutador.modal_agenda.btn_enviar")}
              </button>
            </div>
          </div>
        </div>
      )}
      {processoFinalizacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {t("processos_recrutador.modal_finalizacao.titulo")}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {t("processos_recrutador.modal_finalizacao.descricao")}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModalFinalizacao}
                disabled={salvandoFinalizacao}
                className="cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="px-6 py-5">
              {/* Candidato */}
              <div className="mb-6 rounded-xl bg-gray-50 p-4">
                <Candidato processo={processoFinalizacao} />

                <p className="mt-3 text-sm font-medium text-gray-700">
                  {processoFinalizacao.titulo}
                </p>
              </div>

              {/* Resultado */}
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  {t("processos_recrutador.modal_finalizacao.resultado")}
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setAprovadoFinalizacao(true)}
                    disabled={salvandoFinalizacao}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition ${
                      aprovadoFinalizacao === true
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />

                      <span className="text-sm font-semibold">
                        {t("processos_recrutador.modal_finalizacao.aprovado")}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAprovadoFinalizacao(false)}
                    disabled={salvandoFinalizacao}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition ${
                      aprovadoFinalizacao === false
                        ? "border-gray-500 bg-gray-100 text-gray-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5" />

                      <span className="text-sm font-semibold">
                        {t(
                          "processos_recrutador.modal_finalizacao.nao_aprovado",
                        )}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Feedback */}
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  {t("processos_recrutador.modal_finalizacao.feedback")}
                </label>

                <textarea
                  rows={5}
                  maxLength={3000}
                  value={parecerFinalizacao}
                  onChange={(e) => setParecerFinalizacao(e.target.value)}
                  disabled={salvandoFinalizacao}
                  placeholder={t(
                    "processos_recrutador.modal_finalizacao.feedback_placeholder",
                  )}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50"
                />

                <div className="mt-1 flex justify-between gap-3">
                  <p className="text-xs text-gray-400">
                    {t("processos_recrutador.modal_finalizacao.feedback_aviso")}
                  </p>

                  <span className="shrink-0 text-xs text-gray-400">
                    {parecerFinalizacao.length}/3000
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fecharModalFinalizacao}
                disabled={salvandoFinalizacao}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("processos_recrutador.modal_finalizacao.btn_cancelar")}
              </button>

              <button
                type="button"
                onClick={finalizarProcesso}
                disabled={
                  aprovadoFinalizacao === null ||
                  !parecerFinalizacao.trim() ||
                  salvandoFinalizacao
                }
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />

                {salvandoFinalizacao
                  ? t("processos_recrutador.modal_finalizacao.btn_finalizando")
                  : t("processos_recrutador.modal_finalizacao.btn_finalizar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  ativo,
  label,
  quantidade,
  onClick,
}: {
  ativo: boolean;
  label: string;
  quantidade: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
        ativo
          ? "border-purple-600 text-purple-700"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          ativo ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {quantidade}
      </span>
    </button>
  );
}
