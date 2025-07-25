"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t, i18n } = useTranslation("common");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
    } else {
      const onInit = () => setReady(true);
      i18n.on("initialized", onInit);
      return () => {
        i18n.off("initialized", onInit);
      };
    }
  }, [i18n]);

  if (!ready) return null; // ou um loading spinner opcional

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        {t("notfound.primeira_linha")}
      </h2>
      <p className="text-gray-600 mb-6">{t("notfound.segunda_linha")}</p>

      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
      >
        <ArrowLeftCircle className="w-5 h-5" />
        {t("notfound.btn_voltar")}
      </button>
    </div>
  );
}
