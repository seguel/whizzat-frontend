"use client";
import { useState, useEffect } from "react";
import Header from "../components/header/header";
import { useTranslation } from "react-i18next";
import LoadingOverlay from "../components/LoadingOverlay";
import PlansByPerfil from "../components/perfil/PlansByPerfil";

type PeriodType = "monthly" | "yearly";

interface PlanoSelecionado {
  planoPeriodoId: number;
  nomePlano: string;
  valor: string;
  period: PeriodType;
}

export default function PlansPage() {
  const { t, i18n } = useTranslation("common");
  const [ready, setReady] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] =
    useState<PlanoSelecionado | null>(null);

  const perfilMap: Record<
    number,
    { nome: string; cor: string; titulo: string }
  > = {
    1: { nome: "Candidato", cor: "#22c55e", titulo: t("perfil.candidato") }, // verde
    2: { nome: "Recrutador", cor: "#7c3aed", titulo: t("perfil.recrutador") }, // roxo
    // 3: { nome: "Avaliador", cor: "#3b82f6", titulo: t("perfil.avaliador") }, // azul
  };

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

  if (!ready) return <LoadingOverlay />;

  const renderPerfilSection = (perfilId: number) => {
    const perfil = perfilMap[perfilId];
    return (
      <div
        className="relative w-full rounded-xl p-4 mb-10"
        style={{ border: `2px solid ${perfil.cor}` }}
      >
        {/* Aba com o nome do perfil */}
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-t-lg text-white font-bold text-sm"
          style={{ backgroundColor: perfil.cor }}
        >
          {perfil.titulo}
        </div>

        {/* Grid dos planos */}
        <div className="flex flex-wrap justify-center gap-6 py-8">
          <PlansByPerfil
            perfil={perfil.nome.toLowerCase()}
            selectedPlanoId={planoSelecionado?.planoPeriodoId}
            onSelect={setPlanoSelecionado}
            exibirBotao={false}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header />
      <main className="p-4">
        <div className="flex flex-col items-center justify-center w-full max-w-[1400px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-extralight mb-12">
            {t("pages_home.titulo_planos")}
          </h1>
          {/* Perfil Sections */}
          {renderPerfilSection(1)} {/* Candidato */}
          {renderPerfilSection(2)} {/* Recrutador */}
          {/* {renderPerfilSection(3)} Avaliador */}
        </div>
      </main>
    </div>
  );
}
