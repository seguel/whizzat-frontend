"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/perfil/Sidebar";
import TopBar from "../components/perfil/TopBar";
import JobList from "../components/perfil/JobList";
import TalentPoolPanel from "../components/perfil/TalentPoolPanel";
import { ProfileType } from "../components/perfil/ProfileContext";

import LoadingOverlay from "../components/LoadingOverlay";
import SemDados from "./SemDados";

interface Props {
  perfil: ProfileType;
}

export default function DashboardRecrutador({ perfil }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasEmpresa, setHasEmpresa] = useState<boolean | null>(null);

  // Verifica o vínculo com o perfil assim que tiver o usuarioId e perfil.id
  useEffect(() => {
    if (!perfil) return;

    const verificarHasEmpresa = async () => {
      try {
        const perfilId =
          perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/empresas/vinculo/${perfilId}`,
          {
            method: "GET",
            credentials: "include", // importante para enviar o cookie JWT
          }
        );

        if (!res.ok) {
          setHasEmpresa(false);
        } else {
          const data = await res.json();
          if (data.length > 0) setHasEmpresa(true);
          else setHasEmpresa(false);
        }
      } catch (error) {
        console.error("Erro ao verificar vínculo:", error);
        setHasEmpresa(false);
      }
    };

    verificarHasEmpresa();
  }, [perfil]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {hasEmpresa === null && <LoadingOverlay />}

        {!hasEmpresa ? (
          <SemDados tipo="empresa" />
        ) : (
          <>
            <main className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-6">
                <JobList title="Vagas da empresa" jobs={[]} />
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
