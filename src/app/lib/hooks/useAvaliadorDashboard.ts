"use client";

import { useCallback, useEffect, useState } from "react";
import { AvaliadorDashboardResponse } from "../types/avaliador-dashboard";

export function useAvaliadorDashboard() {
  const [data, setData] = useState<AvaliadorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avaliador/dashboard`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar dashboard");
      }

      const result: AvaliadorDashboardResponse = await response.json();

      setData(result);
    } catch (err) {
      console.error("Erro ao carregar dashboard do avaliador:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

  return {
    data,
    loading,
    error,
    refetch: carregarDashboard,
  };
}
