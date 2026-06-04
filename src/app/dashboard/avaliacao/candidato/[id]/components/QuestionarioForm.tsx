"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface PerguntaDTO {
  id: number;
  ordem: number;
  pergunta: string;
  tipo: string;
  resposta?: string;
}

interface QuestionarioDTO {
  avaliacaoId: number;
  skill: string;
  questionarioId: number;
  titulo: string;
  comentario?: string;
  perguntas: PerguntaDTO[];
}

interface Props {
  avaliacaoId: number;
}

export default function QuestionarioForm({ avaliacaoId }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [questionario, setQuestionario] = useState<QuestionarioDTO | null>(
    null,
  );

  const [respostas, setRespostas] = useState<Record<number, string>>({});

  async function carregarQuestionario() {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidato/avaliacao/${avaliacaoId}/questionario`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.message);
      }

      const data = await res.json();

      setQuestionario(data);
      // console.log(data);

      const respostasIniciais: Record<number, string> = {};

      data.perguntas.forEach((pergunta: PerguntaDTO) => {
        respostasIniciais[pergunta.id] = pergunta.resposta || "";
      });

      setRespostas(respostasIniciais);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarQuestionario();
  }, []);

  function atualizarResposta(perguntaId: number, valor: string) {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: valor,
    }));
  }

  async function salvar() {
    try {
      setSaving(true);

      const payload = {
        respostas: Object.entries(respostas).map(([perguntaId, resposta]) => ({
          perguntaId: Number(perguntaId),
          resposta,
        })),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidato/avaliacao/${avaliacaoId}/questionario/responder`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const erro = await res.json().catch(() => null);

        throw new Error(erro?.message || "Erro ao salvar questionário");
      }

      toast.success("Questionário enviado com sucesso", {
        duration: 3000,
      });

      router.push(`/dashboard/avaliacao/candidato?perfil=candidato`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar respostas",
        {
          duration: 3000,
        },
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelar() {
    router.push("/dashboard/avaliacao/candidato");
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        Carregando questionário...
      </div>
    );
  }

  if (!questionario) {
    return (
      <div className="w-full flex justify-center py-10">
        Questionário não encontrado.
      </div>
    );
  }

  const possuiResposta = Object.values(respostas).some(
    (resposta) => resposta.trim().length > 0,
  );

  const respondidas = Object.values(respostas).filter(
    (resposta) => resposta.trim().length > 0,
  ).length;

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900">
          Questionário de Avaliação
        </h1>

        <p className="mt-2 text-gray-600">
          Skill avaliada:{" "}
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            {questionario.skill}
          </span>
        </p>
      </div>
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mt-4">{questionario.titulo}</h1>

          {questionario.comentario && (
            <p className="mt-2 text-gray-600">{questionario.comentario}</p>
          )}
        </div>

        <div className="space-y-6">
          {questionario.perguntas.map((pergunta, index) => (
            <div key={pergunta.id} className="border rounded-lg p-4">
              <label className="block font-medium mb-3">
                {index + 1}. {pergunta.pergunta}
              </label>

              <textarea
                rows={5}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={respostas[pergunta.id] || ""}
                onChange={(e) => atualizarResposta(pergunta.id, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Respondidas: {respondidas} de {questionario.perguntas.length}
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={cancelar}
            className="px-5 py-2 border rounded-lg cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            disabled={saving || !possuiResposta}
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
            {saving ? "Salvando..." : "Enviar Respostas"}
          </button>
        </div>
      </div>
    </div>
  );
}
