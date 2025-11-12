"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Image from "next/image";
import { useRouter } from "next/navigation"; // App Router
import SemDados from "../SemDados";
import { useTranslation } from "react-i18next";

interface Props {
  perfil: ProfileType;
  recrutadorId: string | null;
  hasPerfilRecrutador: boolean;
}

interface EmpresaData {
  id: number;
  nome_empresa: string;
  website?: string;
  email?: string;
  telefone?: string;
  localizacao?: string;
  apresentacao?: string;
  logo?: string;
  imagem_fundo?: string;
  ativo: boolean;
}

export default function EmpresaListar({
  perfil,
  recrutadorId,
  hasPerfilRecrutador,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [empresas, setEmpresas] = useState<EmpresaData[]>([]);

  useEffect(() => {
    if (!hasPerfilRecrutador) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    const fetchEmpresas = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/recrutador/${recrutadorId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();

        if (Array.isArray(data.empresas)) {
          setEmpresas(data.empresas);
        }
      } catch (error) {
        console.error(
          t("tela_lista_empresas.item_alerta_erro_buscar_dados"),
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpresas();
  }, [perfil]);

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
            empresas && (
              <>
                <div className="pt-1 px-1 flex justify-end w-full">
                  {/* Botão cadastrar (direita) */}
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/empresa/criar?perfil=${perfil}&op=N`
                      )
                    }
                    className="px-4 py-2 text-sm font-semibold rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                  >
                    {t("tela_lista_empresas.item_botao_cadastrar")}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {empresas.map((empresa) => (
                    <div
                      key={empresa.id}
                      className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer transition border-2 ${
                        empresa.ativo ? "border-green-500" : "border-gray-400"
                      }`}
                      onClick={() =>
                        router.push(
                          `/dashboard/empresa/detalhe/${empresa.id}?perfil=${perfil}`
                        )
                      }
                    >
                      {/* Logo */}
                      <div className="w-full flex justify-center mb-4">
                        {empresa.logo ? (
                          <Image
                            src={empresa.logo}
                            alt="Logo da empresa"
                            width={64}
                            height={64}
                            className="w-16 h-16 object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-full text-xs text-center">
                            {t("tela_lista_empresas.item_msg_sem_foto")}
                          </div>
                        )}
                      </div>

                      {/* Nome + dados */}
                      <h3 className="text-md font-semibold text-center text-gray-800">
                        {empresa.nome_empresa}
                      </h3>
                      <p className="text-sm text-center text-gray-500 mt-1">
                        {empresa.email ||
                          t("tela_lista_empresas.item_msg_sem_email")}
                      </p>
                      <p className="text-sm text-center text-gray-500">
                        {empresa.telefone ||
                          t("tela_lista_empresas.item_msg_sem_telefone")}
                      </p>

                      {/* Status apenas com texto colorido */}
                      {empresa.ativo ? (
                        <span className="flex items-center  justify-center gap-1">
                          <div className="w-4 h-4 flex items-center justify-center rounded-full bg-green-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-sm  text-green-600">
                            {t("tela_lista_empresas.item_ativo")}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>

                          <span className="text-sm  text-gray-600">
                            {t("tela_lista_empresas.item_inativo")}
                          </span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </main>
      </div>
    </div>
  );
}
