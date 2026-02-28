"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
// import { Star } from "lucide-react";

interface Props {
  perfil: ProfileType;
}

interface Convite {
  id: number;
  candidato_nome: string;
  localizacao: string;
  skill: string;
  peso?: number; // 10 a 100
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
}: {
  convite: Convite;
  tipo: "PENDENTE" | "ACEITO" | "AGENDADO";
  onAceitar?: (id: number) => void;
  onRecusar?: (id: number) => void;
}) {
  const pesoNota = convite.peso ? convite.peso / 10 : 0;

  const getPesoColor = () => {
    if (!convite.peso) return "bg-gray-300";
    if (convite.peso >= 80) return "bg-green-500";
    if (convite.peso >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusColor = () => {
    switch (tipo) {
      case "PENDENTE":
        return "bg-amber-400";
      case "ACEITO":
        return "bg-emerald-500";
      case "AGENDADO":
        return "bg-blue-500";
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
                <span className="text-xs text-gray-500">Peso</span>
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
              📅 {new Date(convite.data_agenda).toLocaleString()}
            </p>
          )}
        </div>

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
                Rejeitar
              </button>

              <button
                onClick={() => onAceitar?.(convite.id)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer
                         bg-green-600 text-white
                         hover:bg-green-700 transition"
              >
                Aceitar
              </button>
            </div>
          )}
          {tipo === "ACEITO" && (
            <div className="mt-4 pt-3 border-t">
              <div className="w-full py-2 rounded-lg text-center text-xs font-semibold bg-yellow-50 text-yellow-700">
                ⏳ Aguardando agendamento
              </div>
            </div>
          )}

          {tipo === "AGENDADO" && (
            <div className="mt-4 pt-3 border-t">
              <div className="w-full py-2 rounded-lg text-center text-xs font-semibold bg-blue-50 text-blue-700">
                📅 Aguardando finalização
              </div>
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {tipo === "PENDENTE" ? "Enviado em" : "Aceito em"}{" "}
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [convitesPendentes, setConvitesPendentes] = useState<Convite[]>([]);
  const [convitesAceitos, setConvitesAceitos] = useState<Convite[]>([]);
  const [convitesAgendados, setConvitesAgendados] = useState<Convite[]>([]);

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

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 overflow-y-auto bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        <main className="p-6 w-[98%] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUNA 1 */}
            <div>
              <h2 className="font-bold text-gray-800 mb-4 text-center">
                Convites Recebidos ({convitesPendentes.length})
              </h2>

              <div className="space-y-4 flex flex-col items-center">
                {convitesPendentes.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Nenhum convite pendente
                  </p>
                )}

                {convitesPendentes.map((convite) => (
                  <ConviteCard
                    key={convite.id}
                    convite={convite}
                    tipo="PENDENTE"
                    onAceitar={handleAceitar}
                    onRecusar={handleRecusar}
                  />
                ))}
              </div>
            </div>

            {/* COLUNA 2 */}
            <div>
              <h2 className="font-bold text-gray-800 mb-4 text-center">
                Aceitos ({convitesAceitos.length})
              </h2>

              <div className="space-y-4 flex flex-col items-center">
                {convitesAceitos.length === 0 && (
                  <p className="text-sm text-gray-400">Nenhum convite aceito</p>
                )}

                {convitesAceitos.map((convite) => (
                  <ConviteCard
                    key={convite.id}
                    convite={convite}
                    tipo="ACEITO"
                  />
                ))}
              </div>
            </div>

            {/* COLUNA 3 */}
            <div>
              <h2 className="font-bold text-gray-800 mb-4 text-center">
                Agendados ({convitesAgendados.length})
              </h2>

              <div className="space-y-4 flex flex-col items-center">
                {convitesAgendados.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Nenhum agendamento pendente
                  </p>
                )}

                {convitesAgendados.map((convite) => (
                  <ConviteCard
                    key={convite.id}
                    convite={convite}
                    tipo="AGENDADO"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
