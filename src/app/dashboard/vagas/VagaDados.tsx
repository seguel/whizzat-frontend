"use client";

import { useState, useEffect } from "react";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import SemEmpresa from "../SemEmpresa";
import { ImSpinner2 } from "react-icons/im";
import LoadingOverlay from "../../components/LoadingOverlay";

interface Props {
  perfil: ProfileType;
  hasEmpresa: boolean | null;
  empresaId: string | null;
  vagaId: string | null;
}
interface SkillAvaliacao {
  skill_id: number;
  score: number;
  avaliador_id?: number;
}

interface VagasForm {
  empresa_id: string;
  nome_vaga: string;
  descricao: string;
  local_vaga: string;
  modalidade_trabalho: string;
  periodo_trabalho: string;
  pcd: boolean;
  qtde_dias_aberta: string;
  qtde_posicao: string;
  lista_skills: SkillAvaliacao[];
}

interface VagaData {
  vaga_id: number;
  empresa_id: number;
  nome_vaga: string;
  descricao: string;
  local_vaga: string;
  modalidade_trabalho: number;
  periodo_trabalho: number;
  pcd: boolean;
  qtde_dias_aberta: number;
  qtde_posicao: number;
  lista_skills: SkillAvaliacao[];
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
    modalidade_trabalho: "",
    periodo_trabalho: "",
    pcd: false,
    qtde_dias_aberta: "",
    qtde_posicao: "",
    lista_skills: [],
  });
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vagaPublicada, setVagaPublicada] = useState<VagaData | null>(null);

  const [vaga, setVaga] = useState<VagaData | null>(null);
  const [loadingVaga, setLoadingVaga] = useState<boolean>(false);
  const [diasDisponiveis, setDiasDisponiveis] = useState(0);
  const [quantidadeVagas, setQuantidadeVagas] = useState(0);

  useEffect(() => {
    if (!vagaId) return;

    const fetchVaga = async () => {
      setLoadingVaga(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vagas/${vagaId}`,
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
        setLoadingVaga(false);
      }
    };

    fetchVaga();
  }, [vagaId]);

  if (vagaId && loadingVaga) {
    return <LoadingOverlay />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
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
        !form.modalidade_trabalho ||
        !form.periodo_trabalho ||
        form.qtde_dias_aberta === "0" ||
        form.qtde_dias_aberta === "0"
      )
        return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 2) {
      if (!form.lista_skills) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 3) {
      //if (!form.apresentacao || !capaFile) return;
      setShowErrors(false);
      nextStep();
      return;
    }

    if (step === 4) {
      if (!isFormValid(form)) return;

      setIsSubmitting(true);

      try {
        const body = new FormData();
        body.append("empresa_id", form.empresa_id);
        body.append("nome_vaga", form.nome_vaga);
        body.append("local_vaga", form.local_vaga);
        body.append("descricao", form.descricao);
        body.append("modalidade_trabalho", form.modalidade_trabalho);
        body.append("periodo_trabalho", form.periodo_trabalho);
        body.append("pcd", form.pcd ? "1" : "0");
        body.append("qtde_dias_aberta", form.qtde_dias_aberta);
        body.append("qtde_posicao", form.qtde_posicao);

        const perfilId =
          perfil === "recrutador" ? "2" : perfil === "avaliador" ? "3" : "1";
        body.append("perfilId", perfilId);

        /* 
        for (let [key, value] of body.entries()) {
          console.log(key, value);
        } */

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vagas/create-vaga`,
          {
            method: "POST",
            body,
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao salvar vaga.");
        }

        const data = await response.json(); // <- Aqui pega o retorno da empresa salva
        setVagaPublicada(data); // <- Aqui salva os dados no estado

        // Limpa o localStorage se necessário
        localStorage.removeItem("vagaForm");

        setIsSubmitting(false);
        nextStep();
      } catch (err) {
        console.error("Erro ao enviar dados:", err);
        alert("Erro ao enviar dados da vaga. Tente novamente.");
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

        {!hasEmpresa ? (
          <SemEmpresa />
        ) : (
          <>
            {step != 5 && (
              <div className="pt-3 pl-6 flex items-center justify-center">
                <div className="flex items-center justify-between w-full text-sm font-medium text-gray-500">
                  {[
                    "1 Dados",
                    "2 Skills",
                    "3 Especialista",
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
                  >
                    {/* Coluna Esquerda */}
                    <div className="flex flex-col gap-4">
                      {/* Empresa */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Empresa:
                        <select className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option value="">Empresa</option>
                          {/* opções dinâmicas */}
                        </select>
                      </label>

                      {/* Nome da vaga */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Nome da vaga:
                        <input
                          type="text"
                          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="vaga"
                          defaultValue={vaga?.nome_vaga ?? form.nome_vaga}
                          onChange={handleChange}
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
                          type="text"
                          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="local"
                          defaultValue={vaga?.local_vaga ?? form.local_vaga}
                          onChange={handleChange}
                        />
                        {showErrors && !form.local_vaga && (
                          <p className="text-sm text-red-600 mt-1">
                            Campo obrigatório.
                          </p>
                        )}
                      </label>

                      {/* Modalidade de trabalho */}
                      <fieldset className="text-sm text-gray-700">
                        <legend>Modalidade de trabalho:</legend>
                        <div className="flex gap-4 mt-1">
                          <label>
                            <input
                              type="radio"
                              name="modalidade"
                              value="presencial"
                            />{" "}
                            Presencial
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="modalidade"
                              value="remoto"
                            />{" "}
                            Remoto
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="modalidade"
                              value="hibrido"
                            />{" "}
                            Híbrido
                          </label>
                        </div>
                      </fieldset>

                      {/* Período de trabalho */}
                      <fieldset className="text-sm text-gray-700">
                        <legend>Período de trabalho:</legend>
                        <div className="flex flex-wrap gap-4 mt-1">
                          <label>
                            <input
                              type="radio"
                              name="periodo"
                              value="integral"
                            />{" "}
                            Período integral
                          </label>
                          <label>
                            <input type="radio" name="periodo" value="meio" />{" "}
                            Meio período
                          </label>
                          <label>
                            <input type="radio" name="periodo" value="hora" />{" "}
                            Por hora
                          </label>
                        </div>
                      </fieldset>

                      {/* Inclusiva PCD */}
                      <label className="text-sm text-gray-700">
                        <input type="checkbox" className="mr-2" />
                        Inclusiva PCD
                      </label>
                    </div>

                    {/* Coluna Direita */}
                    <div className="flex flex-col gap-4">
                      {/* Descrição */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Descrição:
                        <textarea
                          maxLength={500}
                          rows={6}
                          defaultValue={vaga?.descricao ?? form.descricao}
                          className="border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Descrição da vaga"
                        />
                        {/* <span className="text-xs text-right mt-1 text-gray-400">
                          {descricao.length} / 500
                        </span> */}
                      </label>

                      {/* Dias disponíveis */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Quantos dias a vaga ficará disponível?
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setDiasDisponiveis((prev) =>
                                Math.max(prev - 1, 1)
                              )
                            }
                            className="px-3 py-1 rounded-full bg-purple-100 text-purple-600"
                          >
                            -
                          </button>
                          <span className="w-12 text-center">
                            {diasDisponiveis}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setDiasDisponiveis((prev) => prev + 1)
                            }
                            className="px-3 py-1 rounded-full bg-purple-100 text-purple-600"
                          >
                            +
                          </button>
                        </div>
                      </label>

                      {/* Quantidade de vagas */}
                      <label className="flex flex-col text-sm text-gray-700">
                        Quantidade de vagas para este cargo:
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantidadeVagas((prev) =>
                                Math.max(prev - 1, 0)
                              )
                            }
                            className="px-3 py-1 rounded-full bg-purple-100 text-purple-600"
                          >
                            -
                          </button>
                          <span className="w-12 text-center">
                            {quantidadeVagas}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setQuantidadeVagas((prev) => prev + 1)
                            }
                            className="px-3 py-1 rounded-full bg-purple-100 text-purple-600"
                          >
                            +
                          </button>
                        </div>
                      </label>
                    </div>

                    {/* Botão Avançar */}
                    <div className="col-span-1 md:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="w-full md:w-32 py-2 rounded-full text-white bg-purple-600 hover:bg-purple-700"
                      >
                        Avançar
                      </button>
                    </div>
                  </form>
                )}

                {/* //resto do codigo */}
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
    form.modalidade_trabalho.trim() !== "" &&
    form.periodo_trabalho !== null &&
    form.qtde_dias_aberta.trim() !== "0" &&
    form.qtde_posicao.trim() !== "0"
  );
};
