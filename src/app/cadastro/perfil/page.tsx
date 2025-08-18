"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "../../lib/hooks/useAuthGuard";
import PerfilForm from "./PerfilForm";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useRouter } from "next/navigation";

function useVerificarPerfil() {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/check-perfil`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Falha ao buscar perfil");

        const data = await res.json();
        const url = data.redirect_to;
        setRedirectTo(url); // pode ser "" ou "/dashboard?perfil=..."
      } catch (error) {
        console.error("Erro ao verificar vínculo:", error);
        setRedirectTo(""); // assume sem perfil
      }
    };

    fetchPerfil();
  }, []);

  return redirectTo;
}

export default function PerfilPage() {
  const router = useRouter();
  const { isReady } = useAuthGuard("/cadastro/login");
  const redirectTo = useVerificarPerfil();

  // Redireciona automaticamente se houver perfil
  useEffect(() => {
    if (redirectTo && redirectTo !== "") {
      router.push(redirectTo);
    }
  }, [redirectTo, router]);

  const isLoading =
    !isReady ||
    redirectTo === null ||
    (redirectTo !== "" && redirectTo !== null);

  if (isLoading) return <LoadingOverlay />;

  // Só mostra o formulário se a verificação foi feita e não há redirecionamento
  return <PerfilForm />;
}
