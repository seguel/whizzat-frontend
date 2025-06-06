"use client";

import Image from "next/image";
import ProfileCard from "../../components/perfil/ProfileCard";
import LogoutButton from "../../components/perfil/logoutButton";
import { useTranslation } from "react-i18next";

export default function PerfilForm() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Botão de Logout com SVG */}
      <LogoutButton />

      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-1">
        {/* Ilustração */}
        <div className="hidden sm:block flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:max-[30%]">
          <Image
            src="/assets/imagem_perfil.png"
            alt="Pessoa com laptop"
            width={330}
            height={456}
            //className="w-full h-auto"
            priority
          />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            {t("perfil.titulo_primeiro")}
          </h1>
          <p className="text-gray-700">{t("perfil.titulo_segundo")}</p>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <ProfileCard
              title={t("perfil.card_candidato")}
              description={t("perfil.card_candidato_descricao")}
              imageSrc="/assets/imagem_perfil_candidato.png"
              href="/cadastro/perfil/candidato"
            />
            <ProfileCard
              title={t("perfil.card_recrutador")}
              description={t("perfil.card_recrutador_descricao")}
              imageSrc="/assets/imagem_perfil_recrutador.png"
              href="/cadastro/perfil/recrutador"
            />
            <ProfileCard
              title={t("perfil.card_avaliador")}
              description={t("perfil.card_avaliador_descricao")}
              imageSrc="/assets/imagem_perfil_avaliador.png"
              href="/cadastro/perfil/avaliador"
            />
          </div>

          <p className="text-gray-600 mt-6">{t("perfil.titulo_terceiro")}</p>
        </div>
      </div>
    </div>
  );
}
