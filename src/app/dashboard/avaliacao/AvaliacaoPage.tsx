"use client";

import {
  ProfileProvider,
  ProfileType,
} from "../../components/perfil/ProfileContext";
import { NotificationProvider } from "../../components/perfil/NotificationContext";
import AvaliacaoConvites from "./AvaliacaoConvites";

interface Props {
  perfil: ProfileType;
}

export default function Middleware({ perfil }: Props) {
  return (
    <ProfileProvider initialProfile={perfil}>
      <NotificationProvider>
        <AvaliacaoConvites perfil={perfil} />
      </NotificationProvider>
    </ProfileProvider>
  );
}
