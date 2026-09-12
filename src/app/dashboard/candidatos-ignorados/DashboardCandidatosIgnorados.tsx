"use client";

import { useState } from "react";

import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import SemDados from "../SemDados";

import { ProfileType } from "../../components/perfil/ProfileContext";
import { useRecrutadorEmpresa } from "../../lib/hooks/useRecrutadorEmpresa";

import CandidatosIgnorados from "./CandidatosIgnorados";

interface Props {
  perfil: ProfileType;
}

export default function DashboardCandidatosIgnorados({ perfil }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { hasPerfilRecrutador, loading } = useRecrutadorEmpresa(perfil);

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-1 flex-col overflow-hidden bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!hasPerfilRecrutador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : (
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
            <CandidatosIgnorados />
          </main>
        )}
      </div>
    </div>
  );
}
