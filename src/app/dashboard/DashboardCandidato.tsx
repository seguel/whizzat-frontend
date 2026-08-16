"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // App Router
import Sidebar from "../components/perfil/Sidebar";
import TopBar from "../components/perfil/TopBar";
import CandidateDashboard from "./candidato/components/CandidateDashboard";
import { ProfileType } from "../components/perfil/ProfileContext";
import { useCandidato } from "../lib/hooks/useCandidato";
import LoadingOverlay from "../components/LoadingOverlay";
import SemDados from "./SemDados";

interface Props {
  perfil: ProfileType;
}

export default function DashboardCandidato({ perfil }: Props) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { hasPerfilCandidato, loading, hasRedirectPlano } =
    useCandidato(perfil);

  useEffect(() => {
    if (hasRedirectPlano) {
      router.push(hasRedirectPlano);
    }
  }, [hasRedirectPlano, router]);

  if (loading) return <LoadingOverlay />;

  // 🔹 Se estiver redirecionando, não renderiza nada
  if (hasRedirectPlano) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 bg-[#F5F6F6] overflow-hidden">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!hasPerfilCandidato ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
            <CandidateDashboard />
          </main>
        )}
      </div>
    </div>
  );
}
