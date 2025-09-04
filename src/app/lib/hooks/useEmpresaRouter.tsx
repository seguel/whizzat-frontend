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
  const [hasEmpresa, setHasEmpresa] = useState<boolean | null>(false);
  const [userId, setUserId] = useState<string>(""); // <-- aqui

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

        setUserId(data.usuario_id); // <-- usa state agora
        setHasEmpresa(data.empresas.length > 0);
      } catch (error) {
        console.error("Erro ao verificar vínculo:", error);
        setHasEmpresa(false);
      }
    };

    fetchVinculo();
  }, [perfil]);

  // só renderiza depois que userId estiver definido
  if (!userId) {
    return {
      isLoading: true,
      componente: <div>Carregando...</div>, // pode trocar por um loader/spinner
    };
  }

  if (isCadastro || isEdicao || !hasEmpresa) {
    return {
      isLoading: false,
      componente: (
        <EmpresaDados perfil={perfil} empresaId={id ?? null} userId={userId} />
      ),
    };
  }

  const isLoading = !isReady || hasEmpresa === null;

  const componente = hasEmpresa ? (
    <Empresa perfil={perfil} empresaId={id ?? null} />
  ) : (
    <EmpresaDados perfil={perfil} userId={userId} />
  );

  return { isLoading, componente };
}
