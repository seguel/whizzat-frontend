"use client";

import { useState, useEffect } from "react";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import SemDados from "../SemDados";
import { ImSpinner2 } from "react-icons/im";
import LoadingOverlay from "../../components/LoadingOverlay";
import { X, Clock, Building2, CalendarDays } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import TooltipIcon from "../../components/TooltipIcon";
import SkillsPanel from "../../components/perfil/SkillsPanel";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";
// import { getFileUrl } from "../../util/getFileUrl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import PageContainer from "@/app/components/PageContainer";

interface Props {
  perfil: ProfileType;
  hasEmpresa: boolean | null;
  empresaId: string | null;
  vagaId: string | null;
  userId?: number;
  recrutadorId: number | null;
}

type TipoOportunidade = "AMPLA_CONCORRENCIA" | "AFIRMATIVA" | "EXCLUSIVA";

type PublicoAfirmativo =
  | "PCD"
  | "AFIRMATIVA_RACIAL"
  | "LGBTQIA"
  | "MULHERES"
  | "CINQUENTA_MAIS"
  | "DIVERSIDADE";

interface SkillAvaliacao {
  skill_id: number;
  nome?: string;
  peso: number;
  avaliador_proprio: boolean;
  tipo_skill_id?: number;
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

interface VagasForm {
  empresa_id: string;
  nome_vaga: string;
  descricao: string;
  local_vaga: string;
  modalidade_trabalho_id: string;
  periodo_trabalho_id: string;
  tipo_oportunidade: TipoOportunidade;
  publicos_afirmativos: PublicoAfirmativo[];
  qtde_dias_aberta: string;
  qtde_posicao: string;
  lista_skills: SkillAvaliacao[];
  data_cadastro: string;
  logo: string;
  ativo: boolean;
  estado_id: number;
  estado_label: string;
  cidade_id: number;
  cidade_label: string;
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
  tipo_oportunidade: TipoOportunidade;
  publicos_afirmativos: PublicoAfirmativo[];
  qtde_dias_aberta: number;
  qtde_posicao: number;
  skills: SkillAvaliacao[];
  data_cadastro: string;
  logo: string;
  ativo: boolean;
  estado_id: number;
  estado_label: string;
  cidade_id: number;
  cidade_label: string;
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {}
  }, [storedValue, key]);

  return [storedValue, setStoredValue] as const;
}

export default function VagaDados({
  perfil,
  hasEmpresa,
  empresaId,
  vagaId,
  userId,
  recrutadorId,
}: Props) {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useLocalStorage<VagasForm>(`vagasForm_${userId}`, {
    empresa_id: "",
    nome_vaga: "",
    descricao: "",
    local_vaga: "",
    modalidade_trabalho_id: "",
    periodo_trabalho_id: "",
    tipo_oportunidade: "AMPLA_CONCORRENCIA",
    publicos_afirmativos: [],
    qtde_dias_aberta: "",
    qtde_posicao: "",
    lista_skills: [],
    data_cadastro: new Date().toISOString(),
    logo: "",
    ativo: true,
    estado_id: 0,
    estado_label: "",
    cidade_id: 0,
    cidade_label: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vagaPublicada, setVagaPublicada] = useState<VagaData | null>(null);

  const [vaga, setVaga] = useState<VagaData | null>(null);
  const [loadingVagaEmpresa, setLoadingVagaEmpresa] = useState<boolean>(false);
  const [diasDisponiveis, setDiasDisponiveis] = useState(0);
  const [quantidadeVagas, setQuantidadeVagas] = useState(0);
  const [hasAvaliadorProprio, setHasAvaliadorProprio] = useState(false);

  const [estado, setEstado] = useState("");
  const [estados, setEstados] = useState<
    { id: number; sigla: string; estado: string }[]
  >([]);
  const [cidade, setCidade] = useState("");
  const [cidades, setCidades] = useState<{ id: number; cidade: string }[]>([]);

  const [empresas, setEmpresas] = useState<
    { id: number; nome_empresa: string; logo: string }[]
  >([]);
  const [modalidades, setModalidades] = useState<
    { modalidade_trabalho_id: number; modalidade: string }[]
  >([]);
  const [periodos, setPeriodos] = useState<
    { periodo_trabalho_id: number; periodo: string }[]
  >([]);
  const [skills, setSkills] = useState<
    { skill_id: number; skill: string; tipo_skill_id: number }[]
  >([]);

  /* const skillsData =
    form.lista_skills?.map((skill) => ({
      subject: skill.nome,
      A: skill.peso,
      fullMark: 10,
    })) || [];
 */
  const skillsData = form.lista_skills || [];

  const [selectedSkill, setSelectedSkill] = useState<{
    value: string;
    label: string;
    tipo_skill_id: number;
  } | null>(null);

  // Data de vigência
  const dataBase = form.data_cadastro
    ? new Date(form.data_cadastro)
    : new Date();
  const dias = Number(form.qtde_dias_aberta ?? 0);

  // fallback caso a data seja inválida
  const dataVigencia = isNaN(dataBase.getTime())
    ? new Date()
    : addDays(dataBase, dias);

  const dataFormatada = format(dataVigencia, "dd 'de' MMMM", { locale: ptBR });

  useEffect(() => {
    setLoadingVagaEmpresa(true);
    console.log(vagaPublicada);

    const fetchSelectData = async () => {
      try {
        const estadoRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/estados/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": i18n.language,
            },
          },
        );

        const estadosData = await estadoRes.json();

        // console.log(generosData);
        setEstados(estadosData);
      } catch (error) {
        console.error(
          t("tela_perfil_recrutador.item_alerta_erro_buscar_dados"),
          error,
        );
      } finally {
        setLoadingVagaEmpresa(false);
      }
    };

    fetchSelectData();
  }, []);

  useEffect(() => {
    setHasAvaliadorProprio(false);
    if (!vagaId) return;

    const fetchVaga = async () => {
      setLoadingVagaEmpresa(true);
      try {
        // const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

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
        //console.log(data);
        const vagaFormData: VagasForm = {
          empresa_id: data.empresa_id,
          nome_vaga: data.nome_vaga || "",
          descricao: data.descricao || "",
          local_vaga: data.local_vaga || "",
          modalidade_trabalho_id: data.modalidade_trabalho_id || "",
          periodo_trabalho_id: data.periodo_trabalho_id || "",
          tipo_oportunidade: data.tipo_oportunidade ?? "AMPLA_CONCORRENCIA",
          publicos_afirmativos: data.publicos_afirmativos ?? [],
          qtde_dias_aberta: data.qtde_dias_aberta || "",
          qtde_posicao: data.qtde_posicao || "",
          lista_skills: data.skills || [],
          data_cadastro: data.data_cadastro
            ? new Date(data.data_cadastro).toISOString()
            : new Date().toISOString(),
          logo: data.logo || "",
          ativo: data.ativo ?? true,
          estado_id: data.estado_id,
          estado_label: data.estado_label,
          cidade_id: data.cidade_id,
          cidade_label: data.cidade_label,
        };
        setEstado(data.estado_id);
        setCidade(data.cidade_id);

        setDiasDisponiveis(data.qtde_dias_aberta);
        setQuantidadeVagas(data.qtde_posicao);
        setForm(vagaFormData);
        setVaga(data);

        fetchCidades(data.estado_id);
      } catch (error) {
        console.error(
          t("tela_vaga_dados.item_alerta_erro_buscar_dados"),
          error,
        );
      } finally {
        setLoadingVagaEmpresa(false);
      }
    };

    fetchVaga();
  }, [vagaId]);

  useEffect(() => {
    setLoadingVagaEmpresa(true);
    // const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    const fetchSelectData = async () => {
      try {
        const [empresasRes, modalidadesRes, periodosRes, skillsRes] =
          await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/empresas/recrutador/${recrutadorId}`,
              {
                method: "GET",
                credentials: "include",
              },
            ),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/modalidades/`, {
              method: "GET",
              credentials: "include",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/periodos/`, {
              method: "GET",
              credentials: "include",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/`, {
              method: "GET",
              credentials: "include",
            }),
          ]);

        const [empresasData, modalidadesData, periodosData, skillsData] =
          await Promise.all([
            empresasRes.json(),
            modalidadesRes.json(),
            periodosRes.json(),
            skillsRes.json(),
          ]);

        setEmpresas(empresasData.empresas);
        setModalidades(modalidadesData);
        setPeriodos(periodosData);
        setSkills(skillsData);
      } catch (error) {
        console.error(
          t("tela_vaga_dados.item_alerta_erro_buscar_dados"),
          error,
        );
      } finally {
        setLoadingVagaEmpresa(false);
      }
    };

    fetchSelectData();
  }, [perfil]);

  useEffect(() => {
    if (!empresaId || empresas.length === 0) return;

    const empresaSelecionada = empresas.find(
      (e) => e.id.toString() === empresaId.toString(),
    );

    if (empresaSelecionada) {
      setForm((prev) => ({
        ...prev,
        empresa_id: empresaId,
        logo: empresaSelecionada.logo,
      }));
    }
  }, [empresaId, empresas]);

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const value = Number(e.target.value ?? 0);
    const estadoSelecionada = estados.find(
      (e) => e.id.toString() === selectedId,
    );

    setEstado(selectedId);
    setForm((prev) => ({
      ...prev,
      estado_id: value,
      estado_label: estadoSelecionada?.estado ?? "",
    }));

    fetchCidades(selectedId);
  };

  const fetchCidades = async (selectedId: string) => {
    setLoadingVagaEmpresa(true);
    try {
      const cidadeRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cidades/estado-cidade/${selectedId}`,
        {
          method: "GET",
        },
      );

      if (!cidadeRes.ok)
        throw new Error(t("cadastro.item_alerta_erro_buscar_dados"));

      const data = await cidadeRes.json();

      // console.log(data);
      setCidades(data);
    } catch (error) {
      console.error(t("cadastro.item_alerta_erro_buscar_dados"), error);
    } finally {
      setLoadingVagaEmpresa(false);
    }
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const value = Number(e.target.value ?? 0);
    const cidadeSelecionada = cidades.find(
      (e) => e.id.toString() === selectedId,
    );

    setCidade(selectedId);

    setForm((prev) => ({
      ...prev,
      cidade_id: value,
      cidade_label: cidadeSelecionada?.cidade ?? "",
    }));
  };

  if ((vagaId || empresaId) && loadingVagaEmpresa) {
    return <LoadingOverlay />;
  }

  const handleChange_dinamicos = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, type } = e.target;
    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleCancel = () => {
    // Limpa o formulário salvo no localStorage
    localStorage.removeItem(`vagasForm_${userId}`);

    // Feedback visual
    toast.error(t("tela_vaga_dados.item_alerta_descartada"), {
      duration: 3000, // 3 segundos
    });

    const url = vagaId
      ? `/dashboard/vagas?perfil=${perfil}&vagaid=${vagaId}&id=${empresaId}`
      : `/dashboard/vagas?perfil=${perfil}`;

    router.push(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (step === 1) {
      if (
        !form.empresa_id ||
        !form.nome_vaga ||
        form.cidade_id === 0 ||
        !form.descricao ||
        !form.modalidade_trabalho_id ||
        !form.periodo_trabalho_id ||
        form.qtde_dias_aberta === "0" ||
        Number(form.qtde_posicao) <= 0 ||
        (form.tipo_oportunidade !== "AMPLA_CONCORRENCIA" &&
          form.publicos_afirmativos.length === 0)
      ) {
        return;
      }

      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 2) {
      if (form.lista_skills.filter((s) => s.tipo_skill_id == 1).length < 0)
        return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 3) {
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 4) {
      if (!isFormValid(form)) return;

      setIsSubmitting(true);

      try {
        const perfilId =
          perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

        const payload = {
          empresa_id: Number(form.empresa_id),
          perfil_id: perfilId,
          nome_vaga: form.nome_vaga,
          descricao: form.descricao,
          local_vaga: form.local_vaga,
          modalidade_trabalho_id: Number(form.modalidade_trabalho_id),
          periodo_trabalho_id: Number(form.periodo_trabalho_id),
          tipo_oportunidade: form.tipo_oportunidade,

          publicos_afirmativos:
            form.tipo_oportunidade === "AMPLA_CONCORRENCIA"
              ? []
              : form.publicos_afirmativos,
          qtde_dias_aberta: Number(form.qtde_dias_aberta),
          qtde_posicao: Number(form.qtde_posicao),
          skills: form.lista_skills.filter((s) => s.skill_id > 0), // ← SkillAvaliacao[]
          novas_skills: form.lista_skills.filter((s) => s.skill_id < 0), // ← opcional
          ...(vagaId ? { vaga_id: Number(vagaId), ativo: form.ativo } : {}),
          cidade_id: form.cidade_id,
        };

        const url = !vagaId
          ? `${process.env.NEXT_PUBLIC_API_URL}/vagas/create-vaga`
          : `${process.env.NEXT_PUBLIC_API_URL}/vagas/update-vaga`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(t("tela_vaga_dados.item_alerta_erro_salvar"));
        }

        const data = await response.json(); // <- Aqui pega o retorno da empresa salva
        setVagaPublicada(data); // <- Aqui salva os dados no estado

        // Limpa o localStorage se necessário
        localStorage.removeItem(`vagasForm_${userId}`);

        setIsSubmitting(false);
        toast.success(
          `${t("tela_vaga_dados.item_alerta_sucesso_1")} ${data.nome_vaga} ${t(
            "tela_vaga_dados.item_alerta_sucesso_2",
          )}`,
          {
            duration: 5000, // ← 5 segundos
          },
        );
        //nextStep();
        router.push(
          `/dashboard/vagas?perfil=${perfil}&vagaid=${data.vaga_id}&id=${data.empresa_id}`,
        );
      } catch (err) {
        console.error("Erro ao enviar dados:", err);
        toast.error(t("tela_vaga_dados.item_alerta_erro_salvar"), {
          duration: 5000, // ← 5 segundos
        });
        setIsSubmitting(false);
      }
    }
  };

  const handleAddSkill = (tipoSkill: number) => {
    if (!selectedSkill?.value) {
      setShowErrors(true);
      return;
    }
    const isNovaSkill = isNaN(Number(selectedSkill.value));
    const id = isNovaSkill ? Date.now() * -1 : Number(selectedSkill.value);

    if (form.lista_skills.some((s) => s.skill_id === id)) return;

    const novaSkill = {
      skill_id: id,
      peso: 10,
      avaliador_proprio: true,
      nome: selectedSkill.label, // ← Salva o nome para posterior criação no backend
      tipo_skill_id: tipoSkill,
    };

    setForm((prev) => ({
      ...prev,
      lista_skills: [...prev.lista_skills, novaSkill],
    }));

    if (isNovaSkill) {
      setSkills((prev) => [
        ...prev,
        {
          skill_id: id,
          skill: selectedSkill.label,
          tipo_skill_id: selectedSkill.tipo_skill_id,
        },
      ]);
    }

    setSelectedSkill(null);
  };

  const handleSkillChange = (
    skill_id: number,
    field: "peso" | "avaliador_proprio",
    value: number | boolean,
  ) => {
    const atualizadas = form.lista_skills.map((s) =>
      s.skill_id === skill_id ? { ...s, [field]: value } : s,
    );
    setForm((prev) => ({ ...prev, lista_skills: atualizadas }));
  };

  const handleRemoveSkill = (skill_id: number) => {
    setForm((prev) => ({
      ...prev,
      lista_skills: prev.lista_skills.filter((s) => s.skill_id !== skill_id),
    }));
  };

  const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const empresaSelecionada = empresas.find(
      (e) => e.id.toString() === selectedId,
    );

    setForm((prev) => ({
      ...prev,
      empresa_id: selectedId,
      logo: empresaSelecionada?.logo ?? "",
    }));
  };

  const handlePublicoAfirmativoChange = (
    publico: PublicoAfirmativo,
    checked: boolean,
  ) => {
    setForm((prev) => ({
      ...prev,

      publicos_afirmativos: checked
        ? [...new Set([...prev.publicos_afirmativos, publico])]
        : prev.publicos_afirmativos.filter((item) => item !== publico),
    }));
  };

  const handleTipoOportunidadeChange = (tipo: TipoOportunidade) => {
    setForm((prev) => ({
      ...prev,
      tipo_oportunidade: tipo,

      // Se voltar para ampla, limpa os públicos
      publicos_afirmativos:
        tipo === "AMPLA_CONCORRENCIA" ? [] : prev.publicos_afirmativos,
    }));
  };

  interface OpportunityTypeOptionProps {
    value: TipoOportunidade;
    checked: boolean;
    title: string;
    description: string;
    icon: string;
    onChange: (value: TipoOportunidade) => void;
  }

  function OpportunityTypeOption({
    value,
    checked,
    title,
    description,
    icon,
    onChange,
  }: OpportunityTypeOptionProps) {
    return (
      <label
        className={`
        flex flex-col
        rounded-xl border
        p-3 sm:p-4
        cursor-pointer
        transition-all
        h-full
        ${
          checked
            ? "border-purple-400 bg-white shadow-sm"
            : "border-gray-200 bg-white/60 hover:border-purple-200 hover:bg-white"
        }
      `}
      >
        {/* Radio + ícone + título */}
        <div className="flex items-start gap-2">
          <input
            type="radio"
            name="tipo_oportunidade"
            value={value}
            checked={checked}
            onChange={() => onChange(value)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-purple-600 cursor-pointer"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg shrink-0">{icon}</span>

              <span className="text-sm font-semibold text-gray-800">
                {title}
              </span>
            </div>
          </div>
        </div>

        {/* Descrição abaixo */}
        <p className="mt-2 pl-6 text-xs text-gray-500 leading-relaxed">
          {description}
        </p>
      </label>
    );
  }

  interface PublicOptionProps {
    codigo: PublicoAfirmativo;
    checked: boolean;
    title: string;
    onChange: (publico: PublicoAfirmativo, checked: boolean) => void;
  }

  function PublicOption({
    codigo,
    checked,
    title,
    onChange,
  }: PublicOptionProps) {
    return (
      <label
        className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
          checked
            ? "border-purple-300 bg-white shadow-sm"
            : "border-gray-200 bg-white/60 hover:border-purple-200"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(codigo, e.target.checked)}
          className="h-4 w-4 accent-purple-600 cursor-pointer"
        />

        <span className="text-sm font-medium text-gray-800">{title}</span>
      </label>
    );
  }

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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 bg-[#F5F6F6] overflow-hidden">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!hasEmpresa ? (
          <SemDados tipo="empresa" perfil={perfil} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {step != 5 && (
                <div className="pt-3 pl-6 flex items-center justify-center">
                  <div className="flex items-center justify-between w-full text-sm font-medium text-gray-500">
                    {[
                      `1 ${t("tela_topo_passos.passo_dados")}`,
                      `2 ${t("tela_topo_passos.passo_hardskills")}`,
                      `3 ${t("tela_topo_passos.passo_softskills")}`,
                      `4 ${t("tela_topo_passos.passo_visualizar")}`,
                      `5 ${t("tela_topo_passos.passo_publicar")}`,
                    ].map((etapa, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 flex-1 min-w-0"
                      >
                        <div
                          className={`w-6 h-6 rounded-full text-center text-white text-xs flex items-center justify-center ${
                            step === index + 1 ? "bg-purple-600" : "bg-gray-300"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span
                          className={`truncate ${
                            step === index + 1 ? "text-black" : "text-gray-400"
                          }`}
                        >
                          {etapa.split(" ")[1]}
                        </span>
                        {index < 4 && (
                          <span className="mx-1 text-gray-300 hidden sm:inline">
                            ───────
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PageContainer>
                <div className="flex flex-col flex-1 w-full min-h-[500px] ">
                  {step === 1 && (
                    <form
                      onSubmit={handleSubmit}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
                    >
                      {vagaId && (
                        <div className="col-span-1 md:col-span-2 flex justify-start">
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                name="ativo"
                                checked={form.ativo ?? vaga?.ativo ?? true}
                                onChange={handleChange_dinamicos}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-5"></div>
                            </div>
                            <span className="ml-3 text-sm font-normal text-gray-700">
                              {t("tela_vaga_dados.item_ativo")}
                            </span>
                          </label>
                        </div>
                      )}

                      {/* Coluna Esquerda */}
                      <div className="flex flex-col gap-4">
                        {/* Empresa */}
                        <label className="flex flex-col text-sm text-gray-700">
                          {t("tela_vaga_dados.item_label_nome")}
                          <select
                            className={`
                          border border-purple-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-300
                          ${
                            empresaId
                              ? "bg-gray-100 cursor-not-allowed opacity-80"
                              : ""
                          }
                        `}
                            name="empresa_id"
                            value={empresaId ?? form.empresa_id ?? ""}
                            onChange={handleEmpresaChange}
                            disabled={!!empresaId}
                          >
                            <option value="">
                              {t("tela_vaga_dados.item_placeholder_nome")}
                            </option>
                            {empresas.map((empresa) => (
                              <option key={empresa.id} value={empresa.id}>
                                {empresa.nome_empresa}
                              </option>
                            ))}
                          </select>
                        </label>

                        {/* Nome da vaga */}
                        <label className="flex flex-col text-sm text-gray-700">
                          {t("tela_vaga_dados.item_label_site")}
                          <input
                            name="nome_vaga"
                            type="text"
                            className="border rounded-md px-3 py-2 border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-300"
                            placeholder={t(
                              "tela_vaga_dados.item_placeholder_site",
                            )}
                            defaultValue={form.nome_vaga ?? vaga?.nome_vaga}
                            onChange={handleChange_dinamicos}
                          />
                          {showErrors && !form.nome_vaga && (
                            <p className="text-sm text-red-600 mt-1">
                              {t("tela_vaga_dados.item_msg_campo_obt")}
                            </p>
                          )}
                        </label>

                        {/* Linha Estado + Cidade */}
                        <div className="grid grid-cols-12 gap-2">
                          {/* Estado - col-3 */}
                          <div className="col-span-12 md:col-span-5">
                            <label className="text-sm font-medium mb-1">
                              {t("cadastro.estado")}
                            </label>

                            <select
                              className="border border-blue-600 rounded px-3 py-2 focus:outline-none w-full"
                              name="estado"
                              value={estado}
                              onChange={handleEstadoChange}
                            >
                              <option value="">
                                {t("cadastro.placehold_estado")}
                              </option>
                              {estados.map((e) => (
                                <option key={e.id} value={e.id}>
                                  {e.sigla}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Cidade - col-9 */}
                          <div className="col-span-12 md:col-span-7">
                            <label className="text-sm font-medium mb-1">
                              {t("cadastro.cidade")}
                            </label>

                            <select
                              className="border border-blue-600 rounded px-3 py-2 focus:outline-none w-full"
                              name="cidade"
                              value={cidade}
                              onChange={handleCidadeChange}
                            >
                              <option value="">
                                {t("cadastro.placehold_cidade")}
                              </option>
                              {cidades.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.cidade}
                                </option>
                              ))}
                            </select>

                            {showErrors && !form.cidade_id && (
                              <p className="text-sm text-red-600 mt-1">
                                {t("tela_perfil_recrutador.item_msg_campo_obt")}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Modalidade */}
                        <fieldset className="text-sm text-gray-700 mt-2">
                          <legend className="mb-1 font-medium">
                            {t("tela_vaga_dados.item_label_modalidade")}
                          </legend>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {modalidades.map((mod) => (
                              <label
                                key={mod.modalidade_trabalho_id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name="modalidade_trabalho_id"
                                  value={mod.modalidade_trabalho_id}
                                  checked={
                                    String(mod.modalidade_trabalho_id) ===
                                    String(
                                      form.modalidade_trabalho_id ??
                                        vaga?.modalidade_trabalho_id,
                                    )
                                  }
                                  onChange={handleChange_dinamicos}
                                  className="appearance-none w-4 h-4 rounded-full border-2 border-purple-600 checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all duration-200"
                                />
                                <span>{mod.modalidade}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        {/* Período */}
                        <fieldset className="text-sm text-gray-700 mt-2">
                          <legend className="mb-1 font-medium">
                            {t("tela_vaga_dados.item_label_periodo")}
                          </legend>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {periodos.map((per) => (
                              <label
                                key={per.periodo_trabalho_id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name="periodo_trabalho_id"
                                  value={per.periodo_trabalho_id}
                                  onChange={handleChange_dinamicos}
                                  checked={
                                    String(per.periodo_trabalho_id) ===
                                    String(
                                      form.periodo_trabalho_id ??
                                        vaga?.periodo_trabalho_id,
                                    )
                                  }
                                  className="appearance-none w-4 h-4 rounded-full border-2 border-purple-600 checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all duration-200"
                                />
                                <span>{per.periodo}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      </div>

                      {/* Coluna Direita */}
                      <div className="flex flex-col gap-4">
                        {/* Descrição */}
                        <label className="flex flex-col text-sm text-gray-700">
                          {t("tela_vaga_dados.item_label_descricao")}
                          <textarea
                            name="descricao"
                            maxLength={5000}
                            rows={9}
                            defaultValue={form.descricao ?? vaga?.descricao}
                            className="border rounded-md px-3 py-2 resize-none border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-300"
                            placeholder={t(
                              "tela_vaga_dados.item_placeholder_descricao",
                            )}
                            onChange={handleChange_dinamicos}
                          />
                          {showErrors && !form.descricao && (
                            <p className="text-sm text-red-600 mt-1">
                              {t("tela_vaga_dados.item_msg_campo_obt")}
                            </p>
                          )}
                        </label>

                        {/* Dias disponíveis */}
                        <label className="flex flex-col text-sm text-gray-700">
                          {t("tela_vaga_dados.item_label_dias_vaga")}
                          <div className="flex items-center gap-2 mt-1">
                            {/* Botão de diminuir */}
                            <button
                              type="button"
                              onClick={() => {
                                setDiasDisponiveis((prev) => {
                                  const novoValor = Math.max(prev - 1, 1);
                                  handleChange_dinamicos({
                                    target: {
                                      name: "qtde_dias_aberta",
                                      value: novoValor.toString(),
                                    },
                                  } as React.ChangeEvent<HTMLInputElement>);
                                  return novoValor;
                                });
                              }}
                              className="px-3 py-1 rounded-full bg-purple-100 text-purple-600"
                            >
                              -
                            </button>

                            {/* Input que permite digitar */}
                            <input
                              name="qtde_dias_aberta"
                              type="number"
                              min={1}
                              max={60}
                              className="border rounded-md w-16 px-3 py-2 border-purple-600 text-center focus:outline-none focus:ring-1 focus:ring-purple-300
                                  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                                  [&::-moz-appearance]:textfield"
                              value={form.qtde_dias_aberta ?? diasDisponiveis}
                              onChange={(e) => {
                                let valor = parseInt(e.target.value || "1", 10);
                                if (isNaN(valor)) valor = 1;
                                if (valor > 60) valor = 60;
                                if (valor < 1) valor = 1;

                                setDiasDisponiveis(valor);
                                handleChange_dinamicos({
                                  target: {
                                    name: "qtde_dias_aberta",
                                    value: valor.toString(),
                                  },
                                } as React.ChangeEvent<HTMLInputElement>);
                              }}
                            />

                            {/* Botão de aumentar */}
                            <button
                              type="button"
                              onClick={() => {
                                setDiasDisponiveis((prev) => {
                                  const novoValor = Math.min(prev + 1, 60);
                                  handleChange_dinamicos({
                                    target: {
                                      name: "qtde_dias_aberta",
                                      value: novoValor.toString(),
                                    },
                                  } as React.ChangeEvent<HTMLInputElement>);
                                  return novoValor;
                                });
                              }}
                              className="px-3 py-1 rounded-full bg-purple-100 text-purple-600"
                            >
                              +
                            </button>
                          </div>
                          {showErrors &&
                            (!diasDisponiveis || diasDisponiveis === 0) && (
                              <p className="text-sm text-red-600 mt-1">
                                {t("tela_vaga_dados.item_msg_campo_obt")}
                              </p>
                            )}
                        </label>

                        {/* Quantidade de vagas */}
                        <label className="flex flex-col text-sm text-gray-700">
                          {t("tela_vaga_dados.item_label_qtde_vaga")}
                          <div className="flex items-center gap-2 mt-1">
                            {/* Botão de diminuir */}
                            <button
                              type="button"
                              onClick={() => {
                                setQuantidadeVagas((prev) => {
                                  const novoValor = Math.max(prev - 1, 0);
                                  handleChange_dinamicos({
                                    target: {
                                      name: "qtde_posicao",
                                      value: novoValor.toString(),
                                    },
                                  } as React.ChangeEvent<HTMLInputElement>);
                                  return novoValor;
                                });
                              }}
                              className="px-3 py-1 rounded-full bg-purple-100 text-purple-600"
                            >
                              -
                            </button>

                            {/* Input que permite digitar */}
                            <input
                              name="qtde_posicao"
                              type="number"
                              min={0}
                              max={100}
                              className="border rounded-md w-16 px-3 py-2 border-purple-600 text-center focus:outline-none focus:ring-1 focus:ring-purple-300
                                [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                                [&::-moz-appearance]:textfield"
                              value={form.qtde_posicao ?? quantidadeVagas}
                              onChange={(e) => {
                                let valor = parseInt(e.target.value || "0", 10);
                                if (isNaN(valor)) valor = 0;
                                if (valor > 100) valor = 100;
                                if (valor < 0) valor = 0;

                                setQuantidadeVagas(valor);
                                handleChange_dinamicos({
                                  target: {
                                    name: "qtde_posicao",
                                    value: valor.toString(),
                                  },
                                } as React.ChangeEvent<HTMLInputElement>);
                              }}
                            />

                            {/* Botão de aumentar */}
                            <button
                              type="button"
                              onClick={() => {
                                setQuantidadeVagas((prev) => {
                                  const novoValor = Math.min(prev + 1, 100);
                                  handleChange_dinamicos({
                                    target: {
                                      name: "qtde_posicao",
                                      value: novoValor.toString(),
                                    },
                                  } as React.ChangeEvent<HTMLInputElement>);
                                  return novoValor;
                                });
                              }}
                              className="px-3 py-1 rounded-full bg-purple-100 text-purple-600"
                            >
                              +
                            </button>
                          </div>
                          {showErrors &&
                            (!quantidadeVagas || quantidadeVagas === 0) && (
                              <p className="text-sm text-red-600 mt-1">
                                {t("tela_vaga_dados.item_msg_campo_obt")}
                              </p>
                            )}
                        </label>
                      </div>

                      {/* Tipo de oportunidade - largura total */}
                      <div className="col-span-1 md:col-span-2 w-full">
                        <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 sm:p-5">
                          <div className="mb-4">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                              {t("tela_vaga_dados.tipo_oportunidade_titulo")}
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              {t("tela_vaga_dados.tipo_oportunidade_descricao")}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <OpportunityTypeOption
                              value="AMPLA_CONCORRENCIA"
                              checked={
                                form.tipo_oportunidade === "AMPLA_CONCORRENCIA"
                              }
                              onChange={handleTipoOportunidadeChange}
                              title={t("tela_vaga_dados.tipo_ampla")}
                              description={t("tela_vaga_dados.tipo_ampla_msg")}
                              icon="🌐"
                            />

                            <OpportunityTypeOption
                              value="AFIRMATIVA"
                              checked={form.tipo_oportunidade === "AFIRMATIVA"}
                              onChange={handleTipoOportunidadeChange}
                              title={t("tela_vaga_dados.tipo_afirmativa")}
                              description={t(
                                "tela_vaga_dados.tipo_afirmativa_msg",
                              )}
                              icon="🤝"
                            />

                            <OpportunityTypeOption
                              value="EXCLUSIVA"
                              checked={form.tipo_oportunidade === "EXCLUSIVA"}
                              onChange={handleTipoOportunidadeChange}
                              title={t("tela_vaga_dados.tipo_exclusiva")}
                              description={t(
                                "tela_vaga_dados.tipo_exclusiva_msg",
                              )}
                              icon="🎯"
                            />
                          </div>

                          {form.tipo_oportunidade !== "AMPLA_CONCORRENCIA" && (
                            <div className="mt-5 pt-4 border-t border-purple-100">
                              <p className="text-sm font-medium text-gray-800 mb-1">
                                {t("tela_vaga_dados.publico_afirmativo_titulo")}
                              </p>

                              <p className="text-xs text-gray-500 mb-4">
                                {form.tipo_oportunidade === "EXCLUSIVA"
                                  ? t("tela_vaga_dados.publico_exclusivo_msg")
                                  : t("tela_vaga_dados.publico_afirmativo_msg")}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <PublicOption
                                  codigo="PCD"
                                  checked={form.publicos_afirmativos.includes(
                                    "PCD",
                                  )}
                                  onChange={handlePublicoAfirmativoChange}
                                  title={t("tela_vaga_dados.publico_pcd")}
                                />

                                <PublicOption
                                  codigo="AFIRMATIVA_RACIAL"
                                  checked={form.publicos_afirmativos.includes(
                                    "AFIRMATIVA_RACIAL",
                                  )}
                                  onChange={handlePublicoAfirmativoChange}
                                  title={t("tela_vaga_dados.publico_racial")}
                                />

                                <PublicOption
                                  codigo="LGBTQIA"
                                  checked={form.publicos_afirmativos.includes(
                                    "LGBTQIA",
                                  )}
                                  onChange={handlePublicoAfirmativoChange}
                                  title={t("tela_vaga_dados.publico_lgbtqia")}
                                />

                                <PublicOption
                                  codigo="MULHERES"
                                  checked={form.publicos_afirmativos.includes(
                                    "MULHERES",
                                  )}
                                  onChange={handlePublicoAfirmativoChange}
                                  title={t("tela_vaga_dados.publico_mulheres")}
                                />

                                <PublicOption
                                  codigo="CINQUENTA_MAIS"
                                  checked={form.publicos_afirmativos.includes(
                                    "CINQUENTA_MAIS",
                                  )}
                                  onChange={handlePublicoAfirmativoChange}
                                  title={t("tela_vaga_dados.publico_50mais")}
                                />

                                <PublicOption
                                  codigo="DIVERSIDADE"
                                  checked={form.publicos_afirmativos.includes(
                                    "DIVERSIDADE",
                                  )}
                                  onChange={handlePublicoAfirmativoChange}
                                  title={t(
                                    "tela_vaga_dados.publico_diversidade",
                                  )}
                                />
                              </div>

                              {showErrors &&
                                form.publicos_afirmativos.length === 0 && (
                                  <p className="text-sm text-red-600 mt-3">
                                    {t("tela_vaga_dados.publico_obrigatorio")}
                                  </p>
                                )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-span-1 mt-4 md:col-span-2 flex justify-center md:justify-end">
                        <button
                          type="button" // evita submit acidental
                          onClick={handleCancel}
                          className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                        >
                          {t("tela_vaga_dados.item_botao_cancelar")}
                        </button>
                        <button
                          type="submit"
                          className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                        >
                          {t("tela_vaga_dados.item_botao_avancar")}
                        </button>
                      </div>
                    </form>
                  )}

                  {step === 2 && (
                    <div className="w-full flex flex-col flex-1">
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col flex-1"
                      >
                        <div>
                          <h1 className="block text-sm mb-1 py-3 font-bold">
                            {t("tela_vaga_dados.item_label_informe_hardskills")}
                            <p className="text-[11px] font-normal italic">
                              {t(
                                "tela_vaga_dados.item_label_informe_hardskills_subitem",
                              )}
                            </p>
                            <p className="block text-[11x] font-light">
                              {t("tela_vaga_dados.item_label_informe_qtde")}
                            </p>
                          </h1>

                          <label className="text-sm font-medium mb-1 flex items-center gap-1">
                            {t("tela_vaga_dados.item_label_skill")}
                            <TooltipIcon
                              message={`${t(
                                "tela_vaga_dados.item_tooltip_skill_titulo",
                              )}\n${t(
                                "tela_vaga_dados.item_tooltip_skill_passo1",
                              )}\n${t(
                                "tela_vaga_dados.item_tooltip_skill_passo2",
                              )}\n${t(
                                "tela_vaga_dados.item_tooltip_skill_passo3",
                              )}`}
                              perfil={perfil}
                            />
                          </label>

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <CreatableSelect
                                isClearable
                                placeholder={t(
                                  "tela_vaga_dados.item_msg_skill",
                                )}
                                value={selectedSkill}
                                onChange={(newValue) =>
                                  setSelectedSkill(newValue)
                                }
                                options={skills
                                  .filter((f) => f.tipo_skill_id == 1)
                                  .map((skill) => ({
                                    value: String(skill.skill_id),
                                    label: skill.skill,
                                    tipo_skill_id: skill.tipo_skill_id,
                                  }))}
                                formatCreateLabel={(inputValue) =>
                                  `${t(
                                    "tela_vaga_dados.item_msg_criar_skill",
                                  )} "${inputValue}"`
                                }
                                isDisabled={form.lista_skills.length >= 12} // 🚀 trava após 12
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddSkill(1)}
                              className="bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700 transition whitespace-nowrap cursor-pointer"
                            >
                              {t("tela_vaga_dados.item_botao_adicionar")}
                            </button>
                          </div>

                          {showErrors && form.lista_skills.length <= 0 && (
                            <p className="text-sm text-red-600 mt-1">
                              {t("tela_vaga_dados.item_msg_campo_obt")}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col gap-3 mt-5">
                          {form.lista_skills
                            .filter((f) => f.tipo_skill_id == 1)
                            .map((item) => {
                              const skill = skills.find(
                                (s) => s.skill_id === item.skill_id,
                              );
                              return (
                                <div
                                  key={item.skill_id}
                                  className="border border-purple-300 bg-purple-50 px-4 py-3 rounded-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="flex flex-col gap-2 w-full">
                                    {/* Linha com Skill, Peso e Avaliador */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 sm:gap-8">
                                      {/* Nome da skill */}
                                      <div className="bg-purple-600 text-white text-sm font-medium text-center px-3 py-1 rounded-full w-fit min-w-[150px]">
                                        {skill?.skill ?? item.nome}
                                      </div>

                                      {/* Peso com slider */}
                                      <div className="flex items-center gap-2 text-sm min-w-[200px]">
                                        <label className="font-medium whitespace-nowrap">
                                          {t("tela_vaga_dados.item_label_peso")}
                                        </label>
                                        <input
                                          type="range"
                                          min={1}
                                          max={10}
                                          step={0.5}
                                          list="tickmarks"
                                          value={item.peso / 10}
                                          onChange={(e) =>
                                            handleSkillChange(
                                              item.skill_id,
                                              "peso",
                                              Number(e.target.value) * 10,
                                            )
                                          }
                                          className="w-full sm:w-40 accent-purple-600 cursor-pointer"
                                        />
                                        <datalist id="tickmarks">
                                          {[...Array(19)].map((_, i) => {
                                            const val = i * 0.5 + 1;
                                            return (
                                              <option
                                                key={val}
                                                value={val.toFixed(1)}
                                              />
                                            );
                                          })}
                                        </datalist>
                                        <span className="w-8 text-right">
                                          {(item.peso / 10).toFixed(1)}
                                        </span>
                                      </div>

                                      {/* Avaliador */}
                                      <div className="flex items-center gap-4 text-sm min-w-[260px]">
                                        <div className="flex items-center gap-1">
                                          <label className="font-medium whitespace-nowrap">
                                            {t(
                                              "tela_vaga_dados.item_label_avaliador",
                                            )}
                                          </label>
                                          <TooltipIcon
                                            message={
                                              hasAvaliadorProprio
                                                ? `${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo1",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo2",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo3",
                                                  )}\n\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo4",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo5",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo6",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo7",
                                                  )}`
                                                : `${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo8",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo9",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo10",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo11",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo12",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo13",
                                                  )}`
                                            }
                                            perfil={perfil}
                                          />
                                        </div>
                                        <label className="flex items-center gap-1">
                                          <input
                                            type="radio"
                                            checked={
                                              hasAvaliadorProprio === true &&
                                              item.avaliador_proprio
                                                ? true
                                                : false
                                            }
                                            disabled={!hasAvaliadorProprio}
                                            onChange={() =>
                                              handleSkillChange(
                                                item.skill_id,
                                                "avaliador_proprio",
                                                true,
                                              )
                                            }
                                          />
                                          {t(
                                            "tela_vaga_dados.item_label_proprio",
                                          )}
                                        </label>
                                        <label className="flex items-center gap-1">
                                          <input
                                            type="radio"
                                            checked={
                                              hasAvaliadorProprio === false
                                                ? true
                                                : !item.avaliador_proprio
                                            }
                                            onChange={() =>
                                              handleSkillChange(
                                                item.skill_id,
                                                "avaliador_proprio",
                                                false,
                                              )
                                            }
                                          />
                                          {t(
                                            "tela_vaga_dados.item_label_whizzat",
                                          )}
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleRemoveSkill(item.skill_id)
                                    }
                                    className="text-red-600 hover:text-red-800 mt-2 sm:mt-0"
                                    title={t(
                                      "tela_vaga_dados.item_botao_remover_skill",
                                    )}
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              );
                            })}
                        </div>

                        {/* Botões no rodapé */}
                        <div className="flex flex-col md:flex-row justify-between gap-2 mt-auto pt-4">
                          <div className="flex">
                            <button
                              onClick={prevStep}
                              type="button"
                              className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                            >
                              {t("tela_vaga_dados.item_botao_voltar")}
                            </button>
                          </div>

                          {/* Direita: botões cadastrar e editar */}
                          <div className="flex gap-2">
                            <button
                              type="button" // evita submit acidental
                              onClick={handleCancel}
                              className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                            >
                              {t("tela_vaga_dados.item_botao_cancelar")}
                            </button>
                            <button
                              type="submit"
                              disabled={form.lista_skills.length < 3} // só habilita se >= 3
                              className={`w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 
                          ${
                            form.lista_skills.length < 3
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-purple-100 hover:bg-purple-200 cursor-pointer"
                          }`}
                            >
                              {t("tela_vaga_dados.item_botao_avancar")}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="w-full flex flex-col flex-1">
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col flex-1"
                      >
                        <div>
                          <h1 className="block text-sm mb-1 py-3 font-bold">
                            {t("tela_vaga_dados.item_label_informe_softskills")}
                            <p className="text-[11px] font-normal italic">
                              {t(
                                "tela_vaga_dados.item_label_informe_softskills_subitem",
                              )}
                            </p>
                          </h1>

                          <label className="text-sm font-medium mb-1 flex items-center gap-1">
                            {t("tela_vaga_dados.item_label_skill")}
                            <TooltipIcon
                              message={`${t(
                                "tela_vaga_dados.item_tooltip_skill_titulo",
                              )}\n${t(
                                "tela_vaga_dados.item_tooltip_skill_passo1",
                              )}\n${t(
                                "tela_vaga_dados.item_tooltip_skill_passo2",
                              )}\n${t(
                                "tela_vaga_dados.item_tooltip_skill_passo3",
                              )}`}
                              perfil={perfil}
                            />
                          </label>

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <CreatableSelect
                                isClearable
                                placeholder={t(
                                  "tela_vaga_dados.item_msg_skill",
                                )}
                                value={selectedSkill}
                                onChange={(newValue) =>
                                  setSelectedSkill(newValue)
                                }
                                options={skills
                                  .filter((f) => f.tipo_skill_id == 2)
                                  .map((skill) => ({
                                    value: String(skill.skill_id),
                                    label: skill.skill,
                                    tipo_skill_id: skill.tipo_skill_id,
                                  }))}
                                formatCreateLabel={(inputValue) =>
                                  `${t(
                                    "tela_vaga_dados.item_msg_criar_skill",
                                  )} "${inputValue}"`
                                }
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddSkill(2)}
                              className="bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700 transition whitespace-nowrap cursor-pointer"
                            >
                              {t("tela_vaga_dados.item_botao_adicionar")}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 mt-5">
                          {form.lista_skills
                            .filter((f) => f.tipo_skill_id == 2)
                            .map((item) => {
                              const skill = skills.find(
                                (s) => s.skill_id === item.skill_id,
                              );
                              return (
                                <div
                                  key={item.skill_id}
                                  className="border border-purple-300 bg-purple-50 px-4 py-3 rounded-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="flex flex-col gap-2 w-full">
                                    {/* Linha com Skill, Peso e Avaliador */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 sm:gap-8">
                                      {/* Nome da skill */}
                                      <div className="bg-purple-600 text-white text-sm font-medium text-center px-3 py-1 rounded-full w-fit min-w-[150px]">
                                        {skill?.skill ?? item.nome}
                                      </div>

                                      {/* Peso com slider */}
                                      <div className="flex items-center gap-2 text-sm min-w-[200px]">
                                        <label className="font-medium whitespace-nowrap">
                                          {t("tela_vaga_dados.item_label_peso")}
                                        </label>
                                        <input
                                          type="range"
                                          min={1}
                                          max={10}
                                          step={0.5}
                                          list="tickmarks"
                                          value={item.peso / 10}
                                          onChange={(e) =>
                                            handleSkillChange(
                                              item.skill_id,
                                              "peso",
                                              Number(e.target.value) * 10,
                                            )
                                          }
                                          className="w-full sm:w-40 accent-purple-600 cursor-pointer"
                                        />
                                        <datalist id="tickmarks">
                                          {[...Array(19)].map((_, i) => {
                                            const val = i * 0.5 + 1;
                                            return (
                                              <option
                                                key={val}
                                                value={val.toFixed(1)}
                                              />
                                            );
                                          })}
                                        </datalist>
                                        <span className="w-8 text-right">
                                          {(item.peso / 10).toFixed(1)}
                                        </span>
                                      </div>

                                      {/* Avaliador */}
                                      <div className="flex items-center gap-4 text-sm min-w-[260px]">
                                        <div className="flex items-center gap-1">
                                          <label className="font-medium whitespace-nowrap">
                                            {t(
                                              "tela_vaga_dados.item_label_avaliador",
                                            )}
                                          </label>
                                          <TooltipIcon
                                            message={
                                              hasAvaliadorProprio
                                                ? `${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo1",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo2",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo3",
                                                  )}\n\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo4",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo5",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo6",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo7",
                                                  )}`
                                                : `${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo8",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo9",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo10",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo11",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo12",
                                                  )}\n${t(
                                                    "tela_vaga_dados.item_tooltip_avaliador_passo13",
                                                  )}`
                                            }
                                            perfil={perfil}
                                          />
                                        </div>
                                        <label className="flex items-center gap-1">
                                          <input
                                            type="radio"
                                            checked={
                                              hasAvaliadorProprio === true &&
                                              item.avaliador_proprio
                                                ? true
                                                : false
                                            }
                                            disabled={!hasAvaliadorProprio}
                                            onChange={() =>
                                              handleSkillChange(
                                                item.skill_id,
                                                "avaliador_proprio",
                                                true,
                                              )
                                            }
                                          />
                                          {t(
                                            "tela_vaga_dados.item_label_proprio",
                                          )}
                                        </label>
                                        <label className="flex items-center gap-1">
                                          <input
                                            type="radio"
                                            checked={
                                              hasAvaliadorProprio === false
                                                ? true
                                                : !item.avaliador_proprio
                                            }
                                            onChange={() =>
                                              handleSkillChange(
                                                item.skill_id,
                                                "avaliador_proprio",
                                                false,
                                              )
                                            }
                                          />
                                          {t(
                                            "tela_vaga_dados.item_label_whizzat",
                                          )}
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleRemoveSkill(item.skill_id)
                                    }
                                    className="text-red-600 hover:text-red-800 mt-2 sm:mt-0"
                                    title={t(
                                      "tela_vaga_dados.item_botao_remover_skill",
                                    )}
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              );
                            })}
                        </div>

                        {/* Botões no rodapé */}
                        <div className="flex flex-col md:flex-row justify-between gap-2 mt-auto pt-4">
                          <div className="flex">
                            <button
                              onClick={prevStep}
                              type="button"
                              className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                            >
                              {t("tela_vaga_dados.item_botao_voltar")}
                            </button>
                          </div>

                          {/* Direita: botões cadastrar e editar */}
                          <div className="flex gap-2">
                            <button
                              type="button" // evita submit acidental
                              onClick={handleCancel}
                              className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                            >
                              {t("tela_vaga_dados.item_botao_cancelar")}
                            </button>
                            <button
                              type="submit"
                              className={`w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer`}
                            >
                              {t("tela_vaga_dados.item_botao_avancar")}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="w-full flex flex-col flex-1">
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col flex-1"
                      >
                        {/* Capa e Logo */}

                        {/* Container Principal */}
                        <div className="flex flex-col md:flex-row  w-full ">
                          {/* Coluna Esquerda */}
                          <div className="flex flex-col md:flex-row w-full">
                            {/* Dados da vaga e skills lado a lado */}
                            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-yellow-500"> */}
                            {/* Bloco - Informações da vaga */}
                            <div className="w-[65%] space-y-4 mr-2">
                              {/* Linha 1 - Logo + Título da vaga e empresa */}
                              <div className="flex flex-col gap-4">
                                {/* Logo e título + empresa ocupando toda largura */}
                                <div className="flex flex-row w-full gap-4 items-center">
                                  {/* Logo */}
                                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white shrink-0">
                                    {form.logo ? (
                                      <Image
                                        src={form?.logo}
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
                                  <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                      {form.nome_vaga}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                      {empresas.find(
                                        (e) =>
                                          e.id.toString() ===
                                          form.empresa_id.toString(),
                                      )?.nome_empresa ??
                                        t(
                                          "tela_vaga_dados.item_msg_indefinida",
                                        )}
                                    </p>
                                  </div>
                                </div>

                                {/* Data de vigência abaixo */}
                                <div className="flex items-center gap-2 bg-purple-100 text-purple-800 rounded-md px-1 py-1 text-sm w-fit">
                                  <CalendarDays className="w-4 h-4 text-purple-500" />
                                  <span>
                                    {t("tela_vaga_dados.item_msg_vigencia")}{" "}
                                    <strong>{dataFormatada}</strong>
                                  </span>
                                </div>
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
                                  {form.estado_label}
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
                                  {form.cidade_label}
                                </div>
                              </div>

                              {/* Linha 1 - Local e Data de Cadastro */}
                              <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2">
                                <div className="flex items-center gap-2 w-full">
                                  <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
                                  {t("tela_vaga_dados.item_msg_aberta")}{" "}
                                  {(form.data_cadastro ?? dataBase)
                                    ? new Date(
                                        form.data_cadastro ?? dataBase,
                                      ).toLocaleDateString("pt-BR")
                                    : t("tela_vaga_dados.item_msg_sem_data")}
                                </div>
                              </div>

                              {/* Linha 2 - Período e Modalidade */}
                              <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                                <div className="flex items-center gap-2 w-full sm:w-1/2">
                                  <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                                  {periodos.find(
                                    (p) =>
                                      String(p.periodo_trabalho_id) ===
                                      String(form.periodo_trabalho_id),
                                  )?.periodo ||
                                    t("tela_vaga_dados.item_msg_sem_periodo")}
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-1/2">
                                  <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                                  {modalidades.find(
                                    (m) =>
                                      String(m.modalidade_trabalho_id) ===
                                      String(form.modalidade_trabalho_id),
                                  )?.modalidade ||
                                    t(
                                      "tela_vaga_dados.item_msg_sem_modalidade",
                                    )}
                                </div>
                              </div>

                              <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50/40 p-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500">
                                    {t(
                                      "tela_vaga_dados.tipo_oportunidade_titulo",
                                    )}
                                    :
                                  </span>

                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                      form.tipo_oportunidade ===
                                      "AMPLA_CONCORRENCIA"
                                        ? "bg-gray-100 text-gray-700"
                                        : form.tipo_oportunidade ===
                                            "AFIRMATIVA"
                                          ? "bg-purple-100 text-purple-700"
                                          : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {form.tipo_oportunidade ===
                                    "AMPLA_CONCORRENCIA"
                                      ? t("tela_vaga_dados.tipo_ampla")
                                      : form.tipo_oportunidade === "AFIRMATIVA"
                                        ? t("tela_vaga_dados.tipo_afirmativa")
                                        : t("tela_vaga_dados.tipo_exclusiva")}
                                  </span>
                                </div>

                                {form.tipo_oportunidade !==
                                  "AMPLA_CONCORRENCIA" && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {form.publicos_afirmativos.map(
                                      (publico) => (
                                        <span
                                          key={publico}
                                          className="inline-flex rounded-full border border-purple-200 bg-white px-2.5 py-1 text-[11px] font-medium text-purple-700"
                                        >
                                          {getPublicoLabel(publico, t)}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Linha 4 - Descrição */}
                              <div>
                                <h3 className="text-md font-semibold text-gray-700 mb-1">
                                  {t("tela_vaga_dados.item_label_descricao")}
                                </h3>
                                <p className="text-sm text-gray-600 whitespace-pre-line">
                                  {form.descricao}
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
                                {form.lista_skills?.map((skill, index) => (
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
                            <SkillsPanel skills={skillsData} perfil={perfil} />
                          </div>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col md:flex-row justify-between gap-2 mt-auto pt-4">
                          <div className="flex">
                            <button
                              onClick={prevStep}
                              type="button"
                              className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                            >
                              {t("tela_vaga_dados.item_botao_voltar")}
                            </button>
                          </div>

                          {/* Direita: botões cadastrar e editar */}
                          <div className="flex gap-2">
                            <button
                              type="button" // evita submit acidental
                              onClick={handleCancel}
                              className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                            >
                              {t("tela_vaga_dados.item_botao_cancelar")}
                            </button>
                            <button
                              type="submit"
                              className={`px-6 py-2 rounded-full  font-semibold flex items-center justify-center gap-2 ${
                                isFormValid(form)
                                  ? "text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                                  : "bg-gray-300 cursor-not-allowed"
                              }`}
                            >
                              {isSubmitting ? (
                                <ImSpinner2 className="animate-spin" />
                              ) : (
                                t("tela_vaga_dados.item_botao_publicar")
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </PageContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const isFormValid = (form: VagasForm) => {
  return (
    form.empresa_id !== "" &&
    form.nome_vaga.trim() !== "" &&
    form.cidade_id !== 0 &&
    form.descricao.trim() !== "" &&
    form.modalidade_trabalho_id !== null &&
    form.periodo_trabalho_id !== null &&
    form.qtde_dias_aberta !== "0" &&
    form.qtde_posicao !== "0"
  );
};
