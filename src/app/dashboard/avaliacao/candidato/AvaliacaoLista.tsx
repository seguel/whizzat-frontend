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

interface Props {
  perfil: ProfileType;
}

interface Avaliacao {
  id: number;
  avaliador_nome: string;
  localizacao: string;
  skill: string;
  nota?: number;
  logo?: string;
  data_agenda?: string | null;
  agenda_status?: string;
  status: string;
  criado_em: string | null;
  data_avaliacao: string | null;
  peso_avaliador?: number;
  data_envio_formulario: string | null;
  data_agenda_criacao: string | null;
}

/* ======================================================
   CARD
====================================================== */

function AvaliacaoCard({
  avaliacao,
  tipo,
  onAceitarAgenda,
  onRecusarAgenda,
  t,
  perfil,
}: {
  avaliacao: Avaliacao;
  tipo: string;
  onAceitarAgenda?: (id: number) => void;
  onRecusarAgenda?: (id: number) => void;
  t: TFunction;
  perfil: ProfileType;
}) {
  console.log(perfil);
  const { i18n } = useTranslation("common");
  const router = useRouter();

  const currentLocale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "es"
        ? "es-ES"
        : "pt-BR";

  const formatarData = (data?: string | null) => {
    if (!data) return "-";

    return new Intl.DateTimeFormat(currentLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(data));
  };

  const formatarDataHora = (data?: string | null) => {
    if (!data) return "-";

    const dt = new Date(data);

    const dataFormatada = new Intl.DateTimeFormat(currentLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dt);

    const horaFormatada = new Intl.DateTimeFormat(currentLocale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dt);

    return `${dataFormatada} • ${horaFormatada}`;
  };

  const getStatusColor = () => {
    switch (tipo) {
      case "QUESTIONARIO_ENVIADO":
        return "bg-blue-500";

      case "AGENDADO":
      case "AGENDA_ENVIADA":
      case "ENTREVISTA_REALIZADA":
        return "bg-yellow-500";

      case "FINALIZADO":
        return "bg-green-500";

      default:
        return "bg-gray-300";
    }
  };

  return (
    <div
      onClick={() => {
        if (avaliacao.status === "QUESTIONARIO_ENVIADO") {
          router.push(
            `/dashboard/avaliacao/candidato/${avaliacao.id}/questionario?perfil=candidato`,
          );
          return;
        } else if (avaliacao.status === "FINALIZADO") {
          router.push(
            `/dashboard/avaliacao/candidato/${avaliacao.id}?perfil=candidato`,
          );
        }
      }}
      className="
      relative bg-white rounded-xl border shadow-sm mt-1
      w-full max-w-[260px] min-h-[130px]
      flex flex-col
      hover:shadow-md hover:-translate-y-0.5
      transition-all duration-300
      overflow-hidden
      cursor-pointer
    "
    >
      {/* Barra lateral */}
      <div
        className={`absolute left-0 top-0 h-full w-1.5 ${getStatusColor()}`}
      />

      <div className="p-4 pl-5 flex flex-col h-full">
        {/* CONTEÚDO */}
        <div className="flex-1">
          {/* Skill + Nota */}
          <div className="flex items-start justify-between gap-2">
            <div
              className="
              px-2 py-1 rounded-md
              bg-indigo-100 text-indigo-700
              text-xs font-medium
              max-w-[75%]
              truncate
            "
              title={avaliacao.skill}
            >
              {avaliacao.skill}
            </div>

            {avaliacao.peso_avaliador && (
              <div
                className="
                px-2 py-1 rounded-md
                bg-green-100 text-green-700
                text-xs font-semibold
                whitespace-nowrap
              "
              >
                {avaliacao.peso_avaliador / 10}/10
              </div>
            )}
          </div>

          {tipo === "QUESTIONARIO_ENVIADO" && (
            <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
              <p className="text-[11px] text-blue-700 font-medium">
                📅 {t("minha_avaliacao.candidato.formulario_enviado")}
              </p>

              <p className="text-xs font-semibold text-blue-800 mt-1">
                {formatarData(avaliacao.data_envio_formulario ?? null)}
              </p>
            </div>
          )}

          {/* Data entrevista */}
          {(tipo === "AGENDADO" || tipo === "AGENDA_ENVIADA") &&
            avaliacao.data_agenda && (
              <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                <p className="text-[11px] text-blue-700 font-medium">
                  📅 {t("minha_avaliacao.candidato.entrevista_em")}
                </p>

                <p className="text-xs font-semibold text-blue-800 mt-1">
                  {formatarDataHora(avaliacao.data_agenda)}
                </p>
              </div>
            )}
        </div>

        {/* RODAPÉ */}
        <div className="mt-auto">
          {/* QUESTIONÁRIO */}
          {tipo === "QUESTIONARIO_ENVIADO" && (
            <div className="mt-4 pt-3 border-t">
              <div
                className="
                w-full py-2 rounded-lg text-center
                text-xs font-semibold
                bg-blue-50 text-blue-700
              "
              >
                📝 {t("minha_avaliacao.candidato.questionario_pendente")}
              </div>
            </div>
          )}

          {/* AGENDA */}
          {(tipo === "AGENDADO" || tipo === "AGENDA_ENVIADA") && (
            <>
              {tipo === "AGENDADO" && (
                <div className="mt-4 pt-3 border-t">
                  <div
                    className="
                    w-full py-2 rounded-lg text-center
                    text-xs font-semibold
                    bg-green-50 text-green-700
                  "
                  >
                    ✅ {t("minha_avaliacao.candidato.entrevista_confirmada")}
                  </div>
                </div>
              )}

              {tipo === "AGENDA_ENVIADA" &&
                avaliacao.agenda_status != "RECUSADO" && (
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecusarAgenda?.(avaliacao.id);
                      }}
                      className="
                    flex-1 py-2 rounded-lg border
                    text-xs font-semibold cursor-pointer
                    text-red-600 border-red-200
                    hover:bg-red-50 transition
                  "
                    >
                      {t("minha_avaliacao.candidato.btn_recusar")}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAceitarAgenda?.(avaliacao.id);
                      }}
                      className="
                    flex-1 py-2 rounded-lg
                    text-xs font-semibold cursor-pointer
                    bg-green-600 text-white
                    hover:bg-green-700 transition
                  "
                    >
                      {t("minha_avaliacao.candidato.btn_aceitar")}
                    </button>
                  </div>
                )}

              {avaliacao.agenda_status === "RECUSADO" && (
                <div className="mt-4 pt-3 border-t">
                  <div
                    className="
                    w-full py-2 rounded-lg text-center
                    text-xs font-semibold
                    bg-red-50 text-red-700
                  "
                  >
                    ❌ {t("minha_avaliacao.candidato.entrevista_recusada")}
                  </div>
                </div>
              )}
            </>
          )}

          {/* FINALIZADO */}
          {tipo === "FINALIZADO" && (
            <div className="mt-4 pt-3 border-t">
              <div
                className="
                w-full py-2 rounded-lg text-center
                text-xs font-semibold
                bg-green-50 text-green-700
              "
              >
                ✅ {t("minha_avaliacao.candidato.avaliacao_finalizada")}
              </div>
            </div>
          )}

          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {t("minha_avaliacao.candidato.atualizado_em")}{" "}
            {tipo === "QUESTIONARIO_ENVIADO"
              ? formatarData(avaliacao.data_envio_formulario)
              : tipo === "AGENDA_ENVIADA"
                ? formatarData(avaliacao.data_agenda_criacao)
                : tipo === "AGENDADO"
                  ? formatarData(avaliacao.data_agenda)
                  : formatarData(avaliacao.data_avaliacao)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   PAGE
====================================================== */

export default function AvaliacaoLista({ perfil }: Props) {
  const { hasPerfilCandidato, loading } = useCandidato(perfil);

  const { t } = useTranslation("common");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

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
    fetchAvaliacoes();
  }, []);

  const fetchAvaliacoes = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/avaliacoes`,
        {
          credentials: "include",
        },
      );

      const data = await res.json();

      setAvaliacoesQuestionario(data.aguardando_questionario || []);

      setAvaliacoesAgendadas(data.agendadas || []);

      setAvaliacoesFinalizadas(data.finalizadas || []);
    } catch (error) {
      console.error("Erro ao buscar avaliações", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAceitarAgenda = async (id: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/agenda/${id}/aceitar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      await fetchAvaliacoes();
    } catch (error) {
      console.error("Erro ao aceitar agenda", error);
    }
  };

  const handleRecusarAgenda = async (id: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/agenda/${id}/recusar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      await fetchAvaliacoes();
    } catch (error) {
      console.error("Erro ao recusar agenda", error);
    }
  };

  if (isLoading || loading) return <LoadingOverlay />;

  return (
    <div className="flex">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!hasPerfilCandidato ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <PageContainer>
            <div
              className="grid grid-cols-1 md:grid-cols-2
              xl:grid-cols-3 gap-2"
            >
              {/* QUESTIONÁRIO */}
              <div
                className="
                  flex flex-col
                  bg-white
                  rounded-2xl
                  border border-gray-200
                  shadow-sm
                  p-4
                  min-h-[80vh]
                "
              >
                <h2
                  className="font-semibold text-gray-800 mb-4
                  text-center border-b pb-2"
                >
                  {t("minha_avaliacao.candidato.questionarios_pendentes")} (
                  {avaliacoesQuestionario.length})
                </h2>

                <div className="flex flex-col gap-3 pr-1">
                  {avaliacoesQuestionario.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.candidato.sem_questionario")}
                    </p>
                  )}

                  {avaliacoesQuestionario.map((avaliacao) => (
                    <AvaliacaoCard
                      key={avaliacao.id}
                      avaliacao={avaliacao}
                      tipo={avaliacao.status}
                      t={t}
                      perfil={perfil}
                    />
                  ))}
                </div>
              </div>

              {/* AGENDADAS */}
              <div
                className="
                  flex flex-col
                  bg-white
                  rounded-2xl
                  border border-gray-200
                  shadow-sm
                  p-4
                  min-h-[80vh]
                "
              >
                <h2
                  className="font-semibold text-gray-800 mb-4
                  text-center border-b pb-2"
                >
                  {t("minha_avaliacao.candidato.entrevistas")} (
                  {avaliacoesAgendadas.length})
                </h2>

                <div className="flex flex-col gap-3 pr-1">
                  {avaliacoesAgendadas.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.candidato.sem_entrevista")}
                    </p>
                  )}

                  {avaliacoesAgendadas.map((avaliacao) => (
                    <AvaliacaoCard
                      key={avaliacao.id}
                      avaliacao={avaliacao}
                      tipo={avaliacao.status}
                      onAceitarAgenda={handleAceitarAgenda}
                      onRecusarAgenda={handleRecusarAgenda}
                      t={t}
                      perfil={perfil}
                    />
                  ))}
                </div>
              </div>

              {/* FINALIZADAS */}
              <div
                className="
                  flex flex-col
                  bg-white
                  rounded-2xl
                  border border-gray-200
                  shadow-sm
                  p-4
                  min-h-[80vh]
                "
              >
                <h2
                  className="font-semibold text-gray-800 mb-4
                  text-center border-b pb-2"
                >
                  {t("minha_avaliacao.candidato.finalizadas")} (
                  {avaliacoesFinalizadas.length})
                </h2>

                <div className="flex flex-col gap-3 pr-1">
                  {avaliacoesFinalizadas.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.candidato.sem_finalizacao")}
                    </p>
                  )}

                  {avaliacoesFinalizadas.map((avaliacao) => (
                    <AvaliacaoCard
                      key={avaliacao.id}
                      avaliacao={avaliacao}
                      tipo={avaliacao.status}
                      t={t}
                      perfil={perfil}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PageContainer>
        )}
      </div>
    </div>
  );
}
