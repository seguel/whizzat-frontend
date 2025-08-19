import { notFound, redirect } from "next/navigation";
import MiddlewarePage from "./middleware";
import { ProfileType } from "../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const perfil = Array.isArray(searchParams?.perfil)
    ? searchParams.perfil[0]
    : searchParams?.perfil;
  const op = Array.isArray(searchParams?.op)
    ? (searchParams.op[0] as "N" | "E")
    : (searchParams?.op as "N" | "E" | undefined);
  const id = Array.isArray(searchParams?.id)
    ? searchParams.id[0]
    : searchParams?.id;

  if (!perfil) {
    redirect("?perfil=candidato");
  }

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <MiddlewarePage perfil={perfil as ProfileType} op={op} id={id} />;
}
