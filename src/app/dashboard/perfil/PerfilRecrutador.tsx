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
}

interface RecrutadorData {
  recrutador_id: number;
  telefone?: string;
  apresentacao?: string;
  localizacao: string;
  meio_notificacao: string;
  logo?: string;
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

export default function PerfilRecrutador({
  perfil,
  recrutadorId,
  userId,
}: RecrutadorProps) {
  const router = useRouter();

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
    }
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  //const [recrutadorPublicado, setRecrutadorPublicado] = useState<RecrutadorData | null>(null);

  const [recrutador, setRecrutador] = useState<RecrutadorData | null>(null);
  const [loadingRecrutador, setLoadingRecrutador] = useState<boolean>(false);

  useEffect(() => {
    if (!recrutadorId) return;

    const fetchRecrutador = async () => {
      setLoadingRecrutador(true);
      const perfilId =
        perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recrutador/${recrutadorId}/perfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar dados da recrutador");

        const data = await res.json();

        // mapeia os campos da API para o form
        const recrutadorFormData: RecrutadorForm = {
          telefone: data.telefone || "",
          localizacao: data.localizacao || "",
          apresentacao: data.apresentacao || "",
          meioNotificacao: data.meio_notificacao || "",
          logoPreview: data.logo || null,
          ativo: data.ativo ?? true,
        };

        setForm(recrutadorFormData); // <- preenche estado + localStorage
        setRecrutador(data); // se quiser manter o objeto bruto
        router.push(`/dashboard/perfil?perfil=${perfil}&id=${recrutadorId}`);
      } catch (error) {
        console.error("Erro ao carregar recrutador:", error);
      } finally {
        setLoadingRecrutador(false);
      }
    };

    fetchRecrutador();
  }, [recrutadorId]);

  if (recrutadorId && loadingRecrutador) {
    return <LoadingOverlay />;
  }

  const handleCancel = () => {
    // Limpa o formulário salvo no localStorage
    localStorage.removeItem(`recrutadorForm_${userId}`);

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

      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
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
      if (!isFormValid(form)) return;

      setIsSubmitting(true);

      try {
        const perfilId =
          perfil === "recrutador" ? "2" : perfil === "avaliador" ? "3" : "1";

        const formData = new FormData();
        formData.append("telefone", form.telefone);
        formData.append("localizacao", form.localizacao);
        formData.append("apresentacao", form.apresentacao);
        formData.append("meio_notificacao", form.meioNotificacao);

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
              : "Erro ao salvar recrutador.";
          throw new Error(errorMessage);
        }

        //setRecrutadorPublicado(data);

        localStorage.removeItem(`recrutadorForm_${userId}`);
        toast.success(`Recrutador publicada com sucesso!`, {
          duration: 5000,
        });
        setIsSubmitting(false);
        router.push(`/dashboard?perfil=${perfil}`);
      } catch (err: unknown) {
        console.error("Erro ao enviar dados:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Erro ao enviar dados da recrutador. Tente novamente.";

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
              {["1 Dados", "2 Visualizar", "3 Publicar"].map((etapa, index) => (
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
                      Ativo
                    </span>
                  </label>
                  // </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telefone de contato:
                  </label>
                  <div className="flex items-center border border-purple-400 rounded px-3 py-2">
                    <span className="mr-2">🇧🇷</span>
                    <input
                      type="tel"
                      name="telefone"
                      placeholder="Telefone"
                      className="w-full outline-none"
                      defaultValue={recrutador?.telefone ?? form.telefone}
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
                    className="w-full border border-purple-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
                  {showErrors && !form.localizacao && (
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
                  <label className="block text-sm font-medium mb-2">
                    Carregue uma foto, imagem, logo do recrutador (recomendado
                    512×512 px, até 1MB).
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
                    className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                  >
                    Avançar
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
                  {/* Capa e logo */}
                  <div className="relative w-full h-20 sm:h-24 md:h-36 rounded-lg bg-gray-100 z-0 overflow-hidden">
                    {/* Logo sobreposto e responsivo */}
                    <div className="absolute left-6 top-full -translate-y-2/3 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden border-4 border-white z-10">
                      {form.logoPreview ? (
                        <img
                          src={form.logoPreview}
                          alt="Logo da recrutador"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-xs text-gray-400 text-center px-2">
                          Sem logo
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Informações da recrutador */}
                  <div className="flex-1 pt-8 px-4 md:px-8">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {form.telefone || "Nenhum telefone fornecido."}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {form.localizacao || "Nenhuma localização fornecida."}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {form.meioNotificacao ||
                        "Nenhuma meio de notificação selecionada."}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {form.apresentacao || "Nenhuma apresentação fornecida."}
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col md:flex-row justify-between gap-2 mt-auto px-4 md:px-8 pb-4">
                    <div className="flex">
                      <button
                        onClick={prevStep}
                        type="button"
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                      >
                        Voltar
                      </button>
                    </div>

                    {/* Direita: botões cadastrar e editar */}
                    <div className="flex gap-2">
                      <button
                        type="button" // evita submit acidental
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                      >
                        Cancelar
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
                          "Publicar"
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
    form.telefone.trim() !== "" &&
    form.localizacao.trim() !== "" &&
    form.meioNotificacao.trim() !== ""
    /*form.apresentacao.trim() !== ""  &&
    form.logoPreview !== null &&
    form.capaPreview !== null */
  );
};
