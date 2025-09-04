"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Image from "next/image";
import { useRouter } from "next/navigation"; // App Router
// import { getFileUrl } from "../../util/getFileUrl";

interface Props {
  perfil: ProfileType;
  empresaId: number | null;
}

interface EmpresaData {
  empresa_id: number;
  nome_empresa: string;
  email?: string;
  telefone?: string;
  apresentacao?: string;
  logo?: string;
  imagem_fundo?: string;
}

export default function Empresa({ perfil, empresaId }: Props) {
  const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [empresas, setEmpresas] = useState<EmpresaData[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] =
    useState<EmpresaData | null>(null);

  useEffect(() => {
    const perfilId =
      perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    const fetchEmpresas = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/vinculo/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (Array.isArray(data.empresas)) {
          setEmpresas(data.empresas);
          if (data.empresas.length === 1) {
            setEmpresaSelecionada(data.empresas[0]);
          } else {
            if (empresaId && !isNaN(Number(empresaId))) {
              handleSelecionarEmpresa(Number(empresaId));
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpresas();
  }, [perfil]);

  const handleSelecionarEmpresa = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/empresas/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      setEmpresaSelecionada(data);
    } catch (error) {
      console.error("Erro ao buscar dados da empresa:", error);
    } finally {
      setIsLoading(false);
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
          {/* Caso tenha empresa selecionada */}
          {empresaSelecionada ? (
            <div className="flex flex-col items-start p-4 bg-white rounded-lg shadow-sm w-full min-h-[500px] space-y-6">
              <div className="pt-1 px-1 flex justify-between w-full">
                {/* Botão voltar (esquerda) */}
                <button
                  onClick={() => setEmpresaSelecionada(null)}
                  className="px-4 py-2 text-sm rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                >
                  ← Voltar para lista de empresas
                </button>

                {/* Botão cadastrar (direita) */}
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/empresa_dados?perfil=${perfil}&op=N`
                    )
                  }
                  className="px-4 py-2 text-sm font-semibold rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                >
                  + Cadastrar Empresa
                </button>
              </div>

              {/* Capa e logo */}
              <div className="w-full space-y-6 min-h-[100%] flex flex-col">
                <div className="relative w-full h-20 sm:h-24 md:h-36 rounded-lg bg-gray-100 z-0">
                  {empresaSelecionada.imagem_fundo ? (
                    <Image
                      src={empresaSelecionada.imagem_fundo}
                      alt="Imagem de capa"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized // opcional, se estiver usando imagens externas sem loader
                    />
                  ) : (
                    /* 
                    <img
                      src={empresaSelecionada.capaPreview}
                      alt="Imagem de capa"
                      className="w-full h-full object-cover"
                    /> */
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sem imagem de capa
                    </div>
                  )}

                  {/* Logo sobreposto */}
                  <div className="absolute left-6 top-full -translate-y-2/3 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden border-4 border-white z-10">
                    {empresaSelecionada.logo ? (
                      <Image
                        src={empresaSelecionada.logo}
                        alt="Logo da empresa"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized // opcional, se estiver usando imagens externas sem loader
                      />
                    ) : (
                      /* <img
                        src={empresaSelecionada.logoPreview}
                        alt="Logo da empresa"
                        className="w-full h-full object-contain"
                      /> */
                      <div className="text-xs text-gray-400 text-center px-2">
                        Sem logo
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações + Vagas */}
                <div className="pt-10 px-4 md:px-8 w-full grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Coluna esquerda */}
                  <div className="md:col-span-3 space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {empresaSelecionada.nome_empresa}
                    </h2>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {empresaSelecionada.apresentacao ||
                        "Nenhuma apresentação fornecida."}
                    </p>
                  </div>

                  {/* Coluna direita */}
                  <div className="flex flex-col items-start justify-start space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Vagas
                    </h3>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/vagas?perfil=${perfil}&op=N&id=${empresaSelecionada.empresa_id}`
                        )
                      }
                      className="px-4 py-2 rounded-full text-sm font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                    >
                      Cadastrar Vaga
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Caso tenha múltiplas empresas
            <>
              <div className="pt-1 px-1 flex justify-end w-full">
                {/* Botão cadastrar (direita) */}
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/empresa_dados?perfil=${perfil}&op=N`
                    )
                  }
                  className="px-4 py-2 text-sm font-semibold rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                >
                  + Cadastrar Empresa
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {empresas.map((empresa) => (
                  <div
                    key={empresa.empresa_id}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer transition"
                    onClick={() => handleSelecionarEmpresa(empresa.empresa_id)}
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
                          unoptimized // opcional, se estiver usando imagens externas sem loader
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-full text-xs text-center">
                          Sem logo
                        </div>
                      )}
                    </div>

                    <h3 className="text-md font-semibold text-center text-gray-800">
                      {empresa.nome_empresa}
                    </h3>
                    <p className="text-sm text-center text-gray-500 mt-1">
                      {empresa.email || "sem email"}
                    </p>
                    <p className="text-sm text-center text-gray-500">
                      {empresa.telefone || "sem telefone"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
