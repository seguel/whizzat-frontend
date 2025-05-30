"use client";

import Image from "next/image";
import ProfileCard from "../../components/perfil/ProfileCard";
import LogoutButton from "../../components/perfil/logoutButton";

export default function PerfilForm() {
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
            Olá, seja bem vindo(a) ao WeChek!
          </h1>
          <p className="text-gray-700">
            Para iniciar, escolha uma opção de perfil
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <ProfileCard
              title="Sou um(a) Candidato(a)"
              description="Estou à procura da melhor oportunidade profissional"
              imageSrc="/assets/imagem_perfil_candidato.png"
            />
            <ProfileCard
              title="Sou um(a) Recrutador(a)"
              description="Estou à procura do melhor candidato para uma vaga"
              imageSrc="/assets/imagem_perfil_recrutador.png"
            />
            <ProfileCard
              title="Sou um(a) Avaliador(a)"
              description="Desejo avaliar candidatos para receber benefícios"
              imageSrc="/assets/imagem_perfil_avaliador.png"
            />
          </div>

          <p className="text-gray-600 mt-6">
            Mas fique tranquilo(a), você pode criar outro perfil após acessar o
            WeChek
          </p>
        </div>
      </div>
    </div>
  );
}
