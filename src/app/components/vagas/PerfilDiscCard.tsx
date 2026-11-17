"use client";

import { BrainCircuit, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PerfilDisc {
  dominante: "D" | "I" | "S" | "C" | null;
  secundaria: "D" | "I" | "S" | "C" | null;
  blend_codigo: string | null;
  blend_titulo: string | null;
  scores: Record<"D" | "I" | "S" | "C", number | null>;
  finalizado_em: string | null;
}

interface Props {
  disc: PerfilDisc;
}

const dimensoes = ["D", "I", "S", "C"] as const;

const cores: Record<(typeof dimensoes)[number], string> = {
  D: "bg-blue-500",
  I: "bg-amber-500",
  S: "bg-green-500",
  C: "bg-purple-500",
};

export default function PerfilDiscCard({ disc }: Props) {
  const { t } = useTranslation("common");

  // Normaliza os scores para a representação visual.
  // Não altera os valores calculados pelo backend.
  const total = dimensoes.reduce(
    (soma, dimensao) => soma + Math.max(0, disc.scores[dimensao] ?? 0),
    0,
  );

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-blue-600" />

        <h3 className="text-sm font-semibold text-gray-900">
          {t("perfil_candidato.disc_titulo")}
        </h3>
      </div>

      <div className="space-y-4 rounded-xl border border-blue-100 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              {t("perfil_candidato.disc_dominante")}
            </p>

            <p className="mt-1 text-lg font-bold text-blue-900">
              {disc.dominante
                ? `${disc.dominante} — ${t(
                    `perfil_candidato.disc_dimensao_${disc.dominante.toLowerCase()}`,
                  )}`
                : "-"}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              {t("perfil_candidato.disc_secundaria")}
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {disc.secundaria
                ? `${disc.secundaria} — ${t(
                    `perfil_candidato.disc_dimensao_${disc.secundaria.toLowerCase()}`,
                  )}`
                : "-"}
            </p>
          </div>
        </div>

        {disc.blend_codigo && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
              {disc.blend_codigo}
            </span>

            <span className="text-sm font-medium text-gray-700">
              {disc.blend_titulo}
            </span>
          </div>
        )}

        <div className="space-y-3">
          {dimensoes.map((dimensao) => {
            const valor = disc.scores[dimensao];

            const percentual =
              total > 0 && valor !== null
                ? (Math.max(0, valor) / total) * 100
                : 0;

            return (
              <div key={dimensao}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600">
                    {dimensao} —{" "}
                    {t(
                      `perfil_candidato.disc_dimensao_${dimensao.toLowerCase()}`,
                    )}
                  </span>

                  <span className="text-xs font-semibold text-gray-800">
                    {valor === null ? "-" : valor}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${cores[dimensao]}`}
                    style={{ width: `${percentual}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-2 border-t border-gray-100 pt-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

          <p className="text-xs leading-5 text-gray-500">
            {t("perfil_candidato.disc_compartilhado")}
          </p>
        </div>
      </div>
    </section>
  );
}
