import { useEffect, useState } from "react";

type Perfil = "recrutador" | "avaliador" | "candidato";

/* interface RecrutadorResponse {
  id: number | null;
  usuario_id: number;
} */

export function useAvaliador(perfil: Perfil) {
  const [userId, setUserId] = useState<number | null>(null);
  const [avaliadorId, setAvaliadorId] = useState<number | null>(null);
  const [hasPerfilAvaliador, setHasPerfilAvaliador] = useState(false);
  //const [hasEmpresa, setHasEmpresa] = useState(false);
  const [loading, setLoading] = useState(true);

  const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

  useEffect(() => {
    const verificarHasPerfilAvaliador = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/avaliador/check-hasperfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();
        setUserId(data.usuario_id);

        if (data.id != null) {
          setHasPerfilAvaliador(true);
          setAvaliadorId(data.id);
        } else {
          setHasPerfilAvaliador(false);
          // setHasEmpresa(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
        setHasPerfilAvaliador(false);
        // setHasEmpresa(false);
      } finally {
        setLoading(false);
      }
    };

    verificarHasPerfilAvaliador();
  }, [perfilId]);

  return {
    userId,
    avaliadorId,
    hasPerfilAvaliador,
    loading,
  };
}
