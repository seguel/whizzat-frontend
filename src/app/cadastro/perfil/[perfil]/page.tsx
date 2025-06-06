import PerfilSelecionadoPage from "./PerfilSelecionado";

const validPerfis = ["candidato", "recrutador", "avaliador"] as const;
type PerfilKey = (typeof validPerfis)[number];

export default function Page({ params }: { params: { perfil: string } }) {
  const perfil = params.perfil as PerfilKey;

  if (!validPerfis.includes(perfil)) {
    return (
      <div className="text-center mt-10 text-red-500">Perfil inválido</div>
    );
  }

  return <PerfilSelecionadoPage perfil={perfil} />;
}
