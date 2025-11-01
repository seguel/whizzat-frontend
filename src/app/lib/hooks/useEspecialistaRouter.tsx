// import { useEffect, useState } from "react";
import Lista from "../../dashboard/especialista/lista";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useAuthGuard } from "./useAuthGuard";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useRecrutadorEmpresa } from "./useRecrutadorEmpresa";

interface Options {
  perfil: ProfileType;
}

export function useEspecialistaRouter({ perfil }: Options) {
  const { isReady } = useAuthGuard("/cadastro/login");
  const { userId, recrutadorId, hasPerfilRecrutador, hasEmpresa, loading } =
    useRecrutadorEmpresa(perfil);

  // só renderiza depois que userId estiver definido
  if (!userId || loading) {
    return {
      isLoading: true,
      componente: <div>Carregando...</div>, // pode trocar por um loader/spinner
    };
  }

  // Visualização de lista de vagas
  const isLoading =
    !isReady ||
    loading ||
    (hasEmpresa === null && hasPerfilRecrutador === null);

  const componente = isLoading ? (
    <LoadingOverlay />
  ) : (
    <Lista
      perfil={perfil}
      recrutadorId={recrutadorId ?? null}
      hasPerfilRecrutador={hasPerfilRecrutador}
    />
  );

  return { isLoading, componente };
}
