import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const steps = [
  "CONVITE_ACEITO",
  "QUESTIONARIO_ENVIADO",
  "AGENDA_ENVIADA",
  "AGENDADO",
  "ENTREVISTA_REALIZADA",
  "FINALIZADO",
] as const;

const stepLabels: Record<(typeof steps)[number], string> = {
  CONVITE_ACEITO: "minha_avaliacao.steps.convite_aceito",
  QUESTIONARIO_ENVIADO: "minha_avaliacao.steps.questionario_enviado",
  AGENDA_ENVIADA: "minha_avaliacao.steps.agenda_enviada",
  AGENDADO: "minha_avaliacao.steps.agendado",
  ENTREVISTA_REALIZADA: "minha_avaliacao.steps.entrevista_realizada",
  FINALIZADO: "minha_avaliacao.steps.finalizado",
};

type StepStatus = (typeof steps)[number];

export default function AvaliacaoTimeline({ status }: { status: string }) {
  const { t } = useTranslation("common");

  const currentIndex = steps.indexOf(status as StepStatus);

  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm h-[525px]">
      <h2 className="font-semibold mb-15">
        {t("minha_avaliacao.titulo_progresso")}
      </h2>

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
                className={`flex items-center justify-center
                w-5 h-5 rounded-full z-10
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
                  className={`text-[12px]
                  ${completed && !current ? "text-gray-500" : ""}
                  ${current ? "font-semibold text-blue-600" : ""}`}
                >
                  {t(stepLabels[step])}
                </span>

                {current && (
                  <span className="text-xs text-blue-500">
                    {t("minha_avaliacao.etapa_atual")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
