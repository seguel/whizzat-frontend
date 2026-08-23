"use client";

import { useTranslation } from "react-i18next";

interface Props {
  pontuacao: number;
  posicao: number;
}

export default function EvaluatorRanking({ pontuacao, posicao }: Props) {
  const { t } = useTranslation("common");

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("dash_avaliador.ranking_titulo")}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {t("dash_avaliador.ranking_descricao")}
          </p>
        </div>

        <span className="text-xl">🏆</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-blue-50 p-4 text-center">
          <p className="text-xs text-gray-500">
            {t("dash_avaliador.ranking_pontuacao")}
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">{pontuacao}</p>

          <p className="text-xs text-gray-400 mt-1">
            {t("dash_avaliador.ranking_pontos")}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-500">
            {t("dash_avaliador.ranking_posicao")}
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">#{posicao}</p>

          <p className="text-xs text-gray-400 mt-1">
            {t("dash_avaliador.ranking_avaliadores")}
          </p>
        </div>
      </div>
    </section>
  );
}
