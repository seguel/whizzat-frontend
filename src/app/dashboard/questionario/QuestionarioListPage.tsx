"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
// import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import toast from "react-hot-toast";
import ModalConfirm from "./components/ModalConfirm";

interface Props {
  perfil: ProfileType;
}

interface Questionario {
  id: number;
  titulo: string;
  comentario: string;
  ativo: boolean;
  data_criacao: string;
  total_perguntas?: number;
}

export default function QuestionarioListPage({ perfil }: Props) {
  const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  const [modalExcluir, setModalExcluir] = useState(false);
  const [questionarioSelecionado, setQuestionarioSelecionado] =
    useState<Questionario | null>(null);

  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);

  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "ativo" | "inativo">(
    "todos",
  );

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  useEffect(() => {
    const fetchQuestionarios = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/questionario/`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar questionários");
        }

        const data = await response.json();
        // console.log(data);

        setQuestionarios(data);
      } catch (error) {
        console.error("Erro ao buscar questionários", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionarios();
  }, []);

  const excluir = async () => {
    if (!questionarioSelecionado) return;

    setExcluindo(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questionario/${questionarioSelecionado.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      toast.success(t("questionario.sucesso"));

      // remove da lista sem recarregar
      setQuestionarios((prev) =>
        prev.filter((q) => q.id !== questionarioSelecionado.id),
      );

      setModalExcluir(false);
      setQuestionarioSelecionado(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t("questionario.erro"));
    } finally {
      setExcluindo(false);
    }
  };

  const abrirModalExcluir = (q: Questionario) => {
    setQuestionarioSelecionado(q);
    setModalExcluir(true);
  };

  const questionariosFiltrados = questionarios
    .filter((q) =>
      `${q.titulo} ${q.comentario}`.toLowerCase().includes(busca.toLowerCase()),
    )
    .filter((q) => {
      if (filtroAtivo === "ativo") return q.ativo;
      if (filtroAtivo === "inativo") return !q.ativo;
      return true;
    });

  const totalPaginas = Math.ceil(
    questionariosFiltrados.length / itensPorPagina,
  );

  const questionariosPagina = questionariosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina,
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 overflow-y-auto bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        <main className="p-6 w-[98%] mx-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-xl font-semibold text-gray-800">
              {t("questionario.titulo_pagina_questionario")}
            </h1>

            <Link
              href={`/dashboard/questionario/criar?perfil=${perfil}`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              {t("questionario.btn_add_questionario")}
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <span className="text-sm text-gray-600">
              {t("questionario.filtro")}:
            </span>
            <input
              type="text"
              placeholder="Buscar questionário..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              className="border rounded-lg px-3 py-2 text-sm w-full sm:w-72"
            />
            <select
              value={filtroAtivo}
              onChange={(e) => {
                setFiltroAtivo(e.target.value as any);
                setPaginaAtual(1);
              }}
              className="border rounded-lg px-3 py-2 text-sm w-full sm:w-40"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            {questionariosFiltrados.length} {t("questionario.resultado_busca")}
          </div>

          {/* LISTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {questionariosPagina.map((q) => (
              <div
                key={q.id}
                className="bg-white border rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition  cursor-default"
              >
                {/* Título */}
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {q.titulo}
                    </h3>

                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full
        ${
          q.ativo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
        }`}
                    >
                      {q.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                    {q.comentario}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <span>{q.total_perguntas ?? 0} perguntas</span>

                    <span>
                      {t("questionario.criado_em")}{" "}
                      {new Date(q.data_criacao).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* AÇÕES */}
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Link
                    href={`/dashboard/questionario/${q.id}?perfil=${perfil}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Eye size={14} />
                    {t("questionario.btn_ver")}
                  </Link>

                  <Link
                    href={`/dashboard/questionario/editar/${q.id}?perfil=${perfil}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Pencil size={14} />
                    {t("questionario.btn_editar")}
                  </Link>

                  <button
                    onClick={() => abrirModalExcluir(q)}
                    disabled={excluindo}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    {excluindo
                      ? t("questionario.btn_excluindo")
                      : t("questionario.btn_excluir")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* vazio */}
          {(questionarios.length === 0 ||
            questionariosFiltrados.length === 0) && (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
              <p>{t("questionario.sem_questionario")}</p>

              <Link
                href={`/dashboard/questionario/criar?perfil=${perfil}`}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                {t("questionario.btn_add_questionario")}
              </Link>
            </div>
          )}

          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual((p) => p - 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40"
              >
                {t("questionario.anterior")}
              </button>

              <span className="text-sm text-gray-500">
                {t("questionario.pagina_count")} {paginaAtual}{" "}
                {t("questionario.de_count")} {totalPaginas}
              </span>

              <button
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual((p) => p + 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40"
              >
                {t("questionario.proximo")}
              </button>
            </div>
          )}
        </main>
      </div>

      {modalExcluir && questionarioSelecionado && (
        <ModalConfirm
          titulo={t("questionario.modal_titulo")}
          mensagem={`${t("questionario.modal_pergunta")} "${questionarioSelecionado.titulo}"?`}
          onCancel={() => setModalExcluir(false)}
          onConfirm={excluir}
          loading={excluindo}
        />
      )}
    </div>
  );
}
