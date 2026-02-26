"use client";

import { useEffect } from "react";
import {
  ProfileProvider,
  ProfileType,
} from "../../../components/perfil/ProfileContext";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { useCandidatoRouter } from "../../../lib/hooks/useCandidatoRouter";
import Vagas from "./ListaVagas";
import VagaDetalhes from "./VagaDetalhe";
import { useRouter } from "next/navigation"; // App Router

interface Props {
  perfil: ProfileType;
  vaga?: string | null;
  emp?: string | undefined;
}

export default function CandidatoPage({ perfil, vaga, emp }: Props) {
  const router = useRouter();
  const { loading, userId, candidatoId, hasPerfilCandidato, hasRedirectPlano } =
    useCandidatoRouter();

  useEffect(() => {
    if (hasRedirectPlano) {
      router.push(hasRedirectPlano);
    }
  }, [hasRedirectPlano, router]);

  if (loading || !userId) return <LoadingOverlay />;

  const componente = vaga ? (
    <VagaDetalhes
      perfil={perfil}
      empresaId={emp}
      candidatoId={candidatoId}
      vagaId={vaga}
    />
  ) : (
    <Vagas
      perfil={perfil}
      hasPerfilCandidato={hasPerfilCandidato}
      candidatoId={candidatoId}
    />
  );

  return (
    <ProfileProvider initialProfile={perfil}>{componente}</ProfileProvider>
  );
}
