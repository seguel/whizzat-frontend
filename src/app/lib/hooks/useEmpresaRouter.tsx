// import { useEffect, useState } from "react";
import EmpresaCriar from "../../dashboard/empresa/criar/criar";
import EmpresaListar from "../../dashboard/empresa/lista";
import EmpresaEditar from "../../dashboard/empresa/editar/[id]/editar";
import EmpresaDetalhe from "../../dashboard/empresa/detalhe/[id]/detalhe";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useAuthGuard } from "./useAuthGuard";
//import LoadingOverlay from "../../components/LoadingOverlay";
import { useRecrutadorEmpresa } from "./useRecrutadorEmpresa";
import { useRouter } from "next/navigation"; // App Route

interface Options {
  perfil: ProfileType;
  op?: "N" | "E";
  id?: string;
  // rec?: string;
}

export function useEmpresaRouter({ perfil, op, id }: Options) {
  const router = useRouter();
  const isCadastro = op === "N";
  const isEdicao = op === "E" && id;

  const { isReady } = useAuthGuard("/cadastro/login");
  /*  const [hasPerfilRecrutador, setHasPerfilRecrutador] = useState<
    boolean | null
  >(null);
  const [hasEmpresa, setHasEmpresa] = useState<boolean | null>(false);
  const [userId, setUserId] = useState<string>(""); // <-- aqui */

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

  if ((isCadastro || !hasEmpresa) && hasPerfilRecrutador) {
    return {
      isLoading: false,
      componente: (
        <EmpresaCriar
          perfil={perfil}
          userId={userId}
          recrutadorId={String(recrutadorId) ?? null}
          hasPerfilRecrutador={hasPerfilRecrutador}
        />
      ),
    };
  } else if (isEdicao && hasPerfilRecrutador) {
    return {
      isLoading: false,
      componente: (
        <EmpresaEditar
          perfil={perfil}
          empresaId={id ?? null}
          userId={userId}
          recrutadorId={String(recrutadorId) ?? null}
          hasPerfilRecrutador={hasPerfilRecrutador}
        />
      ),
    };
  }

  const isLoading =
    !isReady ||
    loading ||
    (hasEmpresa === null && hasPerfilRecrutador === null);

  const componente = hasEmpresa ? (
    id ? (
      <EmpresaDetalhe
        perfil={perfil}
        empresaId={id ?? null}
        recrutadorId={String(recrutadorId) ?? null}
        hasPerfilRecrutador={hasPerfilRecrutador}
      />
    ) : (
      <EmpresaListar
        perfil={perfil}
        recrutadorId={recrutadorId ? String(recrutadorId) : null}
        hasPerfilRecrutador={hasPerfilRecrutador}
      />
    )
  ) : (
    <EmpresaCriar
      perfil={perfil}
      userId={userId}
      recrutadorId={recrutadorId ? String(recrutadorId) : null}
      hasPerfilRecrutador={hasPerfilRecrutador}
    />
  );

  return { isLoading, componente };
}
