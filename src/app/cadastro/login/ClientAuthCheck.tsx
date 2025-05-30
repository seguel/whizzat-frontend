"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "./LoginForm";

export default function ClientAuthCheck() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/protected`, {
      method: "POST",
      credentials: "include",
    }).then((res) => {
      if (res.ok) {
        router.replace("/cadastro/perfil");
      } else {
        setChecked(true);
      }
    });
  }, []);

  if (!checked) return null;

  return <LoginPage />;
}
