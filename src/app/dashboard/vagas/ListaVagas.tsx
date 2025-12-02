"use client";

import { useState, useEffect } from "react";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import SemDados from "../SemDados";
import JobList from "../../components/perfil/JobList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { ImSpinner2 } from "react-icons/im";
import { useTranslation } from "react-i18next";

interface Props {
  perfil: ProfileType;
  hasEmpresa: boolean | null;
  hasPerfilRecrutador: boolean | null;
  recrutadorId: number | null;
}

interface Job {
  empresa_id: number;
  vaga_id: number;
  logo: string;
  nome_empresa: string;
  nome_vaga: string;
  localizacao: string;
  data_cadastro: string;
  qtde_dias_aberta: number;
  prazo: string;
  pcd?: boolean;
  lgbtq?: boolean;
  mulheres?: boolean;
  cinquenta_mais?: boolean;
  cidade_label: string;
  estado_sigla: string;
}

export default function ListaVagas({
  perfil,
  hasEmpresa,
  hasPerfilRecrutador,
  recrutadorId,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasVagas, setHasVaga] = useState<boolean>(false);

  const [sugeridos, setSugeridos] = useState<Job[]>([]);
  const [escolhidos, setEscolhidos] = useState<Job[]>([]);
  const [avaliacao, setAvaliacao] = useState<Job[]>([]);

  const [empresas, setEmpresas] = useState<
    { id: number; nome_empresa: string }[]
  >([]);
  const [skills, setSkills] = useState<{ skill_id: number; skill: string }[]>(
    []
  );

  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroSkill, setFiltroSkill] = useState("");
  const [hasVagasFiltro, setHasVagasFiltro] = useState<boolean | null>(null);

  // Função para buscar vagas com os filtros aplicados
  const handleFiltrar = async () => {
    try {
      setIsFiltering(true);

      // const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

      // Se não selecionar, envia "todos"
      const empresaParam = filtroEmpresa || "todos";
      const skillParam = filtroSkill || "todos";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vagas/vagas-abertas/${recrutadorId}?empresaId=${empresaParam}&skill=${skillParam}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      setSugeridos(data);
      setEscolhidos(data);
      setAvaliacao(data);
      setHasVagasFiltro(data.length > 0);
    } catch (error) {
      console.error(t("tela_lista_vagas.item_alerta_erro_buscar_dados"), error);
    } finally {
      setIsFiltering(false);
    }
  };

  useEffect(() => {
    if (!hasPerfilRecrutador || !hasEmpresa) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const fetchSelectData = async () => {
      try {
        // const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

        const [empresasRes, skillsRes, sugeridosRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/empresas/filtro-ativas/${recrutadorId}`,
            {
              method: "GET",
              credentials: "include",
            }
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/filtro`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/vagas/vagas-abertas/${recrutadorId}`,
            {
              method: "GET",
              credentials: "include",
            }
          ),
        ]);

        const [empresasData, skillsData, sugeridosData] = await Promise.all([
          empresasRes.json(),
          skillsRes.json(),
          sugeridosRes.json(),
        ]);
        // console.log(sugeridosData);
        setEmpresas(empresasData.empresas);
        setSkills(skillsData);
        setSugeridos(sugeridosData);
        setEscolhidos(sugeridosData);
        setAvaliacao(sugeridosData);
        setHasVaga(sugeridosData.length > 0);
      } catch (error) {
        console.error(
          t("tela_lista_vagas.item_alerta_erro_buscar_dados"),
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSelectData();
  }, [perfil]);

  if (loading) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!hasPerfilRecrutador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : !hasEmpresa ? (
          <SemDados tipo="empresa" perfil={perfil} />
        ) : (
          <main className="p-4 w-[98%] mx-auto flex-1">
            {hasVagas ? (
              <>
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 w-full">
                  {/* Grupo de filtros à esquerda */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 flex-1 w-full">
                    {/* Filtro Empresa */}
                    <div className="w-full sm:w-[250px]">
                      <Select
                        isClearable
                        placeholder={t("tela_lista_vagas.item_msg_empresas")}
                        value={
                          filtroEmpresa
                            ? {
                                value: filtroEmpresa,
                                label:
                                  empresas.find(
                                    (e) => String(e.id) === filtroEmpresa
                                  )?.nome_empresa || "",
                              }
                            : {
                                value: "",
                                label: t("tela_lista_vagas.item_msg_empresas"),
                              }
                        }
                        onChange={(option) =>
                          setFiltroEmpresa(option ? String(option.value) : "")
                        }
                        options={[
                          {
                            value: "",
                            label: t("tela_lista_vagas.item_msg_empresas"),
                          },
                          ...empresas.map((empresa) => ({
                            value: String(empresa.id),
                            label: empresa.nome_empresa,
                          })),
                        ]}
                        className="text-sm sm:text-base"
                      />
                    </div>

                    {/* Filtro Skill + Botão Filtrar */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 w-full sm:w-auto">
                      <div className="w-full sm:w-[250px]">
                        <Select
                          isClearable
                          placeholder={t("tela_lista_vagas.item_msg_skills")}
                          value={
                            filtroSkill
                              ? {
                                  value: filtroSkill,
                                  label:
                                    skills.find((s) => s.skill === filtroSkill)
                                      ?.skill || "",
                                }
                              : {
                                  value: "",
                                  label: t("tela_lista_vagas.item_msg_skills"),
                                }
                          }
                          onChange={(option) =>
                            setFiltroSkill(option ? String(option.value) : "")
                          }
                          options={[
                            {
                              value: "",
                              label: t("tela_lista_vagas.item_msg_skills"),
                            },
                            ...skills.map((sk) => ({
                              value: sk.skill,
                              label: sk.skill,
                            })),
                          ]}
                          className="text-sm sm:text-base"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleFiltrar}
                        disabled={isFiltering}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                      >
                        {isFiltering ? (
                          <ImSpinner2 className="animate-spin" />
                        ) : (
                          t("tela_lista_vagas.item_botao_filtrar")
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Botão Cadastrar Vagas à direita */}
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/vagas?perfil=${perfil}&op=N`)
                      }
                      className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                    >
                      {t("tela_lista_vagas.item_botao_cadastrar")}
                    </button>
                  </div>
                </div>

                {hasVagasFiltro || hasVagasFiltro === null ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {sugeridos.length > 0 && (
                      <JobList
                        title={`${t(
                          "tela_lista_vagas.item_titulo_sugeridos"
                        )} ${sugeridos.length}`}
                        jobs={sugeridos}
                        perfil={perfil}
                        colorClass="bg-purple-100 text-purple-700"
                      />
                    )}

                    {escolhidos.length > 0 && (
                      <JobList
                        title={`${t(
                          "tela_lista_vagas.item_titulo_escolhidos"
                        )} ${escolhidos.length}`}
                        jobs={escolhidos}
                        perfil={perfil}
                        colorClass="bg-purple-200 text-purple-800"
                      />
                    )}
                    {avaliacao.length > 0 && (
                      <JobList
                        title={`${t(
                          "tela_lista_vagas.item_titulo_avaliacao"
                        )} ${avaliacao.length}`}
                        jobs={avaliacao}
                        perfil={perfil}
                        colorClass="bg-purple-300 text-purple-900"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h2 className="text-lg sm:text-xl font-medium text-gray-700">
                      {t("tela_lista_vagas.item_msg_sem_vagas")}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                      {t("tela_lista_vagas.item_msg_sem_vagas_filtro")}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <SemDados tipo="vaga" perfil={perfil} />
            )}
          </main>
        )}
      </div>
    </div>
  );
}
