"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import { ProfileType } from "../../components/perfil/ProfileContext";
/* import { useAuthGuard } from "../../lib/hooks/useAuthGuard";*/
import LoadingOverlay from "../../components/LoadingOverlay";
import { FaCloudUploadAlt } from "react-icons/fa";
import { X, Star, FileText, Upload } from "lucide-react";
import { ImSpinner2 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import TooltipIcon from "../../components/TooltipIcon";
import SkillsPanel from "../../components/perfil/SkillsPanel";
import { useTranslation } from "react-i18next";

const allowedTypes = [
  "image/",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface CandidatoProps {
  perfil: ProfileType;
  candidatoId?: string | null;
  userId?: string;
  nome_user: string;
}

interface FormacaoAvaliacao {
  id: number;
  graduacao_id: number;
  formacao: string;
  certificado_file?: string | File; // nome ou caminho (pode ficar vazio no início)
  certificado_preview?: string; // URL temporária (opcional)
}

interface CertificadoAvaliacao {
  // id: string | number;
  certificacao_id: number;
  certificado?: string;
  certificado_file?: string | File; // nome ou caminho (pode ficar vazio no início)
  certificado_preview?: string; // URL temporária (opcional)
}

interface SkillAvaliacao {
  skill_id: number;
  nome?: string;
  peso: number;
  favorito: boolean;
  tempo_favorito?: string;
  tipo_skill_id?: number;
}

// Tipos de dados do formulário
interface CandidatoForm {
  telefone: string;
  logoPreview: string | null;
  localizacao: string;
  apresentacao: string;
  meioNotificacao: string;
  lista_skills: SkillAvaliacao[];
  lista_formacao: FormacaoAvaliacao[];
  lista_certificado: CertificadoAvaliacao[];
  ativo: boolean;
  nome_user: string;
}

interface CandidatoData {
  id: number;
  telefone?: string;
  apresentacao?: string;
  localizacao: string;
  meio_notificacao: string;
  logo?: string;
  skills: SkillAvaliacao[];
  formacao: FormacaoAvaliacao[];
  certificacoes: CertificadoAvaliacao[];
  ativo: boolean;
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

export default function PerfilCandidato({
  perfil,
  candidatoId,
  userId,
  nome_user,
}: CandidatoProps) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [step, setStep] = useState(1);
  const [form, setForm] = useLocalStorage<CandidatoForm>(
    `candidatoForm_${userId}`,
    {
      telefone: "",
      logoPreview: null,
      localizacao: "",
      apresentacao: "",
      meioNotificacao: "",
      lista_skills: [],
      lista_formacao: [],
      lista_certificado: [],
      ativo: true,
      nome_user: "",
    }
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [certificadoFiles, setCertificadoFiles] = useState<
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
  const [certificacaoFiles, setCertificacaoFiles] = useState<
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

  const [candidato, setCandidato] = useState<CandidatoData | null>(null);
  const [loadingCandidato, setLoadingCandidato] = useState<boolean>(true);
  const [graduacoes, setGraduacoes] = useState<
    { id: number; graduacao: string }[]
  >([]);

  const [skills, setSkills] = useState<
    { skill_id: number; skill: string; tipo_skill_id: number }[]
  >([]);

  const [selectedGraduacao, setSelectedGraduacao] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const skillsData = form.lista_skills || [];

  const [selectedSkill, setSelectedSkill] = useState<{
    value: string;
    label: string;
    tipo_skill_id: number;
  } | null>(null);

  useEffect(() => {
    if (nome_user && !form.nome_user) {
      setForm((prev) => ({ ...prev, nome_user }));
    }
  }, [nome_user]);

  useEffect(() => {
    if (!candidatoId) return;

    const fetchCandidato = async () => {
      setLoadingCandidato(true);
      const perfilId = 1;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/candidato/${candidatoId}/perfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok)
          throw new Error(
            t("tela_perfil_candidato.item_alerta_erro_buscar_dados")
          );

        const data = await res.json();
        // console.log(data);

        // mapeia os campos da API para o form
        const candidatoFormData: CandidatoForm = {
          telefone: data.telefone || "",
          localizacao: data.localizacao || "",
          apresentacao: data.apresentacao || "",
          meioNotificacao: data.meio_notificacao || "",
          logoPreview: data.logo || null,
          lista_skills: data.skills || [],
          lista_formacao: data.formacao || [],
          lista_certificado: data.certificacoes || [],
          ativo: data.ativo ?? true,
          nome_user: data.nomeUser,
        };

        setForm(candidatoFormData); // <- preenche estado + localStorage
        setCandidato(data.candidato); // se quiser manter o objeto bruto
        // setNomeUSer(data.nomeUser);

        router.push(`/dashboard/perfil?perfil=${perfil}&id=${candidatoId}`);
      } catch (error) {
        console.error(
          t("tela_perfil_candidato.item_alerta_erro_buscar_dados"),
          error
        );
      } finally {
        setLoadingCandidato(false);
      }
    };

    fetchCandidato();
  }, [candidatoId]);

  useEffect(() => {
    const previews: Record<string, string> = {};
    form.lista_formacao.forEach((f) => {
      if (f.certificado_preview) {
        previews[f.id] = f.certificado_preview;
      } else if (typeof f.certificado_file === "string" && f.certificado_file) {
        previews[f.id] = f.certificado_file; // vindo do BD
      }
    });
    setCertificadoPreviews(previews);
  }, [form.lista_formacao]);

  useEffect(() => {
    const previews: Record<string, string> = {};
    form.lista_certificado.forEach((f) => {
      if (f.certificado_preview) {
        previews[f.certificacao_id] = f.certificado_preview;
      } else if (typeof f.certificado_file === "string" && f.certificado_file) {
        previews[f.certificacao_id] = f.certificado_file; // vindo do BD
      }
    });
    setCertificacaoPreview(previews);
  }, [form.lista_certificado]);

  useEffect(() => {
    setLoadingCandidato(true);
    // const perfilId = perfil === "recrutador" ? 2 : perfil === "candidato" ? 3 : 1;

    const fetchSelectData = async () => {
      try {
        const [skillsRes, graduacoesRes, certificacaoRes] = await Promise.all([
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

        const [skillsData, graduacoesData, certificacaoData] =
          await Promise.all([
            skillsRes.json(),
            graduacoesRes.json(),
            certificacaoRes.json(),
          ]);

        //console.log(skillsData);
        setSkills(skillsData);
        setGraduacoes(graduacoesData);
        setCertificacao(certificacaoData);
      } catch (error) {
        console.error(
          t("tela_perfil_candidato.item_alerta_erro_buscar_dados"),
          error
        );
      } finally {
        setLoadingCandidato(false);
      }
    };

    fetchSelectData();
  }, [perfil]);

  if (candidatoId && loadingCandidato) {
    return <LoadingOverlay />;
  }

  const handleCancel = () => {
    // Limpa o formulário salvo no localStorage
    localStorage.removeItem(`candidatoForm_${userId}`);

    // Feedback visual
    toast.error(t("tela_perfil_candidato.item_alerta_descartada"), {
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
      const isImage = file.type.startsWith("image/");
      const isAllowed = allowedTypes.includes(file.type) || isImage;

      // 🔒 Verifica se o tipo MIME é de imagem
      if (!isAllowed) {
        toast.error(t("tela_perfil_candidato.item_alerta_erro_tipo_arq"), {
          duration: 5000,
        });
        return;
      }

      // 🔒 Verifica tamanho
      if (file.size > maxSize) {
        toast.error(t("tela_perfil_candidato.item_alerta_erro_tamanho_arq"), {
          duration: 5000,
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
      }));
    }
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
      if (!form.telefone || !form.localizacao || !form.meioNotificacao) return;

      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 2) {
      // if (form.lista_formacao.length <= 0) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 3) {
      // if (form.lista_certificado.length <= 0) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 4) {
      if (form.lista_skills.filter((s) => s.tipo_skill_id == 1).length < 0)
        return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 5) {
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 6) {
      if (!isFormValid(form)) return;

      if (certificadoFiles || certificacaoFiles) {
      }

      setIsSubmitting(true);

      try {
        const perfilId = "1";

        const formData = new FormData();

        formData.append("perfilId", String(perfilId));
        formData.append("telefone", form.telefone);
        formData.append("localizacao", form.localizacao);
        formData.append("apresentacao", form.apresentacao);
        formData.append("meio_notificacao", form.meioNotificacao);

        if (logoFile) formData.append("logo", logoFile);

        if (candidatoId) {
          formData.append("candidatoId", String(candidatoId));
          formData.append("ativo", form.ativo ? "1" : "0");
        }

        // ================================
        // SKILLS
        // ================================
        formData.append(
          "skills",
          JSON.stringify(
            serializeSkills(form.lista_skills.filter((s) => s.skill_id > 0))
          )
        );

        formData.append(
          "novas_skills",
          JSON.stringify(
            serializeSkills(form.lista_skills.filter((s) => s.skill_id < 0))
          )
        );

        // ================================
        // FORMAÇÕES
        // ================================
        const formacoesData = form.lista_formacao.map((f, index) => {
          return {
            id: f.id,
            graduacao_id: f.graduacao_id,
            formacao: f.formacao,
            certificado_field: `formacao_certificado_${index}`, // ✅ adiciona o fieldname
            certificado_file:
              f.certificado_file instanceof File
                ? f.certificado_file.name
                : f.certificado_file || null,
          };
        });
        // 🔥 ANEXAR OS ARQUIVOS REAIS AO FormData
        form.lista_formacao.forEach((f, index) => {
          if (f.certificado_file instanceof File) {
            formData.append(
              `formacao_certificado_${index}`,
              f.certificado_file
            );
          }
        });

        formData.append("formacoes", JSON.stringify(formacoesData));

        // Anexa os arquivos reais
        form.lista_certificado.forEach((c, index) => {
          if (c.certificado_file instanceof File) {
            formData.append(`certificado_${index}`, c.certificado_file);
          }
        });
        const certificacoesData = form.lista_certificado.map((c, index) => ({
          ...c,
          certificado_field: `certificado_${index}`, // ✅ adiciona o fieldname
        }));
        // console.log(certificacoesData.filter((c) => c.certificacao_id > 0));
        formData.append(
          "certificacoes",
          JSON.stringify(certificacoesData.filter((c) => c.certificacao_id > 0))
        );
        formData.append(
          "novas_certificacoes",
          JSON.stringify(certificacoesData.filter((c) => c.certificacao_id < 0))
        );

        // ================================
        // ENVIO AO BACKEND
        // ================================
        const url = !candidatoId
          ? `${process.env.NEXT_PUBLIC_API_URL}/candidato/create-candidato`
          : `${process.env.NEXT_PUBLIC_API_URL}/candidato/update-candidato`;

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
              : t("tela_perfil_candidato.item_alerta_erro_salvar");
          throw new Error(errorMessage);
        }

        localStorage.removeItem(`candidatoForm_${userId}`);
        toast.success(t("tela_perfil_candidato.item_alerta_sucesso"), {
          duration: 5000,
        });
        setIsSubmitting(false);
        router.push(`/dashboard?perfil=${perfil}`);
      } catch (err: unknown) {
        console.error(t("tela_perfil_candidato.item_alerta_erro_salvar"), err);

        const message =
          err instanceof Error
            ? err.message
            : t("tela_perfil_candidato.item_alerta_erro_salvar");

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
      tipo_skill_id: s.tipo_skill_id ?? 1,
    }));
  }

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
      favorito: false,
      tempo_favorito: "",
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
    const isImage = file.type.startsWith("image/");
    const isAllowed = allowedTypes.includes(file.type) || isImage;

    // 🔒 Verifica se o tipo MIME é de imagem
    if (!isAllowed) {
      toast.error(t("tela_perfil_candidato.item_alerta_erro_tipo_arq"), {
        duration: 2000,
      });
      return;
    }

    // 🔒 Verifica tamanho
    if (file.size > maxSize) {
      toast.error(t("tela_perfil_candidato.item_alerta_erro_tamanho_arq2"), {
        duration: 2000,
      });
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
      certificado_file: novoCertificadoFile,
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
    id: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    const isImage = file.type.startsWith("image/");
    const isAllowed = allowedTypes.includes(file.type) || isImage;

    // 🔒 Verifica se o tipo MIME é de imagem
    if (!isAllowed) {
      toast.error(t("tela_perfil_candidato.item_alerta_erro_tipo_arq"), {
        duration: 2000,
      });
      return;
    }

    // 🔒 Verifica tamanho
    if (file.size > maxSize) {
      toast.error(t("tela_perfil_candidato.item_alerta_erro_tamanho_arq2"), {
        duration: 2000,
      });
      return;
    }

    // Cria uma nova URL (e invalida a anterior)
    const previewUrl = URL.createObjectURL(file);

    // Atualiza o form corretamente
    setForm((prev) => {
      const novaLista = prev.lista_formacao.map((f) =>
        f.id === id
          ? {
              ...f,
              certificado_file: file, // substitui o arquivo
              certificado_preview: previewUrl, // substitui o preview
            }
          : f
      );
      return { ...prev, lista_formacao: novaLista };
    });

    // Atualiza refs auxiliares
    setCertificadoFiles((prev) => ({ ...prev, [id]: file }));
    setCertificadoPreviews((prev) => ({ ...prev, [id]: previewUrl }));

    toast.success(
      t("tela_perfil_candidato.item_botao_certificado_atualizado"),
      { duration: 2000 }
    );
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
    const isImage = file.type.startsWith("image/");
    const isAllowed = allowedTypes.includes(file.type) || isImage;

    // 🔒 Verifica se o tipo MIME é de imagem
    if (!isAllowed) {
      toast.error(t("tela_perfil_candidato.item_alerta_erro_tipo_arq"), {
        duration: 2000,
      });
      return;
    }

    // 🔒 Verifica tamanho
    if (file.size > maxSize) {
      toast.error(t("tela_perfil_candidato.item_alerta_erro_tamanho_arq2"), {
        duration: 2000,
      });
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
      certificado: selectedCertificacao.label, // ← Salva o nome para posterior criação no backend
      certificado_file: novoCertificacaoFile,
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
    id: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    const isImage = file.type.startsWith("image/");
    const isAllowed = allowedTypes.includes(file.type) || isImage;

    // 🔒 Verifica se o tipo MIME é de imagem
    if (!isAllowed) {
      toast.error(t("tela_perfil_candidato.item_alerta_erro_tipo_arq"), {
        duration: 2000,
      });
      return;
    }

    // 🔒 Verifica tamanho
    if (file.size > maxSize) {
      toast.error(t("tela_perfil_candidato.item_alerta_erro_tamanho_arq2"), {
        duration: 2000,
      });
      return;
    }

    // Cria uma nova URL (e invalida a anterior)
    const previewUrl = URL.createObjectURL(file);

    // Atualiza o form corretamente
    setForm((prev) => {
      const novaLista = prev.lista_certificado.map((f) =>
        f.certificacao_id === id
          ? {
              ...f,
              certificado_file: file, // substitui o arquivo
              certificado_preview: previewUrl, // substitui o preview
            }
          : f
      );
      return { ...prev, lista_certificado: novaLista };
    });

    // Atualiza refs auxiliares
    setCertificacaoFiles((prev) => ({ ...prev, [id]: file }));
    setCertificacaoPreview((prev) => ({ ...prev, [id]: previewUrl }));

    toast.success(
      t("tela_perfil_candidato.item_botao_certificado_atualizado"),
      { duration: 2000 }
    );
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

  if (loadingCandidato) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {step != 7 && (
          <div className="pt-3 pl-6 flex items-center justify-center">
            <div className="flex items-center justify-between w-full text-sm font-medium text-gray-500">
              {[
                `1 ${t("tela_topo_passos.passo_dados")}`,
                `2 ${t("tela_topo_passos.passo_formacao")}`,
                `3 ${t("tela_topo_passos.passo_certificacao")}`,
                `4 ${t("tela_topo_passos.passo_hardskills")}`,
                `5 ${t("tela_topo_passos.passo_softskills")}`,
                `6 ${t("tela_topo_passos.passo_visualizar")}`,
                `7 ${t("tela_topo_passos.passo_publicar")}`,
              ].map((etapa, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 flex-1 min-w-0 "
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
                {candidatoId && (
                  <div className="flex items-center justify-between w-full">
                    {/* Esquerda: Toggle + "Ativo" */}
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="ativo"
                          checked={form.ativo ?? candidato?.ativo ?? true}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-5"></div>
                      </div>
                      <span className="ml-3 text-sm font-normal text-gray-700">
                        {t("tela_perfil_candidato.item_ativo")}
                      </span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("tela_perfil_candidato.item_label_nome")}
                  </label>
                  <div className="flex items-center border border-blue-400 rounded px-3 py-2 bg-gray-100 cursor-not-allowed opacity-80">
                    <input
                      name="nome_user"
                      placeholder={t(
                        "tela_perfil_candidato.item_placeholder_nome"
                      )}
                      className="w-full outline-none"
                      defaultValue={form.nome_user}
                      disabled={true}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("tela_perfil_candidato.item_label_telefone")}
                  </label>
                  <div className="flex items-center border border-blue-400 rounded px-3 py-2">
                    <span className="mr-2">🇧🇷</span>
                    <input
                      type="tel"
                      name="telefone"
                      placeholder={t(
                        "tela_perfil_candidato.item_placeholder_telefone"
                      )}
                      className="w-full outline-none"
                      defaultValue={candidato?.telefone ?? form.telefone}
                      onChange={handleChange}
                    />
                  </div>
                  {showErrors && !form.telefone && (
                    <p className="text-sm text-red-600 mt-1">
                      {t("tela_perfil_candidato.item_msg_campo_obt")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("tela_perfil_candidato.item_label_localizacao")}
                  </label>
                  <input
                    type="text"
                    name="localizacao"
                    placeholder={t(
                      "tela_perfil_candidato.item_placeholder_localizacao"
                    )}
                    className="w-full border border-blue-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={form.localizacao}
                    onChange={handleChange}
                  />
                  {showErrors && !form.localizacao && (
                    <p className="text-sm text-red-600 mt-1">
                      {t("tela_perfil_candidato.item_msg_campo_obt")}
                    </p>
                  )}
                </div>

                <fieldset className="text-sm text-gray-700 mt-2">
                  <legend className="mb-1 font-medium">
                    {t("tela_perfil_candidato.item_label_notificacao")}
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
                      {t("tela_perfil_candidato.item_msg_campo_obt")}
                    </p>
                  )}
                </fieldset>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("tela_perfil_candidato.item_label_descreva")}{" "}
                  </label>
                  <textarea
                    name="apresentacao"
                    placeholder={t(
                      "tela_perfil_candidato.item_placeholder_apresentacao"
                    )}
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
                    {t("tela_perfil_candidato.item_label_foto")}
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
                        {t("tela_perfil_candidato.item_msg_foto")}
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
                      {t("tela_perfil_candidato.item_msg_logo_obt")}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button" // evita submit acidental
                    onClick={handleCancel}
                    className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                  >
                    {t("tela_perfil_candidato.item_botao_cancelar")}
                  </button>
                  <button
                    type="submit"
                    className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                  >
                    {t("tela_perfil_candidato.item_botao_avancar")}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="w-full h-full flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                  <div>
                    <h1 className="block text-sm mb-1 py-3 font-bold">
                      {t("tela_perfil_candidato.item_label_informe_formacao")}
                    </h1>

                    {/* Linha de adição de formação */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:gap-3 gap-2">
                      {/* Graduação */}
                      <div className="flex flex-col w-full sm:w-1/4">
                        <label className="text-sm font-medium mb-1 flex items-center gap-1">
                          {t("tela_perfil_candidato.item_label_graduacao")}
                        </label>
                        <select
                          className="border border-blue-400 rounded-md px-2 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-300"
                          name="graduacao_id"
                          value={selectedGraduacao?.value || ""}
                          onChange={handleGraduacaoChange}
                        >
                          <option value="">
                            {t("tela_perfil_candidato.item_msg_graduacao")}
                          </option>
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
                          {t("tela_perfil_candidato.item_label_formacao")}
                        </label>
                        <input
                          type="text"
                          name="formacao"
                          placeholder={t(
                            "tela_perfil_candidato.item_msg_formacao"
                          )}
                          className="w-full border border-blue-400 rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-300"
                          value={formacaoInput}
                          onChange={(e) => setFormacaoInput(e.target.value)}
                        />
                      </div>

                      {/* Upload certificado estilizado */}
                      <div className="flex flex-col w-full sm:w-1/4">
                        <label className="text-xs sm:text-sm font-medium mb-1">
                          {t("tela_perfil_candidato.item_label_certificado")}
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
                              : t("tela_perfil_candidato.item_msg_certificado")}
                          </span>
                        </label>
                      </div>

                      {/* Botão adicionar */}
                      <div className="flex sm:mt-6">
                        <button
                          type="button"
                          onClick={handleAddFormacao}
                          className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 transition whitespace-nowrap cursor-pointer"
                        >
                          {t("tela_perfil_candidato.item_botao_adicionar")}
                        </button>
                      </div>
                    </div>

                    {showErrors &&
                      (!selectedGraduacao?.value ||
                        !formacaoInput ||
                        !novoCertificadoFile) && (
                        <p className="text-sm text-red-600 mt-1">
                          {t("tela_perfil_candidato.item_msg_campo_obt")}
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
                                    t(
                                      "tela_perfil_candidato.item_msg_nenhuma_graduacao"
                                    )}
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
                                    title={t(
                                      "tela_perfil_candidato.item_botao_visualizar"
                                    )}
                                  >
                                    <FileText size={20} />
                                  </button>
                                )}

                                {/* Upload certificado */}
                                <label
                                  htmlFor={`certificado-${item.id}`}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 hover:text-blue-800 transition flex items-center justify-center cursor-pointer"
                                  title={t(
                                    "tela_perfil_candidato.item_botao_substituir"
                                  )}
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
                            title={t(
                              "tela_perfil_candidato.item_botao_remover_formacao"
                            )}
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
                        {t("tela_perfil_candidato.item_botao_voltar")}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      >
                        {t("tela_perfil_candidato.item_botao_cancelar")}
                      </button>
                      <button
                        type="submit"
                        className={`w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer`}
                      >
                        {t("tela_perfil_candidato.item_botao_avancar")}
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
                      {t(
                        "tela_perfil_candidato.item_label_informe_certificacao"
                      )}
                      {/* <p className="block text-[11x] font-light">(mínimo 1)</p> */}
                    </h1>

                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-[3fr_1.5fr_auto] gap-4 items-end">
                        {/* Campo de certificação - largo */}
                        <div className="flex flex-col w-full">
                          <label className="text-sm font-medium mb-1 flex items-center gap-1">
                            {t("tela_perfil_candidato.item_label_certificacao")}
                            <TooltipIcon
                              message={`${t(
                                "tela_perfil_candidato.item_tooltip_certificacao_titulo"
                              )}\n${t(
                                "tela_perfil_candidato.item_tooltip_certificacao_passo1"
                              )}\n${t(
                                "tela_perfil_candidato.item_tooltip_certificacao_passo2"
                              )}\n${t(
                                "tela_perfil_candidato.item_tooltip_certificacao_passo3"
                              )}`}
                              perfil={perfil}
                            />
                          </label>
                          <CreatableSelect
                            isClearable
                            placeholder={t(
                              "tela_perfil_candidato.item_msg_certificacao"
                            )}
                            value={selectedCertificacao}
                            onChange={(newValue) =>
                              setSelectedCertificacao(newValue)
                            }
                            options={certificacao.map((cert) => ({
                              value: String(cert.id),
                              label: cert.certificado,
                            }))}
                            formatCreateLabel={(inputValue) =>
                              `${t(
                                "tela_perfil_candidato.item_msg_criar_certificacao"
                              )} ${inputValue}`
                            }
                          />
                        </div>

                        {/* Upload - médio */}
                        <div className="flex flex-col w-full">
                          <label className="text-xs sm:text-sm font-medium mb-1">
                            {t("tela_perfil_candidato.item_label_certificado")}
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
                                : t(
                                    "tela_perfil_candidato.item_msg_certificado"
                                  )}
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
                            className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 transition whitespace-nowrap cursor-pointer"
                          >
                            {t("tela_perfil_candidato.item_botao_adicionar")}
                          </button>
                        </div>
                      </div>
                    </div>

                    {showErrors &&
                      (form.lista_certificado.length <= 0 ||
                        !novoCertificacaoFile) && (
                        <p className="text-sm text-red-600 mt-1">
                          {t("tela_perfil_candidato.item_msg_campo_obt")}
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
                            {/* Linha com Skill, Peso e Candidato */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 sm:gap-8">
                              {/* Nome da skill */}
                              <div className="bg-blue-600 text-white text-sm font-medium text-center px-3 py-1 rounded-full w-fit min-w-[150px]">
                                {cert?.certificado ?? item.certificado}
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
                                    title={t(
                                      "tela_perfil_candidato.item_botao_visualizar"
                                    )}
                                  >
                                    <FileText size={20} />
                                  </button>
                                )}

                                {/* Upload certificado */}
                                <label
                                  htmlFor={`certificado-${item.certificacao_id}`}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 hover:text-blue-800 transition flex items-center justify-center cursor-pointer"
                                  title={t(
                                    "tela_perfil_candidato.item_botao_substituir"
                                  )}
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
                            title={t(
                              "tela_perfil_candidato.item_botao_remover_certificacao"
                            )}
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
                        {t("tela_perfil_candidato.item_botao_voltar")}
                      </button>
                    </div>

                    {/* Direita: botões cadastrar e editar */}
                    <div className="flex gap-2">
                      <button
                        type="button" // evita submit acidental
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      >
                        {t("tela_perfil_candidato.item_botao_cancelar")}
                      </button>
                      <button
                        type="submit"
                        className={`w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer`}
                      >
                        {t("tela_perfil_candidato.item_botao_avancar")}
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
                      {t("tela_perfil_candidato.item_label_informe_hardskills")}
                      <p className="text-[11px] font-normal italic">
                        {t(
                          "tela_perfil_candidato.item_label_informe_hardskills_subitem"
                        )}
                      </p>
                      <p className="block text-[11x] font-light">
                        {t("tela_perfil_candidato.item_label_informe_qtde")}
                      </p>
                    </h1>

                    <label className="text-sm font-medium mb-1 flex items-center gap-1">
                      {t("tela_perfil_candidato.item_label_skill")}
                      <TooltipIcon
                        message={`${t(
                          "tela_perfil_candidato.item_tooltip_skill_titulo"
                        )}\n${t(
                          "tela_perfil_candidato.item_tooltip_skill_passo1"
                        )}\n${t(
                          "tela_perfil_candidato.item_tooltip_skill_passo2"
                        )}\n${t(
                          "tela_perfil_candidato.item_tooltip_skill_passo3"
                        )}`}
                        perfil={perfil}
                      />
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <CreatableSelect
                          isClearable
                          placeholder={t(
                            "tela_perfil_candidato.item_msg_skill"
                          )}
                          value={selectedSkill}
                          onChange={(newValue) => setSelectedSkill(newValue)}
                          options={skills
                            .filter((f) => f.tipo_skill_id == 1)
                            .map((skill) => ({
                              value: String(skill.skill_id),
                              label: skill.skill,
                              tipo_skill_id: skill.tipo_skill_id,
                            }))}
                          formatCreateLabel={(inputValue) =>
                            `${t(
                              "tela_perfil_candidato.item_msg_criar_skill"
                            )} ${inputValue}`
                          }
                          isDisabled={form.lista_skills.length >= 12} // 🚀 trava após 12
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSkill(1)}
                        className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 transition whitespace-nowrap cursor-pointer"
                      >
                        {t("tela_perfil_candidato.item_botao_adicionar")}
                      </button>
                    </div>

                    {showErrors && form.lista_skills.length <= 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        {t("tela_perfil_candidato.item_msg_campo_obt")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 mt-5">
                    {form.lista_skills
                      .filter((f) => f.tipo_skill_id == 1)
                      .map((item) => {
                        const skill = skills.find(
                          (s) => s.skill_id === item.skill_id
                        );
                        return (
                          <div
                            key={item.skill_id}
                            className="border border-blue-300 bg-blue-50 px-4 py-3 rounded-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex flex-col gap-2 w-full">
                              {/* Linha com Skill, Peso e Candidato */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 sm:gap-8">
                                {/* Nome da skill */}
                                <div className="bg-blue-600 text-white text-sm font-medium text-center px-3 py-1 rounded-full w-fit min-w-[150px]">
                                  {skill?.skill ?? item.nome}
                                </div>

                                {/* Peso com slider */}
                                <div className="flex items-center gap-2 text-sm min-w-[200px]">
                                  <label className="font-medium whitespace-nowrap">
                                    {t("tela_perfil_candidato.item_label_peso")}
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
                                      {t(
                                        "tela_perfil_candidato.item_label_favorito"
                                      )}
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
                                      if (
                                        totalFavoritos >= 5 &&
                                        !item.favorito
                                      ) {
                                        return;
                                      }

                                      handleSkillChange(
                                        item.skill_id,
                                        "favorito",
                                        !item.favorito
                                      );
                                    }}
                                    className={`flex items-center ${
                                      form.lista_skills.filter(
                                        (s) => s.favorito
                                      ).length >= 5 && !item.favorito
                                        ? "cursor-not-allowed opacity-50"
                                        : "cursor-pointer"
                                    }`}
                                    disabled={
                                      form.lista_skills.filter(
                                        (s) => s.favorito
                                      ).length >= 5 && !item.favorito
                                    }
                                  >
                                    <TooltipIcon
                                      message={`${t(
                                        "tela_perfil_candidato.item_tooltip_favorite_passo1"
                                      )}\n${t(
                                        "tela_perfil_candidato.item_tooltip_favorite_passo2"
                                      )}\n${t(
                                        "tela_perfil_candidato.item_tooltip_favorite_passo2_1"
                                      )}`}
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
                                    placeholder={t(
                                      "tela_perfil_candidato.item_placeholder_favorito"
                                    )}
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
                              title={t(
                                "tela_perfil_candidato.item_botao_remover_skill"
                              )}
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
                        {t("tela_perfil_candidato.item_botao_voltar")}
                      </button>
                    </div>

                    {/* Direita: botões cadastrar e editar */}
                    <div className="flex gap-2">
                      <button
                        type="button" // evita submit acidental
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      >
                        {t("tela_perfil_candidato.item_botao_cancelar")}
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
                        {t("tela_perfil_candidato.item_botao_avancar")}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {step === 5 && (
              <div className="w-full h-full flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                  <div>
                    <h1 className="block text-sm mb-1 py-3 font-bold">
                      {t("tela_perfil_candidato.item_label_informe_softskills")}
                      <p className="text-[11px] font-normal italic">
                        {t(
                          "tela_perfil_candidato.item_label_informe_softskills_subitem"
                        )}
                      </p>
                    </h1>

                    <label className="text-sm font-medium mb-1 flex items-center gap-1">
                      {t("tela_perfil_candidato.item_label_skill")}
                      <TooltipIcon
                        message={`${t(
                          "tela_perfil_candidato.item_tooltip_skill_titulo"
                        )}\n${t(
                          "tela_perfil_candidato.item_tooltip_skill_passo1"
                        )}\n${t(
                          "tela_perfil_candidato.item_tooltip_skill_passo2"
                        )}\n${t(
                          "tela_perfil_candidato.item_tooltip_skill_passo3"
                        )}`}
                        perfil={perfil}
                      />
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <CreatableSelect
                          isClearable
                          placeholder={t(
                            "tela_perfil_candidato.item_msg_skill"
                          )}
                          value={selectedSkill}
                          onChange={(newValue) => setSelectedSkill(newValue)}
                          options={skills
                            .filter((f) => f.tipo_skill_id == 2)
                            .map((skill) => ({
                              value: String(skill.skill_id),
                              label: skill.skill,
                              tipo_skill_id: skill.tipo_skill_id,
                            }))}
                          formatCreateLabel={(inputValue) =>
                            `${t(
                              "tela_perfil_candidato.item_msg_criar_skill"
                            )} ${inputValue}`
                          }
                          // isDisabled={form.lista_skills.length >= 12} // 🚀 trava após 12
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSkill(2)}
                        className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 transition whitespace-nowrap cursor-pointer"
                      >
                        {t("tela_perfil_candidato.item_botao_adicionar")}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 mt-5">
                    {form.lista_skills
                      .filter((f) => f.tipo_skill_id == 2)
                      .map((item) => {
                        const skill = skills.find(
                          (s) => s.skill_id === item.skill_id
                        );
                        return (
                          <div
                            key={item.skill_id}
                            className="border border-blue-300 bg-blue-50 px-4 py-3 rounded-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex flex-col gap-2 w-full">
                              {/* Linha com Skill, Peso e Candidato */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-4 sm:gap-8">
                                {/* Nome da skill */}
                                <div className="bg-blue-600 text-white text-sm font-medium text-center px-3 py-1 rounded-full w-fit min-w-[150px]">
                                  {skill?.skill ?? item.nome}
                                </div>

                                {/* Peso com slider */}
                                <div className="flex items-center gap-2 text-sm min-w-[200px]">
                                  <label className="font-medium whitespace-nowrap">
                                    {t("tela_perfil_candidato.item_label_peso")}
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
                                      {t(
                                        "tela_perfil_candidato.item_label_favorito"
                                      )}
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
                                      if (
                                        totalFavoritos >= 5 &&
                                        !item.favorito
                                      ) {
                                        return;
                                      }

                                      handleSkillChange(
                                        item.skill_id,
                                        "favorito",
                                        !item.favorito
                                      );
                                    }}
                                    className={`flex items-center ${
                                      form.lista_skills.filter(
                                        (s) => s.favorito
                                      ).length >= 5 && !item.favorito
                                        ? "cursor-not-allowed opacity-50"
                                        : "cursor-pointer"
                                    }`}
                                    disabled={
                                      form.lista_skills.filter(
                                        (s) => s.favorito
                                      ).length >= 5 && !item.favorito
                                    }
                                  >
                                    <TooltipIcon
                                      message={`${t(
                                        "tela_perfil_candidato.item_tooltip_favorite_passo1"
                                      )}\n${t(
                                        "tela_perfil_candidato.item_tooltip_favorite_passo2"
                                      )}\n${t(
                                        "tela_perfil_candidato.item_tooltip_favorite_passo2_1"
                                      )}`}
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
                                    placeholder={t(
                                      "tela_perfil_candidato.item_placeholder_favorito"
                                    )}
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
                              title={t(
                                "tela_perfil_candidato.item_botao_remover_skill"
                              )}
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
                        {t("tela_perfil_candidato.item_botao_voltar")}
                      </button>
                    </div>

                    {/* Direita: botões cadastrar e editar */}
                    <div className="flex gap-2">
                      <button
                        type="button" // evita submit acidental
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      >
                        {t("tela_perfil_candidato.item_botao_cancelar")}
                      </button>
                      <button
                        type="submit"
                        className={`w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer`}
                      >
                        {t("tela_perfil_candidato.item_botao_avancar")}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {step === 6 && (
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
                                alt="Logo da candidato"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-gray-400 flex items-center justify-center h-full">
                                {t("tela_perfil_candidato.item_msg_sem_foto")}
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
                                  {t("tela_perfil_candidato.item_ativo")}
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
                                  {t("tela_perfil_candidato.item_inativo")}
                                </span>
                              </span>
                            )}
                            <div className="flex items-center gap-2 font-bold">
                              {form.nome_user}
                            </div>
                            {/* Bloco 2 colunas */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800 w-full">
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
                            t(
                              "tela_perfil_candidato.item_msg_nenhuma_apresentacao"
                            )}
                        </div>
                        <div className="flex flex-row w-[95%] mt-5">
                          <div className="w-1/2 rounded-xl p-1 shadow-sm">
                            <p className="ml-1">
                              {t(
                                "tela_perfil_candidato.item_label_lista_formacao"
                              )}
                            </p>
                            {Array.isArray(form.lista_formacao) &&
                            form.lista_formacao.length > 0 ? (
                              form.lista_formacao.map((item) => {
                                return (
                                  <div
                                    key={item.id}
                                    className="mt-2 border border-blue-300 text-gray-500 px-4 py-3 rounded-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    {item.formacao}
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-sm text-gray-500 font-bold mt-3 text-center">
                                {t(
                                  "tela_perfil_candidato.item_msg_nenhuma_formacao"
                                )}
                              </p>
                            )}
                          </div>
                          <div className="ml-2 w-1/2 rounded-xl p-1 shadow-sm">
                            <p className="ml-1">
                              {t(
                                "tela_perfil_candidato.item_label_lista_certificacao"
                              )}
                            </p>
                            {Array.isArray(form.lista_certificado) &&
                            form.lista_certificado.length > 0 ? (
                              form.lista_certificado.map((item) => {
                                return (
                                  <div
                                    key={item.certificacao_id}
                                    className="mt-2 border border-blue-300 text-gray-500 px-4 py-3 rounded-md flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    {item.certificado}
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-sm text-gray-500 font-bold mt-3 text-center">
                                {t(
                                  "tela_perfil_candidato.item_msg_nenhuma_certificacao"
                                )}
                              </p>
                            )}
                          </div>
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
                      {t("tela_perfil_candidato.item_botao_voltar")}
                    </button>
                  </div>

                  {/* Direita: botões cadastrar e editar */}
                  <div className="flex gap-2">
                    <button
                      type="button" // evita submit acidental
                      onClick={handleCancel}
                      className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                    >
                      {t("tela_perfil_candidato.item_botao_cancelar")}
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
                        t("tela_perfil_candidato.item_botao_publicar")
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

const isFormValid = (form: CandidatoForm) => {
  return (
    form.telefone.trim() !== "" &&
    form.localizacao.trim() !== "" &&
    form.meioNotificacao.trim() !== ""
  );
};
