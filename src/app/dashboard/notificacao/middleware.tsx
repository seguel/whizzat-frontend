"use client";

import {
  ProfileProvider,
  ProfileType,
} from "../../components/perfil/ProfileContext";
import { NotificationProvider } from "../../components/perfil/NotificationContext";
// import LoadingOverlay from "../../components/LoadingOverlay";
import Notificacoes from "./NotificacoesListar";

interface Props {
  perfil: ProfileType;
}

export default function Middleware({ perfil }: Props) {
  return (
    <ProfileProvider initialProfile={perfil}>
      <NotificationProvider>
        <Notificacoes perfil={perfil} />
      </NotificationProvider>
    </ProfileProvider>
  );
}
