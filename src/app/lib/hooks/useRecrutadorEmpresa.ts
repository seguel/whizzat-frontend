import { useEffect, useState } from "react";

type Perfil = "recrutador" | "avaliador" | "candidato";

interface RecrutadorResponse {
  id: number | null;
  usuario_id: number;
  redirect_to: string;
}

export function useRecrutadorEmpresa(perfil: Perfil) {
  const [userId, setUserId] = useState<number | null>(null);
  const [recrutadorId, setRecrutadorId] = useState<number | null>(null);
  const [hasPerfilRecrutador, setHasPerfilRecrutador] = useState(false);
  const [hasEmpresa, setHasEmpresa] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasRedirectPlano, setRedirectPlano] = useState("");

  const perfilId = perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

  useEffect(() => {
    const verificarHasPerfilRecrutador = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recrutador/check-hasperfil/${perfilId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data: RecrutadorResponse = await res.json();
        setUserId(data.usuario_id);
        setRedirectPlano(data.redirect_to);

        if (data.id != null) {
          setHasPerfilRecrutador(true);
          setRecrutadorId(data.id);
          await fetchVinculoEmpresa(data.id);
        } else {
          setHasPerfilRecrutador(false);
          setHasEmpresa(false);
        }
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
        setHasPerfilRecrutador(false);
        setHasEmpresa(false);
      } finally {
        setLoading(false);
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
          await res.json(); // se precisar armazenar os dados da empresa depois
          setHasEmpresa(true);
        }
      } catch (error) {
        console.error("Erro ao verificar vínculo:", error);
        setHasEmpresa(false);
      }
    };

    verificarHasPerfilRecrutador();
  }, [perfilId]);

  return {
    userId,
    recrutadorId,
    hasPerfilRecrutador,
    hasEmpresa,
    loading, // <- quem usa o hook decide se mostra "Carregando..."
    hasRedirectPlano,
  };
}
