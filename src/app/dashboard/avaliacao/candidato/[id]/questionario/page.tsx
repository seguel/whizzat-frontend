import { notFound, redirect } from "next/navigation";
import Questoes from "./questoes";
import { ProfileType } from "../../../../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;

type PerfilKey = (typeof validPerfis)[number];

type SearchParamsType = {
  perfil?: string;
};

export default async function QuestionarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParamsType>;
}) {
  const { id } = await params;

  const query: SearchParamsType = searchParams ? await searchParams : {};

  const perfil = query.perfil ?? "candidato";

  if (!perfil) {
    redirect(`/dashboard?perfil=candidato`);
  }

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <Questoes avaliacaoId={Number(id)} perfil={perfil as ProfileType} />;
}
