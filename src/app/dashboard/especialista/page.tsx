import { notFound } from "next/navigation";
import EspecialistaPage from "./EspecialistaPage";
import { ProfileType } from "../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

type SearchParamsType = {
  perfil?: string;
  id?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsType>;
}) {
  const params: SearchParamsType = searchParams ? await searchParams : {};

  const perfil = params.perfil ?? "candidato";

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <EspecialistaPage perfil={perfil as ProfileType} />;
}
