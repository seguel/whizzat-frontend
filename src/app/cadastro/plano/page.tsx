import { notFound, redirect } from "next/navigation";
import PerfilPlanoPage from "./PerfilPlano";
import { ProfileType } from "../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

export default async function Page({
  searchParams,
}: {
  searchParams: { perfil?: string; expirado?: string };
}) {
  const perfil = searchParams.perfil;
  const expirado = searchParams.expirado ?? undefined;

  if (!perfil) {
    redirect("?perfil=candidato");
  }

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }
  return <PerfilPlanoPage perfil={perfil as ProfileType} />;
}
