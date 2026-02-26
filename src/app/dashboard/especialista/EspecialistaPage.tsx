"use client";

import {
  ProfileProvider,
  ProfileType,
} from "../../components/perfil/ProfileContext";
import { useEspecialistaRouter } from "../../lib/hooks/useEspecialistaRouter";
import LoadingOverlay from "../../components/LoadingOverlay";

interface Props {
  perfil: ProfileType;
}

export default function EspecialistaPage({ perfil }: Props) {
  const { isLoading, componente } = useEspecialistaRouter({ perfil });

  if (isLoading) return <LoadingOverlay />;

  return (
    <ProfileProvider initialProfile={perfil}>{componente}</ProfileProvider>
  );
}
