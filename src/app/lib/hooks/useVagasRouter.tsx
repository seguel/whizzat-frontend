import { useEffect, useState } from "react";
import VagasDados from "../../dashboard/vagas/VagaDados";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useAuthGuard } from "./useAuthGuard";
import Vagas from "../../dashboard/vagas/ListaVagas";

interface Options {
  perfil: ProfileType;
  op?: "N" | "E";
  vagaId: string;
  empresaId?: string;
}

export function useVagasRouter({ perfil, op, vagaId, empresaId }: Options) {
  const isCadastro = op === "N";
  const isEdicao = op === "E" && vagaId;

  const { isReady } = useAuthGuard("/cadastro/login");
  const [hasEmpresa, setHasEmpresa] = useState<boolean | null>(null);

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

  if (isCadastro || isEdicao) {
    return {
      isLoading: false,
      componente: (
        <VagasDados
          perfil={perfil}
          hasEmpresa={hasEmpresa}
          empresaId={empresaId ?? null}
          vagaId={vagaId ?? null}
        />
      ),
    };
  }

  const isLoading = !isReady || hasEmpresa === null;

  const componente = <Vagas perfil={perfil} hasEmpresa={hasEmpresa} />;

  return { isLoading, componente };
}
