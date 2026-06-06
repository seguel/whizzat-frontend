"use client";

import { useEffect, useState } from "react";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

type RespostaItem = {
  pergunta: string;
  resposta: string;
};

type QuestionarioRespostaDTO = {
  titulo: string;
  skill: string;
  respostas: RespostaItem[];
  comentario_resposta: string | null;
};

type Props = {
  avaliacaoId: string;
  avaliadorId: number;
  status: string;
  finalizarSemEntrevista: boolean;
  setFinalizarSemEntrevista: (value: boolean) => void;
};

export default function CardQuestionarioRespostas({
  avaliacaoId,
  avaliadorId,
  status,
  finalizarSemEntrevista,
  setFinalizarSemEntrevista,
}: Props) {
  const { t } = useTranslation("common");
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<QuestionarioRespostaDTO | null>(null);
  const [comentarioResposta, setComentarioResposta] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [comentarioOriginal, setComentarioOriginal] = useState("");

  const fetchRespostas = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avaliador/avaliacao/${avaliacaoId}/questionario/respostas/${avaliadorId}`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Erro ao carregar respostas");
      }

      const data = await res.json();

      setDados(data);
      setComentarioResposta(data.comentario_resposta ?? "");
      setComentarioOriginal(data.comentario_resposta ?? "");
      setFinalizarSemEntrevista(data.finalizarSemEntrevista);
    } catch (error) {
      console.error("Erro ao buscar respostas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRespostas();
  }, [avaliacaoId]);

  const handleSalvarComentario = async () => {
    try {
      if (!comentarioResposta.trim()) {
        toast.error(t("minha_avaliacao.informe_comentario"));
        return;
      }

      setLoading(true);
      setSalvando(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avaliador/avaliacoes/${avaliacaoId}/comentario`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comentario: comentarioResposta,
          }),
        },
      );

      if (!res.ok) {
        toast.error("Problemas ao salvar. Tente mais tarde.", {
          duration: 3000,
        });
        return;
      }

      toast.success(t("minha_avaliacao.msg_salvar_comentario"), {
        duration: 3000,
      });
      setComentarioOriginal(comentarioResposta);
    } catch (error) {
      console.error(error);

      toast.error(t("minha_avaliacao.erro_problema"), {
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <LoadingOverlay />
      </div>
    );
  }

  if (!dados) return null;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 mt-5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {t("minha_avaliacao.respostas_questionario")}
        </h2>

        <p className="text-sm text-gray-500 mt-1">{dados.skill}</p>
      </div>

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-x-8
        "
      >
        {dados.respostas.map((item, index) => (
          <div
            key={index}
            className={`
                    py-5
                    ${
                      index !== dados.respostas.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }
                  `}
          >
            <p className="font-semibold text-blue-900">
              {index + 1}. {item.pergunta}
            </p>

            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
              <span className="font-semibold text-gray-900">R:</span>{" "}
              {item.resposta}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {t("minha_avaliacao.comentario")}
        </label>

        <textarea
          rows={4}
          disabled={status === "FINALIZADO"}
          value={comentarioResposta}
          onChange={(e) => setComentarioResposta(e.target.value)}
          placeholder={t("minha_avaliacao.comentario_resposta")}
          className="w-full rounded-lg border bg-white border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        />
      </div>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {status != "FINALIZADO" && (
          <button
            type="button"
            onClick={handleSalvarComentario}
            disabled={salvando || comentarioResposta === comentarioOriginal}
            className="
        px-5 py-2
        bg-blue-600
        text-white
        rounded-lg
        disabled:opacity-50
        disabled:cursor-not-allowed
        cursor-pointer
      "
          >
            {salvando
              ? t("minha_avaliacao.salvando")
              : t("minha_avaliacao.salvar_comentario")}
          </button>
        )}

        <label
          className="
      flex items-center gap-2
      text-sm
      cursor-pointer
      rounded-lg
      border border-gray-200
      bg-gray-50
      px-3 py-2
    "
        >
          <input
            type="checkbox"
            disabled={status != "QUESTIONARIO_ENVIADO"}
            checked={finalizarSemEntrevista}
            onChange={(e) => setFinalizarSemEntrevista(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />

          <span className="font-medium text-gray-700">
            {t("questionario.resposta.finalizar_sem_entrevista")}
          </span>
        </label>
      </div>
    </div>
  );
}
