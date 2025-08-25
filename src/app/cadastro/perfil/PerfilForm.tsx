"use client";

import ProfileCard from "../../components/perfil/ProfileCard";
import LogoutButton from "../../components/perfil/logoutButton";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";

export default function PerfilForm() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header fixo no topo */}
      <header className="w-full px-4">
        <div className="flex items-center justify-between w-full py-4">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/assets/logofull_whizzat.png"
              alt="Logo grande"
              width={160}
              height={60}
            />
          </Link>

          {/* Botão de Logout */}
          <LogoutButton />
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 w-full flex flex-col lg:flex-row items-center gap-8 max-w-6xl mx-auto px-6 py-12">
        {/* Ilustração à esquerda */}
        <div className="hidden sm:block flex-shrink-0 w-full max-w-xs sm:max-w-sm">
          <Image
            src="/assets/imagem_perfil.png"
            alt="Pessoa com laptop"
            width={330}
            height={456}
            priority
          />
        </div>

        {/* Texto + Cards */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            {t("perfil.titulo_primeiro")}
          </h1>
          <p className="text-gray-700">{t("perfil.titulo_segundo")}</p>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
      </main>
    </div>
  );
}
