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
    return (
      <div className="text-center mt-10 text-red-500">Perfil inválido</div>
    );
  }

  return <PerfilSelecionadoPage perfil={perfil as PerfilKey} />;
}
