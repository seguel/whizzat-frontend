import { notFound } from "next/navigation";
import PerfilSelecionadoPage from "./PerfilSelecionado";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

export default async function Page({
  params,
}: {
  params: Promise<{ perfil: string }>;
}) {
  const { perfil } = await params;

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <PerfilSelecionadoPage perfil={perfil as PerfilKey} />;
}
