import { useEffect, useState } from "react";

type Questionario = {
  id: number;
  titulo: string;
};

export function useQuestionarios(avaliadorId: number) {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/avaliador/questionarios/${avaliadorId}`,
          {
            credentials: "include",
          },
        );

        if (!res.ok) {
          throw new Error("Erro ao buscar questionários");
        }

        const data = await res.json();

        setQuestionarios(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { questionarios, loading };
}
