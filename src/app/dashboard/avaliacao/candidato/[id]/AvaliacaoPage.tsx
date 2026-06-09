"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../../../components/perfil/Sidebar";
import TopBar from "../../../../components/perfil/TopBar";
import LoadingOverlay from "../../../../components/LoadingOverlay";
// import { useTranslation } from "react-i18next";
import { ProfileType } from "../../../../components/perfil/ProfileContext";
import PageContainer from "@/app/components/PageContainer";

import AvaliacaoHeader from "./components/AvaliacaoHeader";
import CardQuestionarioRespostas from "./components/CardQuestionarioRespostas";
import { AvaliacaoDetalheDTO } from "../dto/AvaliacaoDetalheDTO";

interface Props {
  perfil: ProfileType;
  id: string;
}

export default function AvaliacaoPage({ perfil, id }: Props) {
  // const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [avaliacao, setAvaliacao] = useState<AvaliacaoDetalheDTO | null>(null);

  useEffect(() => {
    fetchAvaliacao();
  }, []);

  const fetchAvaliacao = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidato/avaliacao/${id}/detalhe`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Erro ao carregar avaliação");
      }

      const data = await res.json();

      setAvaliacao(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 bg-[#F5F6F6] overflow-hidden">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!avaliacao ? (
          <div className="flex-1 flex items-center justify-center">
            Avaliação não encontrada.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <PageContainer>
              <div className="space-y-6">
                <AvaliacaoHeader avaliacao={avaliacao} />

                {avaliacao?.data_resposta_questionario && (
                  <CardQuestionarioRespostas
                    respostas={avaliacao.respostas}
                    titulo={avaliacao.questionario_titulo}
                  />
                )}
              </div>
            </PageContainer>
          </div>
        )}
      </div>
    </div>
  );
}
