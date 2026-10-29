"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "../../../components/perfil/Sidebar";
import TopBar from "../../../components/perfil/TopBar";
import { useAvaliador } from "../../../lib/hooks/useAvaliador";
import SemDados from "../../SemDados";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { ProfileType } from "../../../components/perfil/ProfileContext";
import { useTranslation } from "react-i18next";
import PageContainer from "@/app/components/PageContainer";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Video,
  UserRound,
  Play,
  Eye,
} from "lucide-react";

type Aba = "recebidos" | "aceitos" | "agendados" | "finalizados";

interface Props {
  perfil: ProfileType;
}

interface Convite {
  id: number;
  candidato_nome: string;
  localizacao: string | null;
  skill: string;
  peso?: number | null;
  peso_avaliador?: number | null;
  logo?: string | null;
  data_agenda?: string | null;
  status: string;
  criado_em?: string | null;
  data_envio_formulario?: string | null;
  data_resposta_questionario?: string | null;
  data_agenda_criacao?: string | null;
  data_avaliacao?: string | null;
  status_agenda?: string | null;
  agenda_status?: string | null;
  plataforma?: string | null;
  link_reuniao?: string | null;
  data_envio_link?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function urlReuniaoValida(valor?: string | null): string | null {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function AvaliacaoCard({
  convite,
  tipo,
  perfil,
  onAceitar,
  onRecusar,
}: {
  convite: Convite;
  tipo: string;
  perfil: ProfileType;
  onAceitar?: (id: number) => void;
  onRecusar?: (id: number) => void;
}) {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language?.startsWith("en")
    ? "en-US"
    : i18n.language?.startsWith("es")
      ? "es-ES"
      : "pt-BR";

  const formatarData = (data?: string | null) =>
    data && !Number.isNaN(new Date(data).getTime())
      ? new Date(data).toLocaleDateString(locale, {
          timeZone: "America/Sao_Paulo",
        })
      : "-";

  const formatarDataHora = (data?: string | null) =>
    data && !Number.isNaN(new Date(data).getTime())
      ? new Date(data).toLocaleString(locale, {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "America/Sao_Paulo",
        })
      : "-";

  const podeAbrirDetalhe = tipo !== "PENDENTE";
  const abrirDetalhe = () => {
    if (podeAbrirDetalhe) {
      router.push(
        `/dashboard/avaliacao/avaliador/${convite.id}?perfil=${perfil}`,
      );
    }
  };

  const questionarioRespondido =
    tipo === "QUESTIONARIO_ENVIADO" &&
    Boolean(convite.data_resposta_questionario);

  const notaBase =
    tipo === "FINALIZADO" ? convite.peso_avaliador : convite.peso;
  const pesoNota =
    (notaBase ?? convite.peso_avaliador ?? convite.peso ?? 0) / 10;
  const percentual = Math.max(0, Math.min(100, notaBase ?? 0));
  const pesoCor =
    pesoNota < 3
      ? "bg-red-400"
      : pesoNota <= 6
        ? "bg-yellow-400"
        : "bg-green-500";
  const agendaRecusada =
    (convite.status_agenda ?? convite.agenda_status) === "RECUSADO";
  const linkReuniao = urlReuniaoValida(convite.link_reuniao);
  const statusConfirmado = tipo === "ENTREVISTA_CONFIRMADA";
  const temAgenda = [
    "AGENDA_ENVIADA",
    "AGENDADO",
    "ENTREVISTA_CONFIRMADA",
    "ENTREVISTA_REALIZADA",
  ].includes(tipo);

  const dataRodape =
    tipo === "PENDENTE" || tipo === "CONVITE_ACEITO"
      ? convite.criado_em
      : tipo === "QUESTIONARIO_ENVIADO"
        ? (convite.data_resposta_questionario ?? convite.data_envio_formulario)
        : tipo === "AGENDA_ENVIADA"
          ? convite.data_agenda_criacao
          : tipo === "AGENDADO" || tipo === "ENTREVISTA_CONFIRMADA"
            ? convite.data_agenda
            : convite.data_avaliacao;

  return (
    <article className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex h-full flex-col p-5">
        {/* Conteúdo principal */}
        <div
          className={`min-w-0 flex-1 ${
            podeAbrirDetalhe ? "cursor-pointer" : ""
          }`}
          onClick={abrirDetalhe}
          role={podeAbrirDetalhe ? "link" : undefined}
          tabIndex={podeAbrirDetalhe ? 0 : undefined}
          onKeyDown={(event) => {
            if (
              podeAbrirDetalhe &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              abrirDetalhe();
            }
          }}
        >
          {/* Candidato */}
          <div className="flex items-center gap-3">
            {convite.logo ? (
              <img
                src={convite.logo}
                alt={convite.candidato_nome}
                className="h-11 w-11 shrink-0 rounded-full border object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <UserRound className="h-5 w-5 text-gray-400" />
              </div>
            )}

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {convite.candidato_nome}
              </h3>

              {convite.localizacao && (
                <p className="text-xs text-gray-500">{convite.localizacao}</p>
              )}
            </div>
          </div>

          {/* Skill e status finalizado */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {convite.skill}
            </span>

            {tipo === "FINALIZADO" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("minha_avaliacao.finalizado")}
              </span>
            )}
          </div>

          {/* Peso da avaliação */}
          {(convite.peso != null || convite.peso_avaliador != null) && (
            <div className="mt-3 max-w-sm">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>{t("minha_avaliacao.peso")}</span>
                <span>{pesoNota}/10</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full ${pesoCor}`}
                  style={{ width: `${percentual}%` }}
                />
              </div>
            </div>
          )}

          {/* Data da entrevista */}
          {temAgenda && convite.data_agenda && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              <CalendarDays className="h-4 w-4 shrink-0" />
              {formatarDataHora(convite.data_agenda)}
            </div>
          )}

          {/* Status da avaliação */}
          <div className="mt-3 text-xs font-medium">
            {tipo === "CONVITE_ACEITO" && (
              <span className="text-amber-700">
                {t("minha_avaliacao.aguardando_avaliacao")}
              </span>
            )}

            {tipo === "QUESTIONARIO_ENVIADO" && (
              <span className="text-amber-700">
                {t(
                  convite.data_resposta_questionario
                    ? "minha_avaliacao.questionario_respondido"
                    : "minha_avaliacao.aguardando_questionario",
                )}
              </span>
            )}

            {tipo === "AGENDA_ENVIADA" && (
              <span
                className={agendaRecusada ? "text-red-700" : "text-amber-700"}
              >
                {t(
                  agendaRecusada
                    ? "minha_avaliacao.agenda_recusada"
                    : "minha_avaliacao.aguardando_agenda",
                )}
              </span>
            )}

            {tipo === "AGENDADO" && (
              <div className="flex flex-col gap-1">
                <span className="text-green-700">
                  {t("minha_avaliacao.agenda_aceita")}
                </span>

                <span className="text-amber-700">
                  {t("agenda.status_aguardando_envio_link")}
                </span>
              </div>
            )}

            {statusConfirmado && (
              <span className="text-green-700">
                {t("processos_recrutador.entrevista_confirmada")}

                {convite.plataforma && (
                  <span className="ml-2 text-gray-500">
                    {" · "}
                    {t(
                      `processos_recrutador.plataforma_${convite.plataforma.toLowerCase()}`,
                    )}
                  </span>
                )}
              </span>
            )}

            {tipo === "ENTREVISTA_REALIZADA" && (
              <span className="text-green-700">
                {t("processos_recrutador.entrevista_realizada")}
              </span>
            )}
          </div>
        </div>

        {/* Rodapé: data à esquerda e botões à direita */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <p className="min-w-0 text-xs text-gray-400">
            {t("minha_avaliacao.enviado_em")} {formatarData(dataRodape)}
          </p>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {/* Convite pendente */}
            {tipo === "PENDENTE" && (
              <>
                <button
                  type="button"
                  onClick={() => onRecusar?.(convite.id)}
                  className="min-h-10 cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  {t("minha_avaliacao.btn_recusar")}
                </button>

                <button
                  type="button"
                  onClick={() => onAceitar?.(convite.id)}
                  className="min-h-10 cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  {t("minha_avaliacao.btn_aceitar")}
                </button>
              </>
            )}

            {/* Iniciar avaliação */}
            {tipo === "CONVITE_ACEITO" && (
              <button
                type="button"
                onClick={abrirDetalhe}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                <Play className="h-4 w-4" />
                {t("minha_avaliacao.btn_iniciar_avaliacao")}
              </button>
            )}

            {/* Agendar ou reagendar entrevista */}
            {(questionarioRespondido || agendaRecusada) && (
              <button
                type="button"
                onClick={abrirDetalhe}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                <CalendarDays className="h-4 w-4" />
                {t("minha_avaliacao.btn_agendar_entrevista")}
              </button>
            )}

            {/* enviar link */}
            {tipo === "AGENDADO" && (
              <button
                type="button"
                onClick={abrirDetalhe}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                <CalendarDays className="h-4 w-4" />
                {t("minha_avaliacao.btn_enviar_link")}
              </button>
            )}

            {/* Acessar entrevista */}
            {statusConfirmado && linkReuniao && (
              <a
                href={linkReuniao}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                <Video className="h-4 w-4" />
                {t("processos_recrutador.btn_acessar_entrevista")}
              </a>
            )}

            {/* Finalizar avaliação */}
            {statusConfirmado && (
              <button
                type="button"
                onClick={abrirDetalhe}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-purple-600 bg-white px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("minha_avaliacao.btn_finalizar_avaliacao")}
              </button>
            )}

            {/* Ver avaliação finalizada */}
            {tipo === "FINALIZADO" && (
              <button
                type="button"
                onClick={abrirDetalhe}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-purple-600 bg-white px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                <Eye className="h-4 w-4" />
                {t("minha_avaliacao.btn_ver_avaliacao")}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AvaliacaoConvites({ perfil }: Props) {
  const { hasPerfilAvaliador, loading } = useAvaliador(perfil);
  const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aba, setAba] = useState<Aba>("recebidos");
  const [convitesPendentes, setConvitesPendentes] = useState<Convite[]>([]);
  const [convitesAceitos, setConvitesAceitos] = useState<Convite[]>([]);
  const [convitesAgendados, setConvitesAgendados] = useState<Convite[]>([]);
  const [convitesFinalizados, setConvitesFinalizados] = useState<Convite[]>([]);

  const fetchConvites = useCallback(
    async (mostrarLoading = true) => {
      try {
        if (mostrarLoading) setIsLoading(true);
        const [resConvites, resAvaliacoes] = await Promise.all([
          fetch(`${API_URL}/${perfil}/convites`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_URL}/${perfil}/avaliacoes`, {
            credentials: "include",
            cache: "no-store",
          }),
        ]);
        if (!resConvites.ok || !resAvaliacoes.ok)
          throw new Error("Erro ao buscar avaliações do avaliador");
        const [dataConvites, dataAvaliacoes] = await Promise.all([
          resConvites.json(),
          resAvaliacoes.json(),
        ]);
        setConvitesPendentes(
          Array.isArray(dataConvites?.pendentes) ? dataConvites.pendentes : [],
        );
        setConvitesAceitos(
          Array.isArray(dataAvaliacoes?.aguardando_agendamento)
            ? dataAvaliacoes.aguardando_agendamento
            : [],
        );
        setConvitesAgendados(
          Array.isArray(dataAvaliacoes?.agendadas)
            ? dataAvaliacoes.agendadas
            : [],
        );
        setConvitesFinalizados(
          Array.isArray(dataAvaliacoes?.finalizadas)
            ? dataAvaliacoes.finalizadas
            : [],
        );
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        if (mostrarLoading) setIsLoading(false);
      }
    },
    [perfil],
  );

  useEffect(() => {
    void fetchConvites();
  }, [fetchConvites]);

  const handleAceitar = async (id: number) => {
    try {
      const response = await fetch(
        `${API_URL}/${perfil}/convites/${id}/aceitar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      if (!response.ok) throw new Error("Erro ao aceitar convite");
      await fetchConvites(false);
    } catch (error) {
      console.error("Erro ao aceitar convite", error);
    }
  };

  const handleRecusar = async (id: number) => {
    try {
      const response = await fetch(
        `${API_URL}/${perfil}/convites/${id}/recusar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      if (!response.ok) throw new Error("Erro ao recusar convite");
      await fetchConvites(false);
    } catch (error) {
      console.error("Erro ao recusar convite", error);
    }
  };

  const abas: { id: Aba; label: string; items: Convite[]; vazio: string }[] = [
    {
      id: "recebidos",
      label: t("minha_avaliacao.recebido"),
      items: convitesPendentes,
      vazio: t("minha_avaliacao.sem_convite"),
    },
    {
      id: "aceitos",
      label: t("minha_avaliacao.aceito"),
      items: convitesAceitos,
      vazio: t("minha_avaliacao.sem_aceito"),
    },
    {
      id: "agendados",
      label: t("minha_avaliacao.agendado"),
      items: convitesAgendados,
      vazio: t("minha_avaliacao.sem_agenda"),
    },
    {
      id: "finalizados",
      label: t("minha_avaliacao.finalizado"),
      items: convitesFinalizados,
      vazio: t("minha_avaliacao.sem_finalizacao"),
    },
  ];
  const abaAtual = abas.find((item) => item.id === aba) ?? abas[0];

  if (isLoading || loading) return <LoadingOverlay />;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex min-w-0 flex-1 flex-col bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />
        {!hasPerfilAvaliador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <PageContainer>
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("minha_avaliacao.titulo_pagina")}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {t("minha_avaliacao.subtitulo_pagina")}
                </p>
              </div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {abas.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAba(item.id);
                        void fetchConvites(false);
                      }}
                      className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition ${
                        aba === item.id
                          ? "border-purple-600 text-purple-700"
                          : "border-transparent text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {item.label}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                          aba === item.id
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.items.length}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mb-3 flex w-full items-center gap-1.5 text-xs text-gray-500">
                  <Clock3 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {t("oportunidades_candidato.fuso_brasilia_exibicao")}
                  </span>
                </div>
              </div>

              {abaAtual.items.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
                  <Clock3 className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-600">
                    {abaAtual.vazio}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {abaAtual.items.map((convite) => (
                    <AvaliacaoCard
                      key={convite.id}
                      convite={convite}
                      tipo={aba === "recebidos" ? "PENDENTE" : convite.status}
                      perfil={perfil}
                      onAceitar={handleAceitar}
                      onRecusar={handleRecusar}
                    />
                  ))}
                </div>
              )}
            </div>
          </PageContainer>
        )}
      </div>
    </div>
  );
}
