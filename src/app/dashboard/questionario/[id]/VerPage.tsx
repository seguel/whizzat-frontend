"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/perfil/Sidebar";
import TopBar from "../../../components/perfil/TopBar";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { ProfileType } from "../../../components/perfil/ProfileContext";
import { Pencil, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageContainer from "@/app/components/PageContainer";
import { useAvaliador } from "../../../lib/hooks/useAvaliador";
import SemDados from "../../SemDados";

interface Props {
  perfil: ProfileType;
  id: string;
}

interface Pergunta {
  id: number;
  pergunta: string;
  resposta_base?: string;
  ativo: boolean;
}

interface Questionario {
  id: number;
  titulo: string;
  comentario?: string;
  ativo: boolean;
  data_criacao: string;
  pergunta: Pergunta[];
}

export default function VerPage({ perfil, id }: Props) {
  const { hasPerfilAvaliador, loading } = useAvaliador(perfil);
  const router = useRouter();
  const { t } = useTranslation("common");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isloading, setLoading] = useState(true);

  const [questionario, setQuestionario] = useState<Questionario | null>(null);

  useEffect(() => {
    const fetchQuestionario = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/questionario/${id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();

        setQuestionario(data);
      } catch (error) {
        console.error("Erro ao carregar questionário", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionario();
  }, [id]);

  if (isloading || loading) return <LoadingOverlay />;

  if (!questionario) {
    return (
      <div className="p-10 text-center">{t("questionario.nao_encontrado")}</div>
    );
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

        {!hasPerfilAvaliador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <PageContainer>
              {/* HEADER */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {questionario.titulo}
                  </h1>

                  {/* metadata */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span
                      className={`px-2 py-1 rounded-full font-semibold
                    ${
                      questionario.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    >
                      {questionario.ativo ? "Ativo" : "Inativo"}
                    </span>

                    <span>•</span>

                    <span>
                      {questionario.pergunta?.length ?? 0}{" "}
                      {questionario.pergunta?.length === 1
                        ? "pergunta"
                        : "perguntas"}
                    </span>

                    <span>•</span>

                    <span>
                      Criado em{" "}
                      {new Date(questionario.data_criacao).toLocaleDateString(
                        "pt-BR",
                      )}
                    </span>
                  </div>

                  {questionario.comentario && (
                    <p className="text-sm text-gray-500 mt-2">
                      {questionario.comentario}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* editar */}
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/questionario/editar/${id}?perfil=${perfil}`,
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
                  text-indigo-900 bg-blue-100 
                      border border-transparent 
                      hover:bg-blue-200 hover:border-blue-300 rounded-lg
                  transition-all duration-200 cursor-pointer"
                  >
                    <Pencil size={16} />
                    {t("questionario.btn_editar")}
                  </button>

                  {/* voltar */}
                  <button
                    onClick={() =>
                      router.push(`/dashboard/questionario?perfil=${perfil}`)
                    }
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
                      text-indigo-900 bg-blue-100 
                      border border-transparent 
                      hover:bg-blue-200 hover:border-blue-300 rounded-lg
                      transition cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    {t("questionario.btn_voltar")}
                  </button>
                </div>
              </div>

              {/* PERGUNTAS */}
              <div className="grid grid-cols-[40px_80px_1fr_1fr] gap-4 text-xs font-semibold text-gray-500 border-b pb-2">
                <div>#</div>
                <div>{t("questionario.ativo")}</div>
                <div>{t("questionario.pergunta")}</div>
                <div>{t("questionario.resposta_base")}</div>
              </div>
              <div className="flex flex-col divide-y">
                {questionario.pergunta.map((p, index) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[40px_80px_1fr_1fr] gap-4 py-3 text-sm"
                  >
                    {/* ordem */}
                    <div className="text-gray-400 font-semibold">
                      {index + 1}
                    </div>

                    {/* ativo */}
                    <div className="text-gray-800">
                      {p.ativo
                        ? t("questionario.ativo_sim")
                        : t("questionario.ativo_nao")}
                    </div>

                    {/* pergunta */}
                    <div className="text-gray-800">{p.pergunta}</div>

                    {/* resposta base */}
                    <div className="text-gray-500">
                      {p.resposta_base || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </PageContainer>
          </div>
        )}
      </div>
    </div>
  );
}
