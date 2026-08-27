"use client";

import { useState, useEffect } from "react";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { Clock, Building2, CalendarDays } from "lucide-react";
import SkillsPanel from "../../components/perfil/SkillsPanel";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import PageContainer from "@/app/components/PageContainer";

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

type TipoOportunidade = "AMPLA_CONCORRENCIA" | "AFIRMATIVA" | "EXCLUSIVA";

type PublicoAfirmativo =
  | "PCD"
  | "AFIRMATIVA_RACIAL"
  | "LGBTQIA"
  | "MULHERES"
  | "CINQUENTA_MAIS"
  | "DIVERSIDADE";

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
  tipo_oportunidade: TipoOportunidade;
  publicos_afirmativos: PublicoAfirmativo[];
  qtde_dias_aberta: number;
  qtde_posicao: number;
  skills: SkillAvaliacao[];
  data_cadastro: string;
  logo: string;
  prazo: string;
  ativo: boolean;
  estado_label: string;
  cidade_label: string;
}

export default function VagaDetalhes({ perfil, empresaId, vagaId }: Props) {
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
          },
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

  function getPublicoLabel(
    publico: PublicoAfirmativo,
    t: (key: string) => string,
  ) {
    switch (publico) {
      case "PCD":
        return t("tela_vaga_dados.publico_pcd");

      case "AFIRMATIVA_RACIAL":
        return t("tela_vaga_dados.publico_racial");

      case "LGBTQIA":
        return t("tela_vaga_dados.publico_lgbtqia");

      case "MULHERES":
        return t("tela_vaga_dados.publico_mulheres");

      case "CINQUENTA_MAIS":
        return t("tela_vaga_dados.publico_50mais");

      case "DIVERSIDADE":
        return t("tela_vaga_dados.publico_diversidade");
    }
  }

  if (!vagaId || !empresaId || loadingVagaEmpresa) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 bg-[#F5F6F6] min-h-screen">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />
        <div className="flex-1 overflow-y-auto">
          <PageContainer>
            <div className="flex flex-col flex-1 w-full min-h-[500px] ">
              <div className="pt-1 px-1 flex justify-between w-full mb-4">
                {/* Esquerda: botão voltar */}
                <div className="flex mb-1">
                  <button
                    onClick={() => {
                      router.replace(`/dashboard/vagas?perfil=${perfil}`); // limpa query id
                    }}
                    className="px-4 py-2 text-sm rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                  >
                    {t("tela_vaga_dados.item_botao_lista_vagas")}
                  </button>
                </div>

                {/* Direita: botões cadastrar e editar */}
                <div className="flex gap-2">
                  {perfil === "recrutador" && (
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/vagas?perfil=${perfil}&op=E&vagaid=${vagaId}&id=${empresaId}`,
                        )
                      }
                      className="px-4 py-2 text-sm font-semibold rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                    >
                      {t("tela_vaga_dados.item_botao_editar")}
                    </button>
                  )}
                </div>
              </div>
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

                      <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2">
                        {/* Estado */}
                        <div className="flex items-center gap-2 w-full sm:w-1/2">
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
                              d="M9 3l6 2 6-2v13l-6 2-6-2-6 2V5l6-2z"
                            />
                          </svg>
                          {vaga?.estado_label}
                        </div>

                        {/* Cidade */}
                        <div className="flex items-center gap-2 w-full sm:w-1/2">
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
                              d="M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z"
                            />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {vaga?.cidade_label}
                        </div>
                      </div>

                      {/* Linha 1 - Local e Data de Cadastro */}
                      <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2">
                        <div className="flex items-center gap-2 w-full sm:w-1/2">
                          <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
                          {t("tela_vaga_dados.item_msg_aberta")}{" "}
                          {vaga?.data_cadastro
                            ? new Date(vaga?.data_cadastro).toLocaleDateString(
                                "pt-BR",
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

                      {/* Tipo de oportunidade */}
                      <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {t("tela_vaga_dados.tipo_oportunidade_titulo")}
                            </h3>

                            <p className="text-xs text-gray-500 mt-1">
                              {t(
                                "tela_vaga_dados.tipo_oportunidade_detalhe_msg",
                              )}
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                              vaga?.tipo_oportunidade === "AMPLA_CONCORRENCIA"
                                ? "bg-gray-100 text-gray-700"
                                : vaga?.tipo_oportunidade === "AFIRMATIVA"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {vaga?.tipo_oportunidade === "AMPLA_CONCORRENCIA"
                              ? t("tela_vaga_dados.tipo_ampla")
                              : vaga?.tipo_oportunidade === "AFIRMATIVA"
                                ? t("tela_vaga_dados.tipo_afirmativa")
                                : t("tela_vaga_dados.tipo_exclusiva")}
                          </span>
                        </div>

                        {vaga?.tipo_oportunidade !== "AMPLA_CONCORRENCIA" &&
                          (vaga?.publicos_afirmativos?.length ?? 0) > 0 && (
                            <div className="mt-4 pt-4 border-t border-purple-100">
                              <p className="text-xs font-medium text-gray-600 mb-2">
                                {t("tela_vaga_dados.publico_afirmativo_titulo")}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {vaga?.publicos_afirmativos?.map((publico) => (
                                  <span
                                    key={publico}
                                    className="inline-flex items-center rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-700"
                                  >
                                    {getPublicoLabel(publico, t)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
          </PageContainer>
        </div>
      </div>
    </div>
  );
}
