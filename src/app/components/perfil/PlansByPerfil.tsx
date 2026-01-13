"use client";

import { useEffect, useState } from "react";
import PlanCard from "./PlanCard";
import LoadingOverlay from "../LoadingOverlay";
import { useTranslation } from "react-i18next";

interface Periodo {
  id: number;
  periodo: string;
  validade_dias: number;
  valor: string;
  perfil_id: number;
  valor_old: string;
  desconto: string;
}

interface PlanItens {
  id: number;
  descricao: string;
}

interface PlanoData {
  id: number;
  plano: string;
  descricao: string;
  periodos: Periodo[];
  itens: PlanItens[];
  highlight: boolean;
}

interface PlansByPerfilProps {
  perfil: string;
  onSelect: (planoPeriodoId: number, period: "monthly" | "yearly") => void;
  selectedPlanoId?: number | null;
  exibirBotao: boolean;
}

export default function PlansByPerfil({
  perfil,
  onSelect,
  selectedPlanoId,
  exibirBotao,
}: PlansByPerfilProps) {
  const { i18n } = useTranslation("common");
  const [loading, setLoading] = useState(false);
  const [planos, setPlanos] = useState<PlanoData[]>([]);

  useEffect(() => {
    const fetchPlanos = async () => {
      setLoading(true);
      const perfilId =
        perfil === "recrutador"
          ? 2
          : perfil === "avaliador"
          ? 3
          : perfil === "candidato"
          ? 1
          : "";

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/planos?perfilId=${perfilId}`,
          {
            headers: {
              "Accept-Language": i18n.language,
            },
          }
        );

        const data: PlanoData[] = await res.json();
        console.log(data);
        setPlanos(data);
      } catch (err) {
        console.error("Erro ao buscar planos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanos();
  }, [perfil, i18n.language]);

  if (loading) return <LoadingOverlay />;

  const formatCurrency = (value: string) =>
    (i18n.language === "pt" ? "R$ " : "$") +
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-6 justify-center">
      {planos.map((plano) => {
        const perfilId =
          perfil === "recrutador"
            ? 2
            : perfil === "avaliador"
            ? 3
            : perfil === "candidato"
            ? 1
            : "";

        const periodos = plano.periodos.filter((p) => p.perfil_id === perfilId);

        const mensal = periodos.find((p) => p.validade_dias !== 365);
        const anual = periodos.find((p) => p.validade_dias === 365);

        // Se faltar algum período, não renderiza o card
        if (!mensal || !anual) {
          return <div key={`plano-${plano.id}-incompleto`} />;
        }

        return (
          <PlanCard
            key={`plano-${plano.id}`}
            title={plano.plano}
            description={plano.descricao}
            buttonColor="blue"
            highlight={plano.highlight}
            monthly={{
              price: formatCurrency(mensal.valor),
              oldPrice: mensal.valor_old
                ? formatCurrency(mensal.valor_old)
                : undefined,
              discount: mensal.desconto,
              periodLabel: "/mês",
              planoPeriodoId: mensal.id,
              price_ano_mes: "",
            }}
            yearly={{
              price: formatCurrency(anual.valor),
              oldPrice: anual.valor_old
                ? formatCurrency(anual.valor_old)
                : undefined,
              discount: anual.desconto,
              periodLabel: "/ano",
              planoPeriodoId: anual.id,
              price_ano_mes: anual.valor,
            }}
            itens={plano.itens}
            selectedPlanoPeriodoId={selectedPlanoId ?? undefined}
            onSelect={onSelect}
            exibirBotao={exibirBotao}
          />
        );
      })}
    </div>
  );
}
