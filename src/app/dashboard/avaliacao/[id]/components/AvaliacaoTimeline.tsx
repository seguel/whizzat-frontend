import { Check } from "lucide-react";

const steps = [
  "CONVITE_ACEITO",
  "QUESTIONARIO_ENVIADO",
  "AGENDA_ENVIADA",
  "AGENDADO",
  "ENTREVISTA_REALIZADA",
  "FINALIZADO",
];

export default function AvaliacaoTimeline({ status }: { status: string }) {
  const currentIndex = steps.indexOf(status);

  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm h-[525px]">
      <h2 className="font-semibold mb-15">Progresso da Avaliação</h2>

      <div className="space-y-9">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex items-start gap-3 relative">
              {/* LINHA */}
              {!isLast && (
                <div
                  className={`absolute left-[10px] top-7 w-[2px] h-[52px]
            ${completed ? "bg-green-400" : "bg-gray-200"}`}
                />
              )}

              {/* CÍRCULO */}
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-full z-10
          ${
            completed
              ? "bg-green-500 text-white"
              : current
                ? "border-2 border-blue-500 bg-white"
                : "bg-gray-300"
          }`}
              >
                {completed && <Check size={12} />}
              </div>

              {/* TEXTO */}
              <div className="flex flex-col">
                <span
                  className={`text-[12px] capitalize
            ${completed && !current ? "text-gray-500" : ""}
            ${current ? "font-semibold text-blue-600" : ""}
          `}
                >
                  {step.replaceAll("_", " ")}
                </span>

                {current && (
                  <span className="text-xs text-blue-500">etapa atual</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
