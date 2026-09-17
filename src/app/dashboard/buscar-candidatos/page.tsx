"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Select from "react-select";
import { CheckCircle2, Search, Send, Trash2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import Sidebar from "@/app/components/perfil/Sidebar";
import TopBar from "@/app/components/perfil/TopBar";
import PageContainer from "@/app/components/PageContainer";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import PerfilCandidatoModal from "@/app/components/vagas/PerfilCandidatoModal";

import CandidateMatchCard, {
  MatchCandidato,
} from "@/app/components/candidate-match/CandidateMatchCard";

import IgnoreCandidateModal from "@/app/components/candidate-match/IgnoreCandidateModal";
import InviteCandidatesModal, {
  ConviteCandidatosPayload,
} from "@/app/components/candidate-match/InviteCandidatesModal";

/*
 * =========================================================
 * Types
 * =========================================================
 */

type FaixaMatch = "ALTA" | "BOA" | "COMPATIVEL" | "TODOS";

interface Skill {
  skill_id: number;
  skill: string;
  tipo_skill_id: number;
}

interface SkillSelecionada {
  skill_id: number;
  nome: string;
  peso: number;
  tipo_skill_id: number;
}

interface SelectOption {
  value: string;
  label: string;
}

/*
 * =========================================================
 * Page
 * =========================================================
 */

export default function BuscarCandidatosPage() {
  const { t } = useTranslation("common");

  const LIMITE_CONVITES = 10;

  /*
   * -------------------------------------------------------
   * Layout
   * -------------------------------------------------------
   */

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /*
   * -------------------------------------------------------
   * Loading inicial
   * -------------------------------------------------------
   */

  const [loading, setLoading] = useState(true);

  /*
   * -------------------------------------------------------
   * Skills
   * -------------------------------------------------------
   */

  const [skills, setSkills] = useState<Skill[]>([]);

  const [skillsSelecionadas, setSkillsSelecionadas] = useState<
    SkillSelecionada[]
  >([]);

  /*
   * -------------------------------------------------------
   * Configuração da busca
   * -------------------------------------------------------
   */

  const [faixa, setFaixa] = useState<FaixaMatch>("ALTA");
  const [limite, setLimite] = useState(15);

  /*
   * -------------------------------------------------------
   * Resultado
   * -------------------------------------------------------
   */

  const [pesquisou, setPesquisou] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<MatchCandidato[]>([]);

  /*
   * -------------------------------------------------------
   * Seleção
   * -------------------------------------------------------
   */

  const [selecionados, setSelecionados] = useState<number[]>([]);

  /*
   * -------------------------------------------------------
   * Ignorar candidato
   * -------------------------------------------------------
   */

  const [candidatoIgnorar, setCandidatoIgnorar] =
    useState<MatchCandidato | null>(null);

  const [motivoIgnorar, setMotivoIgnorar] = useState("");
  const [ignorando, setIgnorando] = useState(false);

  /*
   * -------------------------------------------------------
   * Perfil candidato
   * -------------------------------------------------------
   */

  const [perfilCandidatoId, setPerfilCandidatoId] = useState<number | null>(
    null,
  );

  const [perfilAberto, setPerfilAberto] = useState(false);
  const [conviteAberto, setConviteAberto] = useState(false);
  const resultadosRef = useRef<HTMLDivElement | null>(null);

  /*
   * =======================================================
   * Carrega skills
   * =======================================================
   */

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/skills/`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar skills.");
        }

        const data = await response.json();

        setSkills(data);
      } catch (error) {
        console.error("Erro ao carregar skills:", error);

        toast.error(t("tela_perfil_recrutador.item_alerta_erro_buscar_dados"));
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [t]);

  useEffect(() => {
    if (!pesquisou) {
      return;
    }

    const timer = window.setTimeout(() => {
      resultadosRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [pesquisou]);

  /*
   * =======================================================
   * Separação Hard / Soft
   * =======================================================
   */

  const hardSkills = skills.filter((skill) => skill.tipo_skill_id === 1);
  const softSkills = skills.filter((skill) => skill.tipo_skill_id === 2);
  const hardSkillsSelecionadas = skillsSelecionadas.filter(
    (skill) => skill.tipo_skill_id === 1,
  );

  const softSkillsSelecionadas = skillsSelecionadas.filter(
    (skill) => skill.tipo_skill_id === 2,
  );

  const podeBuscar = skillsSelecionadas.length > 0 && !buscando;

  /*
   * =======================================================
   * Adicionar skill
   * =======================================================
   */

  const adicionarSkill = (skillId: number) => {
    const jaSelecionada = skillsSelecionadas.some(
      (item) => item.skill_id === skillId,
    );

    if (jaSelecionada) {
      return;
    }

    const skill = skills.find((item) => item.skill_id === skillId);

    if (!skill) {
      return;
    }

    setSkillsSelecionadas((prev) => [
      ...prev,
      {
        skill_id: skill.skill_id,
        nome: skill.skill,
        peso: 10,
        tipo_skill_id: skill.tipo_skill_id,
      },
    ]);

    /*
     * Alterou critério:
     * resultado anterior deixa de representar
     * a busca atual.
     */

    setPesquisou(false);
    setResultados([]);
    setSelecionados([]);
  };

  /*
   * =======================================================
   * Remover skill
   * =======================================================
   */

  const removerSkill = (skillId: number) => {
    setSkillsSelecionadas((prev) =>
      prev.filter((item) => item.skill_id !== skillId),
    );

    setPesquisou(false);
    setResultados([]);
    setSelecionados([]);
  };

  /*
   * =======================================================
   * Alterar nível
   *
   * Tela:    1 - 10
   * Backend: 10 - 100
   * =======================================================
   */

  const alterarNivelSkill = (skillId: number, peso: number) => {
    setSkillsSelecionadas((prev) =>
      prev.map((item) =>
        item.skill_id === skillId
          ? {
              ...item,
              peso,
            }
          : item,
      ),
    );

    setPesquisou(false);
    setResultados([]);
    setSelecionados([]);
  };

  /*
   * =======================================================
   * Buscar candidatos
   * =======================================================
   */

  const handleBuscar = async () => {
    if (skillsSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma skill para realizar a busca.");

      return;
    }

    setBuscando(true);
    setPesquisou(false);
    setResultados([]);
    setSelecionados([]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/busca`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            skills: skillsSelecionadas.map((skill) => ({
              skill_id: skill.skill_id,
              peso: skill.peso,
            })),
            faixa,
            limite,
          }),
        },
      );

      if (!response.ok) {
        const erro = await response.json().catch(() => null);

        throw new Error(
          erro?.message || "Não foi possível buscar os candidatos.",
        );
      }

      const data = await response.json();

      setResultados(data.candidatos ?? []);

      setPesquisou(true);
    } catch (error) {
      console.error("Erro ao buscar candidatos:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível buscar os candidatos.",
      );
    } finally {
      setBuscando(false);
    }
  };

  /*
   * =======================================================
   * Seleção
   * =======================================================
   */

  const idsSelecionaveis = useMemo(
    () =>
      resultados
        .filter((item) => !item.ja_convidado)
        .slice(0, LIMITE_CONVITES)
        .map((item) => item.candidato_id),
    [resultados],
  );

  const todosSelecionados =
    idsSelecionaveis.length > 0 &&
    idsSelecionaveis.every((id) => selecionados.includes(id));

  const toggleSelecionado = (candidatoId: number) => {
    const candidato = resultados.find(
      (item) => item.candidato_id === candidatoId,
    );

    if (!candidato || candidato.ja_convidado) {
      return;
    }

    const jaSelecionado = selecionados.includes(candidatoId);

    if (jaSelecionado) {
      setSelecionados((prev) => prev.filter((id) => id !== candidatoId));

      return;
    }

    if (selecionados.length >= LIMITE_CONVITES) {
      toast.error(t("vaga_match.limite_convites"));

      return;
    }

    setSelecionados((prev) => [...prev, candidatoId]);
  };

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      setSelecionados((prev) =>
        prev.filter((id) => !idsSelecionaveis.includes(id)),
      );

      return;
    }

    setSelecionados(idsSelecionaveis);
  };

  /*
   * =======================================================
   * Perfil
   * =======================================================
   */

  const abrirPerfil = (candidatoId: number) => {
    setPerfilCandidatoId(candidatoId);

    setPerfilAberto(true);
  };

  const fecharPerfil = () => {
    setPerfilAberto(false);

    setPerfilCandidatoId(null);
  };

  /*
   * =======================================================
   * Ignorar candidato
   * =======================================================
   */

  const handleAbrirIgnorar = (candidato: MatchCandidato) => {
    setCandidatoIgnorar(candidato);

    setMotivoIgnorar("");
  };

  const handleFecharIgnorar = () => {
    setCandidatoIgnorar(null);

    setMotivoIgnorar("");
  };

  const handleConfirmarIgnorar = async () => {
    if (!candidatoIgnorar || ignorando) {
      return;
    }

    setIgnorando(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/ignorar`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidato_id: candidatoIgnorar.candidato_id,
            motivo: motivoIgnorar || undefined,
          }),
        },
      );

      if (!response.ok) {
        const erro = await response.json().catch(() => null);

        throw new Error(erro?.message || t("vaga_match.erro_ignorar"));
      }

      /*
       * Remove imediatamente da
       * busca atual.
       */

      setResultados((prev) =>
        prev.filter(
          (item) => item.candidato_id !== candidatoIgnorar.candidato_id,
        ),
      );

      /*
       * Também remove da seleção,
       * caso estivesse selecionado.
       */

      setSelecionados((prev) =>
        prev.filter((id) => id !== candidatoIgnorar.candidato_id),
      );

      toast.success(t("vaga_match.ignorar_sucesso"));

      handleFecharIgnorar();
    } catch (error) {
      console.error("Erro ao ignorar candidato:", error);

      toast.error(
        error instanceof Error ? error.message : t("vaga_match.erro_ignorar"),
      );
    } finally {
      setIgnorando(false);
    }
  };

  const handleConvidarSelecionados = () => {
    if (selecionados.length === 0) {
      return;
    }

    setConviteAberto(true);
  };

  const [enviandoConvite, setEnviandoConvite] = useState(false);

  const handleEnviarConvite = async (payload: ConviteCandidatosPayload) => {
    if (enviandoConvite) {
      return;
    }

    setEnviandoConvite(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/convites`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const erro = await response.json().catch(() => null);

        throw new Error(
          erro?.message || "Não foi possível enviar os convites.",
        );
      }

      const data = await response.json();

      toast.success(
        data.quantidade === 1
          ? "Convite enviado com sucesso."
          : `${data.quantidade} convites enviados com sucesso.`,
      );

      const idsConvidados = new Set<number>(
        (data.convites ?? []).map(
          (convite: { candidato_id: number }) => convite.candidato_id,
        ),
      );

      setResultados((prev) =>
        prev.map((candidato) =>
          idsConvidados.has(candidato.candidato_id)
            ? {
                ...candidato,
                ja_convidado: true,
              }
            : candidato,
        ),
      );

      /*
       * Limpa os candidatos selecionados
       * somente depois do sucesso.
       */

      setSelecionados([]);
      setConviteAberto(false);
    } catch (error) {
      console.error("Erro ao enviar convites:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar os convites.",
      );
    } finally {
      setEnviandoConvite(false);
    }
  };

  /*
   * =======================================================
   * Loading inicial
   * =======================================================
   */

  if (loading) {
    return <LoadingOverlay />;
  }

  /*
   * =======================================================
   * Render
   * =======================================================
   */

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          profile="recrutador"
        />

        <div className="flex flex-1 flex-col overflow-hidden bg-[#F5F6F6]">
          <TopBar setIsDrawerOpen={setIsDrawerOpen} />

          <div className="flex-1 overflow-y-auto">
            <PageContainer>
              <div className="w-full py-4 sm:py-6">
                {/* Cabeçalho */}

                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    Buscar candidatos
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Encontre candidatos pelas competências desejadas.
                  </p>
                </div>

                {/* =====================================================
                    Hard / Soft lado a lado
                   ===================================================== */}

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <SkillSection
                    title="Hard Skills"
                    description="Selecione as competências técnicas desejadas e defina o nível esperado."
                    icon="⚙️"
                    skills={hardSkills}
                    selecionadas={hardSkillsSelecionadas}
                    todasSelecionadas={skillsSelecionadas}
                    onAdicionar={adicionarSkill}
                    onRemover={removerSkill}
                    onAlterarNivel={alterarNivelSkill}
                  />

                  <SkillSection
                    title="Soft Skills"
                    description="Selecione as competências comportamentais desejadas e defina o nível esperado."
                    icon="🤝"
                    skills={softSkills}
                    selecionadas={softSkillsSelecionadas}
                    todasSelecionadas={skillsSelecionadas}
                    onAdicionar={adicionarSkill}
                    onRemover={removerSkill}
                    onAlterarNivel={alterarNivelSkill}
                  />
                </div>

                {/* Quantidade de skills */}

                <div className="mt-3 text-xs">
                  {skillsSelecionadas.length === 0 ? (
                    <span className="text-gray-500">
                      Selecione pelo menos uma skill para realizar a busca.
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      {skillsSelecionadas.length}{" "}
                      {skillsSelecionadas.length === 1
                        ? "skill selecionada"
                        : "skills selecionadas"}
                    </span>
                  )}
                </div>

                {/* =====================================================
                    Configuração
                   ===================================================== */}

                <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Resultado da busca
                    </h2>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      Defina o nível de compatibilidade e a quantidade de
                      candidatos que deseja visualizar.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Compatibilidade */}

                    <label className="flex flex-col gap-1 text-sm text-gray-700">
                      {t("vaga_match.compatibilidade")}

                      <select
                        value={faixa}
                        onChange={(event) => {
                          setFaixa(event.target.value as FaixaMatch);
                          setPesquisou(false);
                          setResultados([]);
                          setSelecionados([]);
                        }}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-purple-400"
                      >
                        <option value="ALTA">
                          {t("vaga_match.compatibilidade_alta")}
                        </option>

                        <option value="BOA">
                          {t("vaga_match.compatibilidade_boa")}
                        </option>

                        <option value="COMPATIVEL">
                          {t("vaga_match.compatibilidade_compativel")}
                        </option>

                        <option value="TODOS">
                          {t("vaga_match.compatibilidade_todos")}
                        </option>
                      </select>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />

                        <span>
                          {t(
                            `vaga_match.compatibilidade_${faixa.toLowerCase()}_descricao`,
                          )}
                        </span>
                      </div>
                    </label>

                    {/* Limite */}

                    <label className="flex flex-col gap-1 text-sm text-gray-700">
                      Quantidade de candidatos
                      <select
                        value={limite}
                        onChange={(event) => {
                          setLimite(Number(event.target.value));
                          setPesquisou(false);
                          setResultados([]);
                          setSelecionados([]);
                        }}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-purple-400"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                      </select>
                    </label>
                  </div>
                </section>

                {/* =====================================================
                    Botão buscar
                   ===================================================== */}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={!podeBuscar}
                    onClick={handleBuscar}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                  >
                    <Search className="h-4 w-4" />

                    {buscando ? "Buscando..." : "Buscar candidatos"}
                  </button>
                </div>

                {/* =====================================================
                    Resultados
                   ===================================================== */}

                {pesquisou && (
                  <section
                    ref={resultadosRef}
                    className="mt-7 scroll-mt-6 border-t border-gray-200 pt-6"
                  >
                    {/* Cabeçalho resultado */}

                    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          Resultados
                        </h2>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                          Candidatos encontrados com base nas skills
                          selecionadas.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Total */}

                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Users className="h-4 w-4" />
                          {resultados.length}{" "}
                          {resultados.length === 1
                            ? "candidato encontrado"
                            : "candidatos encontrados"}
                        </div>

                        {/* Selecionados */}

                        {selecionados.length > 0 && (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <span className="text-xs text-gray-500">
                              {selecionados.length} selecionado(s)
                            </span>

                            <button
                              type="button"
                              onClick={handleConvidarSelecionados}
                              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
                            >
                              <Send className="h-3.5 w-3.5" />
                              Convidar selecionados
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selecionar todos */}

                    {idsSelecionaveis.length > 0 && (
                      <div className="mb-3 flex items-center gap-2 px-1">
                        <input
                          type="checkbox"
                          checked={todosSelecionados}
                          onChange={toggleSelecionarTodos}
                          className="h-4 w-4 cursor-pointer accent-purple-600"
                        />

                        <span className="text-xs text-gray-500">
                          Selecionar todos
                        </span>

                        {resultados.length > LIMITE_CONVITES && (
                          <span className="text-xs text-gray-400">
                            (máximo de {LIMITE_CONVITES})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Cards */}

                    <div className="space-y-3">
                      {resultados.map((candidato) => (
                        <CandidateMatchCard
                          key={candidato.candidato_id}
                          candidato={candidato}
                          selecionado={selecionados.includes(
                            candidato.candidato_id,
                          )}
                          disabled={
                            !selecionados.includes(candidato.candidato_id) &&
                            selecionados.length >= LIMITE_CONVITES
                          }
                          onSelecionar={() =>
                            toggleSelecionado(candidato.candidato_id)
                          }
                          onIgnorar={() => handleAbrirIgnorar(candidato)}
                          onVerPerfil={() =>
                            abrirPerfil(candidato.candidato_id)
                          }
                          jaConvidado={candidato.ja_convidado}
                        />
                      ))}
                    </div>

                    {/* Sem resultado */}

                    {resultados.length === 0 && (
                      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                        <Users className="mx-auto h-8 w-8 text-gray-300" />

                        <p className="mt-3 text-sm font-medium text-gray-700">
                          Nenhum candidato encontrado.
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Tente alterar as skills, os níveis desejados ou a
                          faixa de compatibilidade.
                        </p>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </PageContainer>
          </div>
        </div>
      </div>

      {/* ===================================================
          Modal ignorar candidato
         =================================================== */}

      {candidatoIgnorar && (
        <IgnoreCandidateModal
          candidato={candidatoIgnorar}
          motivo={motivoIgnorar}
          ignorando={ignorando}
          onMotivoChange={setMotivoIgnorar}
          onCancelar={handleFecharIgnorar}
          onConfirmar={handleConfirmarIgnorar}
        />
      )}

      {/* ===================================================
          Modal perfil candidato
         =================================================== */}

      <PerfilCandidatoModal
        candidatoId={perfilCandidatoId}
        aberto={perfilAberto}
        onFechar={fecharPerfil}
        selecionado={
          perfilCandidatoId != null && selecionados.includes(perfilCandidatoId)
        }
        onSelecionar={(candidatoId) => toggleSelecionado(candidatoId)}
      />

      <InviteCandidatesModal
        aberto={conviteAberto}
        candidatoIds={selecionados}
        enviando={enviandoConvite}
        onFechar={() => {
          if (!enviandoConvite) {
            setConviteAberto(false);
          }
        }}
        onEnviar={handleEnviarConvite}
      />
    </>
  );
}

/*
 * =========================================================
 * Skill Section
 * =========================================================
 */

interface SkillSectionProps {
  title: string;
  description: string;
  icon: string;
  skills: Skill[];
  selecionadas: SkillSelecionada[];
  todasSelecionadas: SkillSelecionada[];
  onAdicionar: (skillId: number) => void;
  onRemover: (skillId: number) => void;
  onAlterarNivel: (skillId: number, peso: number) => void;
}

function SkillSection({
  title,
  description,
  icon,
  skills,
  selecionadas,
  todasSelecionadas,
  onAdicionar,
  onRemover,
  onAlterarNivel,
}: SkillSectionProps) {
  const [selectedSkill, setSelectedSkill] = useState<SelectOption | null>(null);

  /*
   * Remove do combo as skills
   * já selecionadas.
   */

  const options = skills
    .filter(
      (skill) =>
        !todasSelecionadas.some(
          (selecionada) => selecionada.skill_id === skill.skill_id,
        ),
    )
    .map((skill) => ({
      value: String(skill.skill_id),

      label: skill.skill,
    }));

  const handleAdicionar = () => {
    if (!selectedSkill) {
      return;
    }

    onAdicionar(Number(selectedSkill.value));

    setSelectedSkill(null);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      {/* Cabeçalho */}

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>

          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>

        <p className="mt-1 text-xs text-gray-500 sm:text-sm">{description}</p>
      </div>

      {/* Combo */}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <Select
            isClearable
            placeholder={`Selecione uma ${title}`}
            value={selectedSkill}
            onChange={(value) => setSelectedSkill(value as SelectOption | null)}
            options={options}
            noOptionsMessage={() => "Nenhuma skill disponível"}
          />
        </div>

        <button
          type="button"
          onClick={handleAdicionar}
          disabled={!selectedSkill}
          className="cursor-pointer rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Adicionar
        </button>
      </div>

      {/* Skills selecionadas */}

      {selecionadas.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {selecionadas.map((skill) => (
            <div
              key={skill.skill_id}
              className="rounded-xl border border-purple-100 bg-purple-50/40 p-3 sm:p-4"
            >
              <div className="flex flex-col gap-3">
                {/* Nome + excluir */}

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex min-w-0 max-w-[80%] rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
                    <span className="truncate">{skill.nome}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemover(skill.skill_id)}
                    className="shrink-0 cursor-pointer rounded-lg p-2 text-red-500 hover:bg-red-50"
                    aria-label="Remover skill"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Nível */}

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600">
                    Nível
                  </span>

                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={skill.peso / 10}
                    onChange={(event) =>
                      onAlterarNivel(
                        skill.skill_id,
                        Number(event.target.value) * 10,
                      )
                    }
                    className="min-w-0 flex-1 cursor-pointer accent-purple-600"
                  />

                  <span className="w-8 text-right text-sm font-semibold text-gray-700">
                    {(skill.peso / 10).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
