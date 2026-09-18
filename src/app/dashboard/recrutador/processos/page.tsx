import DashboardProcessos from "./DashboardProcessos";

interface PageProps {
  searchParams: Promise<{
    perfil?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const perfil = params.perfil === "recrutador" ? params.perfil : "recrutador";

  return <DashboardProcessos perfil={perfil} />;
}
