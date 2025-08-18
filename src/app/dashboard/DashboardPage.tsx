"use client";
import {
  ProfileProvider,
  ProfileType,
} from "../components/perfil/ProfileContext";
import DashboardCandidato from "./DashboardCandidato";
import DashboardRecrutador from "./DashboardRecrutador";
import DashboardAvaliador from "./DashboardAvaliador";
import DashboardWrapper from "../components/DashboardWrapper";
import { useAuthGuard } from "../lib/hooks/useAuthGuard";
import LoadingOverlay from "../components/LoadingOverlay";

interface Props {
  perfil: ProfileType;
}

export default function DashboardPage({ perfil }: Props) {
  const { isReady } = useAuthGuard("/cadastro/login");

  if (!isReady) return <LoadingOverlay />;

  return (
    <ProfileProvider initialProfile={perfil}>
      <DashboardWrapper>
        {perfil === "candidato" && <DashboardCandidato perfil={perfil} />}
        {perfil === "recrutador" && <DashboardRecrutador perfil={perfil} />}
        {perfil === "avaliador" && <DashboardAvaliador perfil={perfil} />}
      </DashboardWrapper>
    </ProfileProvider>
  );
}
