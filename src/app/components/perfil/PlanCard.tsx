"use client";

import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

type PeriodType = "monthly" | "yearly";

interface PlanoSelecionado {
  planoPeriodoId: number;
  nomePlano: string;
  valor: string;
  period: PeriodType;
}

interface PlanItens {
  id: number;
  descricao: string;
}

interface PriceInfo {
  price: string; // preço formatado tipo "R$ 500,00"
  oldPrice?: string;
  discount?: string;
  periodLabel: string;
  planoPeriodoId: number;
  price_ano_mes: string;
}

interface PlanCardProps {
  title: string;
  description: string;
  monthly: PriceInfo;
  yearly: PriceInfo;
  highlight?: boolean;
  itens: PlanItens[];
  buttonColor: "blue" | "yellow";
  defaultPeriod?: PeriodType;
  selectedPlanoPeriodoId?: number;
  onSelect: (plano: PlanoSelecionado) => void;
  exibirBotao: boolean;
}

/* Toggle mensal/anual */
function PeriodToggle({
  value,
  onChange,
  t,
}: {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
  t: TFunction;
}) {
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <span
        className={`text-sm cursor-pointer ${
          value === "monthly" ? "font-bold text-gray-900" : "text-gray-500"
        }`}
        onClick={() => onChange("monthly")}
      >
        {t("planos.mensal")}
      </span>

      <div
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
          value === "yearly" ? "bg-purple-600" : "bg-gray-300"
        }`}
        onClick={() => onChange(value === "monthly" ? "yearly" : "monthly")}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
            value === "yearly" ? "translate-x-6" : ""
          }`}
        />
      </div>

      <span
        className={`text-sm cursor-pointer ${
          value === "yearly" ? "font-bold text-gray-900" : "text-gray-500"
        }`}
        onClick={() => onChange("yearly")}
      >
        {t("planos.anual")}
      </span>
    </div>
  );
}

export default function PlanCard({
  title,
  description,
  monthly,
  yearly,
  itens,
  highlight,
  buttonColor,
  defaultPeriod = "monthly",
  selectedPlanoPeriodoId,
  onSelect,
  exibirBotao,
}: PlanCardProps) {
  const { t, i18n } = useTranslation("common");
  const [period, setPeriod] = useState<PeriodType>(defaultPeriod);
  const [ready, setReady] = useState(false);

  const data = period === "monthly" ? monthly : yearly;
  const isSelected = selectedPlanoPeriodoId === data.planoPeriodoId;

  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
    } else {
      const onInit = () => setReady(true);
      i18n.on("initialized", onInit);
      return () => {
        i18n.off("initialized", onInit);
      };
    }
  }, [i18n]);

  const buttonClass =
    buttonColor === "blue"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-yellow-400 hover:bg-yellow-300 text-gray-900";

  // 🔹 Calcula valor mensal do anual
  const annualMonthlyValue =
    period === "yearly"
      ? Number(yearly.price_ano_mes.replace(/[^\d.-]/g, "").replace(",", ".")) /
        12
      : null;

  // 🔹 Formata valor em R$ xx,xx
  const formatCurrency = (value: number) =>
    "R$ " +
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg p-6 border w-full sm:w-72 md:w-80 transition-all ${
        highlight
          ? "border-yellow-400 shadow-2xl scale-[1.03]"
          : "border-gray-200"
      }`}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 px-4 py-1 rounded-full text-xs font-bold">
          {t("planos.recomendado")}
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>

      <PeriodToggle value={period} onChange={setPeriod} t={t} />

      {data.oldPrice && (
        <div className="mt-4 flex items-center gap-2">
          <p className="line-through text-gray-400 text-xs sm:text-sm">
            {data.oldPrice}
          </p>

          {data.discount && (
            <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded">
              {data.discount}% OFF
            </span>
          )}
        </div>
      )}

      {/* Preço principal */}
      <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
        {data.price}
        <span className="text-lg font-semibold">
          /{period === "yearly" ? t("planos.ano") : t("planos.mes")}
        </span>
      </p>

      {/* Valor mensal equivalente do anual */}
      {period === "yearly" && annualMonthlyValue !== null && (
        <p className="mt-1 text-gray-400 text-xs sm:text-sm">
          {formatCurrency(annualMonthlyValue)}/{t("planos.mes")}
        </p>
      )}

      {exibirBotao && (
        <button
          onClick={() =>
            onSelect({
              planoPeriodoId: data.planoPeriodoId,
              nomePlano: title,
              valor: data.price,
              period,
            })
          }
          className={`mt-6 w-full py-2 rounded-lg font-semibold cursor-pointer ${
            isSelected ? "bg-yellow-400 text-black" : buttonClass
          }`}
        >
          {isSelected
            ? t("planos.botao_selecionado")
            : t("planos.botao_selecionar")}
        </button>
      )}

      <ul className="mt-6 space-y-2 text-sm">
        {itens.map((item) => (
          <li key={item.id} className="flex gap-2">
            <Check className="w-4 h-4 text-green-500" />
            {item.descricao}
          </li>
        ))}
      </ul>
    </div>
  );
}
