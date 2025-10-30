/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound, redirect } from "next/navigation";
import Lista from "./lista";
import { ProfileType } from "../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

type SearchParamsType = {
  perfil?: string;
  op?: string;
  id?: string;
};

// Next 15 espera searchParams do tipo Promise<any> | undefined
export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsType>;
}) {
  // Garante que sempre teremos objeto, await se Promise
  const params: SearchParamsType = searchParams ? await searchParams : {};

  const perfil = params.perfil ?? "candidato";
  // const op = params.op as "N" | "E" | undefined;
  const id = params.id ?? undefined;
  // const rec = params.rec ?? undefined; //recrutador

  // Redireciona se perfil não definido
  if (!perfil) {
    redirect("?perfil=candidato");
  }

  // Valida se o perfil é válido
  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <Lista perfil={perfil as ProfileType} recrutadorId={id ?? null} />;
}
