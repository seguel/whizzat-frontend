"use client";

import { useState } from "react";

type Props = {
  habilitado: boolean;
};

export default function CardFinalizarAvaliacao({ habilitado }: Props) {
  const [peso, setPeso] = useState(7);
  const [comentario, setComentario] = useState("");

  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm mt-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold">Finalizar Avaliação</h2>

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
            disabled={!habilitado}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <span className="w-10 text-right font-semibold text-blue-700">
            {peso.toFixed(1)}
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
            disabled={!habilitado}
            placeholder="Descreva como foi a entrevista..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
          />
        </div>

        {/* BOTÃO */}
        <div className="flex justify-end">
          <button
            disabled={!habilitado}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition
            ${
              habilitado
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Finalizar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
}
