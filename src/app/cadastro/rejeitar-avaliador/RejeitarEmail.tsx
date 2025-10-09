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

const RejeitarEmail = () => {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isReady, setIsReady] = useState(false); // ✅ controlar renderização
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!searchParams) return;

    const token = searchParams.get("token");
    // const perfilId = searchParams.get("pf");
    const lng = searchParams.get("lng");

    const setIdiomaEContinuar = async () => {
      if (lng) {
        await i18n.changeLanguage(lng); // ✅ aguarda mudança de idioma
      }
      setIsReady(true); // ✅ libera renderização
    };

    setIdiomaEContinuar();

    if (!token) {
      setStatus("error");
      setMessage(t("confirma_email_avaliador.token_invalido"));
      return;
    }

    const activateAccount = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/avaliador/reject`,
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
        // console.log(data);
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
          // setTimeout(() => router.push("/cadastro/login"), 3000);
        } else {
          throw new Error(data.message || "Erro");
        }
      } catch {
        setStatus("error");
        setMessage(t("confirma_email_avaliador.erro_geral"));
      }
    };

    activateAccount();
  }, [router, searchParams, i18n]);

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
          {t("confirma_email_avaliador.titulo_reject")}
        </h1>

        {status === "loading" && (
          <div className="flex justify-center items-center space-x-2">
            <EnvelopeIcon className="w-6 h-6 text-blue-500 animate-pulse" />
            <p className="text-gray-600">
              {t("confirma_email_avaliador.confirmando")}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-2">
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
            <p className="text-green-600 font-medium">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <ExclamationCircleIcon className="w-10 h-10 text-red-500" />
            <p className="text-red-600">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RejeitarEmail;
