"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ConfirmarEmail = () => {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) return;

    const activateAccount = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/activate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
          setTimeout(() => router.push("/cadastro/login"), 3000); // redireciona após 3s
        } else {
          throw new Error(data.message || "Erro");
        }
      } catch {
        setStatus("error");
        setMessage("Erro ao ativar a conta. Token inválido ou expirado.");
      }
    };

    activateAccount();
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {status === "loading" && <p>Confirmando seu e-mail...</p>}
      {status === "success" && (
        <p style={{ color: "green" }}>{message} Redirecionando...</p>
      )}
      {status === "error" && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default ConfirmarEmail;
