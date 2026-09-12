"use client";

import { useSearchParams } from "next/navigation";

import DashboardCandidatosIgnorados from "./DashboardCandidatosIgnorados";
import { ProfileType } from "../../components/perfil/ProfileContext";

export default function Page() {
  const searchParams = useSearchParams();

  const perfilParam = searchParams.get("perfil");

  const perfil: ProfileType =
    perfilParam === "candidato" ||
    perfilParam === "avaliador" ||
    perfilParam === "recrutador"
      ? perfilParam
      : "recrutador";

  return <DashboardCandidatosIgnorados perfil={perfil} />;
}
