import { notFound, redirect } from "next/navigation";
import MiddlewarePage from "./middleware";
import { ProfileType } from "../../components/perfil/ProfileContext";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

// Criamos um tipo só para o que nos interessa
type SearchParams = {
  perfil?: string;
  op?: "N" | "E";
  id?: string;
};

// ⚡ solução: deixar o Next tipar PageProps sozinho e só forçar cast dentro da função
export default function Page({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  // se o Next passar um Promise (caso async), a gente trata
  const resolveParams = (sp: typeof searchParams): SearchParams | undefined => {
    if (!sp) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (sp as Promise<any>).then === "function") {
      // nesse caso o Next trataria como assíncrono,
      // mas para a nossa page síncrona podemos ignorar e forçar {} vazio
      return {};
    }
    return sp as SearchParams;
  };

  const params = resolveParams(searchParams);
  const perfil = params?.perfil;
  const op = params?.op;
  const id = params?.id;

  if (!perfil) {
    redirect("?perfil=candidato");
  }

  if (!validPerfis.includes(perfil as PerfilKey)) {
    notFound();
  }

  return <MiddlewarePage perfil={perfil as ProfileType} op={op} id={id} />;
}
