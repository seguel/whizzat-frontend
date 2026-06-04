"use client";

import { useEffect, useState } from "react";
import LoadingOverlay from "@/app/components/LoadingOverlay";

type RespostaItem = {
  pergunta: string;
  resposta: string;
};

type QuestionarioRespostaDTO = {
  titulo: string;
  skill: string;
  respostas: RespostaItem[];
};

type Props = {
  avaliacaoId: string;
  avaliadorId: number;
};

export default function CardQuestionarioRespostas({
  avaliacaoId,
  avaliadorId,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<QuestionarioRespostaDTO | null>(null);

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
    } catch (error) {
      console.error("Erro ao buscar respostas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRespostas();
  }, [avaliacaoId]);

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
        <h2 className="text-xl font-semibold">Respostas do Questionário</h2>

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
          index !== dados.respostas.length - 1 ? "border-b border-gray-200" : ""
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
    </div>
  );
}
