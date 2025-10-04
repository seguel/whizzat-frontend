// import { useEffect, useState } from "react";
import EmpresaCriar from "../../dashboard/empresa/criar/criar";
import EmpresaListar from "../../dashboard/empresa/lista";
import EmpresaEditar from "../../dashboard/empresa/editar/[id]/editar";
import EmpresaDetalhe from "../../dashboard/empresa/detalhe/[id]/detalhe";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useAuthGuard } from "./useAuthGuard";
//import LoadingOverlay from "../../components/LoadingOverlay";
import { useRecrutadorEmpresa } from "./useRecrutadorEmpresa";

interface Options {
  perfil: ProfileType;
  op?: "N" | "E";
  id?: string;
  // rec?: string;
}

export function useEmpresaRouter({ perfil, op, id }: Options) {
  const isCadastro = op === "N";
  const isEdicao = op === "E" && id;

  const { isReady } = useAuthGuard("/cadastro/login");
  /*  const [hasPerfilRecrutador, setHasPerfilRecrutador] = useState<
    boolean | null
  >(null);
  const [hasEmpresa, setHasEmpresa] = useState<boolean | null>(false);
  const [userId, setUserId] = useState<string>(""); // <-- aqui */

  const { userId, recrutadorId, hasPerfilRecrutador, hasEmpresa, loading } =
    useRecrutadorEmpresa(perfil);

  /* useEffect(() => {
    const perfilId =
      perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    const verificarHasPerfilRecrutador = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recrutador/check-hasperfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include", // importante para enviar o cookie JWT
          }import EmpresaEditar from './../../dashboard/empresa/editar/[id]/page';

        );

        const data = await res.json();
        setUserId(data.usuario_id);
        if (data.id != null) {
          setHasPerfilRecrutador(true);
          fetchVinculoEmpresa(data.id); // se quiser armazenar o id
          // <-- usa state agora
        } else {
          setHasPerfilRecrutador(false);
        }
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
        setHasPerfilRecrutador(false);
      }
    };

    const fetchVinculoEmpresa = async (recrutadorId: number) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recrutador/vinculo-empresa/${recrutadorId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          setHasEmpresa(false);
        } else {
          const data = await res.json();
          console.log(data);

          setHasEmpresa(true);
        }
      } catch (error) {
        console.error("Erro ao verificar vínculo:", error);
        setHasEmpresa(false);
      }
    };
    verificarHasPerfilRecrutador();
  }, [perfil]); */

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
    />
  );

  return { isLoading, componente };
}
