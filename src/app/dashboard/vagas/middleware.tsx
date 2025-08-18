"use client";

import {
  ProfileProvider,
  ProfileType,
} from "../../components/perfil/ProfileContext";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useVagasRouter } from "../../lib/hooks/useVagasRouter";

interface Props {
  perfil: ProfileType;
  op?: "N" | "E";
  vagaId?: string;
  empresaId?: string;
}

export default function Middleware({ perfil, op, vagaId, empresaId }: Props) {
  const { isLoading, componente } = useVagasRouter({
    perfil,
    op,
    vagaId,
    empresaId,
  });

  if (isLoading) return <LoadingOverlay />;

  return (
    <ProfileProvider initialProfile={perfil}>{componente}</ProfileProvider>
  );
}
