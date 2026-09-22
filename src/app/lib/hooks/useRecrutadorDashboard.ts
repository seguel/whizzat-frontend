"use client";

import { useCallback, useEffect, useState } from "react";
import { RecrutadorDashboardResponse } from "../types/recrutador-dashboard";

export function useRecrutadorDashboard() {
  const [data, setData] = useState<RecrutadorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recrutador/dashboard`,
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

      const result: RecrutadorDashboardResponse = await response.json();

      setData(result);
    } catch (err) {
      console.error("Erro ao carregar dashboard do recrutador:", err);

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
