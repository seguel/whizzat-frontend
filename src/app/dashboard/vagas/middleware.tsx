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
  id?: string;
}

export default function Middleware({ perfil, op, id }: Props) {
  const { isLoading, componente } = useVagasRouter({ perfil, op, id });

  if (isLoading) return <LoadingOverlay />;

  return (
    <ProfileProvider initialProfile={perfil}>{componente}</ProfileProvider>
  );
}
