"use client";

import { useSearchParams } from "next/navigation";

import DashboardMinhasOportunidades from "./DashboardMinhasOportunidades";
import { ProfileType } from "../../../components/perfil/ProfileContext";

export default function Page() {
  const searchParams = useSearchParams();

  const perfilParam = searchParams.get("perfil");

  const perfil: ProfileType =
    perfilParam === "candidato" ||
    perfilParam === "avaliador" ||
    perfilParam === "recrutador"
      ? perfilParam
      : "candidato";

  return <DashboardMinhasOportunidades perfil={perfil} />;
}
