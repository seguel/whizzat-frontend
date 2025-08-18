import { notFound, redirect } from "next/navigation";
import MiddlewarePage from "./middleware";
import { ProfileType } from "../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

export default function Page({
  searchParams,
}: {
  searchParams: { perfil?: string; op?: string; id?: string };
}) {
  const perfil = searchParams.perfil;
  const op = searchParams.op as "N" | "E" | undefined;
  const id = searchParams.id;

  if (!perfil) {
    redirect("?perfil=candidato");
  }

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <MiddlewarePage perfil={perfil as ProfileType} op={op} id={id} />;
}
