"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Props = {
  habilitado: boolean;
  avaliacaoId: string;
  avaliadorId: number;
  status: string;
  peso_av: number;
  comentario_av?: string;
};

export default function CardFinalizarAvaliacao({
  habilitado,
  avaliacaoId,
  avaliadorId,
  status,
  peso_av,
  comentario_av,
}: Props) {
  const router = useRouter();
  const [peso, setPeso] = useState(peso_av);
  const [comentario, setComentario] = useState(comentario_av);

  const [loading, setLoading] = useState(false);

  if (status == "FINALIZADO") habilitado = true;

  const handleFinalizar = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avaliador/avaliacoes/finalizar`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            avaliacao_id: Number(avaliacaoId),
            avaliadorId: Number(avaliadorId),
            peso: peso,
            comentario: comentario,
          }),
        },
      );

      if (!res.ok) {
        toast.error("Problemas ao finalizar. Tente mais tarde.", {
          duration: 5000,
        });
        return;
      }

      toast.success("Avaliação Finalizada!", {
        duration: 5000,
      });
      router.push(`/dashboard/avaliacao?perfil=avaliador`);
    } catch (error) {
      console.error(error);

      toast.error("Problemas ao finalizar. Tente mais tarde.", {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  function getPesoLabel() {
    if (peso <= 3) return "Básico";
    if (peso <= 6) return "Intermediário";
    if (peso <= 8) return "Avançado";

    return "Especialista";
  }

  function getPesoColor() {
    if (peso <= 3) return "accent-red-500";
    if (peso <= 6) return "accent-yellow-500";
    if (peso <= 8) return "accent-blue-500";

    return "accent-green-500";
  }

  function getPesoBadgeColorText() {
    if (peso <= 3) return "bg-red-100 text-red-600";
    if (peso <= 6) return "bg-yellow-100 text-yellow-700";
    if (peso <= 8) return "bg-blue-100 text-blue-700";

    return "bg-green-100 text-green-700";
  }

  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm mt-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold">
            {status != "FINALIZADO"
              ? "Finalizar Avaliação"
              : "Avaliação Finalizada"}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Informe a nota final e comentário da entrevista.
          </p>
        </div>

        {!habilitado && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
            Aguardando entrevista
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* PESO */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium whitespace-nowrap">
            Nota Final
          </label>

          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={peso}
            onChange={(e) => setPeso(Number(e.target.value))}
            disabled={!habilitado || loading || status == "FINALIZADO"}
            className={`w-full cursor-pointer ${getPesoColor()}`}
          />

          <span className="w-10 text-right font-semibold text-blue-700">
            {peso.toFixed(1)}
          </span>
          <span
            className={` px-3 py-1 rounded-full text-xs font-medium ${getPesoBadgeColorText()}`}
          >
            {getPesoLabel()}
          </span>
        </div>

        {/* COMENTÁRIO */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Comentário
          </label>

          <textarea
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={!habilitado || loading || status == "FINALIZADO"}
            placeholder="Descreva como foi a entrevista..."
            className="w-full rounded-lg border bg-white border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
          />
        </div>

        {/* BOTÃO */}
        {status != "FINALIZADO" && (
          <div className="flex justify-end">
            <button
              onClick={handleFinalizar}
              disabled={!habilitado || loading}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition
            ${
              habilitado && !loading
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            >
              {loading ? "Finalizando..." : "Finalizar Avaliação"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
