"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isUserAuthenticated } from "../../lib/auth";
import LoginPage from "./LoginForm";
import LoadingSpinner from "../../components/LoadingSpinner";

// Componente que lida com a lógica usando useSearchParams
function AuthCheck() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/cadastro/perfil";

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const authenticated = await isUserAuthenticated();
      if (authenticated) {
        router.replace(redirectTo);
      } else {
        setLoading(false);
      }
    };

    check();
  }, [router, redirectTo]);

  if (loading) return null; // Ou um componente de carregamento

  return <LoginPage />;
}

// Componente exportado com Suspense
export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthCheck />
    </Suspense>
  );
}
