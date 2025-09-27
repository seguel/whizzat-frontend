"use client";

import {
  ProfileProvider,
  ProfileType,
} from "../../components/perfil/ProfileContext";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useEmpresaRouter } from "../../lib/hooks/useEmpresaRouter";

interface Props {
  perfil: ProfileType;
  op?: "N" | "E";
  id?: string;
  // rec?: string;
}

export default function Middleware({ perfil, op, id }: Props) {
  const { isLoading, componente } = useEmpresaRouter({ perfil, op, id });

  if (isLoading) return <LoadingOverlay />;

  return (
    <ProfileProvider initialProfile={perfil}>{componente}</ProfileProvider>
  );
}
