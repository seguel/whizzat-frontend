"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import { ProfileType } from "../../components/perfil/ProfileContext";
/* import { useAuthGuard } from "../../lib/hooks/useAuthGuard";*/
import LoadingOverlay from "../../components/LoadingOverlay";
import { FaCloudUploadAlt } from "react-icons/fa";
import {
  X,
  Building2,
  ClipboardCheck,
  Star,
  FileText,
  Upload,
} from "lucide-react";
import { ImSpinner2 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import TooltipIcon from "../../components/TooltipIcon";
import SkillsPanel from "../../components/perfil/SkillsPanel";

interface AvaliadorProps {
  perfil: ProfileType;
  avaliadorId?: string | null;
  userId?: string;
  nome_user: string;
}

interface FormacaoAvaliacao {
  id: number;
  graduacao_id: number;
  formacao: string;
  certificado_file?: string; // nome ou caminho (pode ficar vazio no início)
  certificado_preview?: string; // URL temporária (opcional)
}

interface CertificadoAvaliacao {
  // id: string | number;
  certificacao_id: number;
  nome?: string;
  certificado_file?: string; // nome ou caminho (pode ficar vazio no início)
  certificado_preview?: string; // URL temporária (opcional)
}

interface SkillAvaliacao {
  skill_id: number;
  nome?: string;
  peso: number;
  favorito: boolean;
  tempo_favorito?: string;
}

// Tipos de dados do formulário
interface AvaliadorForm {
  empresa_id: string;
  telefone: string;
  logoPreview: string | null;
  localizacao: string;
  apresentacao: string;
  meioNotificacao: string;
  avaliar_todos: string;
  lista_skills: SkillAvaliacao[];
  lista_formacao: FormacaoAvaliacao[];
  lista_certificado: CertificadoAvaliacao[];
  ativo: boolean;
  trabalha_empresa: string;
  nome_user: string;
  status_cadastro: number;
  data_envio_link: string | null;
}

interface AvaliadorData {
  id: number;
  empresa_id?: number;
  telefone?: string;
  apresentacao?: string;
  localizacao: string;
  meio_notificacao: string;
  logo?: string;
  avaliar_todos: string;
  skills: SkillAvaliacao[];
  formacoes: FormacaoAvaliacao[];
  certificacoes: CertificadoAvaliacao[];
  ativo: boolean;
  data_envio_link: string;
}

// LocalStorage hook
// Hook genérico
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

export default function PerfilAvaliador({
  perfil,
  avaliadorId,
  userId,
  nome_user,
}: AvaliadorProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useLocalStorage<AvaliadorForm>(
    `avaliadorForm_${userId}`,
    {
      empresa_id: "",
      telefone: "",
      logoPreview: null,
      localizacao: "",
      apresentacao: "",
      meioNotificacao: "",
      avaliar_todos: "",
      lista_skills: [],
      lista_formacao: [],
      lista_certificado: [],
      ativo: true,
      trabalha_empresa: "",
      nome_user: "",
      status_cadastro: -1,
      data_envio_link: null,
    }
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /***** formacao ******/
  const [formacaoInput, setFormacaoInput] = useState<string>("");
  const [novoCertificadoFile, setNovoCertificadoFile] = useState<File | null>(
    null
  );
  const [novoCertificadoPreview, setNovoCertificadoPreview] = useState<
    string | null
  >(null);
  // Estado para arquivos dos itens já adicionados
  const [, /* certificadoFiles */ setCertificadoFiles] = useState<
    Record<string, File>
  >({});
  const [certificadoPreviews, setCertificadoPreviews] = useState<
    Record<string, string>
  >({});
  /***** fim formacao ******/

  /***** certificacoes ******/
  const [novoCertificacaoFile, setNovoCertificacaoFile] = useState<File | null>(
    null
  );
  const [novoCertificacaoPreview, setNovoCertificacaoPreview] = useState<
    string | null
  >(null);
  // Estado para arquivos dos itens já adicionados
  const [, /* certificacaoFiles */ setCertificacaoFiles] = useState<
    Record<string, File>
  >({});
  const [certificacaoPreview, setCertificacaoPreview] = useState<
    Record<string, string>
  >({});

  const [certificacao, setCertificacao] = useState<
    { id: number | string; certificado: string }[]
  >([]);

  const [selectedCertificacao, setSelectedCertificacao] = useState<{
    value: string;
    label: string;
  } | null>(null);
  /***** fim certificacoes ******/

  const [avaliador, setAvaliador] = useState<AvaliadorData | null>(null);
  const [loadingAvaliador, setLoadingAvaliador] = useState<boolean>(true);
  const [empresas, setEmpresas] = useState<
    { id: number; nome_empresa: string }[]
  >([]);
  const [graduacoes, setGraduacoes] = useState<
    { id: number; graduacao: string }[]
  >([]);

  const [skills, setSkills] = useState<{ skill_id: number; skill: string }[]>(
    []
  );

  const [selectedGraduacao, setSelectedGraduacao] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const skillsData = form.lista_skills || [];

  const [selectedSkill, setSelectedSkill] = useState<{
    value: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (nome_user && !form.nome_user) {
      setForm((prev) => ({ ...prev, nome_user }));
    }
  }, [nome_user]);

  useEffect(() => {
    if (!avaliadorId) return;

    const fetchAvaliador = async () => {
      setLoadingAvaliador(true);
      const perfilId =
        perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/avaliador/${avaliadorId}/perfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar dados da avaliador");

        const data = await res.json();

        // mapeia os campos da API para o form
        const avaliadorFormData: AvaliadorForm = {
          empresa_id: data.empresa_id || "",
          telefone: data.telefone || "",
          localizacao: data.localizacao || "",
          apresentacao: data.apresentacao || "",
          meioNotificacao: data.meio_notificacao || "",
          logoPreview: data.logo || null,
          avaliar_todos: data.avaliar_todos ? "1" : "0",
          lista_skills: data.skills || [],
          lista_formacao: data.formacoes || [],
          lista_certificado: data.certificacoes || [],
          ativo: data.ativo ?? true,
          trabalha_empresa: data.empresa_id ? "SIM" : "NAO",
          nome_user: data.nomeUser,
          status_cadastro: data.status_cadastro ?? -1,
          data_envio_link: data.data_envio_link || null,
        };

        setForm(avaliadorFormData); // <- preenche estado + localStorage
        setAvaliador(data.avaliador); // se quiser manter o objeto bruto
        // setNomeUSer(data.nomeUser);

        router.push(`/dashboard/perfil?perfil=${perfil}&id=${avaliadorId}`);
      } catch (error) {
        console.error("Erro ao carregar avaliador:", error);
      } finally {
        setLoadingAvaliador(false);
      }
    };

    fetchAvaliador();
  }, [avaliadorId]);

  useEffect(() => {
    setLoadingAvaliador(true);
    // const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    const fetchSelectData = async () => {
      try {
        const [empresasRes, skillsRes, graduacoesRes, certificacaoRes] =
          await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/avaliador/empresas-cadastro/`,
              {
                method: "GET",
                credentials: "include",
              }
            ),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/`, {
              method: "GET",
              credentials: "include",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/graduacao/`, {
              method: "GET",
              credentials: "include",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificacoes/`, {
              method: "GET",
              credentials: "include",
            }),
          ]);

        const [empresasData, skillsData, graduacoesData, certificacaoData] =
          await Promise.all([
            empresasRes.json(),
            skillsRes.json(),
            graduacoesRes.json(),
            certificacaoRes.json(),
          ]);

        setEmpresas(empresasData.empresas);
        setSkills(skillsData);
        setGraduacoes(graduacoesData);
        setCertificacao(certificacaoData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoadingAvaliador(false);
      }
    };

    fetchSelectData();
  }, [perfil]);

  if (avaliadorId && loadingAvaliador) {
    return <LoadingOverlay />;
  }

  const handleCancel = () => {
    // Limpa o formulário salvo no localStorage
    localStorage.removeItem(`avaliadorForm_${userId}`);

    // Feedback visual
    toast.error("Alterações descartadas.", {
      duration: 3000, // 3 segundos
    });

    // Redireciona com segurança, evitando id indefinido
    const url = `/dashboard?perfil=${perfil}`;

    router.push(url);
  };

  // Handlers comuns
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    if (name === "logo" && files?.[0]) {
      const file = files[0];
      const maxSize = 1 * 1024 * 1024; // 1MB

      if (file.size > maxSize) {
        toast.error("O arquivo deve ter no máximo 1MB.", {
          duration: 5000, // ← 5 segundos
        });
        return;
      }

      const preview = URL.createObjectURL(file);

      if (name === "logo") {
        if (form.logoPreview && !form.logoPreview.startsWith("http")) {
          URL.revokeObjectURL(form.logoPreview);
        }
        setLogoFile(file);
        setForm((prev) => ({ ...prev, logoPreview: preview }));
      }
    } else {
      // Para campos de texto ou outros
      const { name, type } = e.target;
      const value =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      setForm((prev) => ({
        ...prev,
        [name]: value,
        // se selecionou "NAO", limpa empresa_id
        ...(name === "trabalha_empresa" && value === "NAO"
          ? { empresa_id: "", avaliar_todos: "1" }
          : {}),
      }));
    }
  };

  const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    /* const empresaSelecionada = empresas.find(
      (e) => e.id.toString() === selectedId
    ); */

    setForm((prev) => ({
      ...prev,
      empresa_id: selectedId,
    }));
  };

  const handleGraduacaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedText = e.target.options[e.target.selectedIndex].text; // 👈 pega o texto visível

    if (selectedId) {
      setSelectedGraduacao({
        value: selectedId,
        label: selectedText,
      });
    } else {
      setSelectedGraduacao(null);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (step === 1) {
      if (
        !form.telefone ||
        !form.localizacao ||
        !form.meioNotificacao ||
        !form.avaliar_todos
      )
        return;

      if (form.trabalha_empresa === "SIM" && !form.empresa_id) {
        setShowErrors(true);
        return;
      }

      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 2) {
      if (form.lista_formacao.length <= 0) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 3) {
      if (form.lista_certificado.length <= 0) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 4) {
      if (form.lista_skills.length <= 0) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 5) {
      if (!isFormValid(form)) return;

      setIsSubmitting(true);

      try {
        const perfilId =
          perfil === "recrutador" ? "2" : perfil === "avaliador" ? "3" : "1";

        const formData = new FormData();
        formData.append(
          "empresaId",
          form.empresa_id ? String(form.empresa_id) : ""
        );
        formData.append("perfilId", String(perfilId));
        formData.append("telefone", form.telefone);
        formData.append("localizacao", form.localizacao);
        formData.append("apresentacao", form.apresentacao);
        formData.append("meio_notificacao", form.meioNotificacao);
        formData.append(
          "avaliar_todos",
          form.avaliar_todos === "1" ? "true" : "false"
        );

        if (logoFile) {
          formData.append("logo", logoFile); // precisa ser File/Blob
        }

        if (avaliadorId) {
          formData.append("avaliadorId", String(avaliadorId));
          formData.append("ativo", form.ativo ? "1" : "0");
        }

        // Skills existentes
        formData.append(
          "skills",
          JSON.stringify(
            serializeSkills(form.lista_skills.filter((s) => s.skill_id > 0))
          )
        );

        // Skills novas
        formData.append(
          "novas_skills",
          JSON.stringify(
            serializeSkills(form.lista_skills.filter((s) => s.skill_id < 0))
          )
        );

        formData.append(
          "formacoes",
          JSON.stringify(
            form.lista_formacao.map((f) => ({
              id: typeof f.id === "string" && f.id ? null : f.id,
              graduacao_id: f.graduacao_id,
              formacao: f.formacao,
              certificado_file: f.certificado_file,
            }))
          )
        );

        /* console.log("logoFile state:", logoFile);
        for (const [key, value] of formData.entries()) {
          console.log("FormData:", key, value);
        } */

        const url = !avaliadorId
          ? `${process.env.NEXT_PUBLIC_API_URL}/avaliador/create-avaliador`
          : `${process.env.NEXT_PUBLIC_API_URL}/avaliador/update-avaliador`;

        const response = await fetch(url, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage =
            typeof data.message === "string"
              ? data.message
              : Array.isArray(data.message)
              ? data.message.join(", ")
              : "Erro ao salvar avaliador.";
          throw new Error(errorMessage);
        }

        //setAvaliadorPublicado(data);

        localStorage.removeItem(`avaliadorForm_${userId}`);
        toast.success(`Avaliador publicada com sucesso!`, {
          duration: 5000,
        });
        setIsSubmitting(false);
        router.push(`/dashboard?perfil=${perfil}`);
      } catch (err: unknown) {
        console.error("Erro ao enviar dados:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Erro ao enviar dados da avaliador. Tente novamente.";

        toast.error(message, {
          duration: 5000,
        });

        setIsSubmitting(false);
      }
    }
  };

  // Função utilitária para transformar skills
  function serializeSkills(skills: SkillAvaliacao[]) {
    return skills.map((s) => ({
      skill_id: s.skill_id,
      nome: s.nome ?? "",
      peso: Number(s.peso) || 0,
      favorito: Boolean(s.favorito), // boolean
      tempo_favorito: s.tempo_favorito ?? "",
    }));
  }

  const handleAddSkill = () => {
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
      favorito: false,
      tempo_favorito: "",
      nome: selectedSkill.label, // ← Salva o nome para posterior criação no backend
    };

    setForm((prev) => ({
      ...prev,
      lista_skills: [...prev.lista_skills, novaSkill],
    }));

    if (isNovaSkill) {
      setSkills((prev) => [
        ...prev,
        { skill_id: id, skill: selectedSkill.label },
      ]);
    }

    setSelectedSkill(null);
  };

  const handleSkillChange = (
    skill_id: number,
    field: "peso" | "favorito" | "tempo_favorito",
    value: number | boolean | string
  ) => {
    const atualizadas = form.lista_skills.map((s) => {
      if (s.skill_id !== skill_id) return s;

      // se está desmarcando o favorito, limpar tempo_favorito
      /* if (field === "favorito" && value === false) {
        return { ...s, favorito: false, tempo_favorito: "" };
      } */

      return { ...s, [field]: value };
    });

    setForm((prev) => ({ ...prev, lista_skills: atualizadas }));
  };

  const handleRemoveSkill = (skill_id: number) => {
    setForm((prev) => ({
      ...prev,
      lista_skills: prev.lista_skills.filter((s) => s.skill_id !== skill_id),
    }));
  };

  /*** formacao ***/

  const handleNovoCertificadoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("O arquivo deve ter no máximo 2MB.");
      return;
    }

    setNovoCertificadoFile(file);
    setNovoCertificadoPreview(URL.createObjectURL(file));
  };

  const handleAddFormacao = () => {
    if (!selectedGraduacao || !formacaoInput.trim() || !novoCertificadoFile)
      return;

    const novaId = Date.now() * -1;
    const novaFormacao: FormacaoAvaliacao = {
      id: novaId,
      graduacao_id: Number(selectedGraduacao.value),
      formacao: formacaoInput.trim(),
      certificado_file: String(novaId),
      certificado_preview: novoCertificadoPreview || undefined,
    };

    setForm((prev) => ({
      ...prev,
      lista_formacao: [...prev.lista_formacao, novaFormacao],
    }));

    // Salva arquivo para envio posterior
    setCertificadoFiles((prev) => ({ ...prev, [novaId]: novoCertificadoFile }));
    setCertificadoPreviews((prev) => ({
      ...prev,
      [novaId]: novoCertificadoPreview || "",
    }));

    // Limpar campos temporários
    setSelectedGraduacao(null);
    setFormacaoInput("");
    setNovoCertificadoFile(null);
    setNovoCertificadoPreview(null);
  };

  const handleCertificadoItemChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string | number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setCertificadoFiles((prev) => ({ ...prev, [id]: file }));
    setCertificadoPreviews((prev) => ({ ...prev, [id]: preview }));

    setForm((prev) => ({
      ...prev,
      lista_formacao: prev.lista_formacao.map((f) =>
        f.id === id ? { ...f, certificado_preview: preview } : f
      ),
    }));
  };

  const handleRemoveFormacao = (id: string | number) => {
    setForm((prev) => ({
      ...prev,
      lista_formacao: prev.lista_formacao.filter((f) => f.id !== id),
    }));
  };

  /*** certificacoes ***/
  const handleNovoCertificacaoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("O arquivo deve ter no máximo 2MB.");
      return;
    }

    setNovoCertificacaoFile(file);
    setNovoCertificacaoPreview(URL.createObjectURL(file));
  };

  const handleAddCertificacao = () => {
    if (!selectedCertificacao?.value || !novoCertificacaoFile) {
      setShowErrors(true);
      return;
    }
    const isNovaCert = isNaN(Number(selectedCertificacao.value));
    const id = isNovaCert
      ? Date.now() * -1
      : Number(selectedCertificacao.value);

    if (form.lista_certificado.some((s) => s.certificacao_id === id)) return;

    const novaCert = {
      certificacao_id: id,
      nome: selectedCertificacao.label, // ← Salva o nome para posterior criação no backend
      certificado_file: String(id),
      certificado_preview: novoCertificacaoPreview || undefined,
    };

    setCertificacaoFiles((prev) => ({ ...prev, [id]: novoCertificacaoFile }));
    setCertificacaoPreview((prev) => ({
      ...prev,
      [id]: novoCertificacaoPreview || "",
    }));

    setForm((prev) => ({
      ...prev,
      lista_certificado: [...prev.lista_certificado, novaCert],
    }));

    if (isNovaCert) {
      setCertificacao((prev) => [
        ...prev,
        { id: id, certificado: selectedCertificacao.label },
      ]);
    }

    setSelectedCertificacao(null);
    setNovoCertificacaoFile(null);
    setNovoCertificacaoPreview(null);
  };

  const handleCertificacaoItemChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string | number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setCertificacaoFiles((prev) => ({ ...prev, [id]: file }));
    setCertificacaoPreview((prev) => ({ ...prev, [id]: preview }));

    setForm((prev) => ({
      ...prev,
      lista_certificado: prev.lista_certificado.map((f) =>
        f.certificacao_id === id ? { ...f, certificado_preview: preview } : f
      ),
    }));
  };

  const handleRemoveCertificacao = (id: number) => {
    setForm((prev) => ({
      ...prev,
      lista_certificado: prev.lista_certificado.filter(
        (s) => s.certificacao_id !== id
      ),
    }));
  };

  /*** fim certificaoes ***/

  const handleReenviarSolicitacao = async () => {
    setIsResending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avaliador/reenviar-solicitacao/${avaliadorId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao reenviar solicitação");
      }
      toast.success(`Solicitação reenviada com sucesso!`, {
        duration: 5000,
      });
      window.location.reload();
    } catch (error) {
      toast.error(`Erro ao reenviar solicitação!`, {
        duration: 5000,
      });
      console.error("Erro ao reenviar solicitação:", error);
      setIsResending(false);
    }
  };

  if (loadingAvaliador) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {step != 6 && (
          <div className="pt-3 pl-6 flex items-center justify-center">
            <div className="flex items-center justify-between w-full text-sm font-medium text-gray-500">
              {[
                "1 Dados",
                "2 Formação Academica",
                "3 Certificação",
                "4 Skills",
                "5 Visualizar",
                "6 Publicar",
              ].map((etapa, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 flex-1 min-w-0"
                >
                  <div
                    className={`w-6 h-6 rounded-full text-center text-white text-xs flex items-center justify-center ${
                      step === index + 1 ? "bg-blue-600" : "bg-gray-300"
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
                  {index < 5 && (
                    <span className="mx-1 text-gray-300 hidden sm:inline">
                      ─────
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <main className="p-4 grid grid-cols-1 gap-4 w-[98%] mx-auto">
          <div className="flex flex-col items-start p-4 bg-white rounded-lg shadow-sm w-full min-h-[500px]">
            {step === 1 && (
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-4 w-full"
              >
                {avaliadorId && (
                  <div className="flex items-center justify-between w-full">
                    {/* Esquerda: Toggle + "Ativo" */}
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="ativo"
                          checked={form.ativo ?? avaliador?.ativo ?? true}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-5"></div>
                      </div>
                      <span className="ml-3 text-sm font-normal text-gray-700">
                        Ativo
                      </span>
                    </label>

                    {/* Direita: Situação Cadastro */}
                    <div className="text-sm text-right">
                      <span className="block font-medium text-gray-700">
                        Situação do Cadastro:
                      </span>

                      {(() => {
                        if (
                          form.status_cadastro === -1 &&
                          form.data_envio_link
                        ) {
                          const cadastroDate = new Date(form.data_envio_link);
                          const diffDias = Math.floor(
                            (Date.now() - cadastroDate.getTime()) /
                              (1000 * 60 * 60 * 24)
                          );

                          if (diffDias > 3) {
                            // Exibe botão no lugar do texto
                            return (
                              <button
                                type="button"
                                onClick={handleReenviarSolicitacao}
                                className="mt-1 rounded-md bg-blue-600 px-3 py-1 text-white text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                              >
                                {isResending ? (
                                  <span className="flex items-center gap-1">
                                    <ImSpinner2 className="animate-spin" />
                                    Enviando ...
                                  </span>
                                ) : (
                                  "Reenviar Solicitação"
                                )}
                              </button>
                            );
                          }
                        }

                        // Caso contrário, exibe o texto normalmente
                        return (
                          <span
                            className={`block ${
                              form.status_cadastro === 1
                                ? "text-green-600 font-semibold"
                                : form.status_cadastro === -1
                                ? "text-yellow-600 font-medium"
                                : "text-red-600 font-medium"
                            }`}
                          >
                            {form.status_cadastro === 1
                              ? "Confirmado"
                              : form.status_cadastro === -1
                              ? "Aguardando confirmação"
                              : "Cadastro Rejeitado"}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome:
                  </label>
                  <div className="flex items-center border border-blue-400 rounded px-3 py-2 bg-gray-100 cursor-not-allowed opacity-80">
                    <input
                      name="nome_user"
                      placeholder="Nome"
                      className="w-full outline-none"
                      defaultValue={form.nome_user}
                      disabled={true}
                    />
                  </div>
                </div>

                <fieldset className="text-sm text-gray-700 mt-2">
                  <legend className="mb-1 font-medium">
                    Você trabalha para uma empresa que está na Whizzat?
                  </legend>
                  <div className="flex">
                    <label className="flex items-center gap-2 cursor-pointer mr-10">
                      <input
                        type="radio"
                        name="trabalha_empresa"
                        value="SIM"
                        checked={"SIM" === String(form.trabalha_empresa)}
                        onChange={handleChange}
                        className="appearance-none w-4 h-4 rounded-full border-2 border-blue-600 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200"
                      />
                      <span>Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="trabalha_empresa"
                        value="NAO"
                        checked={"NAO" === String(form.trabalha_empresa)}
                        onChange={handleChange}
                        className="appearance-none w-4 h-4 rounded-full border-2 border-blue-600 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200"
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </fieldset>

                {/* Empresa */}
                <label className="flex flex-col text-sm text-gray-700 ">
                  Empresa:
                  <select
                    className={`
                      border border-blue-600 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300
                      ${
                        form.trabalha_empresa !== "SIM"
                          ? "bg-gray-100 cursor-not-allowed opacity-80"
                          : ""
                      }
                    `}
                    name="empresa_id"
                    value={
                      form.trabalha_empresa !== "SIM"
                        ? ""
                        : form.empresa_id ?? ""
                    }
                    onChange={handleEmpresaChange}
                    disabled={form.trabalha_empresa !== "SIM"}
                  >
                    <option value="">Selecione a empresa</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nome_empresa}
                      </option>
                    ))}
                  </select>
                </label>

                {showErrors &&
                  !form.empresa_id &&
                  form.trabalha_empresa === "SIM" && (
                    <p className="text-sm text-red-600 mt-1">
                      Campo obrigatório.
                    </p>
                  )}

                <fieldset className="text-sm text-gray-700 mt-2">
                  <legend className="mb-1 font-medium">
                    Você deseja avaliar candidatos e vagas:
                  </legend>
                  <div className="flex">
                    <label className="flex items-center gap-2 cursor-pointer mr-10">
                      <input
                        type="radio"
                        name="avaliar_todos"
                        value="1"
                        checked={
                          form.trabalha_empresa !== "SIM"
                            ? true
                            : "1" === String(form.avaliar_todos)
                        }
                        onChange={handleChange}
                        className="appearance-none w-4 h-4 rounded-full border-2 border-blue-600 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200"
                      />
                      <span>De qualquer empresa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="avaliar_todos"
                        value="0"
                        checked={
                          form.trabalha_empresa !== "SIM"
                            ? false
                            : "0" === String(form.avaliar_todos)
                        }
                        disabled={form.trabalha_empresa !== "SIM"}
                        onChange={handleChange}
                        className={`appearance-none w-4 h-4 rounded-full border-2 border-blue-600 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200
                          ${
                            form.trabalha_empresa !== "SIM"
                              ? "bg-gray-100 cursor-not-allowed opacity-80"
                              : ""
                          }`}
                      />
                      <span>Somente da minha empresa</span>
                    </label>
                  </div>
                </fieldset>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telefone de contato:
                  </label>
                  <div className="flex items-center border border-blue-400 rounded px-3 py-2">
                    <span className="mr-2">🇧🇷</span>
                    <input
                      type="tel"
                      name="telefone"
                      placeholder="Telefone"
                      className="w-full outline-none"
                      defaultValue={avaliador?.telefone ?? form.telefone}
                      onChange={handleChange}
                    />
                  </div>
                  {showErrors && !form.telefone && (
                    <p className="text-sm text-red-600 mt-1">
                      Campo obrigatório.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Localização:
                  </label>
                  <input
                    type="text"
                    name="localizacao"
                    placeholder="Informe o seu local"
                    className="w-full border border-blue-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={form.localizacao}
                    onChange={handleChange}
                  />
                  {showErrors && !form.localizacao && (
                    <p className="text-sm text-red-600 mt-1">
                      Campo obrigatório.
                    </p>
                  )}
                </div>

                <fieldset className="text-sm text-gray-700 mt-2">
                  <legend className="mb-1 font-medium">
                    Meio de Notificação:
                  </legend>
                  <div className="flex">
                    <label className="flex items-center gap-2 cursor-pointer mr-10">
                      <input
                        type="radio"
                        name="meioNotificacao"
                        value="WhatsApp"
                        checked={"WhatsApp" === String(form.meioNotificacao)}
                        onChange={handleChange}
                        className="appearance-none w-4 h-4 rounded-full border-2 border-blue-600 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200"
                      />
                      <span>WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="meioNotificacao"
                        value="SMS"
                        checked={"SMS" === String(form.meioNotificacao)}
                        onChange={handleChange}
                        className="appearance-none w-4 h-4 rounded-full border-2 border-blue-600 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200"
                      />
                      <span>SMS</span>
                    </label>
                  </div>
                  {showErrors && !form.meioNotificacao && (
                    <p className="text-sm text-red-600 mt-1">
                      Campo obrigatório.
                    </p>
                  )}
                </fieldset>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descreva, em algumas linhas, um pouco mais sobre você. Este
                    texto será sua carta de apresentação para as empresas na
                    plataforma.{" "}
                    <strong>
                      (Caso você seja de uma única empresa, pode deixar em
                      branco este campo)
                    </strong>
                  </label>
                  <textarea
                    name="apresentacao"
                    placeholder="Apresente-se "
                    className="w-full border border-blue-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={6}
                    value={form.apresentacao || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        apresentacao: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Carregue uma foto, imagem, logo do avaliador (recomendado
                    512×512 px, até 1MB).
                  </label>
                  <label
                    className={`
                      flex flex-col items-center justify-center
                      border border-dashed border-blue-400 rounded
                      cursor-pointer hover:bg-blue-50
                      min-h-[50px]
                      p-3
                      sm:p-6
                    `}
                  >
                    {form.logoPreview ? (
                      <Image
                        src={form.logoPreview}
                        alt="Prévia da logo"
                        width={80}
                        height={50}
                        className="object-contain mb-2"
                        unoptimized
                        priority={false}
                      />
                    ) : (
                      <FaCloudUploadAlt className="text-2xl mb-1" />
                    )}
                    {!form.logoPreview && (
                      <span className="text-sm font-medium text-center sm:text-base">
                        Clique aqui e carregue sua imagem
                      </span>
                    )}
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      className="hidden"
                      onChange={handleChange}
                    />
                  </label>
                  {showErrors && !logoFile && (
                    <p className="text-sm text-red-600 mt-1">
                      Logo obrigatória.
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button" // evita submit acidental
                    onClick={handleCancel}
                    className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                  >
                    Avançar
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="w-full h-full flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                  <div>
                    <h1 className="block text-sm mb-1 py-3 font-bold">
                      Informe as suas formações acadêmicas
                    </h1>

                    {/* Linha de adição de formação */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:gap-3 gap-2">
                      {/* Graduação */}
                      <div className="flex flex-col w-full sm:w-1/4">
                        <label className="text-sm font-medium mb-1 flex items-center gap-1">
                          Graduação:
                        </label>
                        <select
                          className="border border-blue-400 rounded-md px-2 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-300"
                          name="graduacao_id"
                          value={selectedGraduacao?.value || ""}
                          onChange={handleGraduacaoChange}
                        >
                          <option value="">Selecione a graduação</option>
                          {graduacoes.map((grad) => (
                            <option key={grad.id} value={grad.id}>
                              {grad.graduacao}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Formação */}
                      <div className="flex flex-col w-full sm:w-2/4">
                        <label className="text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
                          Formação:
                        </label>
                        <input
                          type="text"
                          name="formacao"
                          placeholder="Digite sua formação"
                          className="w-full border border-blue-400 rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-300"
                          value={formacaoInput}
                          onChange={(e) => setFormacaoInput(e.target.value)}
                        />
                      </div>

                      {/* Upload certificado estilizado */}
                      <div className="flex flex-col w-full sm:w-1/4">
                        <label className="text-xs sm:text-sm font-medium mb-1">
                          Certificado (JPG, PNG ou PDF)
                        </label>
                        {/* Input real (oculto) */}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          id="novo-certificado"
                          onChange={handleNovoCertificadoChange} // ✅ AQUI ESTAVA FALTANDO
                        />

                        {/* Label estilizado (clique para selecionar arquivo) */}
                        <label
                          htmlFor="novo-certificado"
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-blue-400 rounded-md cursor-pointer hover:bg-blue-50 transition text-sm sm:text-base truncate"
                        >
                          <Upload
                            size={18}
                            className="text-blue-600 shrink-0"
                          />
                          <span className="truncate">
                            {novoCertificadoFile
                              ? novoCertificadoFile.name // mostra o nome real do arquivo
                              : "Selecione o arquivo"}
                          </span>
                        </label>
                      </div>

                      {/* Botão adicionar */}
                      <div className="flex sm:mt-6">
                        <button
                          type="button"
                          onClick={handleAddFormacao}
                          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition whitespace-nowrap cursor-pointer"
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>

                    {showErrors &&
                      (!selectedGraduacao?.value ||
                        !formacaoInput ||
                        !novoCertificadoFile) && (
                        <p className="text-sm text-red-600 mt-1">
                          Campo obrigatório.
                        </p>
                      )}
                  </div>

                  {/* Lista de formações */}
                  <div className="flex flex-1 flex-col gap-3 mt-5">
                    {form.lista_formacao?.map((item) => {
                      const graduacaoObj = graduacoes.find(
                        (g) => g.id === item.graduacao_id
                      );

                      return (
                        <div
                          key={item.id}
                          className="border border-blue-300 bg-blue-50 px-4 py-3 rounded-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap">
                              {/* Tipo da graduação */}
                              <div className="flex items-center gap-2 text-sm min-w-[200px] font-bold">
                                <span>
                                  {graduacaoObj?.graduacao ??
                                    "Graduação não encontrada"}
                                </span>
                              </div>

                              {/* Nome da formação */}
                              <div className="bg-blue-600 text-white text-sm font-medium text-center px-3 py-1 rounded-full w-fit min-w-[150px]">
                                {item.formacao}
                              </div>

                              {/* Ações */}
                              <div className="flex items-center gap-3 text-sm min-w-[120px]">
                                {/* Visualizar certificado */}
                                {certificadoPreviews[item.id] && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      window.open(
                                        certificadoPreviews[item.id],
                                        "_blank"
                                      )
                                    }
                                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 hover:text-blue-800 transition flex items-center justify-center cursor-pointer"
                                    title="Visualizar certificado"
                                  >
                                    <FileText size={20} />
                                  </button>
                                )}

                                {/* Upload certificado */}
                                <label
                                  htmlFor={`certificado-${item.id}`}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 hover:text-blue-800 transition flex items-center justify-center cursor-pointer"
                                  title="Substituir certificado"
                                >
                                  <Upload size={20} />
                                </label>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  id={`certificado-${item.id}`}
                                  className="hidden"
                                  onChange={(e) =>
                                    handleCertificadoItemChange(e, item.id)
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {/* Remover formação */}
                          <button
                            onClick={() => handleRemoveFormacao(item.id)}
                            className="text-red-600 hover:text-red-800 mt-2 sm:mt-0 self-end sm:self-auto cursor-pointer"
                            title="Remover Formação"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botões de navegação */}
                  <div className="flex flex-col md:flex-row justify-between gap-2 mt-4">
                    <div className="flex">
                      <button
                        onClick={prevStep}
                        type="button"
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 text-center cursor-pointer"
                      >
                        Voltar
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={form.lista_formacao.length < 1}
                        className={`w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 
                          ${
                            form.lista_formacao.length < 1
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-100 hover:bg-blue-200 cursor-pointer"
                          }`}
                      >
                        Avançar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="w-full h-full flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                  <div>
                    <h1 className="block text-sm mb-1 py-3 font-bold">
                      Informe as suas certificações
                      <p className="block text-[11x] font-light">(mínimo 1)</p>
                    </h1>

                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr_auto] gap-4 items-end">
                        {/* Campo de certificação - largo */}
                        <div className="flex flex-col w-full">
                          <label className="text-sm font-medium mb-1 flex items-center gap-1">
                            Certificações:
                            <TooltipIcon
                              message={`Como adicionar certificação que não está na lista:\n1. Digite a certificação desejada;\n2. Selecione 'Criar nova certificação';\n3. Clique no botão Adicionar.`}
                              perfil={perfil}
                            />
                          </label>
                          <CreatableSelect
                            isClearable
                            placeholder="Digite ou selecione"
                            value={selectedCertificacao}
                            onChange={(newValue) =>
                              setSelectedCertificacao(newValue)
                            }
                            options={certificacao.map((cert) => ({
                              value: String(cert.id),
                              label: cert.certificado,
                            }))}
                            formatCreateLabel={(inputValue) =>
                              `Criar nova certificação: "${inputValue}"`
                            }
                          />
                        </div>

                        {/* Upload - médio */}
                        <div className="flex flex-col w-full">
                          <label className="text-xs sm:text-sm font-medium mb-1">
                            Certificado (JPG, PNG ou PDF)
                          </label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            id="novo-certificacao"
                            onChange={handleNovoCertificacaoChange}
                          />
                          <label
                            htmlFor="novo-certificacao"
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-blue-400 rounded-md cursor-pointer hover:bg-blue-50 transition text-sm truncate"
                          >
                            <Upload
                              size={18}
                              className="text-blue-600 shrink-0"
                            />
                            <span className="truncate">
                              {novoCertificacaoFile
                                ? novoCertificacaoFile.name
                                : "Selecionar"}
                            </span>
                          </label>
                        </div>

                        {/* Botão - largura automática */}
                        <div className="flex flex-col w-full">
                          <label className="text-xs sm:text-sm font-medium mb-1 opacity-0">
                            &nbsp;
                          </label>
                          <button
                            type="button"
                            onClick={handleAddCertificacao}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition whitespace-nowrap w-full md:w-auto cursor-pointer"
                          >
                            + Adicionar
                          </button>
                        </div>
                      </div>
                    </div>

                    {showErrors &&
                      (form.lista_certificado.length <= 0 ||
                        !novoCertificacaoFile) && (
                        <p className="text-sm text-red-600 mt-1">
                          Campo obrigatório.
                        </p>
                      )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 mt-5">
                    {form.lista_certificado.map((item) => {
                      const cert = certificacao.find(
                        (s) => s.id === item.certificacao_id
                      );
                      return (
                        <div
                          key={item.certificacao_id}
                          className="border border-blue-300 bg-blue-50 px-4 py-3 rounded-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex flex-col gap-2 w-full">
                            {/* Linha com Skill, Peso e Avaliador */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 sm:gap-8">
                              {/* Nome da skill */}
                              <div className="bg-blue-600 text-white text-sm font-medium text-center px-3 py-1 rounded-full w-fit min-w-[150px]">
                                {cert?.certificado ?? item.nome}
                              </div>

                              {/* Ações */}
                              <div className="flex items-center gap-3 text-sm min-w-[120px]">
                                {/* Visualizar certificado */}
                                {certificacaoPreview[item.certificacao_id] && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      window.open(
                                        certificacaoPreview[
                                          item.certificacao_id
                                        ],
                                        "_blank"
                                      )
                                    }
                                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 hover:text-blue-800 transition flex items-center justify-center cursor-pointer"
                                    title="Visualizar certificado"
                                  >
                                    <FileText size={20} />
                                  </button>
                                )}

                                {/* Upload certificado */}
                                <label
                                  htmlFor={`certificado-${item.certificacao_id}`}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 hover:text-blue-800 transition flex items-center justify-center cursor-pointer"
                                  title="Substituir certificado"
                                >
                                  <Upload size={20} />
                                </label>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  id={`certificado-${item.certificacao_id}`}
                                  className="hidden"
                                  onChange={(e) =>
                                    handleCertificacaoItemChange(
                                      e,
                                      item.certificacao_id
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleRemoveCertificacao(item.certificacao_id)
                            }
                            className="text-red-600 hover:text-red-800 mt-2 sm:mt-0 cursor-pointer"
                            title="Remover certificação"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botões no rodapé */}
                  <div className="flex flex-col md:flex-row justify-between gap-2 mt-4">
                    <div className="flex">
                      <button
                        onClick={prevStep}
                        type="button"
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 text-center cursor-pointer"
                      >
                        Voltar
                      </button>
                    </div>

                    {/* Direita: botões cadastrar e editar */}
                    <div className="flex gap-2">
                      <button
                        type="button" // evita submit acidental
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={form.lista_certificado.length < 1} // só habilita se >= 3
                        className={`w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 
                      ${
                        form.lista_certificado.length < 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      }`}
                      >
                        Avançar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {step === 4 && (
              <div className="w-full h-full flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                  <div>
                    <h1 className="block text-sm mb-1 py-3 font-bold">
                      Informe as Skills que você deseja atuar como avaliador
                      <p className="block text-[11x] font-light">
                        (mínimo 3 e no máximo 12)
                      </p>
                    </h1>

                    <label className="text-sm font-medium mb-1 flex items-center gap-1">
                      Skills:
                      <TooltipIcon
                        message={`Como adicionar skill que não está na lista:\n1. Digite a skill desejada;\n2. Selecione 'Criar nova skill';\n3. Clique no botão Adicionar.`}
                        perfil={perfil}
                      />
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <CreatableSelect
                          isClearable
                          placeholder="Digite ou selecione uma skill"
                          value={selectedSkill}
                          onChange={(newValue) => setSelectedSkill(newValue)}
                          options={skills.map((skill) => ({
                            value: String(skill.skill_id),
                            label: skill.skill,
                          }))}
                          formatCreateLabel={(inputValue) =>
                            `Criar nova skill: "${inputValue}"`
                          }
                          isDisabled={form.lista_skills.length >= 12} // 🚀 trava após 12
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 transition whitespace-nowrap cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>

                    {showErrors && form.lista_skills.length <= 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Campo obrigatório.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 mt-5">
                    {form.lista_skills.map((item) => {
                      const skill = skills.find(
                        (s) => s.skill_id === item.skill_id
                      );
                      return (
                        <div
                          key={item.skill_id}
                          className="border border-blue-300 bg-blue-50 px-4 py-3 rounded-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex flex-col gap-2 w-full">
                            {/* Linha com Skill, Peso e Avaliador */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 sm:gap-8">
                              {/* Nome da skill */}
                              <div className="bg-blue-600 text-white text-sm font-medium text-center px-3 py-1 rounded-full w-fit min-w-[150px]">
                                {skill?.skill ?? item.nome}
                              </div>

                              {/* Peso com slider */}
                              <div className="flex items-center gap-2 text-sm min-w-[200px]">
                                <label className="font-medium whitespace-nowrap">
                                  Peso:
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
                                      Number(e.target.value) * 10
                                    )
                                  }
                                  className="w-full sm:w-40 accent-blue-600 cursor-pointer"
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

                              {/* favorito */}
                              <div className="flex items-center gap-4 text-sm min-w-[260px]">
                                <div className="flex items-center gap-1">
                                  <label className="font-medium whitespace-nowrap">
                                    Favorito:
                                  </label>
                                </div>

                                {/* Estrela de favorito */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const totalFavoritos =
                                      form.lista_skills.filter(
                                        (s) => s.favorito
                                      ).length;

                                    // Se já tem 5 favoritos e este não é favorito → não deixa clicar
                                    if (totalFavoritos >= 5 && !item.favorito) {
                                      return;
                                    }

                                    handleSkillChange(
                                      item.skill_id,
                                      "favorito",
                                      !item.favorito
                                    );
                                  }}
                                  className={`flex items-center ${
                                    form.lista_skills.filter((s) => s.favorito)
                                      .length >= 5 && !item.favorito
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                  disabled={
                                    form.lista_skills.filter((s) => s.favorito)
                                      .length >= 5 && !item.favorito
                                  }
                                >
                                  <TooltipIcon
                                    message={`- Pode ser selecionado até 5 favoritos.\n- Os Skills favoritos serão assumidos\n como preferenciais para avaliações de candidatos.`}
                                    perfil={perfil}
                                  >
                                    <Star
                                      className={`w-4 h-4 transition-colors ${
                                        item.favorito
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  </TooltipIcon>
                                </button>

                                {/* Tempo da skill */}
                                <input
                                  type="text"
                                  placeholder="Tempo skill"
                                  className="border rounded px-2 py-1 w-30 disabled:bg-gray-100"
                                  value={item.tempo_favorito}
                                  onChange={(e) =>
                                    handleSkillChange(
                                      item.skill_id,
                                      "tempo_favorito",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveSkill(item.skill_id)}
                            className="text-red-600 hover:text-red-800 mt-2 sm:mt-0"
                            title="Remover skill"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botões no rodapé */}
                  <div className="flex flex-col md:flex-row justify-between gap-2 mt-4">
                    <div className="flex">
                      <button
                        onClick={prevStep}
                        type="button"
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 text-center cursor-pointer"
                      >
                        Voltar
                      </button>
                    </div>

                    {/* Direita: botões cadastrar e editar */}
                    <div className="flex gap-2">
                      <button
                        type="button" // evita submit acidental
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={form.lista_skills.length < 3} // só habilita se >= 3
                        className={`w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 
                      ${
                        form.lista_skills.length < 3
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      }`}
                      >
                        Avançar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {step === 5 && (
              <form
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col w-full h-full"
              >
                {/* Container Principal */}
                <div className="flex flex-col md:flex-row  w-full ">
                  {/* Coluna Esquerda */}
                  <div className="flex flex-col md:flex-row w-full">
                    {/* Dados da vaga e skills lado a lado */}
                    {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-yellow-500"> */}
                    {/* Bloco - Informações da vaga */}
                    <div className="w-full space-y-4 mr-2">
                      {/* Linha 1 - Logo + Título da vaga e empresa */}
                      <div className="flex flex-col gap-4">
                        {/* Logo e título + empresa ocupando toda largura */}
                        <div className="flex items-start gap-4">
                          {/* Avatar / Logo */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0">
                            {form.logoPreview ? (
                              <img
                                src={form.logoPreview}
                                alt="Logo da avaliador"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-gray-400 flex items-center justify-center h-full">
                                Sem logo
                              </div>
                            )}
                          </div>

                          {/* Dados */}
                          <div className="flex-1 space-y-3 ">
                            {/* Status + Nome */}
                            {form.ativo ? (
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
                                <span className="text-sm text-green-600">
                                  Ativo
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
                                <span className="text-sm text-gray-600">
                                  Inativo
                                </span>
                              </span>
                            )}
                            <div className="flex items-center gap-2 font-bold">
                              {form.nome_user}
                            </div>
                            {/* Bloco 2 colunas */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800 w-full">
                              {/* empresa */}
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-500" />

                                <p className="text-sm text-gray-500 font-bold">
                                  {empresas.find(
                                    (e) =>
                                      e.id.toString() ===
                                      form.empresa_id.toString()
                                  )?.nome_empresa ?? "Sem empresa"}
                                </p>
                              </div>

                              {/* avaliacao */}
                              <div className="flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-gray-500" />

                                <p className="text-sm text-gray-500 ">
                                  {form.avaliar_todos == "1"
                                    ? "Avaliar todos"
                                    : "Avaliar somente da minha empresa"}
                                </p>
                              </div>

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
                                {form.localizacao}
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
                                {form.telefone}
                              </div>

                              {/* Meio de comunicação */}
                              <div className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  {/* Balão de chat */}
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 10h8m-8 4h5m-9 5.5V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7l-4 4z"
                                  />
                                </svg>
                                {form.meioNotificacao}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Apresentação */}
                        <div className="w-[85%] text-sm text-gray-700 whitespace-pre-line mt-5">
                          {form.apresentacao ||
                            "Nenhuma apresentação fornecida."}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita - Gráficos */}
                  <div className="w-full md:w-100 flex flex-col gap-4 md:items-end">
                    <SkillsPanel skills={skillsData} perfil={perfil} />
                  </div>
                </div>

                {/* Botões */}
                <div className="flex flex-col md:flex-row justify-between gap-2 mt-6">
                  <div className="flex">
                    <button
                      onClick={prevStep}
                      type="button"
                      className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 text-center cursor-pointer"
                    >
                      Voltar
                    </button>
                  </div>

                  {/* Direita: botões cadastrar e editar */}
                  <div className="flex gap-2">
                    <button
                      type="button" // evita submit acidental
                      onClick={handleCancel}
                      className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2 rounded-full  font-semibold flex items-center justify-center gap-2 ${
                        isFormValid(form)
                          ? "text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <ImSpinner2 className="animate-spin" />
                      ) : (
                        "Publicar"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const isFormValid = (form: AvaliadorForm) => {
  return (
    form.telefone.trim() !== "" &&
    form.localizacao.trim() !== "" &&
    form.meioNotificacao.trim() !== "" /*&&
    form.avaliar_todos !== ""
    form.apresentacao.trim() !== ""  &&
    form.logoPreview !== null &&
    form.capaPreview !== null */
  );
};
