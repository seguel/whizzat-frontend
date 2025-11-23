"use client";

import { useState, useEffect } from "react";
import { ProfileType } from "../../../components/perfil/ProfileContext";
import Sidebar from "../../../components/perfil/Sidebar";
import TopBar from "../../../components/perfil/TopBar";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { Clock, Building2, MapPin, CalendarDays } from "lucide-react";
import SkillsPanel from "../../../components/perfil/SkillsPanel";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface Props {
  perfil: ProfileType;
  candidatoId: number | null;
  empresaId: string | undefined;
  vagaId: string;
}
interface SkillAvaliacao {
  skill_id: number;
  nome?: string;
  peso: number;
  avaliador_proprio: boolean;
  tipo_skill_id: number;
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
  lgbtq: boolean;
  mulheres: boolean;
  cinquenta_mais: boolean;
  qtde_dias_aberta: number;
  qtde_posicao: number;
  skills: SkillAvaliacao[];
  data_cadastro: string;
  logo: string;
  prazo: string;
  ativo: boolean;
}

export default function VagaDetalhes({
  perfil,
  empresaId,
  vagaId,
  candidatoId,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [vaga, setVaga] = useState<VagaData | null>(null);
  const [loadingVagaEmpresa, setLoadingVagaEmpresa] = useState<boolean>(true);
  /* const [diasDisponiveis, setDiasDisponiveis] = useState(0);
  const [quantidadeVagas, setQuantidadeVagas] = useState(0); */

  useEffect(() => {
    if (!vagaId) {
      setLoadingVagaEmpresa(false);
      console.log(candidatoId);
      return;
    }

    const fetchVaga = async () => {
      // const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

      if (!empresaId || !vagaId) {
        console.warn("empresaId ou vagaId não informado");
        setLoadingVagaEmpresa(false);
        return;
      }

      setLoadingVagaEmpresa(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vagas/${vagaId}/empresa/${empresaId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok)
          throw new Error(t("tela_vaga_dados.item_alerta_erro_buscar_dados"));

        const data = await res.json();
        setVaga(data);
      } catch (error) {
        console.error("Erro ao carregar vaga:", error);
        toast.error(t("tela_vaga_dados.item_alerta_erro_buscar_dados"), {
          duration: 5000,
        });
      } finally {
        setLoadingVagaEmpresa(false);
      }
    };

    fetchVaga();
  }, [vagaId]);

  if (!vagaId || !empresaId || loadingVagaEmpresa) {
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
            <div className="pt-1 px-1 flex justify-between w-full">
              {/* Esquerda: botão voltar */}
              <div className="flex mb-1">
                <button
                  onClick={() => {
                    router.replace(
                      `/dashboard/candidato/vagas?perfil=${perfil}`
                    ); // limpa query id
                  }}
                  className="px-4 py-2 text-sm rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                >
                  {t("tela_vaga_dados.item_botao_lista_vagas")}
                </button>
              </div>
            </div>
            <div className="w-full h-full flex flex-col">
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
                              {t("tela_vaga_dados.item_msg_sem_foto")}
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
                              href={`/dashboard/empresa/detalhe/${empresaId}?perfil=${perfil}`}
                            >
                              {vaga?.empresa?.nome_empresa}
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2">
                      {/* Data de vigência abaixo */}
                      <div className="flex w-full sm:w-1/2">
                        <div className="flex items-center gap-2 bg-purple-100 text-purple-800 rounded-md px-1 py-1 text-sm w-fit">
                          <CalendarDays className="w-4 h-4 text-purple-500" />
                          <span>
                            {t("tela_vaga_dados.item_msg_vigencia")}{" "}
                            <strong>{vaga?.prazo}</strong>
                          </span>
                        </div>
                      </div>
                      {perfil === "recrutador" && (
                        <div className="flex items-center gap-2 w-full sm:w-1/2">
                          <span className="font-medium">
                            {t("tela_vaga_dados.item_situacao")}
                          </span>
                          {vaga?.ativo ? (
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
                                {t("tela_vaga_dados.item_ativo")}
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
                                {t("tela_vaga_dados.item_inativo")}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Linha 1 - Local e Data de Cadastro */}
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2">
                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                        {vaga?.local_vaga || "Local não informado"}
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
                        {t("tela_vaga_dados.item_msg_aberta")}{" "}
                        {vaga?.data_cadastro
                          ? new Date(vaga?.data_cadastro).toLocaleDateString(
                              "pt-BR"
                            )
                          : t("tela_vaga_dados.item_msg_sem_data")}
                      </div>
                    </div>

                    {/* Linha 2 - Período e Modalidade */}
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                        {vaga?.periodo_trabalho?.periodo ||
                          t("tela_vaga_dados.item_msg_sem_periodo")}
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                        {vaga?.modalidade_trabalho?.modalidade ||
                          t("tela_vaga_dados.item_msg_sem_modalidade")}
                      </div>
                    </div>

                    {/* Linha 3 - Aberta em e PCD */}
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                      <div className="w-full sm:w-1/2">
                        {vaga?.pcd && (
                          <span role="img" aria-label="acessível">
                            ♿ {t("tela_vaga_dados.item_vaga_pcd")}
                          </span>
                        )}
                      </div>
                      <div className="w-full sm:w-1/2">
                        {vaga?.lgbtq && (
                          <span role="img" aria-label="acessível">
                            🏳️‍🌈 {t("tela_vaga_dados.item_vaga_lgbtq")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                      <div className="w-full sm:w-1/2">
                        {vaga?.mulheres && (
                          <span role="img" aria-label="acessível">
                            👩‍💼 {t("tela_vaga_dados.item_vaga_mulheres")}
                          </span>
                        )}
                      </div>
                      <div className="w-full sm:w-1/2">
                        {vaga?.cinquenta_mais && (
                          <span role="img" aria-label="acessível">
                            👴 {t("tela_vaga_dados.item_vaga_50_mais")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Linha 4 - Descrição */}
                    <div>
                      <h3 className="text-md font-semibold text-gray-700 mb-1">
                        {t("tela_vaga_dados.item_label_descricao")}
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
                      {t("tela_vaga_dados.item_label_skill_pesos")}
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
                              {t("tela_vaga_dados.item_label_peso")}{" "}
                              {skill.peso / 10}/10
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
                  <SkillsPanel skills={vaga?.skills} perfil={perfil} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
