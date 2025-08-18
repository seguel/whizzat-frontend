"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Tipos de perfis suportados
export type ProfileType = "candidato" | "recrutador" | "avaliador";

interface ProfileContextType {
  profile: ProfileType;
  setProfile: (profile: ProfileType) => void;
}

const defaultContext: ProfileContextType = {
  profile: "candidato", // fallback
  setProfile: () => {},
};

// Dados específicos de cada perfil (se quiser usar em outros lugares)
export const profileData = {
  candidato: {
    titulo: "Candidato(a)",
    descricaoCurta: "Estou à procura da melhor oportunidade profissional.",
    descricaoLonga:
      "Nossa política é perguntar apenas o que for estritamente necessário. À medida que você for usando o WeChek, vamos pedindo mais informações — somente se for indispensável.",
    avatar: "/avatar.png",
    cor: "#22c55e", // verde
    ilustracao: "/illustration.png",
  },
  recrutador: {
    titulo: "Recrutador(a)",
    descricaoCurta: "Buscando os melhores talentos para sua empresa.",
    descricaoLonga:
      "Facilitamos a triagem, análise e contato com candidatos ideais. Suas ações moldam como você será visto pelos candidatos.",
    avatar: "/avatar-recrutador.png",
    cor: "#3b82f6", // azul
    ilustracao: "/illustration-recrutador.png",
  },
  avaliador: {
    titulo: "Avaliador(a)",
    descricaoCurta: "Auxiliando na seleção de talentos.",
    descricaoLonga:
      "Sua análise é essencial para garantir a contratação dos melhores profissionais.",
    avatar: "/avatar-avaliador.png",
    cor: "#f59e0b", // amarelo
    ilustracao: "/illustration-avaliador.png",
  },
} as const;

// Criação do contexto
export const ProfileContext = createContext<ProfileContextType>(defaultContext);

// Hook para acessar o contexto
export function useProfile() {
  return useContext(ProfileContext);
}

// Provider com perfil inicial opcional
interface ProfileProviderProps {
  children: ReactNode;
  initialProfile: ProfileType;
}

export function ProfileProvider({
  initialProfile,
  children,
}: ProfileProviderProps) {
  const [profile, setProfile] = useState<ProfileType>(initialProfile);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
