/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import VerPage from "./VerPage";
import { ProfileType } from "../../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

type SearchParamsType = {
  perfil?: string;
};

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: SearchParamsType;
}) {
  const perfil = searchParams?.perfil ?? "candidato";
  const id = params.id;

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <VerPage perfil={perfil as ProfileType} id={id} />;
}
