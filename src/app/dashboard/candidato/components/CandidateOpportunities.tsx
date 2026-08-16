"use client";

type OpportunityStatus =
  | "convite"
  | "questionario"
  | "entrevista"
  | "avaliacao"
  | "finalizado";

type Opportunity = {
  id: number;
  vaga: string;
  empresa: string;
  etapa: string;
  status: OpportunityStatus;
  atualizadoEm: string;
  match?: number;
};

const opportunities: Opportunity[] = [
  {
    id: 1,
    vaga: "Frontend Developer",
    empresa: "Empresa Exemplo",
    etapa: "Entrevista",
    status: "entrevista",
    atualizadoEm: "14 Ago",
    match: 92,
  },
  {
    id: 2,
    vaga: "Full Stack Developer",
    empresa: "Tech Solutions",
    etapa: "Avaliação",
    status: "avaliacao",
    atualizadoEm: "13 Ago",
    match: 84,
  },
];

const statusConfig: Record<
  OpportunityStatus,
  {
    label: string;
    className: string;
  }
> = {
  convite: {
    label: "Convite recebido",
    className: "bg-purple-50 text-purple-700",
  },

  questionario: {
    label: "Questionário",
    className: "bg-yellow-50 text-yellow-700",
  },

  entrevista: {
    label: "Entrevista",
    className: "bg-green-50 text-green-700",
  },

  avaliacao: {
    label: "Em avaliação",
    className: "bg-blue-50 text-blue-700",
  },

  finalizado: {
    label: "Finalizado",
    className: "bg-gray-100 text-gray-600",
  },
};

export default function CandidateOpportunities() {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Minhas oportunidades
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Acompanhe os processos seletivos em que você foi convidado.
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">
          💼
        </div>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity) => {
          const status = statusConfig[opportunity.status];

          return (
            <div
              key={opportunity.id}
              className="rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 transition-all"
            >
              <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {opportunity.vaga}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    {opportunity.empresa}
                  </p>

                  <div className="mt-4">
                    <ProcessProgress currentStatus={opportunity.status} />
                  </div>
                </div>

                <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-3 xl:min-w-[130px]">
                  {opportunity.match != null && (
                    <div className="text-left xl:text-right">
                      <p className="text-xs text-gray-400">Compatibilidade</p>

                      <p className="text-xl font-bold text-green-600 mt-0.5">
                        {opportunity.match}%
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    className="text-sm font-medium text-green-600 hover:text-green-700 whitespace-nowrap"
                  >
                    Ver processo →
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Última atualização: {opportunity.atualizadoEm}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProcessProgress({
  currentStatus,
}: {
  currentStatus: OpportunityStatus;
}) {
  const steps: {
    key: OpportunityStatus;
    label: string;
  }[] = [
    {
      key: "convite",
      label: "Convite",
    },
    {
      key: "questionario",
      label: "Questionário",
    },
    {
      key: "entrevista",
      label: "Entrevista",
    },
    {
      key: "avaliacao",
      label: "Avaliação",
    },
    {
      key: "finalizado",
      label: "Resultado",
    },
  ];

  const currentIndex = steps.findIndex((step) => step.key === currentStatus);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-center min-w-[520px]">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;

          return (
            <div
              key={step.key}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    completed
                      ? "bg-green-500 text-white"
                      : current
                        ? "bg-green-100 text-green-700 ring-4 ring-green-50"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </div>

                <span
                  className={`text-[11px] mt-2 whitespace-nowrap ${
                    current ? "font-semibold text-green-700" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-[2px] flex-1 mx-2 mb-5 ${
                    index < currentIndex ? "bg-green-400" : "bg-gray-100"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
