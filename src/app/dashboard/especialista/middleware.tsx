"use client";

import {
  ProfileProvider,
  ProfileType,
} from "../../components/perfil/ProfileContext";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useEspecialistaRouter } from "../../lib/hooks/useEspecialistaRouter";

interface Props {
  perfil: ProfileType;
}

export default function Middleware({ perfil }: Props) {
  const { isLoading, componente } = useEspecialistaRouter({ perfil });

  if (isLoading) return <LoadingOverlay />;

  return (
    <ProfileProvider initialProfile={perfil}>{componente}</ProfileProvider>
  );
}
