"use client";
import { useEffect, useState } from "react";
import {
  ProfileProvider,
  ProfileType,
} from "../../components/perfil/ProfileContext";
// import PerfilCandidato from "./PerfilCandidato";
import PerfilRecrutador from "./PerfilRecrutador";
// import PerfilAvaliador from "./PerfilAvaliador";
import PerfilWrapper from "../../components/PageWrapper";
import { useAuthGuard } from "../../lib/hooks/useAuthGuard";
import LoadingOverlay from "../../components/LoadingOverlay";

interface Props {
  perfil: ProfileType;
  //op?: "N" | "E";
  id?: string | null;
}

export default function PerfilPage({ perfil, id }: Props) {
  const { isReady } = useAuthGuard("/cadastro/login");
  const [userId, setUserId] = useState<string>("");
  const [recrutadorId, setRecrutadorId] = useState<string>("");

  useEffect(() => {
    const perfilId =
      perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    const verificarHasPerfilRecrutador = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recrutador/check-hasperfil-cadastro/${perfilId}`,
          {
            method: "GET",
            credentials: "include", // importante para enviar o cookie JWT
          }
        );

        const data = await res.json();
        setUserId(data.usuario_id);
        setRecrutadorId(data.id);
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
      }
    };

    verificarHasPerfilRecrutador();
  }, [perfil]);

  if (!isReady || !userId) return <LoadingOverlay />;

  return (
    <ProfileProvider initialProfile={perfil}>
      <PerfilWrapper>
        {/* {perfil === "candidato" && <PerfilCandidato perfil={perfil} />} */}
        {perfil === "recrutador" && (
          <PerfilRecrutador
            perfil={perfil}
            userId={userId}
            recrutadorId={id ?? recrutadorId ?? null}
          />
        )}
        {/* {perfil === "avaliador" && <PerfilAvaliador perfil={perfil} />} */}
      </PerfilWrapper>
    </ProfileProvider>
  );
}
