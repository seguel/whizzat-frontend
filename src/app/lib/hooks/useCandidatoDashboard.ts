"use client";

import { useCallback, useEffect, useState } from "react";
import { CandidatoDashboardResponse } from "../types/candidato-dashboard";

export function useCandidatoDashboard() {
  const [data, setData] = useState<CandidatoDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidato/dashboard`,
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

      const result: CandidatoDashboardResponse = await response.json();

      setData(result);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);

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
