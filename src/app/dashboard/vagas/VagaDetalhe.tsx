"use client";

import { useState, useEffect } from "react";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { Clock, Building2, MapPin, CalendarDays } from "lucide-react";
import SkillsPanel from "../../components/perfil/SkillsPanel";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

interface Props {
  perfil: ProfileType;
  empresaId: string | null;
  vagaId: string;
}
interface SkillAvaliacao {
  skill_id: number;
  nome?: string;
  peso: number;
  avaliador_proprio: boolean;
}

interface ModalidadeVaga {
  modalidade_id: number;
  modalidade: string;
}

interface PeriodoVaga {
  periodo_id: number;
  periodo: string;
}

interface EmpresaVaga {
  nome_empresa: string;
  logo: string;
}

interface VagaData {
  vaga_id: number;
  empresa_id: number;
  empresa: EmpresaVaga;
  nome_vaga: string;
  descricao: string;
  local_vaga: string;
  modalidade_trabalho_id: string;
  periodo_trabalho_id: string;
  modalidade_trabalho: ModalidadeVaga;
  periodo_trabalho: PeriodoVaga;
  pcd: boolean;
  qtde_dias_aberta: number;
  qtde_posicao: number;
  skills: SkillAvaliacao[];
  data_cadastro: string;
  logo: string;
  prazo: string;
}

export default function VagaDetalhes({ perfil, empresaId, vagaId }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [vaga, setVaga] = useState<VagaData | null>(null);
  const [loadingVagaEmpresa, setLoadingVagaEmpresa] = useState<boolean>(false);
  const [diasDisponiveis, setDiasDisponiveis] = useState(0);
  const [quantidadeVagas, setQuantidadeVagas] = useState(0);

  useEffect(() => {
    if (!vagaId) return;

    const fetchVaga = async () => {
      const perfilId =
        perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

      if (!empresaId || !vagaId) {
        console.warn("empresaId ou vagaId não informado");
        return;
      }

      setLoadingVagaEmpresa(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/vaga/${vagaId}/empresa/${empresaId}/perfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Erro ao buscar dados da vaga");

        const data = await res.json();
        setVaga(data);
      } catch (error) {
        console.error("Erro ao carregar vaga:", error);
        toast.error("Problemas ao carregar dados da vaga. Tente novamente.", {
          duration: 5000,
        });
      } finally {
        setLoadingVagaEmpresa(false);
      }
    };

    fetchVaga();
  }, [vagaId]);

  if ((vagaId || empresaId) && loadingVagaEmpresa) {
    return <LoadingOverlay />;
  }

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
          <div className="flex flex-col items-start p-4 bg-white rounded-lg shadow-sm w-full min-h-[500px]">
            <div className="w-full h-full flex flex-col">
              {/* <div className="pt-1 px-1 flex justify-between w-full mb-4">
                {/* Botão voltar (esquerda) 
                <Link href={`/dashboard/vagas?perfil=${perfil}`}>
                  <button className="px-4 py-2 text-sm rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer">
                    ← Voltar para lista de vagas
                  </button>
                </Link>
              </div> */}

              {/* Container Principal */}
              <div className="flex flex-col md:flex-row  w-full ">
                {/* Coluna Esquerda */}
                <div className="flex flex-col md:flex-row w-full">
                  {/* Dados da vaga e skills lado a lado */}
                  {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-yellow-500"> */}
                  {/* Bloco - Informações da vaga */}
                  <div className="w-full lg:w-[65%] space-y-4 mr-2">
                    {/* Linha 1 - Logo + Título da vaga e empresa */}
                    <div className="flex flex-col gap-4">
                      {/* Logo e título + empresa ocupando toda largura */}
                      <div className="flex flex-row w-full gap-4 items-center">
                        {/* Logo */}
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white shrink-0">
                          {vaga?.empresa?.logo ? (
                            <Image
                              src={vaga?.empresa?.logo}
                              alt="Logo da empresa"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="text-xs text-gray-400 text-center px-2">
                              Sem logo
                            </div>
                          )}
                        </div>

                        {/* Título e empresa */}
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">
                            {vaga?.nome_vaga}
                          </h2>
                          <p className="text-sm text-gray-500">
                            <Link
                              className="hover:underline"
                              href={`/dashboard/empresa_dados?perfil=${perfil}&id=${empresaId}`}
                            >
                              {vaga?.empresa?.nome_empresa}
                            </Link>
                          </p>
                        </div>
                      </div>

                      {/* Data de vigência abaixo */}
                      <div className="flex items-center gap-2 bg-purple-100 text-purple-800 rounded-md px-1 py-1 text-sm w-fit">
                        <CalendarDays className="w-4 h-4 text-purple-500" />
                        <span>
                          Vigência até: <strong>{vaga?.prazo}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Linha 1 - Local e Data de Cadastro */}
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2">
                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                        {vaga?.local_vaga || "Local não informado"}
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
                        Aberta em:{" "}
                        {vaga?.data_cadastro
                          ? new Date(vaga?.data_cadastro).toLocaleDateString(
                              "pt-BR"
                            )
                          : "Data não informada"}
                      </div>
                    </div>

                    {/* Linha 2 - Período e Modalidade */}
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                        {vaga?.periodo_trabalho?.periodo ||
                          "Período não informado"}
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                        {vaga?.modalidade_trabalho?.modalidade ||
                          "Modalidade não informada"}
                      </div>
                    </div>

                    {/* Linha 3 - Aberta em e PCD */}
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                      <div className="w-full sm:w-1/2">
                        {vaga?.pcd && (
                          <span role="img" aria-label="acessível">
                            ♿ Vaga para PCD
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Linha 4 - Descrição */}
                    <div>
                      <h3 className="text-md font-semibold text-gray-700 mb-1">
                        Descrição
                      </h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {vaga?.descricao}
                      </p>
                    </div>

                    {/* Linha 5 - Vigência */}
                  </div>

                  {/* Bloco - Lista de Skills */}
                  <div className="w-full sm:w-[30%] flex flex-col mt-2">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">
                      Skills e pesos
                    </h3>

                    <ul className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                      {vaga?.skills?.map((skill, index) => (
                        <li
                          key={index}
                          className="border border-purple-300 bg-purple-50 px-4 py-3 rounded-md flex flex-col justify-between"
                        >
                          {/* Linha 1: nome da skill e peso */}
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-light">
                              {skill.nome}
                            </span>
                            <span className="text-xs text-[#808080]">
                              Peso: {skill.peso / 10}/10
                            </span>
                          </div>

                          {/* Linha 2: barra de score */}
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{
                                width: `${(skill.peso / 10) * 10}%`,
                              }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* </div> */}
                </div>

                {/* Coluna Direita - Gráficos */}
                <div className="w-full md:w-100 flex flex-col gap-4 md:items-end">
                  <SkillsPanel skills={vaga?.skills} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
