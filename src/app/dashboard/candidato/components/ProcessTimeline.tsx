"use client";

import {
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  MailCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { DashboardMovimentacao } from "../../../lib/types/candidato-dashboard";

interface Props {
  movimentacoes: DashboardMovimentacao[];
}

export default function ProcessTimeline({ movimentacoes }: Props) {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  const locale = i18n.language?.startsWith("en") ? "en-US" : "pt-BR";

  function abrirMovimentacao(movimentacao: DashboardMovimentacao) {
    const tab =
      movimentacao.evento === "PROCESSO_FINALIZADO"
        ? "finalizados"
        : "entrevistas";

    router.push(
      `/dashboard/candidato/oportunidades?perfil=candidato&tab=${tab}&processo=${movimentacao.referencia_id}`,
    );
  }

  function formatarData(data: string) {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
    }).format(new Date(data));
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("dash_candidato.movimentacoes_titulo")}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {t("dash_candidato.movimentacoes_descricao")}
        </p>
      </div>

      {movimentacoes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
          <CalendarDays className="mx-auto mb-3 h-8 w-8 text-gray-300" />

          <p className="text-sm font-semibold text-gray-700">
            {t("dash_candidato.sem_movimentacoes")}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {t("dash_candidato.sem_movimentacoes_msg")}
          </p>
        </div>
      ) : (
        <div>
          {movimentacoes.map((item, index) => {
            const isLast = index === movimentacoes.length - 1;

            return (
              <TimelineRow
                key={item.id}
                item={item}
                isLast={isLast}
                data={formatarData(item.data)}
                onClick={() => abrirMovimentacao(item)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function TimelineRow({
  item,
  isLast,
  data,
  onClick,
}: {
  item: DashboardMovimentacao;
  isLast: boolean;
  data: string;
  onClick: () => void;
}) {
  const { t } = useTranslation("common");

  const config = {
    CONVITE_RECEBIDO: {
      icon: <BriefcaseBusiness className="h-3.5 w-3.5 text-white" />,
      dot: "bg-purple-500",
      ring: "ring-purple-100",
      titulo: t("dash_candidato.movimentacao_convite_recebido"),
    },

    CONVITE_ACEITO: {
      icon: <MailCheck className="h-3.5 w-3.5 text-white" />,
      dot: "bg-blue-500",
      ring: "ring-blue-100",
      titulo: t("dash_candidato.movimentacao_convite_aceito"),
    },

    AGENDA_ENVIADA: {
      icon: <CalendarDays className="h-3.5 w-3.5 text-white" />,
      dot: "bg-amber-500",
      ring: "ring-amber-100",
      titulo: t("dash_candidato.movimentacao_agenda_enviada"),
    },

    AGENDA_CONFIRMADA: {
      icon: <CalendarCheck2 className="h-3.5 w-3.5 text-white" />,
      dot: "bg-green-500",
      ring: "ring-green-100",
      titulo: t("dash_candidato.movimentacao_agenda_confirmada"),
    },

    PROCESSO_FINALIZADO: {
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-white" />,
      dot: "bg-gray-500",
      ring: "ring-gray-100",
      titulo: t("dash_candidato.movimentacao_processo_finalizado"),
    },
  }[item.evento];

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.dot} ring-4 ${config.ring}`}
        >
          {config.icon}
        </div>

        {!isLast && <div className="mt-2 min-h-10 w-px flex-1 bg-gray-200" />}
      </div>

      {/* Conteúdo */}
      <button
        type="button"
        onClick={onClick}
        className={`group flex flex-1 cursor-pointer flex-col pb-6 text-left ${
          isLast ? "pb-0" : ""
        }`}
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 transition group-hover:text-purple-700">
              {config.titulo}
            </p>

            <p className="mt-1 text-sm font-medium text-gray-600">
              {item.descricao}
            </p>

            {item.empresa && (
              <p className="mt-0.5 text-xs text-gray-400">{item.empresa}</p>
            )}
          </div>

          <span className="shrink-0 whitespace-nowrap text-xs text-gray-400">
            {data}
          </span>
        </div>
      </button>
    </div>
  );
}
