import { notFound, redirect } from "next/navigation";
import PerfilPage from "./PerfilPage";
import { ProfileType } from "../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

type SearchParamsType = {
  perfil?: string;
  op?: string;
  id?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsType>;
}) {
  // Garante que sempre teremos objeto, await se Promise
  const params: SearchParamsType = searchParams ? await searchParams : {};

  const perfil = params.perfil ?? "candidato";
  //const op = params.op as "N" | "E" | undefined;
  const id = params.id ?? undefined;

  if (!perfil) {
    redirect("?perfil=candidato");
  }

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <PerfilPage perfil={perfil as ProfileType} id={id} />;
}
