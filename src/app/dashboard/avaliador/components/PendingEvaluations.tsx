"use client";

import { useTranslation } from "react-i18next";
import {
  AvaliadorDashboardPendencia,
  AvaliadorDashboardPendenciaAcao,
} from "../../../lib/types/avaliador-dashboard";

interface Props {
  pendencias: AvaliadorDashboardPendencia[];
}

const statusStyle: Record<AvaliadorDashboardPendenciaAcao, string> = {
  QUESTIONARIO: "bg-yellow-50 text-yellow-700",
  AGENDA: "bg-blue-50 text-blue-700",
  REAGENDAR: "bg-red-50 text-red-700",
  FINALIZAR: "bg-purple-50 text-purple-700",
};

export default function PendingEvaluations({ pendencias }: Props) {
  const { t } = useTranslation("common");

  const getLabelAcao = (acao: AvaliadorDashboardPendenciaAcao) => {
    switch (acao) {
      case "QUESTIONARIO":
        return t("dash_avaliador.acao_questionario");

      case "AGENDA":
        return t("dash_avaliador.acao_agenda");

      case "REAGENDAR":
        return t("dash_avaliador.acao_reagendar");

      case "FINALIZAR":
        return t("dash_avaliador.acao_finalizar");
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("dash_avaliador.pendencias_titulo")}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {t("dash_avaliador.pendencias_descricao")}
        </p>
      </div>

      {pendencias.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {pendencias.map((evaluation) => (
            <div
              key={evaluation.id}
              className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">
                    {evaluation.skill}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {evaluation.candidato}
                  </p>

                  <span
                    className={`inline-flex w-fit mt-3 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      statusStyle[evaluation.acao]
                    }`}
                  >
                    {getLabelAcao(evaluation.acao)}
                  </span>
                </div>

                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                >
                  {t("dash_avaliador.btn_ver_avaliacao")} →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">
            {t("dash_avaliador.sem_pendencias")}
          </p>
        </div>
      )}
    </section>
  );
}
