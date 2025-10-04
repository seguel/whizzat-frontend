/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound, redirect } from "next/navigation";
import MiddlewarePage from "../middleware";
import { ProfileType } from "../../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

type SearchParamsType = {
  perfil?: string;
  op?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParamsType; // <-- vem da query string
}) {
  const perfil = searchParams?.perfil ?? "candidato";
  const op = searchParams?.op as "N" | undefined;

  // Redireciona se perfil não definido
  if (!perfil) {
    redirect("?perfil=candidato");
  }

  // Valida se o perfil é válido
  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <MiddlewarePage perfil={perfil as ProfileType} op={op} />;
}
