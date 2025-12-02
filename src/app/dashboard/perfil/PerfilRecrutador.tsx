"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import { ProfileType } from "../../components/perfil/ProfileContext";
/* import { useAuthGuard } from "../../lib/hooks/useAuthGuard";*/
import LoadingOverlay from "../../components/LoadingOverlay";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import TooltipIcon from "../../components/TooltipIcon";

const allowedTypes = ["image/"];

interface RecrutadorProps {
  perfil: ProfileType;
  recrutadorId?: string | null;
  userId?: string;
}

// Tipos de dados do formulário
interface RecrutadorForm {
  telefone: string;
  logoPreview: string | null;
  localizacao: string;
  apresentacao: string;
  meioNotificacao: string;
  ativo: boolean;
  primeiro_nome: string;
  ultimo_nome: string;
  nome_social?: string;
  data_nascimento: string;
  genero_id: number;
  sexo_label: string;
  estado_id: number;
  estado_label: string;
  cidade_id: number;
  cidade_label: string;
}

interface RecrutadorData {
  recrutador_id: number;
  telefone?: string;
  apresentacao?: string;
  localizacao: string;
  meio_notificacao: string;
  logo?: string;
  ativo: boolean;
  primeiro_nome: string;
  ultimo_nome: string;
  nome_social?: string;
  data_nascimento: string;
  genero_id: number;
  sexo_label: string;
  estado_id: number;
  estado_label: string;
  cidade_id: number;
  cidade_label: string;
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

export default function PerfilRecrutador({
  perfil,
  recrutadorId,
  userId,
}: RecrutadorProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");

  const [step, setStep] = useState(1);
  const [form, setForm] = useLocalStorage<RecrutadorForm>(
    `recrutadorForm_${userId}`,
    {
      telefone: "",
      logoPreview: null,
      localizacao: "",
      apresentacao: "",
      meioNotificacao: "",
      ativo: true,
      primeiro_nome: "",
      ultimo_nome: "",
      nome_social: "",
      data_nascimento: "",
      genero_id: 0,
      sexo_label: "",
      estado_id: 0,
      estado_label: "",
      cidade_id: 0,
      cidade_label: "",
    }
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  //const [recrutadorPublicado, setRecrutadorPublicado] = useState<RecrutadorData | null>(null);

  const [recrutador, setRecrutador] = useState<RecrutadorData | null>(null);
  const [loadingRecrutador, setLoadingRecrutador] = useState<boolean>(false);

  const [dtNasc, setDtNasc] = useState("");
  const [dtNascDisplay, setDtNascDisplay] = useState("");
  const [sexo, setSexo] = useState("");
  const [generos, setGeneros] = useState<{ id: number; genero: string }[]>([]);
  const [estado, setEstado] = useState("");
  const [estados, setEstados] = useState<
    { id: number; sigla: string; estado: string }[]
  >([]);
  const [cidade, setCidade] = useState("");
  const [cidades, setCidades] = useState<{ id: number; cidade: string }[]>([]);

  useEffect(() => {
    const fetchSelectData = async () => {
      setLoadingRecrutador(true);
      try {
        const [generoRes, estadoRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/generos/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": i18n.language,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/estados/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": i18n.language,
            },
          }),
        ]);

        const [generosData, estadosData] = await Promise.all([
          generoRes.json(),
          estadoRes.json(),
        ]);

        // console.log(generosData);
        setGeneros(generosData);
        setEstados(estadosData);
      } catch (error) {
        console.error(
          t("tela_perfil_recrutador.item_alerta_erro_buscar_dados"),
          error
        );
      } finally {
        setLoadingRecrutador(false);
      }
    };

    const fetchUserData = async () => {
      setLoadingRecrutador(true);
      try {
        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recrutador/user`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const userData = await userRes.json();

        const recrutadorFormData: RecrutadorForm = {
          telefone: "",
          localizacao: "",
          apresentacao: "",
          meioNotificacao: "",
          logoPreview: null,
          ativo: true,
          primeiro_nome: userData.primeiro_nome,
          ultimo_nome: userData.ultimo_nome,
          nome_social: userData.nome_social,
          data_nascimento: maskedToISO(userData.data_nascimento) ?? "",
          genero_id: userData.genero_id,
          sexo_label: userData.genero,
          estado_id: userData.estado_id,
          estado_label: userData.estado,
          cidade_id: userData.cidade_id,
          cidade_label: userData.cidade,
        };

        // console.log("passei aqui sem idrecrutador");
        // console.log(userData);

        setDtNascDisplay(userData.data_nascimento);
        setDtNasc(maskedToISO(userData.data_nascimento) ?? ""); // mantém ISO interno
        setEstado(userData.estado_id);
        setSexo(userData.genero_id);
        setCidade(userData.cidade_id);

        setForm(recrutadorFormData); // <- preenche estado + localStorage

        fetchCidades(userData.estado_id);
      } catch (error) {
        console.error(
          t("tela_perfil_recrutador.item_alerta_erro_buscar_dados"),
          error
        );
      } finally {
        setLoadingRecrutador(false);
      }
    };

    fetchSelectData();
    if (!recrutadorId) fetchUserData();
  }, []);

  useEffect(() => {
    if (!recrutadorId) return;

    const fetchRecrutador = async () => {
      setLoadingRecrutador(true);
      const perfilId =
        perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

      try {
        const recrutadorRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recrutador/${recrutadorId}/perfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!recrutadorRes.ok)
          throw new Error(
            t("tela_perfil_recrutador.item_alerta_erro_buscar_dados")
          );

        const data = await recrutadorRes.json();
        // console.log(data);

        // mapeia os campos da API para o form
        const recrutadorFormData: RecrutadorForm = {
          telefone: data.telefone || "",
          localizacao: "",
          apresentacao: data.apresentacao || "",
          meioNotificacao: data.meio_notificacao || "",
          logoPreview: data.logo || null,
          ativo: data.ativo ?? true,
          primeiro_nome: data.primeiro_nome,
          ultimo_nome: data.ultimo_nome,
          nome_social: data.nome_social,
          data_nascimento: maskedToISO(data.data_nascimento) ?? "",
          genero_id: data.genero_id,
          sexo_label: data.genero,
          estado_id: data.estado_id,
          estado_label: data.estado,
          cidade_id: data.cidade_id,
          cidade_label: data.cidade,
        };

        setDtNascDisplay(data.data_nascimento);
        setDtNasc(maskedToISO(data.data_nascimento) ?? ""); // mantém ISO interno
        setEstado(data.estado_id);
        setSexo(data.genero_id);
        setCidade(data.cidade_id);

        setForm(recrutadorFormData); // <- preenche estado + localStorage
        setRecrutador(data); // se quiser manter o objeto bruto

        fetchCidades(data.estado_id);

        router.push(`/dashboard/perfil?perfil=${perfil}&id=${recrutadorId}`);
      } catch (error) {
        console.error(
          t("tela_perfil_recrutador.item_alerta_erro_buscar_dados"),
          error
        );
      } finally {
        setLoadingRecrutador(false);
      }
    };

    fetchRecrutador();
  }, [recrutadorId]);

  const applyDateMask = (value: string) => {
    // remove tudo que não for número
    const digits = value.replace(/\D/g, "");

    if (i18n.language.startsWith("pt")) {
      // dd/mm/yyyy
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(
        4,
        8
      )}`;
    } else {
      // en-US mm/dd/yyyy
      if (digits.length <= 2) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(
        4,
        8
      )}`;
    }
  };

  /* const isoToMasked = (iso: string | null | undefined): string => {
    if (!iso) return "";

    const date = new Date(iso);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = String(date.getUTCFullYear());

    if (i18n.language.startsWith("pt")) {
      return `${day}/${month}/${year}`;
    } else {
      return `${month}/${day}/${year}`;
    }
  }; */

  const maskedToISO = (value: string) => {
    const parts = value.split("/");

    if (parts.length !== 3) return null;

    const [p1, p2, p3] = parts;

    if (p3.length !== 4) return null; // só aceita ano completo

    if (i18n.language.startsWith("pt")) {
      // dd/mm/yyyy
      return `${p3}-${p2.padStart(2, "0")}-${p1.padStart(2, "0")}`;
    } else {
      // mm/dd/yyyy
      return `${p3}-${p1.padStart(2, "0")}-${p2.padStart(2, "0")}`;
    }
  };

  const isValidDate = (iso: string) => {
    const date = new Date(iso);

    if (isNaN(date.getTime())) return false;

    // Confirma que a data gerada bate com a original (corrige coisas como 32/01 virar 01/02)
    const [year, month, day] = iso.split("-").map(Number);

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() + 1 === month &&
      date.getUTCDate() === day
    );
  };

  const handleMaskedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // aplica máscara
    const masked = applyDateMask(rawValue);

    // salva sempre o valor mascarado
    setDtNascDisplay(masked);

    // tenta converter para ISO (somente se estiver completo)
    const iso = maskedToISO(masked);

    if (!iso) {
      // ainda não está completa, não valida
      setForm((prev) => ({ ...prev, data_nascimento: "" }));
      return;
    }

    // valida
    if (!isValidDate(iso)) {
      toast.error(t("cadastro.data_invalida"), { duration: 2000 });
      setDtNasc("");
      setDtNascDisplay(""); // impede envio errado
      return;
    }

    // data válida → salva ISO interno
    setDtNasc(iso);
    setForm((prev) => ({ ...prev, data_nascimento: iso }));
  };

  const handleGeneroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const value = Number(e.target.value ?? 0);
    const generoSelecionada = generos.find(
      (e) => e.id.toString() === selectedId
    );

    setSexo(selectedId);

    setForm((prev) => ({
      ...prev,
      genero_id: value,
      sexo_label: generoSelecionada?.genero ?? "",
    }));
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const value = Number(e.target.value ?? 0);
    const estadoSelecionada = estados.find(
      (e) => e.id.toString() === selectedId
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
    setLoadingRecrutador(true);
    try {
      const cidadeRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cidades/estado-cidade/${selectedId}`,
        {
          method: "GET",
        }
      );

      if (!cidadeRes.ok)
        throw new Error(t("cadastro.item_alerta_erro_buscar_dados"));

      const data = await cidadeRes.json();

      // console.log(data);
      setCidades(data);
    } catch (error) {
      console.error(t("cadastro.item_alerta_erro_buscar_dados"), error);
    } finally {
      setLoadingRecrutador(false);
    }
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const value = Number(e.target.value ?? 0);
    const cidadeSelecionada = cidades.find(
      (e) => e.id.toString() === selectedId
    );

    setCidade(selectedId);

    setForm((prev) => ({
      ...prev,
      cidade_id: value,
      cidade_label: cidadeSelecionada?.cidade ?? "",
    }));
  };

  if (recrutadorId && loadingRecrutador) {
    return <LoadingOverlay />;
  }

  const handleCancel = () => {
    // Limpa o formulário salvo no localStorage
    localStorage.removeItem(`recrutadorForm_${userId}`);

    // Feedback visual
    toast.error(t("tela_perfil_recrutador.item_alerta_descartada"), {
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
        toast.error(t("tela_perfil_recrutador.item_alerta_erro_tipo_arq"), {
          duration: 2000,
        });
        return;
      }

      // 🔒 Verifica tamanho
      if (file.size > maxSize) {
        toast.error(t("tela_perfil_recrutador.item_alerta_erro_tamanho_arq"), {
          duration: 2000,
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

      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (step === 1) {
      if (
        !form.primeiro_nome ||
        !form.ultimo_nome ||
        !form.telefone ||
        !form.meioNotificacao ||
        !form.telefone ||
        !form.data_nascimento ||
        form.genero_id == 0 ||
        form.cidade_id == 0
      )
        return;

      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 2) {
      if (!isFormValid(form)) return;

      setIsSubmitting(true);

      try {
        const perfilId =
          perfil === "recrutador" ? "2" : perfil === "avaliador" ? "3" : "1";

        const formData = new FormData();
        formData.append("telefone", form.telefone);
        formData.append("localizacao", "");
        formData.append("apresentacao", form.apresentacao);
        formData.append("meio_notificacao", form.meioNotificacao);

        formData.append("primeiro_nome", form.primeiro_nome);
        formData.append("ultimo_nome", form.ultimo_nome);
        formData.append("nome_social", form.nome_social ?? "");
        formData.append("data_nascimento", dtNasc);
        formData.append("genero_id", String(form.genero_id));
        formData.append("cidade_id", String(form.cidade_id));

        if (logoFile) {
          formData.append("logo", logoFile); // precisa ser File/Blob
        }

        if (recrutadorId) {
          formData.append("recrutadorId", String(recrutadorId));
          formData.append("ativo", form.ativo ? "1" : "0");
        } else {
          formData.append("perfilId", perfilId);
        }

        /* console.log("logoFile state:", logoFile);
        for (const [key, value] of formData.entries()) {
          console.log("FormData:", key, value);
        } */

        const url = !recrutadorId
          ? `${process.env.NEXT_PUBLIC_API_URL}/recrutador/create-recrutador`
          : `${process.env.NEXT_PUBLIC_API_URL}/recrutador/update-recrutador`;

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
              : t("tela_perfil_recrutador.item_alerta_erro_salvar");
          throw new Error(errorMessage);
        }

        //setRecrutadorPublicado(data);

        localStorage.removeItem(`recrutadorForm_${userId}`);
        toast.success(t("tela_perfil_recrutador.item_alerta_sucesso"), {
          duration: 5000,
        });
        setIsSubmitting(false);
        router.push(`/dashboard?perfil=${perfil}`);
      } catch (err: unknown) {
        console.error(t("tela_perfil_recrutador.item_alerta_erro_salvar"), err);

        const message =
          err instanceof Error
            ? err.message
            : t("tela_perfil_recrutador.item_alerta_erro_salvar");

        toast.error(message, {
          duration: 5000,
        });

        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {step != 5 && (
          <div className="pt-3 pl-6 flex items-center justify-center">
            <div className="flex items-center justify-between w-full text-sm font-medium text-gray-500">
              {[
                `1 ${t("tela_topo_passos.passo_dados")}`,
                `2 ${t("tela_topo_passos.passo_visualizar")}`,
                `3 ${t("tela_topo_passos.passo_publicar")}`,
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
                  {index < 2 && (
                    <span className="mx-1 text-gray-300 hidden sm:inline">
                      ───────
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
                {recrutadorId && (
                  // <div className="col-span-1 md:col-span-2 flex justify-start">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="ativo"
                        checked={form.ativo ?? recrutador?.ativo ?? true}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-5"></div>
                    </div>
                    <span className="ml-3 text-sm font-normal text-gray-700">
                      {t("tela_perfil_recrutador.item_ativo")}
                    </span>
                  </label>
                  // </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1">
                    {t("tela_perfil_recrutador.item_label_nome")}
                  </label>
                  <div className="flex flex-row gap-3">
                    <div className="flex items-center border border-purple-400 rounded px-3 py-2 w-1/2">
                      <input
                        name="primeiro_nome"
                        placeholder={t(
                          "tela_perfil_recrutador.item_placeholder_primeiro_nome"
                        )}
                        className="w-full outline-none"
                        defaultValue={form.primeiro_nome}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex items-center border border-purple-400 rounded px-3 py-2 w-1/2">
                      <input
                        name="ultimo_nome"
                        placeholder={t(
                          "tela_perfil_recrutador.item_placeholder_ultimo_nome"
                        )}
                        className="w-full outline-none"
                        defaultValue={form.ultimo_nome}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {showErrors && (!form.primeiro_nome || !form.ultimo_nome) && (
                    <p className="text-sm text-red-600 mt-1">
                      {t("tela_perfil_recrutador.item_msg_campo_obt")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 flex items-center gap-1">
                    {t("cadastro.nome_social")}
                    <TooltipIcon
                      message={`${t("cadastro.tooltip_msg_nome_social")}`}
                      perfil={perfil}
                    />
                  </label>
                  <div className="flex items-center border border-purple-400 rounded px-3 py-2">
                    <input
                      type="text"
                      name="nome_social"
                      placeholder={t("cadastro.placehold_nome_social")}
                      className="w-full outline-none"
                      defaultValue={form.nome_social}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Campo 1 - Data de nascimento */}
                  <div className="col-span-1">
                    <label className="text-sm font-medium mb-1">
                      {t("cadastro.data_nascimento")}
                    </label>

                    <input
                      type="text"
                      value={dtNascDisplay}
                      onChange={handleMaskedDateChange}
                      placeholder={t("cadastro.placehold_data_nascimento")}
                      className="flex items-center border border-purple-400 rounded px-3 py-2 focus:outline-none w-full"
                    />

                    {showErrors && !form.data_nascimento && (
                      <p className="text-sm text-red-600 mt-1">
                        {t("tela_perfil_recrutador.item_msg_campo_obt")}
                      </p>
                    )}
                  </div>

                  {/* Campo 2 - Sexo */}
                  <div className="col-span-1">
                    <label className="text-sm font-medium mb-1">
                      {t("cadastro.sexo")}
                    </label>
                    <select
                      className="flex border border-purple-400 rounded px-3 py-2 focus:outline-none w-full"
                      name="genero"
                      value={sexo}
                      onChange={handleGeneroChange}
                    >
                      <option value="">{t("cadastro.placehold_sexo")}</option>
                      {generos.map((gen) => (
                        <option key={gen.id} value={gen.id}>
                          {gen.genero}
                        </option>
                      ))}
                    </select>

                    {showErrors && !form.genero_id && (
                      <p className="text-sm text-red-600 mt-1">
                        {t("tela_perfil_recrutador.item_msg_campo_obt")}
                      </p>
                    )}
                  </div>

                  {/* Campo 3 - Estado */}
                  <div className="col-span-1">
                    <label className="text-sm font-medium mb-1">
                      {t("cadastro.estado")}
                    </label>

                    <select
                      className="flex border border-purple-400 rounded px-3 py-2 focus:outline-none w-full"
                      name="estado"
                      value={estado}
                      onChange={handleEstadoChange}
                    >
                      <option value="">{t("cadastro.placehold_estado")}</option>
                      {estados.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.sigla}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campo 4 - Cidade (maior no desktop) */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-sm font-medium mb-1">
                      {t("cadastro.cidade")}
                    </label>

                    <select
                      className="flex border border-purple-400 rounded px-3 py-2 focus:outline-none w-full"
                      name="cidade"
                      value={cidade}
                      onChange={handleCidadeChange}
                    >
                      <option value="">{t("cadastro.placehold_cidade")}</option>
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

                <div>
                  <label className="text-sm font-medium mb-1">
                    {t("tela_perfil_recrutador.item_label_telefone")}
                  </label>
                  <div className="flex items-center border border-purple-400 rounded px-3 py-2">
                    <input
                      type="tel"
                      name="telefone"
                      placeholder={t(
                        "tela_perfil_recrutador.item_placeholder_telefone"
                      )}
                      className="w-full outline-none"
                      defaultValue={form.telefone}
                      onChange={handleChange}
                    />
                  </div>
                  {showErrors && !form.telefone && (
                    <p className="text-sm text-red-600 mt-1">
                      {t("tela_perfil_recrutador.item_msg_campo_obt")}
                    </p>
                  )}
                </div>

                <fieldset className="text-sm text-gray-700 mt-2">
                  <legend className="text-sm font-medium mb-1">
                    {t("tela_perfil_recrutador.item_label_notificacao")}
                  </legend>
                  <div className="flex">
                    <label className="flex items-center gap-2 cursor-pointer mr-10">
                      <input
                        type="radio"
                        name="meioNotificacao"
                        value="WhatsApp"
                        checked={"WhatsApp" === String(form.meioNotificacao)}
                        onChange={handleChange}
                        className="appearance-none w-4 h-4 rounded-full border-2 border-purple-600 checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all duration-200"
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
                        className="appearance-none w-4 h-4 rounded-full border-2 border-purple-600 checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all duration-200"
                      />
                      <span>SMS</span>
                    </label>
                  </div>
                  {showErrors && !form.meioNotificacao && (
                    <p className="text-sm text-red-600 mt-1">
                      {t("tela_perfil_recrutador.item_msg_campo_obt")}
                    </p>
                  )}
                </fieldset>

                <div>
                  <label className="text-sm font-medium mb-1">
                    {t("tela_perfil_recrutador.item_label_descreva")}{" "}
                    <strong>
                      {t("tela_perfil_recrutador.item_label_descreva_negrito")}
                    </strong>
                  </label>
                  <textarea
                    name="apresentacao"
                    placeholder={t(
                      "tela_perfil_recrutador.item_placeholder_apresentacao"
                    )}
                    className="w-full border border-purple-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
                  <label className="text-sm font-medium mb-2">
                    {t("tela_perfil_recrutador.item_label_foto")}
                  </label>
                  <label
                    className={`
                      flex flex-col items-center justify-center
                      border border-dashed border-purple-400 rounded
                      cursor-pointer hover:bg-purple-50
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
                        {t("tela_perfil_recrutador.item_msg_foto")}
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
                  {showErrors && !form.logoPreview && (
                    <p className="text-sm text-red-600 mt-1">
                      {t("tela_perfil_recrutador.item_msg_logo_obt")}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button" // evita submit acidental
                    onClick={handleCancel}
                    className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                  >
                    {t("tela_perfil_recrutador.item_botao_cancelar")}
                  </button>
                  <button
                    type="submit"
                    className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                  >
                    {t("tela_perfil_recrutador.item_botao_avancar")}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col w-full h-full"
              >
                <div className="w-full h-full flex flex-col">
                  <div className="flex items-start gap-4">
                    {/* Avatar / Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0">
                      {form.logoPreview ? (
                        <img
                          src={form.logoPreview}
                          alt="Logo da recrutador"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-gray-400 flex items-center justify-center h-full">
                          {t("tela_perfil_recrutador.item_msg_sem_foto")}
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
                            {t("tela_perfil_recrutador.item_ativo")}
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
                            {t("tela_perfil_recrutador.item_inativo")}
                          </span>
                        </span>
                      )}

                      {form.nome_social ? (
                        <div className="flex items-center">
                          <div className="flex flex-col leading-tight">
                            <p className="font-bold">{form.nome_social}</p>
                            <p className="text-sm">
                              {form.primeiro_nome} {form.ultimo_nome}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="flex flex-col leading-tight">
                            <p className="font-bold">
                              {form.primeiro_nome} {form.ultimo_nome}
                            </p>
                            <p className="text-sm">{form.nome_social}</p>
                          </div>
                        </div>
                      )}

                      {/* Bloco 2 colunas */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800 w-[50%]">
                        {/*  Localização /}
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
                        </div> */}

                        {/* Dt Nasc */}
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {dtNascDisplay}
                        </div>

                        {/* Sexo */}
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
                              d="M12 11a4 4 0 100-8 4 4 0 000 8zm0 0c-4.418 0-8 2.239-8 5v3h16v-3c0-2.761-3.582-5-8-5z"
                            />
                          </svg>

                          {form.sexo_label}
                        </div>

                        {/* Estado */}
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
                              d="M9 3l6 2 6-2v13l-6 2-6-2-6 2V5l6-2z"
                            />
                          </svg>
                          {form.estado_label}
                        </div>

                        {/* Cidade */}
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
                              d="M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z"
                            />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {form.cidade_label}
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

                        {/* Website */}
                        {/* <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {/* Globo de internet /}
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 3a9 9 0 100 18 9 9 0 000-18z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.25 12h19.5M12 2.25c2.25 2.25 3.75 5.25 3.75 9.75s-1.5 7.5-3.75 9.75M12 2.25C9.75 4.5 8.25 7.5 8.25 12s1.5 7.5 3.75 9.75"
                            />
                          </svg>
                          {form.site}
                        </div> */}

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
                    {form.apresentacao || "Nenhuma apresentação fornecida."}
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col md:flex-row justify-between gap-2 mt-auto px-4 md:px-8 pb-4">
                    <div className="flex">
                      <button
                        onClick={prevStep}
                        type="button"
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                      >
                        {t("tela_perfil_recrutador.item_botao_voltar")}
                      </button>
                    </div>

                    {/* Direita: botões cadastrar e editar */}
                    <div className="flex gap-2">
                      <button
                        type="button" // evita submit acidental
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                      >
                        {t("tela_perfil_recrutador.item_botao_cancelar")}
                      </button>
                      <button
                        type="submit"
                        className={`px-6 py-2 rounded-full font-semibold text-indigo-900 flex items-center gap-2 ${
                          isFormValid(form)
                            ? " bg-purple-100 hover:bg-purple-200 cursor-pointer"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {isSubmitting ? (
                          <ImSpinner2 className="animate-spin" />
                        ) : (
                          t("tela_perfil_recrutador.item_botao_publicar")
                        )}
                      </button>
                    </div>
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

const isFormValid = (form: RecrutadorForm) => {
  return (
    form.primeiro_nome.trim() !== "" &&
    form.ultimo_nome.trim() !== "" &&
    form.data_nascimento.trim() !== "" &&
    form.genero_id !== 0 &&
    form.cidade_id !== 0 &&
    form.telefone.trim() !== "" &&
    form.meioNotificacao.trim() !== ""
    /*form.logoPreview !== null &&
    form.capaPreview !== null */
  );
};
