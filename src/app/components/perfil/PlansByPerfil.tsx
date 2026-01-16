"use client";

import { useEffect, useState } from "react";
import PlanCard from "./PlanCard";
import LoadingOverlay from "../LoadingOverlay";
import { useTranslation } from "react-i18next";

type PeriodType = "monthly" | "yearly";

interface PlanoSelecionado {
  planoPeriodoId: number;
  nomePlano: string;
  valor: string;
  period: PeriodType;
}

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

interface PlanLang {
  plano: string;
  descricao: string;
}

interface PlanoData {
  id: number;
  plano_lang: PlanLang[]; // 🔹 mapeado a partir de "linguagem" do backend
  periodos: Periodo[];
  itens: PlanItens[];
  highlight: boolean;
}

interface PlansByPerfilProps {
  perfil: string;
  onSelect: (plano: PlanoSelecionado) => void;
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

        const dataFromAPI: any[] = await res.json();

        // 🔹 Mapeando "linguagem" para "plano_lang" para bater com a interface
        const planosMapped: PlanoData[] = dataFromAPI.map((p) => ({
          id: p.id,
          highlight: p.highlight,
          plano_lang: p.linguagem.map((l: any) => ({
            plano: l.plano,
            descricao: l.descricao ?? "",
          })),
          periodos: p.periodos,
          itens: p.itens,
        }));

        setPlanos(planosMapped);
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

        if (!mensal || !anual)
          return <div key={`plano-${plano.id}-incompleto`} />;

        return (
          <PlanCard
            key={`plano-${plano.id}`}
            title={plano.plano_lang[0]?.plano ?? ""}
            description={plano.plano_lang[0]?.descricao ?? ""}
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
