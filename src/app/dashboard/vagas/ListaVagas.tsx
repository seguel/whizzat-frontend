"use client";

import { useState, useEffect } from "react";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import SemDados from "../SemDados";
import JobList from "../../components/perfil/JobList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useRouter } from "next/navigation";

interface Props {
  perfil: ProfileType;
  hasEmpresa: boolean | null;
}

/* interface VagaAPI {
  id: number;
  logo_url: string;
  nome_vaga: string;
  nome_empresa: string;
  cidade: string;
  estado: string;
  pais: string;
  data_cadastro: string;
  qtde_dias_aberta: number;
  pcd?: boolean;
} */

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
}

export default function ListaVagas({ perfil, hasEmpresa }: Props) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasVagas, setHasVaga] = useState<boolean>(false);

  const [sugeridos, setSugeridos] = useState<Job[]>([]);
  const [escolhidos, setEscolhidos] = useState<Job[]>([]);
  const [avaliacao, setAvaliacao] = useState<Job[]>([]);

  const [empresas, setEmpresas] = useState<
    { empresa_id: number; nome_empresa: string }[]
  >([]);
  const [skills, setSkills] = useState<{ skill_id: number; skill: string }[]>(
    []
  );

  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroSkill, setFiltroSkill] = useState("");
  /* 
  function calcularPrazo(dataCadastro: string, dias: number) {
    const data = new Date(dataCadastro);
    data.setDate(data.getDate() + dias);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  } */

  useEffect(() => {
    setLoading(true);

    const fetchSelectData = async () => {
      try {
        const perfilId =
          perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

        const [empresasRes, skillsRes, sugeridosRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/empresas/vinculo/${perfilId}`,
            {
              method: "GET",
              credentials: "include",
            }
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/empresas/vagas-sugeridos/${perfilId}`,
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

        if (sugeridosData.length > 0) setHasVaga(true);

        setEmpresas(empresasData.empresas);
        setSkills(skillsData);
        setSugeridos(sugeridosData);
        setEscolhidos(sugeridosData);
        setAvaliacao(sugeridosData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectData();
  }, [perfil]);

  if (loading) {
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

        {!hasEmpresa ? (
          <SemDados tipo="empresa" />
        ) : (
          <main className="p-4 w-[98%] mx-auto">
            {hasVagas ? (
              <>
                {/* Filtros */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  {/* Grupo de filtros (lado esquerdo) */}
                  <div className="flex flex-wrap gap-4">
                    <select
                      value={filtroEmpresa}
                      onChange={(e) => setFiltroEmpresa(e.target.value)}
                      className="text-sm sm:text-base border border-purple-400 rounded px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 w-auto"
                    >
                      <option value="">Todas as empresas</option>
                      {empresas.map((empresa) => (
                        <option
                          key={empresa.empresa_id}
                          value={empresa.empresa_id}
                        >
                          {empresa.nome_empresa}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filtroSkill}
                      onChange={(e) => setFiltroSkill(e.target.value)}
                      className="text-sm sm:text-base border border-purple-400 rounded px-2 py-1 sm:px-3 sm:py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 w-auto"
                    >
                      <option value="">Todas as Skills</option>
                      {skills.map((sk) => (
                        <option key={sk.skill_id} value={sk.skill}>
                          {sk.skill}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botão alinhado à direita */}
                  <button
                    onClick={() =>
                      router.push(`/dashboard/vagas?perfil=${perfil}&op=N`)
                    }
                    className="px-4 py-2 text-sm font-semibold rounded-full text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                  >
                    + Cadastrar Vagas
                  </button>
                </div>

                {/* Grid de vagas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {sugeridos.length > 0 && (
                    <JobList
                      title={`Candidatos sugeridos: ${sugeridos.length}`}
                      jobs={sugeridos}
                      colorClass="bg-purple-100 text-purple-700"
                    />
                  )}

                  {escolhidos.length > 0 && (
                    <JobList
                      title={`Candidatos escolhidos: ${escolhidos.length}`}
                      jobs={escolhidos}
                      colorClass="bg-purple-200 text-purple-800"
                    />
                  )}
                  {avaliacao.length > 0 && (
                    <JobList
                      title={`Candidatos em avaliação: ${avaliacao.length}`}
                      jobs={avaliacao}
                      colorClass="bg-purple-300 text-purple-900"
                    />
                  )}
                </div>
              </>
            ) : (
              <SemDados tipo="vaga" />
            )}
          </main>
        )}
      </div>
    </div>
  );
}
