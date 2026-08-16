"use client";

import LoadingOverlay from "../../../components/LoadingOverlay";
import DashboardStats from "./DashboardStats";
import SkillsOverview from "./SkillsOverview";
import UpcomingInterviews from "./UpcomingInterviews";
import CandidateOpportunities from "./CandidateOpportunities";
import ProcessTimeline from "./ProcessTimeline";
import { useCandidatoDashboard } from "../../../lib/hooks/useCandidatoDashboard";

export default function CandidateDashboard() {
  const { data, loading, error } = useCandidatoDashboard();

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-6">
        <p className="text-sm text-red-600">
          Não foi possível carregar o dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Dashboard</h1>

        <p className="text-sm text-gray-500 mt-1">
          Acompanhe seus processos seletivos, entrevistas e evolução do seu
          perfil.
        </p>
      </div>

      <DashboardStats resumo={data.resumo} />

      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
        <SkillsOverview skills={data.skills} />

        <UpcomingInterviews entrevistas={data.entrevistas_agendadas} />
      </div>

      <CandidateOpportunities />

      <ProcessTimeline />
    </div>
  );
}
