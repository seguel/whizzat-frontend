"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Image from "next/image";
// import { useRouter } from "next/navigation"; // App Router
import SemDados from "../SemDados";
import { toast } from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";
import { useTranslation } from "react-i18next";
import PageContainer from "@/app/components/PageContainer";

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
  const { t } = useTranslation("common");
  // const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [especialistas, setEspecialistas] = useState<EspecialistaData[]>([]);
  const [isSubmitConfirma, setIsSubmitConfirma] = useState(false);
  const [isSubmitRejeita, setIsSubmitRejeita] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<-1 | 0 | 1>(-1);

  const colunas = [
    { titulo: t("tela_lista_avaliadores.item_titulo_aguardando"), filtro: -1 },
    { titulo: t("tela_lista_avaliadores.item_titulo_reprovados"), filtro: 0 },
    { titulo: t("tela_lista_avaliadores.item_titulo_aprovados"), filtro: 1 },
  ] as const;
  const especialistasFiltrados = especialistas.filter(
    (e) => e.status_cadastro === abaAtiva,
  );

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
          },
        );
        const data = await res.json();
        console.log(data);
        setEspecialistas(data);
      } catch (error) {
        console.error(
          t("tela_lista_avaliadores.item_alerta_erro_buscar_dados"),
          error,
        );
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, empresa_id }),
      });

      const data = await response.json();
      console.log(data);

      toast.success(t("tela_lista_avaliadores.item_alerta_sucesso"), {
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error(t("tela_lista_avaliadores.item_alerta_erro_salvar"), {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, empresa_id }),
      });

      const data = await response.json();
      console.log(data);

      toast.success(t("tela_lista_avaliadores.item_alerta_sucesso"), {
        duration: 3000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error(t("tela_lista_avaliadores.item_alerta_erro_salvar"), {
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

      <div className="flex flex-col flex-1 bg-[#F5F6F6] overflow-hidden">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!hasPerfilRecrutador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <PageContainer>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {t("tela_lista_avaliadores.titulo_pagina")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t("tela_lista_avaliadores.subtitulo_pagina")}
              </p>
            </div>
            <div className="flex flex-col flex-1 w-full min-h-[500px] ">
              {/* Abas no mesmo padrão do avaliador/candidato */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {colunas.map((coluna) => {
                    const quantidade = especialistas.filter(
                      (e) => e.status_cadastro === coluna.filtro,
                    ).length;
                    const ativa = abaAtiva === coluna.filtro;

                    return (
                      <button
                        key={coluna.filtro}
                        type="button"
                        onClick={() => setAbaAtiva(coluna.filtro)}
                        aria-pressed={ativa}
                        className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition ${
                          ativa
                            ? "border-purple-600 text-purple-700"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {coluna.titulo}
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                            ativa
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {quantidade}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avaliadores da aba selecionada */}
              {especialistasFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {especialistasFiltrados.map((espec) => (
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
                            {t("tela_lista_avaliadores.item_msg_sem_foto")}
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
                        <p className="text-xs truncate">{espec.nome_empresa}</p>
                        <div className="flex justify-between mt-3 gap-2">
                          {espec.ativo && espec.status_cadastro === -1 ? (
                            <>
                              <button
                                type="button"
                                className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-0.5 px-1 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 cursor-pointer"
                                onClick={() =>
                                  handleClickConfirmar(
                                    espec.id,
                                    espec.empresa_id,
                                  )
                                }
                              >
                                {isSubmitConfirma ? (
                                  <ImSpinner2 className="animate-spin text-lg" />
                                ) : (
                                  t("tela_lista_avaliadores.item_botao_aprovar")
                                )}
                              </button>
                              <button
                                type="button"
                                className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-0.5 px-1 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 cursor-pointer"
                                onClick={() =>
                                  handleClickRejeitar(
                                    espec.id,
                                    espec.empresa_id,
                                  )
                                }
                              >
                                {isSubmitRejeita ? (
                                  <ImSpinner2 className="animate-spin text-lg" />
                                ) : (
                                  t(
                                    "tela_lista_avaliadores.item_botao_reprovar",
                                  )
                                )}
                              </button>
                            </>
                          ) : espec.ativo && espec.status_cadastro === 0 ? (
                            <div className="flex justify-center w-full gap-2">
                              <button
                                type="button"
                                className="flex-1 max-w-[50%] flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-0.5 px-1 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 cursor-pointer"
                                onClick={() =>
                                  handleClickConfirmar(
                                    espec.id,
                                    espec.empresa_id,
                                  )
                                }
                              >
                                {isSubmitConfirma ? (
                                  <ImSpinner2 className="animate-spin text-lg" />
                                ) : (
                                  t("tela_lista_avaliadores.item_botao_aprovar")
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
                                    espec.empresa_id,
                                  )
                                }
                              >
                                {isSubmitRejeita ? (
                                  <ImSpinner2 className="animate-spin text-lg" />
                                ) : (
                                  t(
                                    "tela_lista_avaliadores.item_botao_reprovar",
                                  )
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-6">
                  <p className="text-center text-sm italic text-gray-400">
                    {t("tela_lista_avaliadores.item_msg_sem_especialista")}
                  </p>
                </div>
              )}
            </div>
          </PageContainer>
        )}
      </div>
    </div>
  );
}
