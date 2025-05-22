"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthRedirect = (redirectIfAuthenticatedTo = "/dashboard") => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");

      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/auth/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          router.push(redirectIfAuthenticatedTo);
        } else {
          Cookies.remove("token"); // token inválido
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        Cookies.remove("token");
      }
    };

    checkAuth();
  }, [router, redirectIfAuthenticatedTo]);
};
