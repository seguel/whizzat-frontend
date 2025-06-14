"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const profiles = {
  candidato: {
    avatar: "/assets/imagem_perfil_candidato.png",
    ilustracao: "/assets/imagem_perfil.png",
  },
  recrutador: {
    avatar: "/assets/imagem_perfil_recrutador.png",
    ilustracao: "/assets/imagem_perfil.png",
  },
  avaliador: {
    avatar: "/assets/imagem_perfil_avaliador.png",
    ilustracao: "/assets/imagem_perfil.png",
  },
} as const;

type PerfilKey = keyof typeof profiles;

export default function PerfilSelecionadoPage({
  perfil,
}: {
  perfil: PerfilKey;
}) {
  const { t } = useTranslation("common");
  const { avatar, ilustracao } = profiles[perfil];
  const titulo = t(`perfil.selecionado_${perfil}_titulo`);
  const descricaoCurta = t(`perfil.selecionado_${perfil}_descricao_curta`);
  const descricaoLonga = t(`perfil.card_${perfil}_descricao`);
  const cor = t(`perfil.selecionado_${perfil}_cor`);
  const cor_css = t(`perfil.selecionado_${perfil}_cor_css`);

  const borderClass = `border-${cor_css}-400`;
  const bgClass = `bg-${cor_css}-400`;
  const textClass = `text-${cor_css}-300`;
  const hoverTextClass = `hover:text-${cor_css}-300`;
  const hoverBgClass = `hover:bg-${cor_css}-400`;

  const router = useRouter();
  //const data = profiles[perfil];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 px-6 py-10">
      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col lg:flex-row items-center justify-center gap-12">
        {/* Ilustração */}
        <div className="w-[300px] h-auto">
          <Image
            src={ilustracao}
            alt="Pessoa com laptop"
            width={300}
            height={300}
            className="hidden sm:block w-full h-auto"
          />
        </div>

        {/* Texto */}
        <div className="max-w-xl text-center lg:text-left space-y-6">
          <h1 className="text-3xl font-semibold text-gray-800">{titulo}</h1>
          <p className="text-gray-700">
            {t("perfil.selecionado_titulo_primeiro")}
          </p>

          <div className="flex items-center gap-4 flex-col sm:flex-row relative">
            {/* Avatar */}
            <div
              className={`relative border-4 ${borderClass} rounded-xl p-4 flex flex-col items-center min-w-[13rem]`}
            >
              <Image
                src={avatar}
                alt={`Avatar ${perfil}`}
                width={64}
                height={64}
                className="rounded-full"
              />
              <p className="font-medium text-sm mt-2">{descricaoCurta}</p>
              <p className="text-xs text-gray-500 text-center">
                {descricaoLonga}
              </p>

              {/* Balão abaixo do avatar - responsivo e corrigido */}
              <div
                className={`
        text-xs p-3 rounded-md shadow-lg w-64 mt-4
        bg-gray-900 text-white text-left
        sm:absolute sm:top-full sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:mt-2 sm:z-10
      `}
              >
                {t("perfil.selecionado_titulo_quarto")}
                <br />
                {t("perfil.selecionado_titulo_quinto")} {descricaoCurta}{" "}
                {t("perfil.selecionado_titulo_sexto")}{" "}
                <span className={`${textClass} font-semibold uppercase`}>
                  {cor}
                </span>
                .{/* Seta – só em desktop */}
                <div className="hidden sm:block absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                </div>
              </div>
            </div>

            {/* Informações adicionais */}
            <div className="text-sm text-gray-600 max-w-sm">
              <p>{t("perfil.selecionado_titulo_segundo")}</p>
              <p className="mt-2">{t("perfil.selecionado_titulo_terceiro")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-between items-center mt-10">
        <button
          onClick={() => router.back()}
          className={`px-6 py-1 rounded-full border ${borderClass} font-semibold  ${hoverBgClass} transition`}
        >
          {t("perfil.btn_voltar")}
        </button>
        <div className="flex gap-4">
          <button
            className={`text-sm  font-semibold hover:underline ${hoverTextClass}`}
          >
            {t("perfil.btn_pular_tutorial")}
          </button>
          <button
            onClick={() => router.push("/cadastro/proximo")}
            className={`px-6 py-1 rounded-full ${bgClass} font-semibold ${hoverBgClass} transition`}
          >
            {t("perfil.btn_avancar")}
          </button>
        </div>
      </div>
    </div>
  );
}
