"use client";

import EvaluatorStats from "./EvaluatorStats";
import EvaluatorAgenda from "./EvaluatorAgenda";
import PendingEvaluations from "./PendingEvaluations";
import EvaluatorRanking from "./EvaluatorRanking";
import TopEvaluatedSkills from "./TopEvaluatedSkills";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { useAvaliadorDashboard } from "../../../lib/hooks/useAvaliadorDashboard";
import { useTranslation } from "react-i18next";
import { Clock3 } from "lucide-react";

export default function EvaluatorDashboard() {
  const { t } = useTranslation("common");
  const { data, loading, error } = useAvaliadorDashboard();

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-6">
        <p className="text-sm text-red-600">{t("dash_avaliador.erro")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("dash_avaliador.header")}
        </h1>

        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {t("dash_avaliador.sub_header")}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock3 className="h-3.5 w-3.5 shrink-0" />

            <span>{t("dash_avaliador.fuso_brasilia_exibicao")}</span>
          </div>
        </div>
      </div>

      <EvaluatorStats resumo={data.resumo} />

      <EvaluatorAgenda agendas={data.agendas} />

      <PendingEvaluations pendencias={data.pendencias} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <EvaluatorRanking
          pontuacao={data.resumo.pontuacao}
          posicao={data.ranking.posicao}
        />
        <TopEvaluatedSkills skills={data.top_skills} />
      </div>
    </div>
  );
}
