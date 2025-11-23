"use client";

import { useState, useEffect } from "react";
import { ProfileType } from "../../../components/perfil/ProfileContext";
import Sidebar from "../../../components/perfil/Sidebar";
import TopBar from "../../../components/perfil/TopBar";
import SemDados from "../../SemDados";
import JobList from "../../../components/perfil/JobList";
import LoadingOverlay from "../../../components/LoadingOverlay";
// import { useRouter } from "next/navigation";
import Select from "react-select";
import { ImSpinner2 } from "react-icons/im";
import { useTranslation } from "react-i18next";

interface Props {
  perfil: ProfileType;
  hasPerfilCandidato: boolean | null;
  candidatoId: number | null;
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
}

export default function ListaVagas({
  perfil,
  hasPerfilCandidato,
  candidatoId,
}: Props) {
  // const router = useRouter();
  const { t } = useTranslation("common");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasVagas, setHasVaga] = useState<boolean>(false);

  const [sugeridos, setSugeridos] = useState<Job[]>([]);

  const [modalidades, setModalidade] = useState<
    { modalidade_trabalho_id: number; modalidade: string }[]
  >([]);
  const [skills, setSkills] = useState<{ skill_id: number; skill: string }[]>(
    []
  );

  const [filtroModalidade, setFiltroModalidade] = useState("");
  const [filtroSkill, setFiltroSkill] = useState("");
  const [hasVagasFiltro, setHasVagasFiltro] = useState<boolean | null>(null);

  // Função para buscar vagas com os filtros aplicados
  const handleFiltrar = async () => {
    try {
      setIsFiltering(true);

      // const perfilId = perfil === "candidato" ? 2 : perfil === "avaliador" ? 3 : 1;

      // Se não selecionar, envia "todos"
      const modalidadeParam = filtroModalidade || "todos";
      const skillParam = filtroSkill || "todos";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vagas?modalidadeId=${modalidadeParam}&skill=${skillParam}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      setSugeridos(data);
      setHasVagasFiltro(data.length > 0);
    } catch (error) {
      console.error(t("tela_lista_vagas.item_alerta_erro_buscar_dados"), error);
    } finally {
      setIsFiltering(false);
    }
  };

  useEffect(() => {
    if (!hasPerfilCandidato) {
      setLoading(false);
      console.log(candidatoId);
      return;
    }
    setLoading(true);

    const fetchSelectData = async () => {
      try {
        // const perfilId = perfil === "candidato" ? 2 : perfil === "avaliador" ? 3 : 1;

        const [modalidadeRes, skillsRes, sugeridosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/modalidades/`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/filtro`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vagas/`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        const [modalidadeData, skillsData, sugeridosData] = await Promise.all([
          modalidadeRes.json(),
          skillsRes.json(),
          sugeridosRes.json(),
        ]);
        // console.log(sugeridosData);
        setModalidade(modalidadeData);
        setSkills(skillsData);
        setSugeridos(sugeridosData);
        setHasVaga(sugeridosData.length >= 0);
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

        {!hasPerfilCandidato ? (
          <SemDados tipo="perfil" perfil={perfil} />
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
                        placeholder={t("tela_lista_vagas.item_msg_modalidades")}
                        value={
                          filtroModalidade
                            ? {
                                value: filtroModalidade,
                                label:
                                  modalidades.find(
                                    (e) =>
                                      String(e.modalidade_trabalho_id) ===
                                      filtroModalidade
                                  )?.modalidade || "",
                              }
                            : {
                                value: "",
                                label: t(
                                  "tela_lista_vagas.item_msg_modalidades"
                                ),
                              }
                        }
                        onChange={(option) =>
                          setFiltroModalidade(
                            option ? String(option.value) : ""
                          )
                        }
                        options={[
                          {
                            value: "",
                            label: t("tela_lista_vagas.item_msg_modalidades"),
                          },
                          ...modalidades.map((mod) => ({
                            value: String(mod.modalidade_trabalho_id),
                            label: mod.modalidade,
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
                </div>

                {hasVagasFiltro || hasVagasFiltro === null ? (
                  <div className="grid grid-cols-1  gap-6">
                    {sugeridos.length >= 0 && (
                      <JobList
                        title=""
                        jobs={sugeridos}
                        perfil={perfil}
                        colorClass="bg-purple-100 text-purple-700"
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
