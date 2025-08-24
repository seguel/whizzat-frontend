"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Image from "next/image";

const ConfirmarEmail = () => {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isReady, setIsReady] = useState(false); // ✅ controlar renderização
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
    const lng = searchParams.get("lng");

    if (emailFromParams) setEmail(emailFromParams);

    const setIdiomaEContinuar = async () => {
      if (lng) {
        await i18n.changeLanguage(lng); // ✅ aguarda mudança de idioma
      }
      setIsReady(true); // ✅ libera renderização
    };

    setIdiomaEContinuar();

    if (!token) {
      setStatus("error");
      setMessage(t("confirma_email.token_invalido"));
      return;
    }

    const activateAccount = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/activate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": lng || i18n.language,
            },
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
        setMessage(t("confirma_email.erro_geral"));
      }
    };

    activateAccount();
  }, [router, searchParams, i18n]);

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-activation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": i18n.language,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResendSuccess(t("confirma_email.reenvio_link_sucesso"));
      } else {
        throw new Error(data.message || "Erro ao reenviar.");
      }
    } catch {
      setResendSuccess(t("confirma_email.reenvio_link_erro"));
    } finally {
      setResendLoading(false);
    }
  };

  if (!isReady) {
    return null; // ou um loader, se preferir
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded shadow-md p-8 text-center space-y-4">
        <Image
          src="/assets/logofull_whizzat.png"
          alt="Logo grande"
          width={180}
          height={40}
          className="mx-auto"
        />
        <h1 className="text-2xl font-bold text-gray-800">
          {t("confirma_email.titulo")}
        </h1>

        {status === "loading" && (
          <div className="flex justify-center items-center space-x-2">
            <EnvelopeIcon className="w-6 h-6 text-blue-500 animate-pulse" />
            <p className="text-gray-600">{t("confirma_email.confirmando")}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-2">
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-sm text-gray-500">
              {t("confirma_email.redirecionando")}
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
                    ? t("confirma_email.reenviar")
                    : t("confirma_email.btn_reenviar")}
                </button>
                {resendSuccess && (
                  <p className="text-sm text-green-600">{resendSuccess}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">
                {t("confirma_email.info")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmarEmail;
