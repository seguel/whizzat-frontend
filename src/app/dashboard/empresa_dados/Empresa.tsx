"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Image from "next/image";
import { useRouter } from "next/navigation"; // App Router
import Link from "next/link";
import SemDados from "../SemDados";

interface Props {
  perfil: ProfileType;
  empresaId: string | null;
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

export default function Empresa({
  perfil,
  empresaId,
  recrutadorId,
  hasPerfilRecrutador,
}: Props) {
  const router = useRouter();

  const [hasVagas, setHasVaga] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [empresas, setEmpresas] = useState<EmpresaData[]>([]);
  const [listVagas, setListVagas] = useState<VagaData[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] =
    useState<EmpresaData | null>(null);

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
          if (empresaId && !isNaN(Number(empresaId))) {
            handleSelecionarEmpresa(Number(empresaId));
          } else if (data.empresas.length === 1) {
            setEmpresaSelecionada(data.empresas[0]);
            handleSelecionarEmpresa(Number(data.empresas[0].id));
          } else {
            setEmpresaSelecionada(null);
          }
          setEmpresas(data.empresas);
        }
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmpresas();
  }, [perfil, empresaId]);

  const handleSelecionarEmpresa = async (id: number) => {
    setIsLoading(true);
    // const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;
    try {
      const [empresasRes, vagasRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/${id}/recrutador/${recrutadorId}`,
          {
            method: "GET",
            credentials: "include",
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/lista-vagas-empresa/${id}`,
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
      // console.log(vagasData);
      setEmpresaSelecionada(empresasData);
      setListVagas(vagasData);
      setHasVaga(vagasData.length > 0);

      router.push(`/dashboard/empresa_dados?perfil=${perfil}&id=${id}`);
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
          {!hasPerfilRecrutador ? (
            <SemDados tipo="perfil" perfil={perfil} />
          ) : empresaSelecionada ? (
            <div className="flex flex-col items-start p-4 bg-white rounded-lg shadow-sm w-full min-h-[500px] space-y-6">
              <div className="pt-1 px-1 flex justify-between w-full">
                {/* Esquerda: botão voltar */}
                <div className="flex">
                  <button
                    onClick={() => {
                      setEmpresaSelecionada(null); // limpa estado
                      router.replace(
                        `/dashboard/empresa_dados?perfil=${perfil}`
                      ); // limpa query id
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
                        `/dashboard/empresa_dados?perfil=${perfil}&op=N`
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
                          `/dashboard/empresa_dados?perfil=${perfil}&op=E&id=${empresaSelecionada.id}`
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
                <div className="pt-10 px-4 md:px-5 w-full grid grid-cols-1 md:grid-cols-4 gap-2">
                  {/* Coluna esquerda */}

                  <div className="md:col-span-3 space-y-2">
                    {empresaSelecionada.ativo ? (
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
                        <span className="text-sm  text-green-600">Ativa</span>
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

                        <span className="text-sm  text-gray-600">Inativa</span>
                      </span>
                    )}
                    <h2 className="text-xl font-semibold text-gray-800">
                      {empresaSelecionada.nome_empresa}
                    </h2>
                    <p className="text-sm text-gray-800">
                      {empresaSelecionada.localizacao}
                    </p>
                    <p className="text-sm text-gray-800">
                      {empresaSelecionada.telefone}
                    </p>
                    <p className="text-sm text-gray-800">
                      {empresaSelecionada.website}
                    </p>
                    <p className="text-sm text-gray-800">
                      {empresaSelecionada.email}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {empresaSelecionada.apresentacao ||
                        "Nenhuma apresentação fornecida."}
                    </p>
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
                            `/dashboard/vagas?perfil=${perfil}&op=N&id=${empresaSelecionada.id}`
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
                            href={`/dashboard/vagas?perfil=${perfil}&vagaid=${job.vaga_id}&id=${empresaSelecionada.id}`}
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
          ) : (
            empresas && (
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
                      key={empresa.id}
                      className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer transition border-2 ${
                        empresa.ativo ? "border-green-500" : "border-gray-400"
                      }`}
                      onClick={() => handleSelecionarEmpresa(empresa.id)}
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
                            Sem logo
                          </div>
                        )}
                      </div>

                      {/* Nome + dados */}
                      <h3 className="text-md font-semibold text-center text-gray-800">
                        {empresa.nome_empresa}
                      </h3>
                      <p className="text-sm text-center text-gray-500 mt-1">
                        {empresa.email || "sem email"}
                      </p>
                      <p className="text-sm text-center text-gray-500">
                        {empresa.telefone || "sem telefone"}
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
                          <span className="text-sm  text-green-600">Ativa</span>
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
                            Inativa
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
