"use client";

import {
  ProfileProvider,
  ProfileType,
} from "../../../components/perfil/ProfileContext";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { useCandidatoRouter } from "../../../lib/hooks/useCandidatoRouter";
import { useAuthGuard } from "../../../lib/hooks/useAuthGuard";
import Vagas from "./ListaVagas";
import VagaDetalhes from "./VagaDetalhe";
import { useRouter } from "next/navigation"; // App Router

interface Props {
  perfil: ProfileType;
  vaga?: string | null;
  emp?: string | undefined;
}

export default function Middleware({ perfil, vaga, emp }: Props) {
  const router = useRouter();
  const { isReady } = useAuthGuard("/cadastro/login");
  const { loading, userId, candidatoId, hasPerfilCandidato, hasRedirectPlano } =
    useCandidatoRouter();

  if (!isReady || loading || !userId) return <LoadingOverlay />;

  if (hasRedirectPlano) {
    router.push(hasRedirectPlano);
    return null;
  }

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
