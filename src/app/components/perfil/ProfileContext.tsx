"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";

export type ProfileType = "candidato" | "recrutador" | "avaliador";

interface ProfileContextType {
  profile: ProfileType;
  setProfile: (profile: ProfileType) => void;
}

const defaultContext: ProfileContextType = {
  profile: "candidato",
  setProfile: () => {},
};

export const ProfileContext = createContext<ProfileContextType>(defaultContext);

export function useProfile() {
  return useContext(ProfileContext);
}

interface ProfileProviderProps {
  children: ReactNode;
  initialProfile?: ProfileType; // agora opcional
}

export function ProfileProvider({
  initialProfile,
  children,
}: ProfileProviderProps) {
  const searchParams = useSearchParams();
  const perfilUrl = searchParams.get("perfil") as ProfileType | null;

  const perfilInicial = initialProfile ?? perfilUrl ?? "candidato";

  const [profile, setProfile] = useState<ProfileType>(perfilInicial);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
