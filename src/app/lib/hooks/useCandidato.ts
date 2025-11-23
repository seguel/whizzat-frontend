import { useEffect, useState } from "react";

type Perfil = "recrutador" | "avaliador" | "candidato";

/* interface RecrutadorResponse {
  id: number | null;
  usuario_id: number;
} */

export function useCandidato(perfil: Perfil) {
  const [userId, setUserId] = useState<number | null>(null);
  const [candidatoId, setCandidatoId] = useState<number | null>(null);
  const [hasPerfilCandidato, setHasPerfilCandidato] = useState(false);
  const [loading, setLoading] = useState(true);

  const perfilId = 1;

  useEffect(() => {
    const verificarHasPerfilCandidato = async () => {
      setLoading(true);
      console.log(perfil);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/candidato/check-hasperfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();
        // console.log(data);

        setUserId(data.usuario_id);

        if (data.id != null) {
          setHasPerfilCandidato(true);
          setCandidatoId(data.id);
        } else {
          setHasPerfilCandidato(false);
          // setHasEmpresa(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
        setHasPerfilCandidato(false);
        // setHasEmpresa(false);
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
    loading,
  };
}
