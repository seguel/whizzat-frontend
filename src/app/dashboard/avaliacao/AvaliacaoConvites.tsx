"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import { useAvaliador } from "../../lib/hooks/useAvaliador";
import SemDados from "../SemDados";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import PageContainer from "@/app/components/PageContainer";
import Link from "next/link";

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
  status: "PENDENTE" | "ACEITO" | "AGENDADO" | "FINALIZADO";
  criado_em: string;
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
  tipo: "PENDENTE" | "ACEITO" | "AGENDADO" | "FINALIZADO";
  onAceitar?: (id: number) => void;
  onRecusar?: (id: number) => void;
  t: TFunction;
  perfil: ProfileType;
}) {
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

  const getStatusColor = () => {
    switch (tipo) {
      case "PENDENTE":
        return "bg-amber-400";
      case "ACEITO":
        return "bg-blue-500";
      case "AGENDADO":
        return "bg-yellow-500";
      case "FINALIZADO":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div
      className="relative bg-white rounded-xl border shadow-sm
                 w-full max-w-[260px] min-h-[230px]
                 flex flex-col
                 hover:shadow-md hover:-translate-y-0.5
                 transition-all duration-300
                 overflow-hidden"
    >
      {/* Barra lateral fixa */}
      <div
        className={`absolute left-0 top-0 h-full w-1.5 ${getStatusColor()}`}
      />

      {/* Conteúdo */}
      <div className="p-4 pl-5 flex flex-col h-full ">
        {/* BLOCO QUE CRESCE */}
        <Link
          className="cursor-pointer"
          href={`/dashboard/avaliacao/${convite.id}?perfil=${perfil}`}
        >
          <div className="flex-1">
            {/* TOPO */}
            <div className="flex items-start gap-3">
              <img
                src={convite.logo || "/avatar-placeholder.png"}
                alt={convite.candidato_nome}
                className="w-12 h-12 rounded-full object-cover border"
              />

              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {convite.candidato_nome}
                </h3>
                <span className="font-normal text-gray-800 text-xs">
                  {convite.localizacao}
                </span>

                <div className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-medium w-fit">
                  {convite.skill}
                </div>
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
                      width: `${convite.peso}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {convite.data_agenda && (
              <p className="text-[11px] text-blue-600 mt-3">
                📅 {new Date(convite.data_agenda).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </Link>
        <div className="absolute bottom-1 left-4 w-[90%]">
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
          {tipo === "ACEITO" && (
            <div className="mt-4 pt-3 border-t">
              <div className="w-full py-2 rounded-lg text-center text-xs font-semibold bg-yellow-50 text-yellow-700">
                ⏳ {t("minha_avaliacao.aguardando_avaliacao")}
              </div>
            </div>
          )}

          {tipo === "AGENDADO" && (
            <div className="mt-4 pt-3 border-t">
              <div className="w-full py-2 rounded-lg text-center text-xs font-semibold bg-blue-50 text-blue-700">
                📅 {t("minha_avaliacao.aguardando_finalizacao")}
              </div>
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {tipo === "PENDENTE"
              ? t("minha_avaliacao.enviado_em")
              : t("minha_avaliacao.aceito_em")}{" "}
            {new Date(convite.criado_em).toLocaleString()}
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
              {/* RECEBIDO */}
              <div className="flex flex-col bg-white shadow-SM rounded-xl border p-4 h-[80vh]">
                <h2 className="font-semibold text-gray-800 mb-4 text-center border-b pb-2">
                  {t("minha_avaliacao.recebido")} ({convitesPendentes.length})
                </h2>

                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
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
              <div className="flex flex-col bg-white shadow-SM rounded-xl border p-4 h-[80vh]">
                <h2 className="font-semibold text-gray-800 mb-4 text-center border-b pb-2">
                  {t("minha_avaliacao.aceito")} ({convitesAceitos.length})
                </h2>

                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                  {convitesAceitos.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.sem_aceito")}
                    </p>
                  )}

                  {convitesAceitos.map((convite) => (
                    <ConviteCard
                      key={convite.id}
                      convite={convite}
                      tipo="ACEITO"
                      t={t}
                      perfil={perfil}
                    />
                  ))}
                </div>
              </div>

              {/* AGENDADO */}
              <div className="flex flex-col bg-white shadow-SM rounded-xl border p-4 h-[80vh]">
                <h2 className="font-semibold text-gray-800 mb-4 text-center border-b pb-2">
                  {t("minha_avaliacao.agendado")} ({convitesAgendados.length})
                </h2>

                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                  {convitesAgendados.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.sem_agenda")}
                    </p>
                  )}

                  {convitesAgendados.map((convite) => (
                    <ConviteCard
                      key={convite.id}
                      convite={convite}
                      tipo="AGENDADO"
                      t={t}
                      perfil={perfil}
                    />
                  ))}
                </div>
              </div>

              {/* FINALIZADOS */}
              <div className="flex flex-col bg-white shadow-SM rounded-xl border p-4 h-[80vh]">
                <h2 className="font-semibold text-gray-800 mb-4 text-center border-b pb-2">
                  {t("minha_avaliacao.finalizado")} (
                  {convitesFinalizados.length})
                </h2>

                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                  {convitesFinalizados.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      {t("minha_avaliacao.sem_finalizacao")}
                    </p>
                  )}

                  {convitesFinalizados.map((convite) => (
                    <ConviteCard
                      key={convite.id}
                      convite={convite}
                      tipo="FINALIZADO"
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
