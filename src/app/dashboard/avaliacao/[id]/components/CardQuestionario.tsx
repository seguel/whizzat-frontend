import { useEffect, useState } from "react";
import { useQuestionarios } from "../../../../lib/hooks/useQuestionarios";

type Props = {
  naoEnviar: boolean;
  setNaoEnviar: (value: boolean) => void;
  avaliacaoId: string;
  avaliadorId: number;

  // 👇 futuros dados vindos do back
  questionarioEnviadoId?: number | null;
  questionarioEnviadoTitulo?: string | null;
  dataEnvioFormulario?: string | null;
};

type Questionario = {
  id: number;
  titulo: string;
};

export default function CardQuestionario({
  naoEnviar,
  setNaoEnviar,
  avaliacaoId,
  avaliadorId,
  questionarioEnviadoId,
  questionarioEnviadoTitulo,
  dataEnvioFormulario,
}: Props) {
  const [selecionado, setSelecionado] = useState<number | "">("");
  const [loadingEnviar, setLoadingEnviar] = useState(false);

  // 👇 controla estado enviado
  const [questionarioEnviado, setQuestionarioEnviado] = useState<{
    id: number;
    titulo: string;
    dataEnvio: string;
  } | null>(null);

  const { questionarios, loading } = useQuestionarios(avaliadorId);

  // 👇 quando abrir tela e já existir questionário enviado
  useEffect(() => {
    if (
      questionarioEnviadoId &&
      questionarioEnviadoTitulo &&
      dataEnvioFormulario
    ) {
      setQuestionarioEnviado({
        id: questionarioEnviadoId,
        titulo: questionarioEnviadoTitulo,
        dataEnvio: dataEnvioFormulario,
      });

      setSelecionado(questionarioEnviadoId);
    }
  }, [questionarioEnviadoId, questionarioEnviadoTitulo, dataEnvioFormulario]);

  const bloqueado = !!questionarioEnviado;

  const handleEnviar = async () => {
    if (!selecionado) return;

    try {
      setLoadingEnviar(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avaliador/avaliacoes/enviar-questionario`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avaliacao_id: avaliacaoId,
            questionario_id: selecionado,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Erro ao enviar questionário");
      }

      const data = await res.json();

      console.log("Enviado:", data);

      // 👇 pega título selecionado
      const questionarioSelecionado = questionarios.find(
        (q: Questionario) => q.id === selecionado,
      );

      // 👇 salva estado local
      setQuestionarioEnviado({
        id: Number(selecionado),
        titulo: questionarioSelecionado?.titulo ?? "Questionário",
        dataEnvio: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEnviar(false);
    }
  };

  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm flex flex-col gap-4 h-[525px]">
      <h2 className="font-semibold mb-2">Selecionar Questionário</h2>

      <select
        disabled={naoEnviar || loadingEnviar || loading || bloqueado}
        value={selecionado}
        onChange={(e) =>
          setSelecionado(e.target.value ? Number(e.target.value) : "")
        }
        className="border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
      >
        <option value="">
          {loading
            ? "Carregando questionários..."
            : "Selecione um questionário"}
        </option>

        {questionarios.map((q: Questionario) => (
          <option key={q.id} value={q.id}>
            {q.titulo}
          </option>
        ))}
      </select>

      <label
        className={`flex items-center gap-2 text-sm ${
          bloqueado ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          checked={naoEnviar}
          disabled={bloqueado}
          onChange={(e) => setNaoEnviar(e.target.checked)}
        />
        Não enviar questionário
      </label>

      <button
        onClick={handleEnviar}
        disabled={
          naoEnviar || !selecionado || loading || loadingEnviar || bloqueado
        }
        className={`rounded-lg py-2 text-sm font-semibold transition border border-transparent
        ${
          naoEnviar || !selecionado || loading || loadingEnviar || bloqueado
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "text-indigo-900 bg-blue-100 hover:bg-blue-200 hover:border-blue-300 cursor-pointer"
        }`}
      >
        {loadingEnviar ? "Enviando..." : "Enviar Questionário"}
      </button>

      {/* 👇 status enviado */}
      {questionarioEnviado && (
        <div className="mt-10 rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
          <p className="font-medium text-green-800">
            Questionário enviado com sucesso
          </p>

          <div className="mt-2 flex flex-col gap-1 text-green-700">
            <span>
              <strong>Questionário:</strong> {questionarioEnviado.titulo}
            </span>

            <span>
              <strong>Data envio:</strong>{" "}
              <span className="font-semibold text-green-700 whitespace-nowrap">
                {new Date(questionarioEnviado.dataEnvio).toLocaleDateString(
                  "pt-BR",
                )}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
