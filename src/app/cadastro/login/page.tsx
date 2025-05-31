"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isUserAuthenticated } from "../../lib/auth";
import LoginPage from "./LoginForm";

export default function Page() {
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

  if (loading) return null; // ou <LoadingSpinner />

  return <LoginPage />;
}
