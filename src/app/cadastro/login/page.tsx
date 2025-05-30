//"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isUserAuthenticated } from "../../lib/auth";
import LoginPage from "./LoginForm";

export default function LoginPageWrapper() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const check = async () => {
      const authenticated = await isUserAuthenticated();
      if (authenticated) {
        router.replace("/cadastro/perfil");
      } else {
        setCheckingAuth(false);
      }
    };

    check();
  }, [router]);

  if (checkingAuth) {
    return <p>Verificando autenticação...</p>; // ou loader visual
  }

  return <LoginPage />;
}
