"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { DashboardOportunidade } from "../../../lib/types/candidato-dashboard";

interface Props {
  oportunidades: DashboardOportunidade[];
}

export default function CandidateOpportunities({ oportunidades }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();

  const handleVerOportunidade = (oportunidade: DashboardOportunidade) => {
    router.push(
      `/dashboard/candidato/oportunidades?perfil=candidato&tab=entrevistas&processo=${oportunidade.id}`,
    );
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("dash_candidato.oportunidades_titulo")}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {t("dash_candidato.oportunidades_descricao")}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl shrink-0">
          💼
        </div>
      </div>

      {oportunidades.length > 0 ? (
        <div className="space-y-3">
          {oportunidades.map((oportunidade) => (
            <OpportunityCard
              key={oportunidade.id}
              oportunidade={oportunidade}
              onVer={() => handleVerOportunidade(oportunidade)}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">
            {t("dash_candidato.sem_oportunidades")}
          </p>
        </div>
      )}

      {oportunidades.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-right">
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/candidato/oportunidades?perfil=candidato")
            }
            className="text-sm font-medium text-green-600 hover:text-green-700 cursor-pointer"
          >
            {t("dash_candidato.ver_todas_oportunidades")} →
          </button>
        </div>
      )}
    </section>
  );
}

function OpportunityCard({
  oportunidade,
  onVer,
}: {
  oportunidade: DashboardOportunidade;
  onVer: () => void;
}) {
  const { t, i18n } = useTranslation("common");

  const tipoLabel = getTipoLabel(oportunidade.tipo, t);
  const statusConfig = getStatusConfig(oportunidade.status, t);

  const dataAtualizacao =
    oportunidade.agenda?.data_hora ??
    oportunidade.data_aceite ??
    oportunidade.data_convite;

  const dataFormatada = new Intl.DateTimeFormat(
    i18n.language?.startsWith("en") ? "en-US" : "pt-BR",
    {
      day: "2-digit",
      month: "short",
    },
  )
    .format(new Date(dataAtualizacao))
    .replace(".", "");

  const isVaga = oportunidade.tipo === "VAGA";

  return (
    <div className="rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 transition-all">
      <div className="flex flex-col xl:flex-row xl:items-center gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {oportunidade.titulo}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {oportunidade.empresa && (
            <p className="text-sm text-gray-500 mt-1">
              {oportunidade.empresa.nome_empresa}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
              {tipoLabel}
            </span>

            {oportunidade.agenda?.status === "ACEITO" && (
              <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700">
                📅 {t("dash_candidato.oportunidade_agendada")}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-3 xl:min-w-[150px]">
          {isVaga && oportunidade.compatibilidade != null && (
            <div className="text-left xl:text-right">
              <p className="text-xs text-gray-400">
                {t("dash_candidato.compatibilidade")}
              </p>

              <p className="text-xl font-bold text-green-600 mt-0.5">
                {oportunidade.compatibilidade}%
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onVer}
            className="text-sm font-medium text-green-600 hover:text-green-700 whitespace-nowrap cursor-pointer"
          >
            {isVaga
              ? t("dash_candidato.ver_processo")
              : t("dash_candidato.ver_oportunidade")}{" "}
            →
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {t("dash_candidato.ultima_atualizacao")}: {dataFormatada}
        </p>
      </div>
    </div>
  );
}

function getTipoLabel(
  tipo: DashboardOportunidade["tipo"],
  t: (key: string) => string,
) {
  switch (tipo) {
    case "VAGA":
      return t("dash_candidato.tipo_vaga");

    case "PALESTRA_EVENTO":
      return t("dash_candidato.tipo_palestra_evento");

    case "MENTORIA":
      return t("dash_candidato.tipo_mentoria");

    case "PROJETO_CONSULTORIA":
      return t("dash_candidato.tipo_projeto_consultoria");

    case "NETWORKING":
      return t("dash_candidato.tipo_networking");

    default:
      return t("dash_candidato.tipo_outro");
  }
}

function getStatusConfig(
  status: DashboardOportunidade["status"],
  t: (key: string) => string,
) {
  switch (status) {
    case "CONVITE_ACEITO":
      return {
        label: t("dash_candidato.status_convite_aceito"),
        className: "bg-purple-50 text-purple-700",
      };

    case "AGENDA_ENVIADA":
      return {
        label: t("dash_candidato.status_agenda_enviada"),
        className: "bg-yellow-50 text-yellow-700",
      };

    case "AGENDADO":
      return {
        label: t("dash_candidato.status_agendado"),
        className: "bg-green-50 text-green-700",
      };

    case "ENTREVISTA_REALIZADA":
      return {
        label: t("dash_candidato.status_entrevista_realizada"),
        className: "bg-blue-50 text-blue-700",
      };

    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-600",
      };
  }
}
