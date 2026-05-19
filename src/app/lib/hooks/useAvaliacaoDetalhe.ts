import { useEffect, useState } from "react";

export function useAvaliacaoDetalhe(id: string) {
  const [avaliacao, setAvaliacao] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/avaliador/avaliacao/${id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!res.ok) {
          console.error("Erro na API:", res.status);
          throw new Error("Erro ao buscar avaliação");
        }

        const data = await res.json();
        // console.log("DATA:", data);

        setAvaliacao(data);
      } catch (err) {
        console.error("Erro ao buscar avaliação", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  return { avaliacao, loading };
}
