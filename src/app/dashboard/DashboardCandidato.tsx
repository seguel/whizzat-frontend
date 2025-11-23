"use client";

import { useState } from "react";
import Sidebar from "../components/perfil/Sidebar";
import TopBar from "../components/perfil/TopBar";
import EvaluationList from "../components/perfil/EvaluationList";
import { ProfileType } from "../components/perfil/ProfileContext";
import { useCandidato } from "../lib/hooks/useCandidato";
import LoadingOverlay from "../components/LoadingOverlay";
import SemDados from "./SemDados";

interface Props {
  perfil: ProfileType;
}

export default function DashboardCandidato({ perfil }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { hasPerfilCandidato, loading } = useCandidato(perfil);

  if (loading) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />
        {!hasPerfilCandidato ? (
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
