import { notFound, redirect } from "next/navigation";
import MiddlewarePage from "./middleware";
import { ProfileType } from "../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

export default async function Page({
  searchParams,
}: {
  searchParams: { perfil?: string; op?: string; vagaid?: string; id?: string };
}) {
  const perfil = searchParams.perfil;
  const op = searchParams.op as "N" | "E" | undefined;
  const vagaid = searchParams.vagaid ?? undefined; // ✅ assegura serializável
  const id = searchParams.id ?? undefined;

  if (!perfil) {
    redirect("?perfil=candidato");
  }

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return (
    <MiddlewarePage
      perfil={perfil as ProfileType}
      op={op}
      vagaId={vagaid}
      empresaId={id}
    />
  );
}
