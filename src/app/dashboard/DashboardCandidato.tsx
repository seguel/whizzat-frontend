// app/dashboard/DashboardCandidato.tsx
"use client";

import { useState } from "react";
import Sidebar from "../components/perfil/Sidebar";
import TopBar from "../components/perfil/TopBar";
import JobList from "../components/perfil/JobList";
import SkillsPanel from "../components/perfil/SkillsPanel";
import DashboardWrapper from "../components/DashboardWrapper";
import { ProfileType } from "../components/perfil/ProfileContext";

interface Props {
  perfil: ProfileType;
}

const appliedJobs = [
  {
    logo: "/logos/ibm.png",
    score: 80,
    title: "Desenvolvedor(a) React",
    company: "IBM Brasil",
    location: "Fortaleza - CE / Brasil",
    deadline: "27 Maio",
    pcd: true,
  },
  {
    logo: "/logos/decolar.png",
    score: 79,
    title: "Desenvolvedor(a) .Net",
    company: "Decolar",
    location: "Campinas - SP / Brasil",
    deadline: "26 Maio",
  },
  {
    logo: "/logos/decolar.png",
    score: 79,
    title: "Desenvolvedor(a) .Net",
    company: "Decolar",
    location: "Campinas - SP / Brasil",
    deadline: "26 Maio",
  },
  {
    logo: "/logos/decolar.png",
    score: 79,
    title: "Desenvolvedor(a) .Net",
    company: "Decolar",
    location: "Campinas - SP / Brasil",
    deadline: "26 Maio",
  },
  // Adicione mais se quiser
];

const matchingJobs = [
  {
    logo: "/logos/delta.png",
    score: 65,
    title: "Desenvolvedor de App",
    company: "Delta Global",
    location: "Porto Alegre - RS / Brasil",
    deadline: "20 Maio",
  },
  {
    logo: "/logos/zeus.png",
    score: 74,
    title: "Desenvolvedor Xamarin",
    company: "Zeus Agrotech",
    location: "Uberlândia - MG / Brasil",
    deadline: "20 Maio",
  },
  {
    logo: "/logos/zeus.png",
    score: 74,
    title: "Desenvolvedor Xamarin",
    company: "Zeus Agrotech",
    location: "Uberlândia - MG / Brasil",
    deadline: "20 Maio",
  },
  {
    logo: "/logos/zeus.png",
    score: 74,
    title: "Desenvolvedor Xamarin",
    company: "Zeus Agrotech",
    location: "Uberlândia - MG / Brasil",
    deadline: "20 Maio",
  },
  // Adicione mais se quiser
];

export default function DashboardCandidato({ perfil }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleStartLoading() {
    setLoading(true);
  }

  return (
    <DashboardWrapper externalLoading={loading}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          profile={perfil}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
        />
        <div className="flex flex-col flex-1 overflow-y-auto transition-all">
          <TopBar
            setIsDrawerOpen={setIsDrawerOpen}
            onStartLoading={handleStartLoading}
          />
          <main className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-6">
              <JobList title="Minhas vagas" jobs={[]} />
              <JobList title="Vagas compatíveis" jobs={[]} />
            </div>
            <div className="md:col-span-1">
              <SkillsPanel />
            </div>
          </main>
        </div>
      </div>
    </DashboardWrapper>
  );
}
