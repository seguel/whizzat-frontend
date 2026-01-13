"use client";
import { useState } from "react";
import Header from "../components/header/header";
// import { useTranslation } from "react-i18next";
// import LoadingOverlay from "../components/LoadingOverlay";
import PlansByPerfil from "../components/perfil/PlansByPerfil";
/* 
interface PlanCardProps {
  title: string;
  description: string;
  oldPrice: string;
  price: string;
  monthLabel: string;
  total: string;
  discount: string;
  features: string[];
  buttonColor: "blue" | "yellow";
  highlight?: boolean;
} */
/* 
interface Periodo {
  id: number;
  periodo: string;
  validade_dias: number;
  valor: string;
  perfil_id: number;
  valor_old: string;
  desconto: string;
} */

// interface PlanoData {
//   id: number;
//   plano: string;
//   descricao: string;
//   periodos: Periodo[];
// }

export default function PlansPage() {
  /* const { i18n } = useTranslation("common");
  const [loadingPlano, setLoadingPlano] = useState(false); */
  const [planoSelecionado, setPlanoSelecionado] = useState<number | null>(null);

  const perfilMap: Record<number, { nome: string; cor: string }> = {
    1: { nome: "Candidato", cor: "#22c55e" }, // verde
    2: { nome: "Recrutador", cor: "#7c3aed" }, // roxo
    // 3: { nome: "Avaliador", cor: "#3b82f6" }, // azul
  };

  /* useEffect(() => {
    const fetchSelectData = async () => {
      setLoadingPlano(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planos/`, {
          headers: { "Accept-Language": i18n.language },
        });
        const data: PlanoData[] = await res.json();
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPlano(false);
      }
    };
    fetchSelectData();
  }, [i18n.language]); */

  // if (loadingPlano) return <LoadingOverlay />;

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
          {perfil.nome}
        </div>

        {/* Grid dos planos */}
        <div className="flex flex-wrap justify-center gap-6 py-8">
          <PlansByPerfil
            perfil={perfil.nome.toLowerCase()}
            selectedPlanoId={planoSelecionado}
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
            Nossos Planos
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
