"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const ConfirmarEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    if (!searchParams) return;

    const token = searchParams.get("token");
    const emailFromParams = searchParams.get("email");

    if (emailFromParams) setEmail(emailFromParams);

    if (!token) {
      setStatus("error");
      setMessage("Token não encontrado.");
      return;
    }

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
          setTimeout(() => router.push("/cadastro/login"), 3000);
        } else {
          throw new Error(data.message || "Erro");
        }
      } catch {
        setStatus("error");
        setMessage("Erro ao ativar a conta. Token inválido ou expirado.");
      }
    };

    activateAccount();

  }, [router, searchParams]);

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-activation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResendSuccess("Link reenviado com sucesso. Verifique seu e-mail.");
      } else {
        throw new Error(data.message || "Erro ao reenviar.");
      }
    } catch {
      setResendSuccess("Erro ao reenviar o link. Tente novamente.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded shadow-md p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Confirmação de E-mail
        </h1>

        {status === "loading" && (
          <div className="flex justify-center items-center space-x-2">
            <EnvelopeIcon className="w-6 h-6 text-blue-500 animate-pulse" />
            <p className="text-gray-600">Confirmando seu e-mail...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-2">
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecionando para o login...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <ExclamationCircleIcon className="w-10 h-10 text-red-500" />
            <p className="text-red-600">{message}</p>

            {email ? (
              <>
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className={`w-full py-2 px-4 rounded text-white text-sm transition ${
                    resendLoading
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {resendLoading
                    ? "Reenviando..."
                    : "Reenviar link de ativação"}
                </button>
                {resendSuccess && (
                  <p className="text-sm text-green-600">{resendSuccess}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Para reenviar o link, acesse a página de login.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmarEmail;
