"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import PageContainer from "../../components/PageContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { useTranslation } from "react-i18next";

import AgendaCalendar from "./components/AgendaCalendar";
import AgendaCardList from "./components/AgendaCardList";
import { AgendaItemDTO } from "./dto/AgendaItemDTO";

interface Props {
  perfil: ProfileType;
}

// export interface AgendaItem {
//   id: number;
//   skill: string;
//   data_hora: string;
// }

export default function AgendaPage({ perfil }: Props) {
  const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [agenda, setAgenda] = useState<AgendaItemDTO[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  async function fetchAgenda() {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/agenda`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Erro ao carregar agenda");
      }

      const data = await res.json();
      // console.log(data);

      setAgenda(data);

      if (data.length == 1) {
        setSelectedDate(data[0].data_hora.slice(0, 10));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAgenda();
  }, []);

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

      <div className="flex flex-col flex-1 bg-[#F5F6F6] overflow-hidden">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        <div className="flex-1 overflow-y-auto">
          <PageContainer>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("agenda.titulo_um")}
                </h1>

                <p className="mt-2 text-gray-500">{t("agenda.titulo_dois")}</p>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  xl:grid-cols-[360px_1fr]
                  gap-6
                  items-start
                "
              >
                <AgendaCalendar
                  agenda={agenda}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />

                <AgendaCardList
                  agenda={agenda}
                  selectedDate={selectedDate}
                  perfil={perfil}
                />
              </div>
            </div>
          </PageContainer>
        </div>
      </div>
    </div>
  );
}
