"use client";

import { useState } from "react";
import Sidebar from "../../../components/perfil/Sidebar";
import TopBar from "../../../components/perfil/TopBar";
import LoadingOverlay from "../../../components/LoadingOverlay";
// import { useTranslation } from "react-i18next";
import { ProfileType } from "../../../components/perfil/ProfileContext";
import PageContainer from "@/app/components/PageContainer";

import AvaliacaoHeader from "./components/AvaliacaoHeader";
import AvaliacaoTimeline from "./components/AvaliacaoTimeline";
import CardFinalizarAvaliacao from "./components/AvaliacaoFinalizar";
import CardQuestionario from "./components/CardQuestionario";
import CardAgenda from "./components/CardAgenda";

import { useAvaliador } from "../../../lib/hooks/useAvaliador";
import { useAvaliacaoDetalhe } from "../../../lib/hooks/useAvaliacaoDetalhe";
import SemDados from "../../SemDados";

interface Props {
  perfil: ProfileType;
  id: string;
}

/* function podeAgendar(status: string, naoEnviar: boolean) {
  if (status === "convite_aceito" && naoEnviar) return true;

  return [
    "questionario_enviado",
    "questionario_respondido",
    "agenda_marcada",
    "entrevista_realizada",
    "avaliacao_finalizada",
  ].includes(status);
} */

export default function AvaliacaoPage({ perfil, id }: Props) {
  const { hasPerfilAvaliador, avaliadorId, loading } = useAvaliador(perfil);

  // const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [naoEnviarQuestionario, setNaoEnviarQuestionario] = useState(false);
  const [entrevistaRealizada, setEntrevistaRealizada] = useState(false);

  const { avaliacao, loading: loadingAvaliacao } = useAvaliacaoDetalhe(id);

  // console.log(avaliacao);

  if (loading || loadingAvaliacao) return <LoadingOverlay />;

  const podeAgendar =
    avaliacao.pode_agendar &&
    (naoEnviarQuestionario || avaliacao.data_envio_formulario);

  //if (avaliacao.status == "FINALIZADO") setEntrevistaRealizada(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 bg-[#F5F6F6] overflow-hidden">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />
        {!hasPerfilAvaliador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <PageContainer>
              <div className="space-y-6">
                <AvaliacaoHeader avaliacao={avaliacao} />

                <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr_1.6fr] gap-4 items-start">
                  <AvaliacaoTimeline status={avaliacao.status} />

                  <CardQuestionario
                    naoEnviar={naoEnviarQuestionario}
                    setNaoEnviar={setNaoEnviarQuestionario}
                    avaliacaoId={id}
                    avaliadorId={avaliadorId ?? 0}
                    questionarioEnviadoId={avaliacao.questionario_id}
                    questionarioEnviadoTitulo={avaliacao.questionario_titulo}
                    dataEnvioFormulario={avaliacao.data_envio_formulario}
                  />

                  <CardAgenda
                    habilitado={podeAgendar}
                    avaliacaoId={id}
                    agenda={avaliacao.agenda}
                    status={avaliacao.status}
                    entrevistaRealizada={entrevistaRealizada}
                    setEntrevistaRealizada={setEntrevistaRealizada}
                  />
                </div>

                {/* <AvaliacaoActions avaliacao={avaliacao} /> */}
              </div>

              <CardFinalizarAvaliacao
                habilitado={entrevistaRealizada}
                avaliacaoId={id}
                avaliadorId={avaliadorId ?? 0}
                status={avaliacao.status}
                peso_av={avaliacao.peso_avaliador ?? 50}
                comentario_av={avaliacao.comentario}
              />
            </PageContainer>
          </div>
        )}
      </div>
    </div>
  );
}
