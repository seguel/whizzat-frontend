"use client";

import { useState, useEffect } from "react";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import SemDados from "../SemDados";
import { ImSpinner2 } from "react-icons/im";
import LoadingOverlay from "../../components/LoadingOverlay";
import { X, Clock, Building2, MapPin, CalendarDays } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import TooltipIcon from "../../components/TooltipIcon";
import SkillsPanel from "../../components/perfil/SkillsPanel";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";
// import { getFileUrl } from "../../util/getFileUrl";
import Image from "next/image";

interface Props {
  perfil: ProfileType;
  hasEmpresa: boolean | null;
  empresaId: string | null;
  vagaId: string | null;
}
interface SkillAvaliacao {
  skill_id: number;
  nome?: string;
  peso: number;
  avaliador_proprio: boolean;
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
  pcd: boolean;
  qtde_dias_aberta: string;
  qtde_posicao: string;
  lista_skills: SkillAvaliacao[];
  data_cadastro: string;
  logo: string;
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
  modalidade: ModalidadeVaga;
  periodo: PeriodoVaga;
  pcd: boolean;
  qtde_dias_aberta: number;
  qtde_posicao: number;
  skills: SkillAvaliacao[];
  data_cadastro: string;
  logo: string;
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
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useLocalStorage<VagasForm>("vagasForm", {
    empresa_id: "",
    nome_vaga: "",
    descricao: "",
    local_vaga: "",
    modalidade_trabalho_id: "",
    periodo_trabalho_id: "",
    pcd: false,
    qtde_dias_aberta: "",
    qtde_posicao: "",
    lista_skills: [],
    data_cadastro: "",
    logo: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vagaPublicada, setVagaPublicada] = useState<VagaData | null>(null);

  const [vaga, setVaga] = useState<VagaData | null>(null);
  const [loadingVagaEmpresa, setLoadingVagaEmpresa] = useState<boolean>(false);
  const [diasDisponiveis, setDiasDisponiveis] = useState(0);
  const [quantidadeVagas, setQuantidadeVagas] = useState(0);

  const [empresas, setEmpresas] = useState<
    { empresa_id: number; nome_empresa: string; logo: string }[]
  >([]);
  const [modalidades, setModalidades] = useState<
    { modalidade_trabalho_id: number; modalidade: string }[]
  >([]);
  const [periodos, setPeriodos] = useState<
    { periodo_trabalho_id: number; periodo: string }[]
  >([]);
  const [skills, setSkills] = useState<{ skill_id: number; skill: string }[]>(
    []
  );

  // Data de vigência
  const dataCadastro = new Date();
  const dias = Number(form.qtde_dias_aberta ?? 0);
  const dataVigencia = addDays(dataCadastro, dias);
  const dataFormatada = format(dataVigencia, "dd 'de' MMMM", { locale: ptBR });

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
  } | null>(null);

  useEffect(() => {
    if (!vagaId) return;

    const fetchVaga = async () => {
      setLoadingVagaEmpresa(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/vaga/${vagaId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar dados da vaga");

        const data = await res.json();
        setVaga(data);
      } catch (error) {
        console.error("Erro ao carregar vaga:", error);
      } finally {
        setLoadingVagaEmpresa(false);
      }
    };

    fetchVaga();
  }, [vagaId]);

  useEffect(() => {
    setLoadingVagaEmpresa(true);
    const perfilId =
      perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    const fetchSelectData = async () => {
      try {
        const [empresasRes, modalidadesRes, periodosRes, skillsRes] =
          await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/empresas/vinculo/${perfilId}`,
              {
                method: "GET",
                credentials: "include",
              }
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

        setEmpresas(empresasData);
        setModalidades(modalidadesData);
        setPeriodos(periodosData);
        setSkills(skillsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoadingVagaEmpresa(false);
      }
    };

    fetchSelectData();
  }, [perfil]);

  useEffect(() => {
    if (!empresaId || empresas.length === 0) return;

    const empresaSelecionada = empresas.find(
      (e) => e.empresa_id.toString() === empresaId.toString()
    );

    if (empresaSelecionada) {
      setForm((prev) => ({
        ...prev,
        empresa_id: empresaId,
        logo: empresaSelecionada.logo,
      }));
    }
  }, [empresaId, empresas]);

  if ((vagaId || empresaId) && loadingVagaEmpresa) {
    return <LoadingOverlay />;
  }

  /* const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  }; */

  const handleChange_dinamicos = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (step === 1) {
      if (
        !form.empresa_id ||
        !form.nome_vaga ||
        !form.local_vaga ||
        !form.descricao ||
        !form.modalidade_trabalho_id ||
        !form.periodo_trabalho_id ||
        form.qtde_dias_aberta === "0" ||
        form.qtde_dias_aberta === "0"
      ) {
        // console.log(form);
        return;
      }

      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 2) {
      if (form.lista_skills.length <= 0) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 3) {
      if (!isFormValid(form)) return;

      setIsSubmitting(true);

      try {
        const payload = {
          empresa_id: Number(form.empresa_id),
          nome_vaga: form.nome_vaga,
          descricao: form.descricao,
          local_vaga: form.local_vaga,
          modalidade_trabalho_id: Number(form.modalidade_trabalho_id),
          periodo_trabalho_id: Number(form.periodo_trabalho_id),
          pcd: form.pcd,
          qtde_dias_aberta: Number(form.qtde_dias_aberta),
          qtde_posicao: Number(form.qtde_posicao),
          skills: form.lista_skills.filter((s) => s.skill_id > 0), // ← SkillAvaliacao[]
          novas_skills: form.lista_skills.filter((s) => s.skill_id < 0), // ← opcional
        };

        /* 
        for (let [key, value] of body.entries()) {
          console.log(key, value);
        }
        return; */

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/create-vaga`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao salvar vaga.");
        }

        const data = await response.json(); // <- Aqui pega o retorno da empresa salva
        setVagaPublicada(data); // <- Aqui salva os dados no estado

        // Limpa o localStorage se necessário
        localStorage.removeItem("vagasForm");

        setIsSubmitting(false);
        toast.success(`Vaga "${data.nome_vaga}" publicada com sucesso!`, {
          duration: 5000, // ← 5 segundos
        });
        nextStep();
      } catch (err) {
        console.error("Erro ao enviar dados:", err);
        toast.error("Erro ao enviar dados da vaga. Tente novamente.", {
          duration: 5000, // ← 5 segundos
        });
        setIsSubmitting(false);
      }
    }
  };

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
      avaliador_proprio: true,
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
    field: "peso" | "avaliador_proprio",
    value: number | boolean
  ) => {
    const atualizadas = form.lista_skills.map((s) =>
      s.skill_id === skill_id ? { ...s, [field]: value } : s
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
      (e) => e.empresa_id.toString() === selectedId
    );

    setForm((prev) => ({
      ...prev,
      empresa_id: selectedId,
      logo: empresaSelecionada?.logo ?? "",
    }));
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

        {!hasEmpresa ? (
          <SemDados tipo="empresa" />
        ) : (
          <>
            {step != 4 && (
              <div className="pt-3 pl-6 flex items-center justify-center">
                <div className="flex items-center justify-between w-full text-sm font-medium text-gray-500">
                  {[
                    "1 Dados",
                    "2 Skills",
                    /* "3 Especialista", */
                    "3 Visualizar",
                    "4 Publicar",
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
                  >
                    {/* Coluna Esquerda */}
                    <div className="flex flex-col gap-4">
                      {/* Empresa */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Empresa:
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
                          <option value="">Selecione a empresa</option>
                          {empresas.map((empresa) => (
                            <option
                              key={empresa.empresa_id}
                              value={empresa.empresa_id}
                            >
                              {empresa.nome_empresa}
                            </option>
                          ))}
                        </select>
                      </label>

                      {/* Nome da vaga */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Nome da vaga:
                        <input
                          name="nome_vaga"
                          type="text"
                          className="border rounded-md px-3 py-2 border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-300"
                          placeholder="nome da vaga"
                          defaultValue={vaga?.nome_vaga ?? form.nome_vaga}
                          onChange={handleChange_dinamicos}
                        />
                        {showErrors && !form.nome_vaga && (
                          <p className="text-sm text-red-600 mt-1">
                            Campo obrigatório.
                          </p>
                        )}
                      </label>

                      {/* Local da vaga */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Local da vaga:
                        <input
                          name="local_vaga"
                          type="text"
                          className="border rounded-md px-3 py-2 border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-300"
                          placeholder="local da vaga"
                          defaultValue={vaga?.local_vaga ?? form.local_vaga}
                          onChange={handleChange_dinamicos}
                        />
                        {showErrors && !form.local_vaga && (
                          <p className="text-sm text-red-600 mt-1">
                            Campo obrigatório.
                          </p>
                        )}
                      </label>

                      {/* Modalidade */}
                      <fieldset className="text-sm text-gray-700 mt-2">
                        <legend className="mb-1 font-medium">
                          Modalidade de trabalho:
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
                                  (form.modalidade_trabalho_id ||
                                    vaga?.modalidade_trabalho_id?.toString())
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
                          Período de trabalho:
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
                                  (form.periodo_trabalho_id ||
                                    vaga?.periodo_trabalho_id?.toString())
                                }
                                className="appearance-none w-4 h-4 rounded-full border-2 border-purple-600 checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all duration-200"
                              />
                              <span>{per.periodo}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {/* Inclusiva */}
                      <label className="flex items-center space-x-2 cursor-pointer mt-2">
                        <div className="relative w-4 h-4">
                          <input
                            type="checkbox"
                            name="pcd"
                            checked={vaga?.pcd ?? form.pcd ?? false}
                            onChange={handleChange_dinamicos}
                            className="appearance-none w-full h-full border-2 border-purple-600 rounded-sm checked:bg-purple-600 checked:border-purple-600 cursor-pointer peer"
                          />

                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs pointer-events-none opacity-0 peer-checked:opacity-100">
                            ✔
                          </span>
                        </div>
                        <span className="text-sm font-normal">
                          Inclusiva PCD
                        </span>
                      </label>
                    </div>

                    {/* Coluna Direita */}
                    <div className="flex flex-col gap-4">
                      {/* Descrição */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Descrição:
                        <textarea
                          name="descricao"
                          maxLength={5000}
                          rows={9}
                          defaultValue={vaga?.descricao ?? form.descricao}
                          className="border rounded-md px-3 py-2 resize-none border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-300"
                          placeholder="Descrição da vaga"
                          onChange={handleChange_dinamicos}
                        />
                        {showErrors && !form.descricao && (
                          <p className="text-sm text-red-600 mt-1">
                            Campo obrigatório.
                          </p>
                        )}
                      </label>

                      {/* Dias disponíveis */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Quantos dias a vaga ficará disponível?
                        <div className="flex items-center gap-2 mt-1">
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
                          <input
                            name="qtde_dias_aberta"
                            type="text"
                            className="border rounded-md w-12 px-3 py-2 border-purple-600 text-center focus:outline-none focus:ring-1 focus:ring-purple-300"
                            value={
                              vaga?.qtde_dias_aberta ??
                              form.qtde_dias_aberta ??
                              diasDisponiveis
                            }
                            onChange={handleChange_dinamicos}
                            readOnly
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setDiasDisponiveis((prev) => {
                                const novoValor = prev + 1;
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
                          (!form.qtde_dias_aberta ||
                            form.qtde_dias_aberta == "0") && (
                            <p className="text-sm text-red-600 mt-1">
                              Campo obrigatório.
                            </p>
                          )}
                      </label>

                      {/* Quantidade de vagas */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Quantidade de vagas para este cargo:
                        <div className="flex items-center gap-2 mt-1">
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
                          <input
                            name="qtde_posicao"
                            type="text"
                            className="border rounded-md w-12 px-3 py-2 border-purple-600 text-center focus:outline-none focus:ring-1 focus:ring-purple-300"
                            value={
                              vaga?.qtde_posicao ??
                              form.qtde_posicao ??
                              quantidadeVagas
                            }
                            readOnly
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setQuantidadeVagas((prev) => {
                                const novoValor = prev + 1;
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
                          (!form.qtde_posicao || form.qtde_posicao == "0") && (
                            <p className="text-sm text-red-600 mt-1">
                              Campo obrigatório.
                            </p>
                          )}
                      </label>
                    </div>

                    {/* Botão Avançar */}
                    <div className="col-span-1 mt-4 md:col-span-2 flex justify-center md:justify-end">
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
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col flex-1"
                    >
                      <div>
                        <h1 className="block text-sm mb-1 py-3 font-bold">
                          Informe as Skills que você busca para este perfil
                          profissional
                        </h1>

                        <label className="text-sm font-medium mb-1 flex items-center gap-1">
                          Skills:
                          <TooltipIcon
                            message={`Como adicionar skill que não está na lista:\n1. Digite a skill desejada;\n2. Selecione 'Criar nova skill';\n3. Clique no botão Adicionar.`}
                          />
                        </label>

                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <CreatableSelect
                              isClearable
                              placeholder="Digite ou selecione uma skill"
                              value={selectedSkill}
                              onChange={(newValue) => {
                                setSelectedSkill(newValue);
                              }}
                              options={skills.map((skill) => ({
                                value: String(skill.skill_id),
                                label: skill.skill,
                              }))}
                              formatCreateLabel={(inputValue) =>
                                `Criar nova skill: "${inputValue}"`
                              }
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700 transition whitespace-nowrap cursor-pointer"
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
                                  <div className="flex items-center gap-4 text-sm min-w-[250px]">
                                    <label className="font-medium whitespace-nowrap">
                                      Avaliador:
                                    </label>
                                    <label className="flex items-center gap-1">
                                      <input
                                        type="radio"
                                        checked={item.avaliador_proprio}
                                        onChange={() =>
                                          handleSkillChange(
                                            item.skill_id,
                                            "avaliador_proprio",
                                            true
                                          )
                                        }
                                      />
                                      Próprio
                                    </label>
                                    <label className="flex items-center gap-1">
                                      <input
                                        type="radio"
                                        checked={!item.avaliador_proprio}
                                        onChange={() =>
                                          handleSkillChange(
                                            item.skill_id,
                                            "avaliador_proprio",
                                            false
                                          )
                                        }
                                      />
                                      Externo
                                    </label>
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
                        <button
                          onClick={prevStep}
                          type="button"
                          className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                        >
                          Voltar
                        </button>
                        <button
                          type="submit"
                          className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                        >
                          Avançar
                        </button>
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
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              {/* Logo e título + empresa */}
                              <div className="flex flex-row sm:flex-1 gap-4 items-center">
                                {/* Logo */}
                                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white shrink-0">
                                  {form.logo ? (
                                    <Image
                                      src={form?.logo}
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

                                {/* Título e empresa */}
                                <div>
                                  <h2 className="text-xl font-semibold text-gray-800">
                                    {form.nome_vaga}
                                  </h2>
                                  <p className="text-sm text-gray-500">
                                    {empresas.find(
                                      (e) =>
                                        e.empresa_id.toString() ===
                                        form.empresa_id
                                    )?.nome_empresa ?? "Indefinida"}
                                  </p>
                                </div>
                              </div>

                              {/* Data de vigência */}
                              <div className="flex items-center gap-2 bg-purple-100 text-purple-800 rounded-md px-3 py-1 text-sm w-fit self-start sm:self-auto">
                                <CalendarDays className="w-4 h-4 text-purple-500" />
                                <span>
                                  Vigência até:{" "}
                                  <strong className="md:block">
                                    {dataFormatada}
                                  </strong>
                                </span>
                              </div>
                            </div>

                            {/* Linha 1 - Local e Data de Cadastro */}
                            <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2">
                              <div className="flex items-center gap-2 w-full sm:w-1/2">
                                <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                                {form.local_vaga || "Local não informado"}
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-1/2">
                                <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
                                Aberta em:{" "}
                                {dataCadastro
                                  ? new Date(dataCadastro).toLocaleDateString(
                                      "pt-BR"
                                    )
                                  : "Data não informada"}
                              </div>
                            </div>

                            {/* Linha 2 - Período e Modalidade */}
                            <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                              <div className="flex items-center gap-2 w-full sm:w-1/2">
                                <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                                {periodos.find(
                                  (p) =>
                                    p.periodo_trabalho_id.toString() ===
                                    form.periodo_trabalho_id
                                )?.periodo || "Período não informado"}
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-1/2">
                                <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                                {modalidades.find(
                                  (m) =>
                                    m.modalidade_trabalho_id.toString() ===
                                    form.modalidade_trabalho_id
                                )?.modalidade || "Modalidade não informada"}
                              </div>
                            </div>

                            {/* Linha 3 - Aberta em e PCD */}
                            <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                              <div className="w-full sm:w-1/2">
                                {form.pcd && (
                                  <span role="img" aria-label="acessível">
                                    ♿ Vaga para PCD
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Linha 4 - Descrição */}
                            <div>
                              <h3 className="text-md font-semibold text-gray-700 mb-1">
                                Descrição
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
                              Skills e pesos
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
                                      Peso: {skill.peso / 10}/10
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
                          <SkillsPanel skills={skillsData} />
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex flex-col md:flex-row justify-between gap-2 mt-6">
                        <button
                          onClick={prevStep}
                          className="w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 text-center cursor-pointer"
                        >
                          Voltar
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
                            "Publicar"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {step === 4 && vagaPublicada === null && <LoadingOverlay />}

                {step === 4 && (
                  <div className="w-full h-full flex flex-col">
                    {/* Container Principal */}
                    <div className="flex flex-col md:flex-row  w-full ">
                      {/* Coluna Esquerda */}
                      <div className="flex flex-col md:flex-row w-full">
                        {/* Dados da vaga e skills lado a lado */}
                        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-yellow-500"> */}
                        {/* Bloco - Informações da vaga */}
                        <div className="w-[65%] space-y-4 mr-2">
                          {/* Linha 1 - Logo + Título da vaga e empresa */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Logo e título + empresa */}
                            <div className="flex flex-row sm:flex-1 gap-4 items-center">
                              {/* Logo */}
                              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white shrink-0">
                                {vagaPublicada?.empresa?.logo ? (
                                  <Image
                                    src={vagaPublicada?.empresa?.logo}
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

                              {/* Título e empresa */}
                              <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                  {vagaPublicada?.nome_vaga}
                                </h2>
                                <p className="text-sm text-gray-500">
                                  {vagaPublicada?.empresa?.nome_empresa}
                                </p>
                              </div>
                            </div>

                            {/* Data de vigência */}
                            <div className="flex items-center gap-2 bg-purple-100 text-purple-800 rounded-md px-3 py-1 text-sm w-fit self-start sm:self-auto">
                              <CalendarDays className="w-4 h-4 text-purple-500" />
                              <span>
                                Vigência até:{" "}
                                <strong className="md:block">
                                  {dataFormatada}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Linha 1 - Local e Data de Cadastro */}
                          <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2">
                            <div className="flex items-center gap-2 w-full sm:w-1/2">
                              <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                              {vagaPublicada?.local_vaga ||
                                "Local não informado"}
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-1/2">
                              <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
                              Aberta em:{" "}
                              {vagaPublicada?.data_cadastro
                                ? new Date(
                                    vagaPublicada?.data_cadastro
                                  ).toLocaleDateString("pt-BR")
                                : "Data não informada"}
                            </div>
                          </div>

                          {/* Linha 2 - Período e Modalidade */}
                          <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                            <div className="flex items-center gap-2 w-full sm:w-1/2">
                              <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                              {vagaPublicada?.periodo?.periodo ||
                                "Período não informado"}
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-1/2">
                              <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                              {vagaPublicada?.modalidade?.modalidade ||
                                "Modalidade não informada"}
                            </div>
                          </div>

                          {/* Linha 3 - Aberta em e PCD */}
                          <div className="flex flex-col sm:flex-row text-sm text-gray-600 gap-1 sm:gap-2 mt-2">
                            <div className="w-full sm:w-1/2">
                              {vagaPublicada?.pcd && (
                                <span role="img" aria-label="acessível">
                                  ♿ Vaga para PCD
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Linha 4 - Descrição */}
                          <div>
                            <h3 className="text-md font-semibold text-gray-700 mb-1">
                              Descrição
                            </h3>
                            <p className="text-sm text-gray-600 whitespace-pre-line">
                              {vagaPublicada?.descricao}
                            </p>
                          </div>

                          {/* Linha 5 - Vigência */}
                        </div>

                        {/* Bloco - Lista de Skills */}
                        <div className="w-full sm:w-[30%] flex flex-col mt-2">
                          <h3 className="text-md font-semibold text-gray-700 mb-2">
                            Skills e pesos
                          </h3>

                          <ul className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                            {vagaPublicada?.skills?.map((skill, index) => (
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
                                    Peso: {skill.peso / 10}/10
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
                        <SkillsPanel skills={vagaPublicada?.skills} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}

const isFormValid = (form: VagasForm) => {
  return (
    form.empresa_id.trim() !== "" &&
    form.nome_vaga.trim() !== "" &&
    form.local_vaga.trim() !== "" &&
    form.descricao.trim() !== "" &&
    form.modalidade_trabalho_id.trim() !== "" &&
    form.periodo_trabalho_id !== null &&
    form.qtde_dias_aberta.trim() !== "0" &&
    form.qtde_posicao.trim() !== "0"
  );
};
