"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {
  RecrutadorDashboardAcao,
  RecrutadorDashboardPendencia,
} from "../../../lib/types/recrutador-dashboard";

interface Props {
  pendencias: RecrutadorDashboardPendencia[];
}

const statusStyle: Record<RecrutadorDashboardAcao, string> = {
  AGENDA: "bg-blue-50 text-blue-700",
  FINALIZAR: "bg-purple-50 text-purple-700",
};

export default function RecruiterPendingProcesses({ pendencias }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();

  const getLabel = (acao: RecrutadorDashboardAcao) => {
    switch (acao) {
      case "AGENDA":
        return t("dash_recrutador.acao_agenda");

      case "FINALIZAR":
        return t("dash_recrutador.acao_finalizar");
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("dash_recrutador.pendencias_titulo")}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {t("dash_recrutador.pendencias_descricao")}
        </p>
      </div>

      {pendencias.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {pendencias.map((processo) => (
            <div
              key={processo.id}
              className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">
                    {processo.titulo}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {processo.candidato.nome}
                  </p>

                  <span
                    className={`inline-flex w-fit mt-3 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      statusStyle[processo.acao]
                    }`}
                  >
                    {getLabel(processo.acao)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/recrutador/processos?perfil=recrutador&processo=${processo.id}`,
                    )
                  }
                  className="cursor-pointer text-sm font-medium text-green-700 hover:text-green-800"
                >
                  {t("dash_recrutador.btn_ver_processo")} →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">
            {t("dash_recrutador.sem_pendencias")}
          </p>
        </div>
      )}
    </section>
  );
}
