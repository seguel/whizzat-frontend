import { useEffect, useState } from "react";
import VagasDados from "../../dashboard/vagas/VagaDados";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useAuthGuard } from "./useAuthGuard";
import Vagas from "../../dashboard/vagas/ListaVagas";
import LoadingOverlay from "../../components/LoadingOverlay";

interface Options {
  perfil: ProfileType;
  op?: "N" | "E";
  vagaId?: string;
  empresaId?: string;
}

export function useVagasRouter({ perfil, op, vagaId, empresaId }: Options) {
  const isCadastro = op === "N";
  const isEdicao = op === "E" && vagaId;

  const { isReady } = useAuthGuard("/cadastro/login");
  const [hasEmpresa, setHasEmpresa] = useState<boolean | null>(null);

  // Busca se há empresa vinculada ao perfil
  useEffect(() => {
    const perfilId =
      perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    const fetchVinculo = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/vinculo/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();
        setHasEmpresa(data.length > 0);
      } catch (error) {
        console.error("Erro ao verificar vínculo:", error);
        setHasEmpresa(false);
      }
    };

    fetchVinculo();
  }, [perfil]);

  // Cadastro ou edição de vaga
  if (isCadastro || isEdicao) {
    const isLoading = hasEmpresa === null || !isReady;

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
        />
      ),
    };
  }

  // Visualização de lista de vagas
  const isLoading = !isReady || hasEmpresa === null;

  const componente = isLoading ? (
    <LoadingOverlay />
  ) : (
    <Vagas perfil={perfil} hasEmpresa={hasEmpresa} />
  );

  return { isLoading, componente };
}
