"use client";

import { useState } from "react";
import Sidebar from "../components/perfil/Sidebar";
import TopBar from "../components/perfil/TopBar";
import JobList from "../components/perfil/JobList";
import TalentPoolPanel from "../components/perfil/TalentPoolPanel";
import { ProfileType } from "../components/perfil/ProfileContext";

import LoadingOverlay from "../components/LoadingOverlay";
import SemDados from "./SemDados";
import { useRecrutadorEmpresa } from "../lib/hooks/useRecrutadorEmpresa";

interface Props {
  perfil: ProfileType;
}

export default function DashboardRecrutador({ perfil }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { hasPerfilRecrutador, hasEmpresa, loading } =
    useRecrutadorEmpresa(perfil);

  if (loading) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!hasPerfilRecrutador ? (
          <SemDados tipo="perfil" perfil={perfil} />
        ) : !hasEmpresa ? (
          <SemDados tipo="empresa" perfil={perfil} />
        ) : (
          <>
            <main className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-6">
                <JobList title="Vagas da empresa" jobs={[]} perfil={perfil} />
              </div>
              <div className="md:col-span-1">
                <TalentPoolPanel />
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
