"use client";

import { useState } from "react";
import Sidebar from "../../../../../components/perfil/Sidebar";
import TopBar from "../../../../../components/perfil/TopBar";
// import LoadingOverlay from "../../../../../components/LoadingOverlay";
// import { useTranslation } from "react-i18next";
import { ProfileType } from "../../../../../components/perfil/ProfileContext";
import PageContainer from "@/app/components/PageContainer";

import QuestionarioForm from "../components/QuestionarioForm";

interface Props {
  perfil: ProfileType;
  avaliacaoId: number;
}

export default function Questoes({ perfil, avaliacaoId }: Props) {
  // const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  //   if (loading || loadingAvaliacao) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 bg-[#F5F6F6] overflow-hidden">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        <div className="flex-1 overflow-y-auto">
          <PageContainer>
            <div className="space-y-6">
              <QuestionarioForm avaliacaoId={avaliacaoId} />
            </div>
          </PageContainer>
        </div>
      </div>
    </div>
  );
}
