import { useEffect, useState } from "react";
import EmpresaDados from "../../dashboard/empresa_dados/EmpresaDados";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useAuthGuard } from "./useAuthGuard";
//import LoadingOverlay from "../../components/LoadingOverlay";
import Empresa from "../../dashboard/empresa_dados/Empresa";

interface Options {
  perfil: ProfileType;
  op?: "N" | "E";
  id?: string;
}

export function useEmpresaRouter({ perfil, op, id }: Options) {
  const isCadastro = op === "N";
  const isEdicao = op === "E" && id;

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
      componente: <EmpresaDados perfil={perfil} empresaId={id ?? null} />,
    };
  }

  const isLoading = !isReady || hasEmpresa === null;

  const componente = hasEmpresa ? (
    <Empresa perfil={perfil} />
  ) : (
    <EmpresaDados perfil={perfil} />
  );

  return { isLoading, componente };
}
