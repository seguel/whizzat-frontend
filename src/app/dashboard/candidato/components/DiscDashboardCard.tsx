"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrainCircuit, CheckCircle2, Clock3, Loader2 } from "lucide-react";

import DiscQuestionarioModal from "../../../components/perfil/DiscQuestionarioModal";
import DiscResultadoModal from "../../../components/perfil/DiscResultadoModal";

type DiscStatus = "NAO_INICIADO" | "EM_ANDAMENTO" | "CONCLUIDO";

export default function DiscDashboardCard() {
  const { t } = useTranslation("common");

  const [status, setStatus] = useState<DiscStatus>("NAO_INICIADO");
  const [loading, setLoading] = useState(true);

  const [questionarioAberto, setQuestionarioAberto] = useState(false);
  const [resultadoAberto, setResultadoAberto] = useState(false);
  const [erro, setErro] = useState(false);

  const carregarStatus = useCallback(async () => {
    setLoading(true);

    try {
      const resultadoResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/disc/meu-resultado`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!resultadoResponse.ok) {
        throw new Error("Erro ao consultar resultado DISC");
      }

      const resultado = await resultadoResponse.json();

      if (resultado?.possui_resultado) {
        setStatus("CONCLUIDO");
        return;
      }

      const aplicacaoResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/disc/minha-aplicacao`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!aplicacaoResponse.ok) {
        throw new Error("Erro ao consultar aplicação DISC");
      }

      const texto = await aplicacaoResponse.text();

      const aplicacao = texto.trim() ? JSON.parse(texto) : null;

      setStatus(
        aplicacao?.status === "EM_ANDAMENTO" ? "EM_ANDAMENTO" : "NAO_INICIADO",
      );
    } catch (error) {
      console.error("Erro ao carregar DISC:", error);
      setErro(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregarStatus();
  }, [carregarStatus]);

  const handleAbrir = () => {
    if (loading) return;

    if (erro) {
      void carregarStatus();
      return;
    }

    if (status === "CONCLUIDO") {
      setResultadoAberto(true);
    } else {
      setQuestionarioAberto(true);
    }
  };

  const handleFecharQuestionario = () => {
    setQuestionarioAberto(false);
    void carregarStatus();
  };

  const handleConcluirQuestionario = () => {
    setQuestionarioAberto(false);
    setStatus("CONCLUIDO");
    setResultadoAberto(true);
  };

  const titulo = erro
    ? t("disc.dash_erro")
    : status === "CONCLUIDO"
      ? t("disc.dash_concluido")
      : status === "EM_ANDAMENTO"
        ? t("disc.dash_andamento")
        : t("disc.dash_nao_iniciado");

  const descricao = erro
    ? t("disc.dash_tentar_novamente")
    : status === "CONCLUIDO"
      ? t("disc.dash_visualizar")
      : status === "EM_ANDAMENTO"
        ? t("disc.dash_continuar")
        : t("disc.dash_responder");

  return (
    <>
      <button
        type="button"
        onClick={handleAbrir}
        disabled={loading}
        className="
          group w-full h-full text-left
          bg-white border border-gray-100
          rounded-2xl p-4 sm:p-5 shadow-sm
          transition-all duration-200
          hover:border-blue-200 hover:shadow-md
          disabled:cursor-wait cursor-pointer
        "
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-500">
              {t("disc.dash_titulo")}
            </p>

            <div className="mt-2 flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : status === "CONCLUIDO" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : status === "EM_ANDAMENTO" ? (
                <Clock3 className="h-5 w-5 text-amber-500" />
              ) : (
                <BrainCircuit className="h-5 w-5 text-blue-600" />
              )}

              <p className="text-xs sm:text-base font-bold text-gray-900">
                {loading ? t("disc.dash_carregando") : titulo}
              </p>
            </div>

            <p className="mt-2 text-xs text-gray-400 whitespace-nowrap">
              {loading ? "" : descricao}
            </p>
          </div>

          <div
            className="
              w-10 h-10 sm:w-11 sm:h-11 shrink-0
              flex items-center justify-center
              rounded-xl bg-blue-50
              text-blue-600
              transition group-hover:bg-blue-100
            "
          >
            <BrainCircuit className="h-6 w-6" />
          </div>
        </div>
      </button>

      <DiscQuestionarioModal
        aberto={questionarioAberto}
        onFechar={handleFecharQuestionario}
        onConcluido={handleConcluirQuestionario}
      />

      <DiscResultadoModal
        aberto={resultadoAberto}
        onFechar={() => {
          setResultadoAberto(false);
          void carregarStatus();
        }}
      />
    </>
  );
}
