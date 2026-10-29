"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/perfil/Sidebar";
import TopBar from "../../../components/perfil/TopBar";
import { useCandidato } from "../../../lib/hooks/useCandidato";
import SemDados from "../../SemDados";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { ProfileType } from "../../../components/perfil/ProfileContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import PageContainer from "@/app/components/PageContainer";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, Video, CheckCircle2, Eye } from "lucide-react";

type Aba = "questionarios" | "entrevistas" | "finalizadas";
type PlataformaEntrevista =
  | "GOOGLE_MEET"
  | "MICROSOFT_TEAMS"
  | "ZOOM"
  | "LINK_EXTERNO";

interface Props {
  perfil: ProfileType;
}

interface Avaliacao {
  id: number;
  avaliador_nome: string | null;
  localizacao: string | null;
  skill: string;
  nota?: number;
  logo?: string | null;
  data_agenda?: string | null;
  agenda_status?: string | null;
  status: string;
  criado_em: string | null;
  data_avaliacao: string | null;
  peso_avaliador?: number | null;
  data_envio_formulario: string | null;
  data_agenda_criacao: string | null;
  plataforma?: PlataformaEntrevista | null;
  link_reuniao?: string | null;
  provider_meeting_id?: string | null;
  data_envio_link?: string | null;
}

function AvaliacaoCard({
  avaliacao,
  tipo,
  onAceitarAgenda,
  onRecusarAgenda,
  t,
  agora,
}: {
  avaliacao: Avaliacao;
  tipo: Aba;
  onAceitarAgenda?: (id: number) => void;
  onRecusarAgenda?: (id: number) => void;
  t: TFunction;
  agora: number;
}) {
  const { i18n } = useTranslation("common");
  const router = useRouter();
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

  const agendaRecusada = avaliacao.agenda_status === "RECUSADO";
  const agendaAceita = avaliacao.agenda_status === "ACEITO";
  const linkValido = (() => {
    if (!avaliacao.link_reuniao) return false;
    try {
      const url = new URL(avaliacao.link_reuniao);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  })();
  const horario = avaliacao.data_agenda
    ? new Date(avaliacao.data_agenda).getTime()
    : NaN;
  const entrevistaConfirmada = avaliacao.status === "ENTREVISTA_CONFIRMADA";
  const podeAcessar =
    entrevistaConfirmada &&
    agendaAceita &&
    linkValido &&
    Number.isFinite(horario) &&
    agora >= horario - 5 * 60 * 1000;

  const abrirDetalhe = () => {
    if (tipo === "questionarios") {
      router.push(
        `/dashboard/avaliacao/candidato/${avaliacao.id}/questionario?perfil=candidato`,
      );
    } else if (tipo === "finalizadas") {
      router.push(
        `/dashboard/avaliacao/candidato/${avaliacao.id}?perfil=candidato`,
      );
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {avaliacao.skill}
            </span>
            {avaliacao.peso_avaliador != null && (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {avaliacao.peso_avaliador / 10}/10
              </span>
            )}
          </div>
          {avaliacao.avaliador_nome && (
            <p className="mt-3 text-sm font-semibold text-gray-900">
              {avaliacao.avaliador_nome}
            </p>
          )}
          {avaliacao.localizacao && (
            <p className="mt-1 text-xs text-gray-500">
              {avaliacao.localizacao}
            </p>
          )}

          {tipo === "questionarios" && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-blue-700">
              <CalendarDays className="h-4 w-4" />
              <span>
                {t("minha_avaliacao.candidato.formulario_enviado")}:{" "}
                {formatarData(avaliacao.data_envio_formulario)}
              </span>
            </div>
          )}

          {tipo === "entrevistas" && (
            <div className="mt-3 space-y-2">
              {avaliacao.data_agenda && (
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-700">
                  <CalendarDays className="h-4 w-4 text-purple-600" />
                  <span>
                    {t("minha_avaliacao.candidato.entrevista_em")}:{" "}
                    {formatarDataHora(avaliacao.data_agenda)}
                  </span>
                  <span className="text-xs font-normal text-gray-400">
                    (Brasília)
                  </span>
                </div>
              )}
              {agendaRecusada ? (
                <p className="text-xs font-medium text-red-600">
                  {t("minha_avaliacao.candidato.entrevista_recusada")}
                </p>
              ) : entrevistaConfirmada && agendaAceita ? (
                <>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("minha_avaliacao.candidato.entrevista_confirmada")}
                  </p>
                  {avaliacao.plataforma && (
                    <p className="text-xs text-gray-500">
                      {avaliacao.plataforma === "GOOGLE_MEET"
                        ? "Google Meet"
                        : avaliacao.plataforma === "MICROSOFT_TEAMS"
                          ? "Microsoft Teams"
                          : avaliacao.plataforma === "ZOOM"
                            ? "Zoom"
                            : "Link externo"}
                    </p>
                  )}
                </>
              ) : avaliacao.status === "AGENDADO" && agendaAceita ? (
                <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                  <Clock3 className="h-4 w-4" />
                  {t("minha_avaliacao.candidato.entrevista_confirmada")}
                  {" · "}
                  {t("minha_avaliacao.aguardando_link")}
                </p>
              ) : !agendaRecusada ? (
                <p className="text-xs font-medium text-amber-600">
                  {t("minha_avaliacao.aguardando_data")}
                </p>
              ) : null}
            </div>
          )}

          {tipo === "finalizadas" && (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              {t("minha_avaliacao.candidato.avaliacao_finalizada")}
            </p>
          )}

          <p className="mt-3 text-xs text-gray-400">
            {t("minha_avaliacao.candidato.atualizado_em")}{" "}
            {formatarData(
              tipo === "questionarios"
                ? avaliacao.data_envio_formulario
                : tipo === "entrevistas"
                  ? avaliacao.data_envio_link ||
                    avaliacao.data_agenda_criacao ||
                    avaliacao.data_agenda
                  : avaliacao.data_avaliacao,
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:max-w-[360px]">
          {tipo === "questionarios" && (
            <button
              type="button"
              onClick={abrirDetalhe}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              {t("minha_avaliacao.candidato.questionario_pendente")}
            </button>
          )}
          {tipo === "entrevistas" &&
            avaliacao.status === "AGENDA_ENVIADA" &&
            !agendaRecusada && (
              <>
                <button
                  type="button"
                  onClick={() => onRecusarAgenda?.(avaliacao.id)}
                  className="min-h-10 cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  {t("minha_avaliacao.candidato.btn_recusar")}
                </button>
                <button
                  type="button"
                  onClick={() => onAceitarAgenda?.(avaliacao.id)}
                  className="min-h-10 cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  {t("minha_avaliacao.candidato.btn_aceitar")}
                </button>
              </>
            )}
          {tipo === "entrevistas" &&
            entrevistaConfirmada &&
            agendaAceita &&
            (podeAcessar ? (
              <a
                href={avaliacao.link_reuniao!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                <Video className="h-4 w-4" />{" "}
                {t("minha_avaliacao.btn_acessar_entrevista")}
              </a>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 disabled:cursor-not-allowed"
                >
                  <Video className="h-4 w-4" />{" "}
                  {t("minha_avaliacao.btn_acessar_entrevista")}
                </button>
                <span className="text-center text-xs text-gray-500">
                  {!linkValido
                    ? "Aguardando link válido"
                    : !Number.isFinite(horario)
                      ? "Aguardando horário"
                      : "Disponível 5 minutos antes"}
                </span>
              </div>
            ))}
          {tipo === "finalizadas" && (
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
  );
}

export default function AvaliacaoLista({ perfil }: Props) {
  const { hasPerfilCandidato, loading } = useCandidato(perfil);
  const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aba, setAba] = useState<Aba>("questionarios");
  const [agora, setAgora] = useState(0);
  const [avaliacoesQuestionario, setAvaliacoesQuestionario] = useState<
    Avaliacao[]
  >([]);
  const [avaliacoesAgendadas, setAvaliacoesAgendadas] = useState<Avaliacao[]>(
    [],
  );
  const [avaliacoesFinalizadas, setAvaliacoesFinalizadas] = useState<
    Avaliacao[]
  >([]);

  useEffect(() => {
    setAgora(Date.now());
    const timer = window.setInterval(() => setAgora(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void fetchAvaliacoes();
  }, []);

  const fetchAvaliacoes = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/avaliacoes`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );
      if (!res.ok) throw new Error("Erro ao carregar avaliações");
      const data = await res.json();
      setAvaliacoesQuestionario(data.aguardando_questionario || []);
      setAvaliacoesAgendadas(data.agendadas || []);
      setAvaliacoesFinalizadas(data.finalizadas || []);
    } catch (error) {
      console.error("Erro ao buscar avaliações", error);
    } finally {
      if (mostrarLoading) setIsLoading(false);
    }
  };

  const handleAceitarAgenda = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/agenda/${id}/aceitar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Erro ao aceitar agenda");
      await fetchAvaliacoes(false);
    } catch (error) {
      console.error("Erro ao aceitar agenda", error);
    }
  };

  const handleRecusarAgenda = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/agenda/${id}/recusar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Erro ao recusar agenda");
      await fetchAvaliacoes(false);
    } catch (error) {
      console.error("Erro ao recusar agenda", error);
    }
  };

  if (isLoading || loading) return <LoadingOverlay />;

  const abas: { id: Aba; label: string; items: Avaliacao[]; vazio: string }[] =
    [
      {
        id: "questionarios",
        label: t("minha_avaliacao.candidato.questionarios_pendentes"),
        items: avaliacoesQuestionario,
        vazio: t("minha_avaliacao.candidato.sem_questionario"),
      },
      {
        id: "entrevistas",
        label: t("minha_avaliacao.candidato.entrevistas"),
        items: avaliacoesAgendadas,
        vazio: t("minha_avaliacao.candidato.sem_entrevista"),
      },
      {
        id: "finalizadas",
        label: t("minha_avaliacao.candidato.finalizadas"),
        items: avaliacoesFinalizadas,
        vazio: t("minha_avaliacao.candidato.sem_finalizacao"),
      },
    ];
  const atual = abas.find((item) => item.id === aba)!;

  return (
    <div className="flex">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex min-w-0 flex-1 flex-col bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />
        {!hasPerfilCandidato ? (
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
                {/* Abas */}
                <div className="flex flex-wrap gap-2">
                  {abas.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAba(item.id);
                        void fetchAvaliacoes(false);
                      }}
                      className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition ${
                        aba === item.id
                          ? "border-purple-600 text-purple-700"
                          : "border-transparent text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {item.label}

                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
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

                {/* Fuso horário à direita */}
                <div className="mb-3 ml-auto flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-500">
                  <Clock3 className="h-3.5 w-3.5 shrink-0" />

                  <span>
                    {t("oportunidades_candidato.fuso_brasilia_exibicao")}
                  </span>
                </div>
              </div>

              {atual.items.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
                  {atual.vazio}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {atual.items.map((avaliacao) => (
                    <AvaliacaoCard
                      key={avaliacao.id}
                      avaliacao={avaliacao}
                      tipo={aba}
                      onAceitarAgenda={handleAceitarAgenda}
                      onRecusarAgenda={handleRecusarAgenda}
                      t={t}
                      agora={agora}
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
