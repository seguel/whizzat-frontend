// import { useEffect, useState } from "react";
import VagasDados from "../../dashboard/vagas/VagaDados";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useAuthGuard } from "./useAuthGuard";
import Vagas from "../../dashboard/vagas/ListaVagas";
import LoadingOverlay from "../../components/LoadingOverlay";
import VagaDetalhes from "./../../dashboard/vagas/VagaDetalhe";
import { useRecrutadorEmpresa } from "./useRecrutadorEmpresa";
import { useRouter } from "next/navigation"; // App Route

interface Options {
  perfil: ProfileType;
  op?: "N" | "E";
  vagaId?: string;
  empresaId?: string;
}

export function useVagasRouter({ perfil, op, vagaId, empresaId }: Options) {
  const router = useRouter();
  const isCadastro = op === "N";
  const isEdicao = op === "E" && vagaId;

  const { isReady } = useAuthGuard("/cadastro/login");
  const {
    userId,
    recrutadorId,
    hasPerfilRecrutador,
    hasEmpresa,
    loading,
    hasRedirectPlano,
  } = useRecrutadorEmpresa(perfil);

  if (hasRedirectPlano) router.push(hasRedirectPlano);

  // só renderiza depois que userId estiver definido
  if (!userId || loading) {
    return {
      isLoading: true,
      componente: <div>Carregando...</div>, // pode trocar por um loader/spinner
    };
  }

  // Cadastro ou edição de vaga
  if (isCadastro || isEdicao) {
    const isLoading = hasEmpresa === null || !isReady || loading;

    return {
      isLoading,
      componente: isLoading ? (
        <LoadingOverlay />
      ) : (
        <VagasDados
          perfil={perfil}
          hasEmpresa={hasEmpresa}
          empresaId={empresaId ?? null}
          vagaId={vagaId ?? null}
          userId={userId}
          recrutadorId={recrutadorId}
        />
      ),
    };
  }

  // Visualização de lista de vagas
  const isLoading =
    !isReady ||
    loading ||
    (hasEmpresa === null && hasPerfilRecrutador === null);

  const componente = isLoading ? (
    <LoadingOverlay />
  ) : vagaId ? (
    <VagaDetalhes
      perfil={perfil}
      vagaId={vagaId}
      empresaId={empresaId ?? null}
    />
  ) : (
    <>
      <Vagas
        perfil={perfil}
        hasEmpresa={hasEmpresa}
        hasPerfilRecrutador={hasPerfilRecrutador}
        recrutadorId={recrutadorId}
      />
    </>
  );

  return { isLoading, componente };
}
