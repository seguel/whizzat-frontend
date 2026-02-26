import { useEffect } from "react";
import Lista from "../../dashboard/especialista/lista";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useRecrutadorEmpresa } from "./useRecrutadorEmpresa";
import { useRouter } from "next/navigation";

interface Options {
  perfil: ProfileType;
}

export function useEspecialistaRouter({ perfil }: Options) {
  const router = useRouter();

  const {
    userId,
    recrutadorId,
    hasPerfilRecrutador,
    hasEmpresa,
    loading,
    hasRedirectPlano,
  } = useRecrutadorEmpresa(perfil);

  useEffect(() => {
    if (hasRedirectPlano) {
      router.push(hasRedirectPlano);
    }
  }, [hasRedirectPlano, router]);

  if (!userId || loading) {
    return {
      isLoading: true,
      componente: null,
    };
  }

  const isLoading =
    loading || (hasEmpresa === null && hasPerfilRecrutador === null);

  const componente = (
    <Lista
      perfil={perfil}
      recrutadorId={recrutadorId ?? null}
      hasPerfilRecrutador={hasPerfilRecrutador}
    />
  );

  return { isLoading, componente };
}
