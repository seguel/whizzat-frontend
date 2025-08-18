import { notFound, redirect } from "next/navigation";
import DashboardPage from "./DashboardPage";
import { ProfileType } from "../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

export default function Page({
  searchParams,
}: {
  searchParams: { perfil?: string };
}) {
  const perfil = searchParams.perfil;

  if (!perfil) {
    redirect("?perfil=candidato");
  }

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <DashboardPage perfil={perfil as ProfileType} />;
}
