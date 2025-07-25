"use client";

import { useState } from "react";
import { ProfileType } from "../../components/perfil/ProfileContext";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import SemEmpresa from "../SemEmpresa";

interface Props {
  perfil: ProfileType;
  hasEmpresa: boolean | null;
}

export default function ListaVagas({ perfil, hasEmpresa }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        {!hasEmpresa ? (
          <SemEmpresa />
        ) : (
          <>
            <main className="p-4 grid grid-cols-1 gap-4 w-[98%] mx-auto">
              <h1>vagas {perfil}</h1>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
