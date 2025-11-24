"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../../components/perfil/Sidebar";
import TopBar from "../../../components/perfil/TopBar";
import { ProfileType } from "../../../components/perfil/ProfileContext";
/* import { useAuthGuard } from "../../lib/hooks/useAuthGuard";*/
import LoadingOverlay from "../../../components/LoadingOverlay";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import SemDados from "../../SemDados";

const allowedTypes = ["image/"];

interface EmpresaDadosProps {
  perfil: ProfileType;
  userId?: number;
  recrutadorId?: string | null;
  hasPerfilRecrutador: boolean;
}

// Tipos de dados do formulário
interface EmpresaForm {
  nome: string;
  site: string;
  email: string;
  telefone: string;
  logoPreview: string | null;
  localizacao: string;
  apresentacao: string;
  capaPreview: string | null;
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

export default function EmpresaCriar({
  perfil,
  userId,
  recrutadorId,
  hasPerfilRecrutador,
}: EmpresaDadosProps) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [step, setStep] = useState(1);
  const [form, setForm] = useLocalStorage<EmpresaForm>(
    `empresaForm_${userId}`,
    {
      nome: "",
      site: "",
      email: "",
      telefone: "",
      logoPreview: null,
      localizacao: "",
      apresentacao: "",
      capaPreview: null,
      ativo: true,
    }
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleCancel = () => {
    // Limpa o formulário salvo no localStorage
    localStorage.removeItem(`empresaForm_${userId}`);

    // Feedback visual
    toast.error(t("tela_empresa_dados.item_alerta_descartada"), {
      duration: 3000, // 3 segundos
    });

    // Redireciona com segurança, evitando id indefinido
    const url = `/dashboard/empresa?perfil=${perfil}`;

    router.push(url);
  };

  // Handlers comuns
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;

    if ((name === "logo" || name === "capa") && files?.[0]) {
      const file = files[0];
      const maxSize = 1 * 1024 * 1024; // 1MB
      const isImage = file.type.startsWith("image/");
      const isAllowed = allowedTypes.includes(file.type) || isImage;

      // 🔒 Verifica se o tipo MIME é de imagem
      if (!isAllowed) {
        toast.error(t("tela_empresa_dados.item_alerta_erro_tipo_arq"), {
          duration: 2000,
        });
        return;
      }

      // 🔒 Verifica tamanho
      if (file.size > maxSize) {
        toast.error(t("tela_empresa_dados.item_alerta_erro_tamanho_arq"), {
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
      } else if (name === "capa") {
        if (form.capaPreview && !form.capaPreview.startsWith("http")) {
          URL.revokeObjectURL(form.capaPreview);
        }
        setCapaFile(file);
        setForm((prev) => ({ ...prev, capaPreview: preview }));
      }
    } else {
      // Campos de texto e outros
      const { name, type } = e.target;
      const value =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (step === 1) {
      if (
        !form.nome ||
        !form.site ||
        !form.email ||
        !form.telefone /* ||
            !logoFile */
      )
        return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 2) {
      if (!form.localizacao) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 3) {
      if (!form.apresentacao) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 4) {
      if (!isFormValid(form)) return;

      setIsSubmitting(true);

      try {
        const body = new FormData();
        body.append("recrutadorId", String(recrutadorId));
        body.append("nome", form.nome);
        body.append("site", form.site);
        body.append("email", form.email);
        body.append("telefone", form.telefone);
        body.append("localizacao", form.localizacao);
        body.append("apresentacao", form.apresentacao);

        // só manda o perfilId no create

        const perfilId =
          perfil === "recrutador" ? "2" : perfil === "avaliador" ? "3" : "1";
        body.append("perfilId", perfilId);

        if (logoFile) body.append("logo", logoFile);
        if (capaFile) body.append("imagem_fundo", capaFile);
        /* console.log("logoFile state:", logoFile);
            for (const [key, value] of body.entries()) {
              console.log("FormData:", key, value);
            } */

        const url = `${process.env.NEXT_PUBLIC_API_URL}/empresas/create-empresa`;

        const response = await fetch(url, {
          method: "POST",
          body,
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage =
            typeof data.message === "string"
              ? data.message
              : Array.isArray(data.message)
              ? data.message.join(", ")
              : t("tela_empresa_dados.item_alerta_erro_salvar");
          throw new Error(errorMessage);
        }

        localStorage.removeItem(`empresaForm_${userId}`);
        toast.success(
          `${t("tela_empresa_dados.item_alerta_sucesso_1")} ${
            data.nome_empresa
          } ${t("tela_empresa_dados.item_alerta_sucesso_2")}`,
          {
            duration: 5000,
          }
        );
        setIsSubmitting(false);
        router.push(`/dashboard/empresa/detalhe/${data.id}?perfil=${perfil}`);
      } catch (err: unknown) {
        console.error(t("tela_empresa_dados.item_alerta_erro_salvar"), err);

        const message =
          err instanceof Error
            ? err.message
            : t("tela_empresa_dados.item_alerta_erro_salvar");

        toast.error(message, {
          duration: 5000,
        });

        setIsSubmitting(false);
      }
    }
  };

  if (!userId) {
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
        {!hasPerfilRecrutador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <>
            {step != 5 && (
              <div className="pt-3 pl-6 flex items-center justify-center">
                <div className="flex items-center justify-between w-full text-sm font-medium text-gray-500">
                  {[
                    `1 ${t("tela_topo_passos.passo_dados")}`,
                    `2 ${t("tela_topo_passos.passo_localizacao")}`,
                    `3 ${t("tela_topo_passos.passo_apresentacao")}`,
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

            <main className="p-4 grid grid-cols-1 gap-4 w-[98%] mx-auto">
              <div className="flex flex-col items-start p-4 bg-white rounded-lg shadow-sm w-full min-h-[500px]">
                {step === 1 && (
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4 w-full"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("tela_empresa_dados.item_label_nome")}
                      </label>
                      <input
                        type="text"
                        name="nome"
                        placeholder={t(
                          "tela_empresa_dados.item_placeholder_nome"
                        )}
                        className="w-full border border-purple-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        defaultValue={form.nome}
                        onChange={handleChange}
                      />
                      {showErrors && !form.nome && (
                        <p className="text-sm text-red-600 mt-1">
                          {t("tela_empresa_dados.item_msg_campo_obt")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("tela_empresa_dados.item_label_site")}
                      </label>
                      <input
                        type="url"
                        name="site"
                        placeholder={t(
                          "tela_empresa_dados.item_placeholder_site"
                        )}
                        className="w-full border border-purple-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        defaultValue={form.site}
                        onChange={handleChange}
                      />
                      {showErrors && !form.site && (
                        <p className="text-sm text-red-600 mt-1">
                          {t("tela_empresa_dados.item_msg_campo_obt")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("tela_empresa_dados.item_label_email")}
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder={t(
                          "tela_empresa_dados.item_placeholder_email"
                        )}
                        className="w-full border border-purple-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        defaultValue={form.email}
                        onChange={handleChange}
                      />
                      {showErrors && !form.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {t("tela_empresa_dados.item_msg_campo_obt")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("tela_empresa_dados.item_label_telefone")}
                      </label>
                      <div className="flex items-center border border-purple-400 rounded px-3 py-2">
                        <span className="mr-2">🇧🇷</span>
                        <input
                          type="tel"
                          name="telefone"
                          placeholder={t(
                            "tela_empresa_dados.item_placeholder_telefone"
                          )}
                          className="w-full outline-none"
                          defaultValue={form.telefone}
                          onChange={handleChange}
                        />
                      </div>
                      {showErrors && !form.telefone && (
                        <p className="text-sm text-red-600 mt-1">
                          {t("tela_empresa_dados.item_msg_campo_obt")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("tela_empresa_dados.item_label_foto")}
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
                            {t("tela_empresa_dados.item_msg_foto")}
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
                          {t("tela_empresa_dados.item_msg_logo_obt")}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button" // evita submit acidental
                        onClick={handleCancel}
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                      >
                        {t("tela_empresa_dados.item_botao_cancelar")}
                      </button>
                      <button
                        type="submit"
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                      >
                        {t("tela_empresa_dados.item_botao_avancar")}
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <div className="w-full h-full flex flex-col">
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col flex-1"
                    >
                      <div className="flex-1">
                        <h1 className="block text-sm mb-1 py-3 font-bold">
                          {t(
                            "tela_empresa_dados.item_label_titulo_localizacao"
                          )}
                        </h1>
                        <label className="block text-sm font-medium mb-1">
                          {t("tela_empresa_dados.item_label_localizacao")}
                        </label>
                        <input
                          type="text"
                          name="localizacao"
                          placeholder={t(
                            "tela_empresa_dados.item_placeholder_localizacao"
                          )}
                          className="w-full border border-purple-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                          value={form.localizacao}
                          onChange={handleChange}
                        />
                        {showErrors && !form.localizacao && (
                          <p className="text-sm text-red-600 mt-1">
                            {t("tela_empresa_dados.item_msg_campo_obt")}
                          </p>
                        )}
                      </div>

                      {/* Botões no rodapé */}
                      <div className="flex flex-col md:flex-row justify-between gap-2 mt-4">
                        <div className="flex">
                          <button
                            onClick={prevStep}
                            type="button"
                            className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                          >
                            {t("tela_empresa_dados.item_botao_voltar")}
                          </button>
                        </div>

                        {/* Direita: botões cadastrar e editar */}
                        <div className="flex gap-2">
                          <button
                            type="button" // evita submit acidental
                            onClick={handleCancel}
                            className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                          >
                            {t("tela_empresa_dados.item_botao_cancelar")}
                          </button>
                          <button
                            type="submit"
                            className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                          >
                            {t("tela_empresa_dados.item_botao_avancar")}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {step === 3 && (
                  <div className="w-full h-full flex flex-col">
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col flex-1"
                    >
                      <div className="flex-1">
                        <h1 className="block text-sm  mb-1 py-3 font-bold">
                          {t("tela_empresa_dados.item_label_titulo_descreva")}
                        </h1>
                        <label className="block text-sm font-medium mb-1">
                          {t("tela_empresa_dados.item_label_descreva")}
                        </label>
                        <textarea
                          name="apresentacao"
                          placeholder={t(
                            "tela_empresa_dados.item_placeholder_apresentacao"
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
                        {showErrors && !form.apresentacao && (
                          <p className="text-sm text-red-600 mt-1">
                            {t("tela_empresa_dados.item_msg_campo_obt")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t("tela_empresa_dados.item_label_capa")}
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
                          {form.capaPreview ? (
                            <Image
                              src={form.capaPreview}
                              alt="Prévia da logo"
                              width={200}
                              height={50}
                              className="object-contain mb-2"
                              unoptimized
                              priority={false}
                            />
                          ) : (
                            <FaCloudUploadAlt className="text-2xl mb-1" />
                          )}
                          {!form.capaPreview && (
                            <span className="text-sm font-medium text-center sm:text-base">
                              {t("tela_empresa_dados.item_msg_foto")}
                            </span>
                          )}
                          <input
                            type="file"
                            name="capa"
                            accept="image/*"
                            className="hidden"
                            onChange={handleChange}
                          />
                        </label>
                        {showErrors && !capaFile && (
                          <p className="text-sm text-red-600 mt-1">
                            {t("tela_empresa_dados.item_msg_capa_obt")}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <div className="flex">
                          <button
                            onClick={prevStep}
                            type="button"
                            className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                          >
                            {t("tela_empresa_dados.item_botao_voltar")}
                          </button>
                        </div>

                        {/* Direita: botões cadastrar e editar */}
                        <div className="flex gap-2">
                          <button
                            type="button" // evita submit acidental
                            onClick={handleCancel}
                            className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                          >
                            {t("tela_empresa_dados.item_botao_cancelar")}
                          </button>
                          <button
                            type="submit"
                            className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                          >
                            {t("tela_empresa_dados.item_botao_avancar")}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {step === 4 && (
                  <form
                    onSubmit={handleSubmit}
                    className="flex-1 flex flex-col w-full h-full"
                  >
                    <div className="w-full h-full flex flex-col">
                      {/* Capa e logo */}
                      <div className="relative w-full h-20 sm:h-24 md:h-36 rounded-lg bg-gray-100 z-0 overflow-hidden">
                        {form.capaPreview ? (
                          <img
                            src={form.capaPreview}
                            alt="Imagem de capa"
                            className="w-full h-full min-w-full min-h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {t("tela_empresa_dados.item_msg_sem_capa")}
                          </div>
                        )}

                        {/* Logo sobreposto e responsivo */}
                        <div className="absolute left-6 top-full -translate-y-2/3 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden border-4 border-white z-10">
                          {form.logoPreview ? (
                            <img
                              src={form.logoPreview}
                              alt="Logo da empresa"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-xs text-gray-400 text-center px-2">
                              {t("tela_empresa_dados.item_msg_sem_foto")}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Informações da empresa */}
                      <div className="flex-1 pt-8 px-4 md:px-8">
                        <div className="md:col-span-3 space-y-3">
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
                                {t("tela_empresa_dados.item_ativo")}
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
                                {t("tela_empresa_dados.item_inativo")}
                              </span>
                            </span>
                          )}

                          <h2 className="text-xl font-semibold text-gray-800">
                            {form.nome}
                          </h2>

                          {/* Bloco 2 colunas */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800">
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

                            {/* Website */}
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                {/* Globo de internet */}
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
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-500"
                                fill="none"
                                viewBox="0 0 25 25"
                                stroke="currentColor"
                              >
                                {/* Envelope */}
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"
                                />
                              </svg>
                              {form.email}
                            </div>
                          </div>

                          {/* Apresentação */}
                          <div className="w-[85%] text-sm text-gray-700 whitespace-pre-line mt-3">
                            {form.apresentacao ||
                              t(
                                "tela_empresa_dados.item_msg_nenhuma_apresentacao"
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex flex-col md:flex-row justify-between gap-2 mt-auto px-4 md:px-8 pb-4">
                        <div className="flex">
                          <button
                            onClick={prevStep}
                            type="button"
                            className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                          >
                            {t("tela_empresa_dados.item_botao_voltar")}
                          </button>
                        </div>

                        {/* Direita: botões cadastrar e editar */}
                        <div className="flex gap-2">
                          <button
                            type="button" // evita submit acidental
                            onClick={handleCancel}
                            className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                          >
                            {t("tela_empresa_dados.item_botao_cancelar")}
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
                              t("tela_empresa_dados.item_botao_publicar")
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}

const isFormValid = (form: EmpresaForm) => {
  return (
    form.nome.trim() !== "" &&
    form.site.trim() !== "" &&
    form.email.trim() !== "" &&
    form.telefone.trim() !== "" &&
    form.localizacao.trim() !== "" &&
    form.apresentacao.trim() !== "" /* &&
      form.logoPreview !== null &&
      form.capaPreview !== null */
  );
};
