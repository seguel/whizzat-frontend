import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

interface SemDadosProps {
  tipo: "empresa" | "vaga" | "perfil";
  perfil: "candidato" | "avaliador" | "recrutador";
}

export default function SemDados({ tipo, perfil }: SemDadosProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const [ready, setReady] = useState(false);

  // Map para classes de cor de acordo com o perfil
  const perfilColors: Record<
    "candidato" | "avaliador" | "recrutador",
    { bg: string; hover: string; text: string }
  > = {
    candidato: {
      bg: "bg-green-100",
      hover: "hover:bg-green-200",
      text: "text-green-900",
    },
    recrutador: {
      bg: "bg-purple-100",
      hover: "hover:bg-purple-200",
      text: "text-purple-900",
    },
    avaliador: {
      bg: "bg-blue-100",
      hover: "hover:bg-blue-200",
      text: "text-blue-900",
    },
  };

  const btnClass = `px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer 
    ${perfilColors[perfil].bg} 
    ${perfilColors[perfil].hover} 
    ${perfilColors[perfil].text}`;

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

  const renderBloco = () => {
    switch (tipo) {
      case "empresa":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg sm:text-xl font-medium text-gray-700">
              {t("semdados.empresa_linha_primeiro")}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {t("semdados.empresa_linha_segundo")}
            </p>
            <p className="text-sm text-gray-500 mb-4 pb-4">
              {t("semdados.empresa_linha_terceiro")}
            </p>
            <button
              onClick={() =>
                router.push(`/dashboard/empresa?perfil=recrutador&op=N`)
              }
              className={btnClass}
            >
              {t("semdados.empresa_linha_botao")}
            </button>
          </div>
        );

      case "vaga":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg sm:text-xl font-medium text-gray-700">
              {t("semdados.vaga_linha_primeiro")}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {t("semdados.vaga_linha_segundo")}
            </p>
            <button
              onClick={() =>
                router.push(`/dashboard/vagas?perfil=recrutador&op=N`)
              }
              className={`mt-5 ${btnClass}`}
            >
              {t("semdados.vaga_linha_botao")}
            </button>
          </div>
        );

      case "perfil":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg sm:text-xl font-medium text-gray-700">
              {t("semdados.perfil_linha_primeiro")} {perfil}{" "}
              {t("semdados.perfil_linha_primeiro_complemento")}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {t("semdados.perfil_linha_segundo")}
            </p>
            <button
              onClick={() => router.push(`/dashboard/perfil?perfil=${perfil}`)}
              className={`mt-5 ${btnClass}`}
            >
              {t("semdados.perfil_linha_botao")}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-3 flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm w-full min-h-[550px] text-center">
        {renderBloco()}
      </div>
    </main>
  );
}
