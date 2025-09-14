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

interface EmpresaDadosProps {
  perfil: ProfileType;
  empresaId?: string | null;
  userId?: string;
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
}

interface EmpresaData {
  empresa_id: number;
  nome_empresa: string;
  email?: string;
  website?: string;
  telefone?: string;
  apresentacao?: string;
  logo?: string;
  imagem_fundo?: string;
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

export default function EmpresaDados({
  perfil,
  empresaId,
  userId,
}: EmpresaDadosProps) {
  const router = useRouter();

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
    }
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [empresaPublicada, setEmpresaPublicada] = useState<EmpresaData | null>(
    null
  );

  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState<boolean>(false);

  useEffect(() => {
    if (!empresaId) return;

    const fetchEmpresa = async () => {
      setLoadingEmpresa(true);
      const perfilId =
        perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/${empresaId}/perfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar dados da empresa");

        const data = await res.json();

        // mapeia os campos da API para o form
        const empresaFormData: EmpresaForm = {
          nome: data.nome_empresa || "",
          site: data.website || "",
          email: data.email || "",
          telefone: data.telefone || "",
          localizacao: data.localizacao || "",
          apresentacao: data.apresentacao || "",
          logoPreview: data.logo || null,
          capaPreview: data.imagem_fundo || null,
        };

        setForm(empresaFormData); // <- preenche estado + localStorage
        setEmpresa(data); // se quiser manter o objeto bruto
      } catch (error) {
        console.error("Erro ao carregar empresa:", error);
      } finally {
        setLoadingEmpresa(false);
      }
    };

    fetchEmpresa();
  }, [empresaId]);

  if (empresaId && loadingEmpresa) {
    return <LoadingOverlay />;
  }

  const handleCancel = () => {
    // Limpa o formulário salvo no localStorage
    localStorage.removeItem(`empresaForm_${userId}`);

    // Feedback visual
    toast.error("Alterações descartadas.", {
      duration: 3000, // 3 segundos
    });

    // Redireciona com segurança, evitando id indefinido
    const url = empresaId
      ? `/dashboard/empresa_dados?perfil=${perfil}&id=${empresaId}`
      : `/dashboard/empresa_dados?perfil=${perfil}`;

    router.push(url);
  };

  // Handlers comuns
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if ((name === "logo" || name === "capa") && files?.[0]) {
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
      } else if (name === "capa") {
        if (form.capaPreview && !form.capaPreview.startsWith("http")) {
          URL.revokeObjectURL(form.capaPreview);
        }
        setCapaFile(file);
        setForm((prev) => ({ ...prev, capaPreview: preview }));
      }
    } else {
      // Para campos de texto ou outros
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
        if (empresaId) {
          body.append("empresa_id", String(empresaId));
        }

        if (logoFile) body.append("logo", logoFile);
        if (capaFile) body.append("imagem_fundo", capaFile);

        const url = !empresaId
          ? `${process.env.NEXT_PUBLIC_API_URL}/empresas/create-empresa`
          : `${process.env.NEXT_PUBLIC_API_URL}/empresas/update-empresa`;

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
              : "Erro ao salvar empresa.";
          throw new Error(errorMessage);
        }

        setEmpresaPublicada(data);

        localStorage.removeItem(`empresaForm_${userId}`);
        toast.success(`Empresa "${data.nome_empresa}" publicada com sucesso!`, {
          duration: 5000,
        });
        setIsSubmitting(false);
        nextStep();
      } catch (err: unknown) {
        console.error("Erro ao enviar dados:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Erro ao enviar dados da empresa. Tente novamente.";

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
                "1 Dados",
                "2 Localização",
                "3 Apresentação",
                "4 Visualizar",
                "5 Publicar",
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
                    Nome da empresa:
                  </label>
                  <input
                    type="text"
                    name="nome"
                    placeholder="Empresa"
                    className="w-full border border-purple-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    defaultValue={empresa?.nome_empresa ?? form.nome}
                    onChange={handleChange}
                  />
                  {showErrors && !form.nome && (
                    <p className="text-sm text-red-600 mt-1">
                      Campo obrigatório.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Website da empresa:
                  </label>
                  <input
                    type="url"
                    name="site"
                    placeholder="Website"
                    className="w-full border border-purple-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    defaultValue={empresa?.website ?? form.site}
                    onChange={handleChange}
                  />
                  {showErrors && !form.site && (
                    <p className="text-sm text-red-600 mt-1">
                      Campo obrigatório.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email de contato:
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full border border-purple-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    defaultValue={empresa?.email ?? form.email}
                    onChange={handleChange}
                  />
                  {showErrors && !form.email && (
                    <p className="text-sm text-red-600 mt-1">
                      Campo obrigatório.
                    </p>
                  )}
                </div>

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
                      defaultValue={empresa?.telefone ?? form.telefone}
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
                  <label className="block text-sm font-medium mb-2">
                    Carregue o logotipo da sua empresa (recomendado 512×512 px,
                    até 1MB).
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
              <div className="w-full h-full flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                  <div className="flex-1">
                    <h1 className="block text-sm mb-1 py-3 font-bold">
                      Informe sua localização para encontrar os melhores
                      candidatos
                    </h1>
                    <label className="block text-sm font-medium mb-1">
                      Localização:
                    </label>
                    <input
                      type="text"
                      name="localizacao"
                      placeholder="Informe o local de sua empresa"
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

                  {/* Botões no rodapé */}
                  <div className="flex flex-col md:flex-row justify-between gap-2 mt-4">
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
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
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
                  <div className="flex-1">
                    <h1 className="block text-sm  mb-1 py-3 font-bold">
                      Apresentação da empresa
                    </h1>
                    <label className="block text-sm font-medium mb-1">
                      Descreva, em algumas linhas, quem é sua empresa e o que
                      ela busca profissionalmente. Este texto será sua carta de
                      apresentação para candidatos e especialistas na
                      plataforma.
                    </label>
                    <textarea
                      name="apresentacao"
                      placeholder="Apresente sua empresa"
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
                        Campo obrigatório.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Carregue a imagem de capa da sua empresa (recomendado:
                      1200×300 px, até 1MB)
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
                          Clique aqui e carregue sua imagem
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
                        capa obrigatória.
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
                        className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 cursor-pointer"
                      >
                        Avançar
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
                        Sem imagem de capa
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
                          Sem logo
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Informações da empresa */}
                  <div className="flex-1 pt-8 px-4 md:px-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {form.nome || "Nome da empresa"}
                    </h2>
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

            {step === 5 && empresaPublicada === null && <LoadingOverlay />}

            {step === 5 && empresaPublicada && (
              <div className="flex flex-col items-start p-4 w-full min-h-[500px] space-y-6">
                {/* Capa e logo */}

                <div className="relative w-full h-20 sm:h-24 md:h-36 rounded-lg bg-gray-100 z-0">
                  {empresaPublicada.imagem_fundo ? (
                    <Image
                      src={empresaPublicada.imagem_fundo}
                      alt="Imagem de capa"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized // opcional, se estiver usando imagens externas sem loader
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sem imagem de capa
                    </div>
                  )}

                  {/* Logo sobreposto */}
                  <div className="absolute left-6 top-full -translate-y-2/3 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden border-4 border-white z-10">
                    {empresaPublicada.logo ? (
                      <Image
                        src={empresaPublicada.logo}
                        alt="Logo da empresa"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized // opcional, se estiver usando imagens externas sem loader
                      />
                    ) : (
                      <div className="text-xs text-gray-400 text-center px-2">
                        Sem logo
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações + Vagas */}
                <div className="pt-10 px-4 md:px-8 w-full grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Coluna esquerda */}
                  <div className="md:col-span-3 space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {empresaPublicada.nome_empresa}
                    </h2>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {empresaPublicada.apresentacao ||
                        "Nenhuma apresentação fornecida."}
                    </p>
                  </div>

                  {/* Coluna direita */}
                  <div className="flex flex-col items-start justify-start space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Vagas
                    </h3>
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/vagas?perfil=${perfil}&op=N&id=${empresaPublicada.empresa_id}`
                        )
                      }
                      className="px-4 py-2 rounded-full text-sm font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
                    >
                      Cadastrar Vaga
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
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
