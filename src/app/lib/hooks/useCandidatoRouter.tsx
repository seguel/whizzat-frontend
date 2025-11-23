import { useEffect, useState } from "react";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useAuthGuard } from "./useAuthGuard";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useCandidato } from "./useCandidato";

// interface Options {
//   perfil: ProfileType;
// }

// interface CandidatoResponse {
//   id: number | null;
//   usuario_id: number;
// }

export function useCandidatoRouter() {
  const [userId, setUserId] = useState<number | null>(null);
  const [candidatoId, setCandidatoId] = useState<number | null>(null);
  const [hasPerfilCandidato, setHasPerfilCandidato] = useState(false);
  const [loading, setLoading] = useState(true);

  const perfilId = 1;

  useEffect(() => {
    const verificarHasPerfilCandidato = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/candidato/check-hasperfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();
        setUserId(data.usuario_id);

        if (data.id != null) {
          setHasPerfilCandidato(true);
          setCandidatoId(data.id);
        } else {
          setHasPerfilCandidato(false);
        }
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
        setHasPerfilCandidato(false);
      } finally {
        setLoading(false);
      }
    };

    verificarHasPerfilCandidato();
  }, [perfilId]);

  return {
    userId,
    candidatoId,
    hasPerfilCandidato,
    loading, // <- quem usa o hook decide se mostra "Carregando..."
  };
}
