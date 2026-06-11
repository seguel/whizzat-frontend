"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/perfil/Sidebar";
import TopBar from "../../../components/perfil/TopBar";
import { useAvaliador } from "../../../lib/hooks/useAvaliador";
import SemDados from "../../SemDados";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { ProfileType } from "../../../components/perfil/ProfileContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import PageContainer from "@/app/components/PageContainer";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

interface Props {
  perfil: ProfileType;
}

interface Convite {
  id: number;
  candidato_nome: string;
  localizacao: string;
  skill: string;
  peso?: number; // 10 a 100
  peso_avaliador?: number;
  logo?: string;
  data_agenda?: string | null;
  status: string;
  criado_em: string;
  data_envio_formulario: string | null;
  data_resposta_questionario: string | null;
  data_agenda_criacao: string | null;
  data_avaliacao: string | null;
  status_agenda?: string;
}

/* ======================================================
   CARD
====================================================== */

function ConviteCard({
  convite,
  tipo,
  onAceitar,
  onRecusar,
  t,
  perfil,
}: {
  convite: Convite;
  tipo: string;
  onAceitar?: (id: number) => void;
  onRecusar?: (id: number) => void;
  t: TFunction;
  perfil: ProfileType;
}) {
  const router = useRouter();

  const pesoNota = convite.peso_avaliador
    ? convite.peso_avaliador / 10
    : convite.peso
      ? convite.peso / 10
      : 0;

  const getPesoColor = () => {
    if (!convite.peso) return "bg-gray-300";
    if (convite.peso < 30) return "bg-red-400";
    if (convite.peso < 60) return "bg-yellow-400";
    if (convite.peso > 60) return "bg-green-500";

    return "bg-red-500";
  };

  const abrirDetalhe = () => {
    if (tipo === "PENDENTE") {
      return;
    }

    router.push(
      `/dashboard/avaliacao/avaliador/${convite.id}?perfil=${perfil}`,
    );
  };

  const getStatusColor = () => {
    switch (tipo) {
      case "PENDENTE":
        return "bg-amber-400";
      case "CONVITE_ACEITO":
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

  const { i18n } = useTranslation("common");

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

  // const formatarDataHora = (data?: string | null) => {
  //   if (!data) return "-";

  //   const dt = new Date(data);

  //   const dataFormatada = new Intl.DateTimeFormat(currentLocale, {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //   }).format(dt);

  //   const horaFormatada = new Intl.DateTimeFormat(currentLocale, {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   }).format(dt);

  //   return `${dataFormatada} • ${horaFormatada}`;
  // };

  return (
    <div
      onClick={abrirDetalhe}
      className="relative bg-white rounded-xl border shadow-sm mt-1
                 w-full max-w-[260px] min-h-[250px]
                 flex flex-col
                 hover:shadow-md hover:-translate-y-0.5
                 transition-all duration-300
                 overflow-hidden
                 cursor-pointer"
    >
      {/* Barra lateral fixa */}
      <div
        className={`absolute left-0 top-0 h-full w-1.5 ${getStatusColor()}`}
      />

      {/* Conteúdo */}
      <div className="p-4 pl-5 flex flex-col flex-1">
        {/* BLOCO QUE CRESCE */}

        <div className="flex-1">
          {/* TOPO */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <img
                src={convite.logo || "/avatar-placeholder.png"}
                alt={convite.candidato_nome}
                className="w-12 h-12 rounded-full object-cover border"
              />

              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                  {convite.candidato_nome}
                </h3>

                <span className="text-xs text-gray-500">
                  {convite.localizacao}
                </span>
              </div>
            </div>

            <div className="w-full rounded-md bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-2 break-words text-center">
              {convite.skill}
            </div>
          </div>

          {/* PESO */}
          {convite.peso && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">
                  {t("minha_avaliacao.peso")}
                </span>
                <span className="text-xs text-gray-400">{pesoNota}/10</span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getPesoColor()}`}
                  style={{
                    width: `${tipo === "FINALIZADO" ? convite.peso_avaliador : convite.peso}%`,
                  }}
                />
              </div>
            </div>
          )}

          {convite.data_agenda && (
            <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-2">
              <div className="flex items-center gap-2 text-blue-700 text-xs font-medium">
                <Calendar size={14} />
                <span>13/06/2026 • 09:45</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3">
          {/* AÇÕES (sempre no rodapé) */}
          {tipo === "PENDENTE" && (
            <div className="flex gap-2 mt-4 pt-3 border-t">
              <button
                onClick={() => onRecusar?.(convite.id)}
                className="flex-1 py-2 rounded-lg border text-xs font-semibold cursor-pointer
                         text-red-600 border-red-200
                         hover:bg-red-50 transition"
              >
                {t("minha_avaliacao.btn_recusar")}
              </button>

              <button
                onClick={() => onAceitar?.(convite.id)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer
                         bg-green-600 text-white
                         hover:bg-green-700 transition"
              >
                {t("minha_avaliacao.btn_aceitar")}
              </button>
            </div>
          )}
          {(tipo === "CONVITE_ACEITO" || tipo === "QUESTIONARIO_ENVIADO") && (
            <div className="mt-4 pt-3 border-t">
              <div className="w-full py-2 rounded-lg text-center text-xs font-semibold bg-yellow-50 text-yellow-700">
                ⏳{" "}
                {tipo === "CONVITE_ACEITO"
                  ? t("minha_avaliacao.aguardando_avaliacao")
                  : convite.data_resposta_questionario
                    ? t("minha_avaliacao.questionario_respondido")
                    : t("minha_avaliacao.aguardando_questionario")}
              </div>
            </div>
          )}

          {(tipo === "AGENDADO" || tipo === "AGENDA_ENVIADA") && (
            <div className="mt-4 pt-3 border-t">
              {convite.status_agenda === "RECUSADO" ? (
                <div
                  className="
                        w-full py-2 rounded-lg text-center
                        text-xs font-semibold
                        bg-red-50 text-red-700
                      "
                >
                  ❌ {t("minha_avaliacao.agenda_recusada")}
                </div>
              ) : (
                <div className="w-full py-2 rounded-lg text-center text-xs font-semibold bg-blue-50 text-blue-700">
                  {tipo === "AGENDADO"
                    ? `✅ ${t("minha_avaliacao.agenda_aceita")}`
                    : `📅 ${t("minha_avaliacao.aguardando_agenda")}`}
                </div>
              )}
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {t("minha_avaliacao.enviado_em")}{" "}
            {tipo === "PENDENTE" || tipo === "CONVITE_ACEITO"
              ? formatarData(convite.criado_em)
              : tipo === "QUESTIONARIO_ENVIADO"
                ? convite.data_resposta_questionario
                  ? formatarData(convite.data_resposta_questionario)
                  : formatarData(convite.data_envio_formulario)
                : tipo === "AGENDA_ENVIADA"
                  ? formatarData(convite.data_agenda_criacao)
                  : tipo === "AGENDADO"
                    ? formatarData(convite.data_agenda)
                    : formatarData(convite.data_avaliacao)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   PAGE
====================================================== */

export default function AvaliacaoConvites({ perfil }: Props) {
  const { hasPerfilAvaliador, loading } = useAvaliador(perfil);

  const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [convitesPendentes, setConvitesPendentes] = useState<Convite[]>([]);
  const [convitesAceitos, setConvitesAceitos] = useState<Convite[]>([]);
  const [convitesAgendados, setConvitesAgendados] = useState<Convite[]>([]);
  const [convitesFinalizados, setConvitesFinalizados] = useState<Convite[]>([]);

  useEffect(() => {
    fetchConvites();
  }, []);

  const fetchConvites = async () => {
    try {
      setIsLoading(true);

      // 🔹 Convites (ranking)
      const resConvites = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/convites`,
        { credentials: "include" },
      );
      const dataConvites = await resConvites.json();
      // console.log(dataConvites);

      setConvitesPendentes(dataConvites.pendentes || []);

      // 🔹 Avaliações do avaliador
      const resAvaliacoes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/avaliacoes`,
        { credentials: "include" },
      );
      const dataAvaliacoes = await resAvaliacoes.json();

      setConvitesAceitos(dataAvaliacoes.aguardando_agendamento || []);
      setConvitesAgendados(dataAvaliacoes.agendadas || []);
      setConvitesFinalizados(dataAvaliacoes.finalizadas || []);

      // console.log(dataAvaliacoes.finalizadas);
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAceitar = async (id: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/convites/${id}/aceitar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      await fetchConvites();
    } catch (error) {
      console.error("Erro ao aceitar convite", error);
    }
  };

  const handleRecusar = async (id: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/convites/${id}/recusar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      await fetchConvites();
    } catch (error) {
      console.error("Erro ao recusar convite", error);
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

      <div className="flex flex-col flex-1  bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!hasPerfilAvaliador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <PageContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 items-start">
              {/* RECEBIDO */}
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
                <h2 className="text-sm font-semibold text-gray-800 mb-4 text-center border-b pb-2">
                  {t("minha_avaliacao.recebido")} ({convitesPendentes.length})
                </h2>

                <div className="flex flex-col gap-3 pr-1">
                  {convitesPendentes.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.sem_convite")}
                    </p>
                  )}

                  {convitesPendentes.map((convite) => (
                    <ConviteCard
                      key={convite.id}
                      convite={convite}
                      tipo="PENDENTE"
                      onAceitar={handleAceitar}
                      onRecusar={handleRecusar}
                      t={t}
                      perfil={perfil}
                    />
                  ))}
                </div>
              </div>

              {/* ACEITO */}
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
                <h2 className="text-sm font-semibold text-gray-800 mb-4 text-center border-b pb-2">
                  {t("minha_avaliacao.aceito")} ({convitesAceitos.length})
                </h2>

                <div className="flex flex-col gap-3 pr-1">
                  {convitesAceitos.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.sem_aceito")}
                    </p>
                  )}

                  {convitesAceitos.map((convite) => (
                    <ConviteCard
                      key={convite.id}
                      convite={convite}
                      tipo={convite.status}
                      t={t}
                      perfil={perfil}
                    />
                  ))}
                </div>
              </div>

              {/* AGENDADO */}
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
                <h2 className="text-sm font-semibold text-gray-800 mb-4 text-center border-b pb-2">
                  {t("minha_avaliacao.agendado")} ({convitesAgendados.length})
                </h2>

                <div className="flex flex-col gap-3 pr-1">
                  {convitesAgendados.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.sem_agenda")}
                    </p>
                  )}

                  {convitesAgendados.map((convite) => (
                    <ConviteCard
                      key={convite.id}
                      convite={convite}
                      tipo={convite.status}
                      t={t}
                      perfil={perfil}
                    />
                  ))}
                </div>
              </div>

              {/* FINALIZADOS */}
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
                <h2 className="text-sm font-semibold text-gray-800 mb-4 text-center border-b pb-2">
                  {t("minha_avaliacao.finalizado")} (
                  {convitesFinalizados.length})
                </h2>

                <div className="flex flex-col gap-3 pr-1">
                  {convitesFinalizados.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.sem_finalizacao")}
                    </p>
                  )}

                  {convitesFinalizados.map((convite) => (
                    <ConviteCard
                      key={convite.id}
                      convite={convite}
                      tipo={convite.status}
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
