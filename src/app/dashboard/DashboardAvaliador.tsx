"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation"; // App Router
import Sidebar from "../components/perfil/Sidebar";
import TopBar from "../components/perfil/TopBar";
import EvaluationList from "../components/perfil/EvaluationList";
import { ProfileType } from "../components/perfil/ProfileContext";
import { useAvaliador } from "../lib/hooks/useAvaliador";
import LoadingOverlay from "../components/LoadingOverlay";
import SemDados from "./SemDados";

interface Props {
  perfil: ProfileType;
}

export default function DashboardAvaliador({ perfil }: Props) {
  // const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { hasPerfilAvaliador, loading } = useAvaliador(perfil);

  //Ativar somente quando avaliador tiver plano
  /* useEffect(() => {
    if (hasRedirectPlano) {
      router.push(hasRedirectPlano);
    }
  }, [hasRedirectPlano, router]); */

  if (loading) return <LoadingOverlay />;

  // 🔹 Se estiver redirecionando, não renderiza nada
  // if (hasRedirectPlano) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />
        {!hasPerfilAvaliador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <>
            <main className="p-4">
              <EvaluationList />
            </main>
          </>
        )}
      </div>
    </div>
  );
}
