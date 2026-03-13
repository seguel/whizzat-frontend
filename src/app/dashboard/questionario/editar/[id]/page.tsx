import { notFound } from "next/navigation";
import EditarPage from "./EditarPage";
import { ProfileType } from "../../../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { perfil?: string };
}) {
  const perfil = searchParams?.perfil ?? "candidato";

  if (!validPerfis.includes(perfil as any)) {
    notFound();
  }

  return <EditarPage perfil={perfil as ProfileType} id={params.id} />;
}
