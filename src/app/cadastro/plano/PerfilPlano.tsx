"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import PlansByPerfil from "../../components/perfil/PlansByPerfil";
import LogoutButton from "../../components/perfil/logoutButton";

type PerfilKey = "candidato" | "recrutador" | "avaliador";

// const profiles = {
//   candidato: { ilustracao: "/assets/imagem_perfil.png" },
//   recrutador: { ilustracao: "/assets/imagem_perfil.png" },
//   avaliador: { ilustracao: "/assets/imagem_perfil.png" },
// } as const;

type PeriodType = "monthly" | "yearly";

interface PlanoSelecionado {
  planoPeriodoId: number;
  nomePlano: string;
  valor: string;
  period: PeriodType;
}

export default function PerfilPlanoPage({ perfil }: { perfil: PerfilKey }) {
  const { t } = useTranslation("common");
  const router = useRouter();

  const [planoSelecionado, setPlanoSelecionado] =
    useState<PlanoSelecionado | null>(null);
  const [openPagamento, setOpenPagamento] = useState(false);

  // const cor = t(`perfil.selecionado_${perfil}_cor`);
  const cor_css = t(`perfil.selecionado_${perfil}_cor_css`);

  // const borderClass = `border-${cor_css}-400`;
  const bgClass = `bg-${cor_css}-200 cursor-pointer`;
  // const textClass = `text-${cor_css}-300`;
  // const hoverTextClass = `hover:text-${cor_css}-300`;
  const hoverBgClass = `hover:bg-${cor_css}-400`;

  const inserePlano = async (planoPeriodoId: number, token_pagto: string) => {
    const perfilId =
      perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planos/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perfilId,
          planoPeriodoId,
          token_pagto,
        }),
      });

      if (!res.ok) throw new Error("Erro ao gravar o plano");
      // console.log(await res.json());

      router.push(`/dashboard?perfil=${perfil}`);
    } catch (err) {
      console.error(err);
    }
  };

  const onPagamentoSucesso = async () => {
    if (!planoSelecionado) return;

    const token = crypto.randomUUID();

    await inserePlano(planoSelecionado.planoPeriodoId, token);

    setOpenPagamento(false);
  };

  const handleCancel = () => {
    // Redireciona com segurança, evitando id indefinido
    const url = `/cadastro/login`;

    router.push(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="w-full sticky top-0 z-50 bg-gray-100 px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/">
            <img
              src="/assets/logofull_whizzat.png"
              alt="Logo"
              className="h-10"
            />
          </Link>
          <LogoutButton color={cor_css} />
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 py-6 items-center">
        <div className="max-w-7xl w-full flex flex-col gap-8 items-center">
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-800">
            {t(`perfil.selecionado_${perfil}_titulo`)}
          </h1>

          <p className="text-gray-700">{t(`planos.titulo`)}</p>

          <PlansByPerfil
            perfil={perfil}
            selectedPlanoId={planoSelecionado?.planoPeriodoId}
            onSelect={setPlanoSelecionado}
            exibirBotao={true}
          />
          <div className="flex justify-end">
            <button
              type="button" // evita submit acidental
              onClick={handleCancel}
              className={`w-full md:w-32 py-2 rounded-full font-semibold text-indigo-900 ${bgClass} ${hoverBgClass} cursor-pointer mr-3`}
            >
              {t("tela_empresa_dados.item_botao_cancelar")}
            </button>
            <button
              disabled={!planoSelecionado}
              onClick={() => setOpenPagamento(true)}
              className={`px-8 py-2 rounded-full font-semibold transition ${
                planoSelecionado
                  ? `${bgClass} ${hoverBgClass}`
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {t("perfil.btn_avancar")}
            </button>
          </div>
        </div>
      </main>

      {/* Modal de Pagamento */}
      {openPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Pagamento</h2>
            <p className="mb-6">
              <strong>Plano:</strong> {planoSelecionado?.nomePlano} <br />
              <strong>Valor:</strong> {planoSelecionado?.valor} <br />
              <strong>Período:</strong>{" "}
              {planoSelecionado?.period === "monthly" ? "Mensal" : "Anual"}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onPagamentoSucesso}
                className="px-6 py-2 bg-green-600 text-white rounded-lg cursor-pointer"
              >
                Confirmar pagamento
              </button>
              <button
                onClick={() => setOpenPagamento(false)}
                className="px-6 py-2 bg-gray-300 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
