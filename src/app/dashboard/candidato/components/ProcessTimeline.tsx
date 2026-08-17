"use client";
import { useTranslation } from "react-i18next";

type TimelineItem = {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  status: "concluido" | "atual" | "pendente";
};

const timeline: TimelineItem[] = [
  {
    id: 1,
    titulo: "Entrevista realizada",
    descricao: "Frontend Developer",
    data: "14 Ago",
    status: "concluido",
  },
  {
    id: 2,
    titulo: "Questionário enviado",
    descricao: "Full Stack Developer",
    data: "13 Ago",
    status: "concluido",
  },
  {
    id: 3,
    titulo: "Entrevista agendada",
    descricao: "Backend Developer",
    data: "20 Ago",
    status: "atual",
  },
  {
    id: 4,
    titulo: "Aguardando próxima etapa",
    descricao: "Backend Developer",
    data: "",
    status: "pendente",
  },
];

export default function ProcessTimeline() {
  const { t } = useTranslation("common");

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Movimentações recentes
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Acompanhe as últimas movimentações dos seus processos seletivos.
        </p>
      </div>

      <div>
        {timeline.map((item, index) => {
          const isLast = index === timeline.length - 1;

          return <TimelineRow key={item.id} item={item} isLast={isLast} />;
        })}
      </div>
    </section>
  );
}

function TimelineRow({
  item,
  isLast,
}: {
  item: TimelineItem;
  isLast: boolean;
}) {
  const statusStyle = {
    concluido: {
      dot: "bg-green-500",
      ring: "ring-green-100",
    },
    atual: {
      dot: "bg-blue-500",
      ring: "ring-blue-100",
    },
    pendente: {
      dot: "bg-gray-300",
      ring: "ring-gray-100",
    },
  }[item.status];

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${statusStyle.dot} ring-4 ${statusStyle.ring} shrink-0 mt-1`}
        />

        {!isLast && <div className="w-px flex-1 min-h-10 bg-gray-200 mt-2" />}
      </div>

      <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.titulo}</p>

            <p className="text-sm text-gray-500 mt-1">{item.descricao}</p>
          </div>

          {item.data && (
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {item.data}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
