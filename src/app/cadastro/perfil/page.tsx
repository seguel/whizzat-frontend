"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isUserAuthenticated } from "../../lib/auth";
import PerfilForm from "./PerfilForm";

export default function PerfilPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    isUserAuthenticated().then((auth) => {
      if (!auth) {
        router.replace("/login");
      } else {
        setChecked(true);
      }
    });
  }, [router]);

  if (!checked) return null; // ou um spinner

  return <PerfilForm />;
}
