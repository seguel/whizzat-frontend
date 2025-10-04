"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../../../components/perfil/Sidebar";
import TopBar from "../../../../components/perfil/TopBar";
import { ProfileType } from "../../../../components/perfil/ProfileContext";
/* import { useAuthGuard } from "../../lib/hooks/useAuthGuard";*/
import LoadingOverlay from "../../../../components/LoadingOverlay";
// import { FaCloudUploadAlt } from "react-icons/fa";
// import { ImSpinner2 } from "react-icons/im";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EmpresaDadosProps {
  perfil: ProfileType;
  empresaId: string | null;
  recrutadorId: string | null;
  hasPerfilRecrutador: boolean;
}

interface EmpresaData {
  id: number;
  nome_empresa: string;
  email?: string;
  website?: string;
  telefone?: string;
  localizacao: string;
  apresentacao?: string;
  logo?: string;
  imagem_fundo?: string;
  ativo: boolean;
}

interface VagaData {
  vaga_id: number;
  empresa_id: number;
  nome_vaga: string;
  descricao: string;
  local_vaga: string; // 👈 ajustar para casar com o back
  pcd: boolean;
  qtde_dias_aberta: number;
  qtde_posicao: number;
  data_cadastro: string;
  modalidade_trabalho: {
    modalidade_trabalho_id: number;
    modalidade: string;
    ativo: boolean;
  };
  periodo_trabalho: {
    periodo_trabalho_id: number;
    periodo: string;
    ativo: boolean;
  };
  nome_empresa: string;
  logo: string;
  prazo: string;
  ativo: boolean;
}

export default function EmpresaDetalhe({
  perfil,
  empresaId,
  recrutadorId,
  hasPerfilRecrutador,
}: EmpresaDadosProps) {
  const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [empresas, setEmpresas] = useState<EmpresaData>();
  const [listVagas, setListVagas] = useState<VagaData[]>([]);
  const [hasVagas, setHasVaga] = useState<boolean>(false);

  useEffect(() => {
    if (!hasPerfilRecrutador) {
      setIsLoading(false);
      return;
    }

    const fetchEmpresas = async () => {
      setIsLoading(true);
      // const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;
      try {
        const [empresasRes, vagasRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/empresas/${empresaId}/recrutador/${recrutadorId}`,
            {
              method: "GET",
              credentials: "include",
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/empresas/lista-vagas-empresa/${empresaId}`,
            {
              method: "GET",
              credentials: "include",
            }
          ),
        ]);

        const [empresasData, vagasData] = await Promise.all([
          empresasRes.json(),
          vagasRes.json(),
        ]);
        // console.log(empresasData);
        setEmpresas(empresasData);
        setListVagas(vagasData);
        setHasVaga(vagasData.length > 0);
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpresas();
  }, [perfil, empresaId]);

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
          <div className="flex flex-col items-start p-4 bg-white rounded-lg shadow-sm w-full min-h-[500px] space-y-6">
            <div className="pt-1 px-1 flex justify-between w-full">
              {/* Esquerda: botão voltar */}
              <div className="flex">
                <button
                  onClick={() => {
                    router.push(`/dashboard/empresa?perfil=${perfil}`); // limpa query id
                  }}
                  className="px-4 py-2 text-sm rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                >
                  ← Voltar para lista de empresas
                </button>
              </div>

              {/* Direita: botões cadastrar e editar */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/empresa/criar?perfil=${perfil}&op=N`
                    )
                  }
                  className="px-4 py-2 text-sm font-semibold rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                >
                  + Cadastrar Empresa
                </button>

                {perfil === "recrutador" && (
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/empresa/editar/${empresas?.id}?perfil=${perfil}&op=E`
                      )
                    }
                    className="px-4 py-2 text-sm font-semibold rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                  >
                    Editar Empresa
                  </button>
                )}
              </div>
            </div>

            {/* Capa e logo */}
            <div className="w-full space-y-6 min-h-[100%] flex flex-col">
              <div className="relative w-full h-20 sm:h-24 md:h-36 rounded-lg bg-gray-100 z-0">
                {empresas?.imagem_fundo ? (
                  <Image
                    src={empresas?.imagem_fundo}
                    alt="Imagem de capa"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized // opcional, se estiver usando imagens externas sem loader
                  />
                ) : (
                  /* 
                    <img
                      src={empresas?.capaPreview}
                      alt="Imagem de capa"
                      className="w-full h-full object-cover"
                    /> */
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sem imagem de capa
                  </div>
                )}

                {/* Logo sobreposto */}
                <div className="absolute left-6 top-full -translate-y-2/3 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden border-4 border-white z-10">
                  {empresas?.logo ? (
                    <Image
                      src={empresas?.logo}
                      alt="Logo da empresa"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized // opcional, se estiver usando imagens externas sem loader
                    />
                  ) : (
                    /* <img
                        src={empresas?.logoPreview}
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
              <div className="pt-10 px-4 md:px-5 w-full grid grid-cols-1 md:grid-cols-4 gap-2">
                {/* Coluna esquerda */}

                <div className="md:col-span-3 space-y-3">
                  {/* Status + Nome */}
                  {empresas?.ativo ? (
                    <span className="flex items-center gap-1">
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
                      <span className="text-sm text-green-600">Ativa</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
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
                      <span className="text-sm text-gray-600">Inativa</span>
                    </span>
                  )}

                  <h2 className="text-xl font-semibold text-gray-800">
                    {empresas?.nome_empresa}
                  </h2>

                  {/* Bloco 2 colunas */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800">
                    {/* Localização */}
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 22s8-4.5 8-12a8 8 0 10-16 0c0 7.5 8 12 8 12z"
                        />
                      </svg>
                      {empresas?.localizacao}
                    </div>

                    {/* Telefone */}
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.2 3.6a1 1 0 01-.272 1.06l-1.516 1.516a11.042 11.042 0 005.292 5.292l1.516-1.516a1 1 0 011.06-.272l3.6 1.2a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C8.477 21 3 15.523 3 9V5z"
                        />
                      </svg>
                      {empresas?.telefone}
                    </div>

                    {/* Website */}
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {/* Globo de internet */}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3a9 9 0 100 18 9 9 0 000-18z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.25 12h19.5M12 2.25c2.25 2.25 3.75 5.25 3.75 9.75s-1.5 7.5-3.75 9.75M12 2.25C9.75 4.5 8.25 7.5 8.25 12s1.5 7.5 3.75 9.75"
                        />
                      </svg>
                      {empresas?.website}
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 25 25"
                        stroke="currentColor"
                      >
                        {/* Envelope */}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                      </svg>
                      {empresas?.email}
                    </div>
                  </div>

                  {/* Apresentação */}
                  <div className="w-[85%] text-sm text-gray-700 whitespace-pre-line mt-3">
                    {empresas?.apresentacao ||
                      "Nenhuma apresentação fornecida."}
                  </div>
                </div>

                {/* Coluna direita */}
                <div className="flex flex-col items-start justify-start space-y-3">
                  <div className="flex flex-row w-full items-center justify-start gap-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Vagas
                    </h3>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/vagas?perfil=${perfil}&op=N&id=${empresas?.id}`
                        )
                      }
                      className="px-4 py-2 rounded-full text-sm font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                    >
                      + Cadastrar Vaga
                    </button>
                  </div>

                  {hasVagas && (
                    <div className="grid grid-cols-1  w-full ">
                      {listVagas?.map((job, idx) => (
                        <Link
                          key={idx}
                          href={`/dashboard/vagas?perfil=${perfil}&vagaid=${job.vaga_id}&id=${empresas?.id}`}
                          className="block w-full mb-2"
                        >
                          <div className="flex flex-row justify-start items-start rounded-lg p-3 sm:p-4 bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-purple-200 transition w-full">
                            {/* Infos */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm break-words">
                                {job.nome_vaga}
                              </h3>
                              <p className="text-xs text-gray-500 break-words">
                                {job.local_vaga}
                              </p>
                              <p className="text-xs text-gray-500 break-words">
                                {job.qtde_posicao}{" "}
                                {job.qtde_posicao > 1 ? "vagas" : "vaga"}
                              </p>

                              {job?.ativo ? (
                                <span className="flex items-center gap-1">
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
                                    Ativa
                                  </span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
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
                                    Inativa
                                  </span>
                                </span>
                              )}

                              <p className="flex items-center justify-center text-xs px-2 py-1 rounded-lg bg-purple-100 mt-2 sm:mt-4 max-w-full">
                                <strong>Aberta até: {job.prazo}</strong>
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
