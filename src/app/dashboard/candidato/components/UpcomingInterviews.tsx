"use client";

import { DashboardEntrevista } from "../../../lib/types/candidato-dashboard";

interface Props {
  entrevistas: DashboardEntrevista[];
}

export default function UpcomingInterviews({ entrevistas }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 h-fit">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Entrevistas agendadas
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Avaliações confirmadas com seus avaliadores.
          </p>
        </div>

        <span className="text-xl">📅</span>
      </div>

      {entrevistas.length > 0 ? (
        <div className="space-y-3">
          {entrevistas.map((entrevista) => (
            <InterviewCard key={entrevista.id} entrevista={entrevista} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">
            Você não possui entrevistas agendadas.
          </p>
        </div>
      )}

      {entrevistas.length > 0 && (
        <button
          type="button"
          className="w-full mt-5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          Ver agenda completa
        </button>
      )}
    </section>
  );
}

function InterviewCard({ entrevista }: { entrevista: DashboardEntrevista }) {
  const data = new Date(entrevista.data_hora);

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(data)
    .replace(".", "")
    .toUpperCase();

  const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);

  return (
    <div
      className={`border rounded-xl p-3 sm:p-4 transition-colors ${
        entrevista.atrasada
          ? "border-red-100 bg-red-50/40"
          : "border-gray-100 hover:bg-gray-50"
      }`}
    >
      <div className="flex gap-3">
        <div className="w-14 shrink-0 text-center">
          <div
            className={`text-xs font-semibold uppercase ${
              entrevista.atrasada ? "text-red-500" : "text-gray-500"
            }`}
          >
            {dataFormatada}
          </div>

          <div className="text-sm font-bold text-gray-900 mt-1">
            {horaFormatada}
          </div>
        </div>

        <div className="w-px bg-gray-100 shrink-0" />

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-gray-900">
            {entrevista.skill}
          </p>

          <p className="text-xs text-gray-500 mt-1">Avaliação de Skill</p>

          <div className="mt-2">
            {entrevista.atrasada ? (
              <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
                Atrasada
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700">
                Confirmada
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
