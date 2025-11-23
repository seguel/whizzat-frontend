import { notFound, redirect } from "next/navigation";
import MiddlewarePage from "./middleware";
import { ProfileType } from "../../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

export default async function Page({
  searchParams,
}: {
  searchParams: { perfil?: string; vg?: string; emp?: string };
}) {
  const perfil = searchParams.perfil;
  const vagaId = searchParams.vg ?? undefined;
  const empresaId = searchParams.emp ?? undefined;

  if (!perfil) {
    redirect("?perfil=candidato");
  }

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }
  return (
    <MiddlewarePage
      perfil={perfil as ProfileType}
      vaga={vagaId}
      emp={empresaId}
    />
  );
}
