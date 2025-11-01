"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Image from "next/image";
// import { useRouter } from "next/navigation"; // App Router
import SemDados from "../SemDados";
// import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";

interface Props {
  perfil: ProfileType;
  recrutadorId: number | null;
  hasPerfilRecrutador: boolean;
}

interface EspecialistaData {
  id: number;
  nome_empresa: string;
  empresa_id: number;
  nomeUser: string;
  localizacao?: string;
  logo?: string;
  ativo: boolean;
  status_cadastro: number;
}

export default function EmpresaListar({
  perfil,
  recrutadorId,
  hasPerfilRecrutador,
}: Props) {
  // const { t, i18n } = useTranslation("common");
  // const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [especialistas, setEspecialistas] = useState<EspecialistaData[]>([]);
  const [isSubmitConfirma, setIsSubmitConfirma] = useState(false);
  const [isSubmitRejeita, setIsSubmitRejeita] = useState(false);

  const colunas = [
    { titulo: "Avaliadores Aguardando Confirmação", filtro: -1 },
    { titulo: "Avaliadores Reprovados", filtro: 0 },
    { titulo: "Avaliadores Aprovados", filtro: 1 },
  ] as const;
  // const lng = "pt"; //searchParams.get("lng");

  useEffect(() => {
    if (!hasPerfilRecrutador) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchEspecialistas = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/avaliador/recrutador/${recrutadorId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log(data);
        setEspecialistas(data);
      } catch (error) {
        console.error("Erro ao buscar especialistas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEspecialistas();
  }, [recrutadorId]);

  const handleClickConfirmar = async (id: number, empresa_id: number) => {
    try {
      setIsSubmitConfirma(true);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/avaliador/activate-form`;

      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, empresa_id }),
      });

      const data = await response.json();
      console.log(data);

      toast.success(`Avaliador atualizado com sucesso!`, { duration: 3000 });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error(`Problemas ao tentar executar a operação!`, {
        duration: 3000,
      });
      setIsSubmitConfirma(false);
    }
  };

  const handleClickRejeitar = async (id: number, empresa_id: number) => {
    try {
      setIsSubmitRejeita(true);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/avaliador/reject-form`;

      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, empresa_id }),
      });

      const data = await response.json();
      console.log(data);

      toast.success(`Avaliador atualizado com sucesso!`, { duration: 3000 });

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error(`Problemas ao tentar executar a operação!`, {
        duration: 3000,
      });
      setIsSubmitRejeita(false);
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
      <div className="flex flex-col flex-1 overflow-y-auto transition-all bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        <main className="p-4 grid grid-cols-1 gap-4 w-[98%] mx-auto">
          {!hasPerfilRecrutador ? (
            <SemDados tipo="perfil" perfil={perfil} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {colunas.map((coluna) => {
                const especialistasFiltradas = especialistas.filter(
                  (e) => e.status_cadastro === coluna.filtro
                );

                return (
                  <div key={coluna.filtro}>
                    <h3 className="text-sm font-semibold text-purple-700 bg-purple-100 px-4 py-2 rounded-full inline-block mb-4">
                      {coluna.titulo}
                    </h3>

                    <div className="flex flex-col gap-4">
                      {especialistasFiltradas.length > 0 ? (
                        especialistasFiltradas.map((espec) => (
                          <div
                            key={espec.id}
                            className={`flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md 
                                ${
                                  espec.ativo && espec.status_cadastro === 1
                                    ? "border-green-400"
                                    : !espec.ativo ||
                                      espec.status_cadastro === 0
                                    ? "border-gray-400"
                                    : espec.status_cadastro === -1
                                    ? "border-orange-400"
                                    : ""
                                }
                              `}
                          >
                            {/* Logo */}
                            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {espec.logo ? (
                                <Image
                                  src={espec.logo}
                                  alt={espec.nome_empresa}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <span className="text-[10px] text-gray-400 text-center px-2">
                                  Sem logo
                                </span>
                              )}
                            </div>

                            {/* Infos */}
                            <div className="flex flex-col min-w-0 w-full">
                              <h3 className="font-semibold text-sm break-words">
                                {espec.nomeUser}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">
                                {espec.localizacao}
                              </p>
                              <p className="text-xs truncate">
                                {espec.nome_empresa}
                              </p>
                              <div className="flex justify-between mt-3 gap-2">
                                {espec.ativo && espec.status_cadastro === -1 ? (
                                  <>
                                    <button
                                      type="button"
                                      className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-0.5 px-1 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 cursor-pointer"
                                      onClick={() =>
                                        handleClickConfirmar(
                                          espec.id,
                                          espec.empresa_id
                                        )
                                      }
                                    >
                                      {isSubmitConfirma ? (
                                        <ImSpinner2 className="animate-spin text-lg" />
                                      ) : (
                                        "Aprovar"
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-0.5 px-1 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 cursor-pointer"
                                      onClick={() =>
                                        handleClickRejeitar(
                                          espec.id,
                                          espec.empresa_id
                                        )
                                      }
                                    >
                                      {isSubmitRejeita ? (
                                        <ImSpinner2 className="animate-spin text-lg" />
                                      ) : (
                                        "Reprovar"
                                      )}
                                    </button>
                                  </>
                                ) : espec.ativo &&
                                  espec.status_cadastro === 0 ? (
                                  <div className="flex justify-center w-full gap-2">
                                    <button
                                      type="button"
                                      className="flex-1 max-w-[50%] flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-0.5 px-1 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 cursor-pointer"
                                      onClick={() =>
                                        handleClickConfirmar(
                                          espec.id,
                                          espec.empresa_id
                                        )
                                      }
                                    >
                                      {isSubmitConfirma ? (
                                        <ImSpinner2 className="animate-spin text-lg" />
                                      ) : (
                                        "Aprovar"
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-center w-full gap-2">
                                    <button
                                      type="button"
                                      className="flex-1 max-w-[50%] flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-0.5 px-1 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 cursor-pointer"
                                      onClick={() =>
                                        handleClickRejeitar(
                                          espec.id,
                                          espec.empresa_id
                                        )
                                      }
                                    >
                                      {isSubmitRejeita ? (
                                        <ImSpinner2 className="animate-spin text-lg" />
                                      ) : (
                                        "Reprovar"
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          Nenhum especialista nesta categoria.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
