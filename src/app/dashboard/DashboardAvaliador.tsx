"use client";

import { useState } from "react";
import Sidebar from "../components/perfil/Sidebar";
import TopBar from "../components/perfil/TopBar";
import EvaluationList from "../components/perfil/EvaluationList";
import { ProfileType } from "../components/perfil/ProfileContext";

interface Props {
  perfil: ProfileType;
}

export default function DashboardAvaliador({ perfil }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />
      <div className="flex flex-col flex-1 overflow-y-auto transition-all">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />
        <main className="p-4">
          <EvaluationList />
        </main>
      </div>
    </div>
  );
}
