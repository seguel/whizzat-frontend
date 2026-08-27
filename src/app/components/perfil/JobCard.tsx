import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type TipoOportunidade = "AMPLA_CONCORRENCIA" | "AFIRMATIVA" | "EXCLUSIVA";

type PublicoAfirmativo =
  | "PCD"
  | "AFIRMATIVA_RACIAL"
  | "LGBTQIA"
  | "MULHERES"
  | "CINQUENTA_MAIS"
  | "DIVERSIDADE";

interface JobCardProps {
  empresa_id: number;
  perfil: string;
  vaga_id: number;
  logo: string;
  nome_empresa: string;
  nome_vaga: string;
  localizacao: string;
  data_cadastro: string;
  qtde_dias_aberta: number;
  prazo: string;
  tipo_oportunidade: TipoOportunidade;
  publicos_afirmativos: PublicoAfirmativo[];
  cidade_label: string;
  estado_sigla: string;
}

function getPublicoLabel(
  publico: PublicoAfirmativo,
  t: (key: string) => string,
) {
  switch (publico) {
    case "PCD":
      return t("tela_vaga_dados.publico_pcd");

    case "AFIRMATIVA_RACIAL":
      return t("tela_vaga_dados.publico_racial");

    case "LGBTQIA":
      return t("tela_vaga_dados.publico_lgbtqia");

    case "MULHERES":
      return t("tela_vaga_dados.publico_mulheres");

    case "CINQUENTA_MAIS":
      return t("tela_vaga_dados.publico_50mais");

    case "DIVERSIDADE":
      return t("tela_vaga_dados.publico_diversidade");
  }
}

export default function JobCard({
  vaga_id,
  empresa_id,
  perfil,
  logo,
  nome_vaga,
  nome_empresa,
  prazo,
  tipo_oportunidade,
  publicos_afirmativos,
  cidade_label,
  estado_sigla,
}: JobCardProps) {
  const { t, i18n } = useTranslation("common");
  const [ready, setReady] = useState(false);

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
    <Link
      href={
        perfil == "candidato"
          ? `/dashboard/candidato/vagas?perfil=${perfil}&vg=${vaga_id}&emp=${empresa_id}`
          : `/dashboard/vagas?perfil=${perfil}&vagaid=${vaga_id}&id=${empresa_id}`
      }
      className="block w-full"
    >
      <div className="flex flex-col lg:min-h-[150px] justify-between rounded-lg p-3 sm:p-2 bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-purple-200 transition w-full">
        {/* Linha superior: logo e informações */}
        <div className="flex flex-row justify-start items-start w-full">
          {/* Logo */}
          <div className="flex flex-col items-center sm:items-start mr-3 sm:mr-4 flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white overflow-hidden">
              {logo ? (
                <Image
                  src={logo}
                  alt="Logo da empresa"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-xs text-gray-400 text-center px-2">
                  {t("tela_lista_vagas.item_msg_sem_foto")}
                </div>
              )}
            </div>
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm break-words">{nome_vaga}</h3>
            <p className="text-xs text-gray-500 break-words">{nome_empresa}</p>
            <p className="text-xs text-gray-500 break-words">
              {cidade_label}/{estado_sigla}
            </p>
            <p className="flex items-center justify-center text-xs px-2 py-1 rounded-lg bg-purple-100 mt-2 sm:mt-4 max-w-full">
              <strong>
                {t("tela_lista_vagas.item_item_periodo")} {prazo}
              </strong>
            </p>
          </div>
        </div>

        {/* Linha inferior: ícones de inclusão */}
        {/* Linha inferior: tipo da oportunidade + públicos */}
        <div className="mt-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              tipo_oportunidade === "AMPLA_CONCORRENCIA"
                ? "bg-gray-100 text-gray-700"
                : tipo_oportunidade === "AFIRMATIVA"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {tipo_oportunidade === "AMPLA_CONCORRENCIA"
              ? t("tela_vaga_dados.tipo_ampla")
              : tipo_oportunidade === "AFIRMATIVA"
                ? t("tela_vaga_dados.tipo_afirmativa")
                : t("tela_vaga_dados.tipo_exclusiva")}
          </span>

          {tipo_oportunidade !== "AMPLA_CONCORRENCIA" &&
            publicos_afirmativos.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {publicos_afirmativos.map((publico) => (
                  <span
                    key={publico}
                    className="inline-flex rounded-full border border-purple-200 bg-white px-2 py-1 text-[10px] font-medium text-purple-700"
                  >
                    {getPublicoLabel(publico, t)}
                  </span>
                ))}
              </div>
            )}
        </div>
      </div>
    </Link>
  );
}
