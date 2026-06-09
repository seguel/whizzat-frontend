import { useTranslation } from "react-i18next";
import { AvaliacaoDetalheDTO } from "../../dto/AvaliacaoDetalheDTO";

interface AvaliacaoHeaderProps {
  avaliacao: AvaliacaoDetalheDTO;
}

interface MetricCardProps {
  label: string;
  value: number | string;
  isDate?: boolean;
}

function MetricCard({ label, value, isDate }: MetricCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-center items-center min-h-[100px]">
      <p className="text-xs uppercase tracking-wide text-gray-500 text-center">
        {label}
      </p>

      <div className="mt-3">
        <span className="text-3xl font-bold text-gray-900">{value}</span>

        {!isDate && value !== "--" && (
          <span className="text-sm text-gray-400 ml-1">/10</span>
        )}
      </div>
    </div>
  );
}

export default function AvaliacaoHeader({ avaliacao }: AvaliacaoHeaderProps) {
  const { t, i18n } = useTranslation("common");

  const currentLocale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "es"
        ? "es-ES"
        : "pt-BR";

  // 👇 formatador internacionalizado
  const formatarData = (data: string) => {
    return new Intl.DateTimeFormat(currentLocale, {
      dateStyle: "short",
    }).format(new Date(data));
  };

  function getPesoColor() {
    const peso = avaliacao.peso_avaliador ?? 0;

    if (peso <= 3) return "bg-red-400";
    if (peso <= 6) return "bg-yellow-400";
    if (peso <= 8) return "bg-blue-400";

    return "bg-green-500";
  }

  function getPesoLabel() {
    const peso = avaliacao.peso_avaliador ?? 0;

    if (peso <= 3) return t("minha_avaliacao.candidato.basico");
    if (peso <= 6) return t("minha_avaliacao.candidato.intermediario");
    if (peso <= 8) return t("minha_avaliacao.candidato.avancado");

    return t("minha_avaliacao.especialista");
  }

  function getPesoBadgeColor() {
    const peso = avaliacao.peso_avaliador ?? 0;

    if (peso <= 3) return "bg-red-100 text-red-600";
    if (peso <= 6) return "bg-yellow-100 text-yellow-700";
    if (peso <= 8) return "bg-blue-100 text-blue-700";

    return "bg-green-100 text-green-700";
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("minha_avaliacao.candidato.resultado_avaliacao")}
          </h1>

          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            {t("minha_avaliacao.candidato.resultado_descricao")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
            {avaliacao.skill}
          </span>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <MetricCard
          label={t("minha_avaliacao.autoavaliacao")}
          value={avaliacao.peso}
        />

        <MetricCard
          label={t("minha_avaliacao.ultima_avaliacao")}
          value={avaliacao.peso_avaliador ?? "--"}
        />

        <MetricCard
          label={t("minha_avaliacao.dt_ultima_avaliacao")}
          value={
            avaliacao.data_avaliacao
              ? formatarData(avaliacao.data_avaliacao)
              : "--"
          }
          isDate
        />
      </div>

      {/* Barra de nível */}
      {avaliacao.peso_avaliador != null && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            {avaliacao.peso_avaliador != null && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getPesoBadgeColor()}`}
              >
                {getPesoLabel()}
              </span>
            )}

            <span className="font-semibold text-gray-700">
              {avaliacao.peso_avaliador}/10
            </span>
          </div>

          <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getPesoColor()}`}
              style={{
                width: `${(avaliacao.peso_avaliador ?? 0) * 10}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
