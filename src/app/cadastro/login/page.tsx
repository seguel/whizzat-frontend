"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isUserAuthenticated } from "../../lib/auth";
import LoginPage from "./LoginForm";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const authenticated = await isUserAuthenticated();
      if (authenticated) {
        router.replace("/cadastro/perfil");
      } else {
        setLoading(false);
      }
    };

    check();
  }, [router]);

  if (loading) return null; // ou spinner

  return <LoginPage />;
}
