import { ProfileType } from "@/app/components/perfil/ProfileContext";
import { useAvaliador } from "./useAvaliador";
import { useCandidato } from "./useCandidato";
import { useRecrutadorEmpresa } from "./useRecrutadorEmpresa";

export function usePerfil(perfil: ProfileType) {
  const avaliador = useAvaliador(perfil);
  const candidato = useCandidato(perfil);
  const recrutador = useRecrutadorEmpresa(perfil);

  switch (perfil) {
    case "avaliador":
      return {
        loading: avaliador.loading,
        hasPerfil: avaliador.hasPerfilAvaliador,
        hasRedirectPlano: avaliador.hasRedirectPlano,
      };

    case "recrutador":
      return {
        loading: recrutador.loading,
        hasPerfil: recrutador.hasPerfilRecrutador,
        hasRedirectPlano: recrutador.hasRedirectPlano,
      };

    default:
      return {
        loading: candidato.loading,
        hasPerfil: candidato.hasPerfilCandidato,
        hasRedirectPlano: candidato.hasRedirectPlano,
      };
  }
}
