"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // App Route
import Sidebar from "../components/perfil/Sidebar";
import TopBar from "../components/perfil/TopBar";
import RecruiterDashboard from "./recrutador/components/RecruiterDashboard";
import { ProfileType } from "../components/perfil/ProfileContext";

import LoadingOverlay from "../components/LoadingOverlay";
import SemDados from "./SemDados";
import { useRecrutadorEmpresa } from "../lib/hooks/useRecrutadorEmpresa";

interface Props {
  perfil: ProfileType;
}

export default function DashboardRecrutador({ perfil }: Props) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { hasPerfilRecrutador, hasEmpresa, loading, hasRedirectPlano } =
    useRecrutadorEmpresa(perfil);

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

        {!hasPerfilRecrutador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : !hasEmpresa ? (
          <SemDados tipo="empresa" perfil={perfil} />
        ) : (
          <>
            <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
              <RecruiterDashboard />
            </main>
          </>
        )}
      </div>
    </div>
  );
}
