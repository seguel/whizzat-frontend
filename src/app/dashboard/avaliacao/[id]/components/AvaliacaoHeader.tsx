import { useTranslation } from "react-i18next";

interface AvaliacaoProps {
  avaliacao: any;
}

interface Props {
  label: string;
  value: number | string;
  isDate?: boolean;
}

function MetricCard({ label, value, isDate }: Props) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3 min-w-[110px] flex flex-col h-[90px]">
      {/* Label no topo */}
      <p className="text-xs text-gray-500 uppercase tracking-wide text-center">
        {label}
      </p>

      {/* Valor no meio */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-800">
          {isDate ? (
            value
          ) : (
            <>
              {value}
              <span className="text-sm text-gray-400">/10</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function AvaliacaoHeader({ avaliacao }: AvaliacaoProps) {
  const { t } = useTranslation("common");
  // const pesoNota = avaliacao.peso ? avaliacao.peso / 10 : 0;

  function getPesoColor() {
    const peso = avaliacao.peso;

    if (peso <= 3) return "bg-red-400";
    if (peso <= 6) return "bg-yellow-400";
    if (peso <= 8) return "bg-green-400";

    return "bg-green-500";
  }

  function getPesoLabel() {
    const peso = avaliacao.peso;

    if (peso <= 3) return "Básico";
    if (peso <= 6) return "Intermediário";
    if (peso <= 8) return "Avançado";

    return "Especialista";
  }

  function getPesoBadgeColor() {
    const peso = avaliacao.peso;

    if (peso <= 3) return "bg-red-100 text-red-600";
    if (peso <= 6) return "bg-yellow-100 text-yellow-700";
    if (peso <= 8) return "bg-blue-100 text-blue-700";

    return "bg-green-100 text-green-700";
  }

  function getInitials(nome: string) {
    if (!nome) return "";

    const parts = nome.split(" ");

    if (parts.length === 1) return parts[0][0];

    return parts[0][0] + parts[parts.length - 1][0];
  }

  return (
    <div className="bg-white border shadow-sm rounded-xl p-6 flex justify-between gap-8 flex-wrap">
      <div className="flex items-start gap-4 min-w-[320px]">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avaliacao.avatar ? (
            <img
              src={avaliacao.avatar}
              alt={avaliacao.candidato_nome}
              className="w-16 h-16 rounded-full object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">
              {getInitials(avaliacao.candidato_nome)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-semibold">{avaliacao.candidato_nome}</h1>

          <p className="text-sm text-gray-500">{avaliacao.cidade}</p>

          {/* Skill */}
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {avaliacao.skill}
            </span>

            {avaliacao.peso && (
              <span
                className={` px-3 py-1 rounded-full text-xs font-medium ${getPesoBadgeColor()}`}
              >
                {getPesoLabel()}
              </span>
            )}
          </div>

          {/* Barra de peso */}
          {avaliacao.peso && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t("minha_avaliacao.peso")}</span>
                <span className="font-medium text-gray-700">
                  {avaliacao.peso}/10
                </span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getPesoColor()}`}
                  style={{ width: `${avaliacao.peso * 10}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 flex-wrap">
        {/* Autoavaliação */}
        <MetricCard label="Autoavaliação" value={avaliacao.peso} />

        {/* Última avaliação */}
        <MetricCard
          label="Última avaliação"
          value={
            avaliacao.ultimo_peso_avaliador
              ? avaliacao.ultimo_peso_avaliador
              : "--"
          }
        />

        {/* Data */}
        <MetricCard
          label="Dt. Últ. Avaliação"
          value={
            avaliacao.ultima_avaliacao
              ? new Date(avaliacao.ultima_avaliacao).toLocaleDateString("pt-BR")
              : "--"
          }
          isDate
        />
      </div>
    </div>
  );
}
