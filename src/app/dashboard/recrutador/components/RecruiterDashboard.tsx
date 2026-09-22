"use client";

import { useTranslation } from "react-i18next";
import RecruiterStats from "./RecruiterStats";
import RecruiterAgenda from "./RecruiterAgenda";
import RecruiterPendingProcesses from "./RecruiterPendingProcesses";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { useRecrutadorDashboard } from "../../../lib/hooks/useRecrutadorDashboard";

export default function RecruiterDashboard() {
  const { t } = useTranslation("common");
  const { data, loading, error } = useRecrutadorDashboard();

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-6">
        <p className="text-sm text-red-600">{t("dash_recrutador.erro")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("dash_recrutador.header")}
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {t("dash_recrutador.sub_header")}
        </p>
      </div>

      <RecruiterStats resumo={data.resumo} />

      <RecruiterAgenda agendas={data.agendas} />

      <RecruiterPendingProcesses pendencias={data.pendencias} />
    </div>
  );
}
