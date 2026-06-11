"use client";

import { useEffect, useRef } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import AgendaCard from "./AgendaCard";
import { AgendaItemDTO } from "../dto/AgendaItemDTO";
import { useTranslation } from "react-i18next";

function getTituloGrupo(data: Date, t: (key: string) => string) {
  if (isToday(data)) {
    return t("agenda.hoje");
  }

  if (isTomorrow(data)) {
    return t("agenda.amanha");
  }

  return format(data, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
}

interface Props {
  agenda: AgendaItemDTO[];
  selectedDate: string | null;
  perfil: string;
}

export default function AgendaCardList({
  agenda,
  selectedDate,
  perfil,
}: Props) {
  const refs = useRef<Record<number, HTMLDivElement | null>>({});
  const { t } = useTranslation("common");

  const grupos = agenda.reduce(
    (acc, item) => {
      const titulo = getTituloGrupo(new Date(item.data_hora), t);

      if (!acc[titulo]) {
        acc[titulo] = [];
      }

      acc[titulo].push(item);

      return acc;
    },
    {} as Record<string, AgendaItemDTO[]>,
  );

  useEffect(() => {
    if (!selectedDate) return;

    const item = agenda.find((a) => a.data_hora.slice(0, 10) === selectedDate);

    if (!item) return;

    refs.current[item.id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [selectedDate, agenda]);

  if (!agenda.length) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-10 text-center">
        <div className="text-5xl mb-3">📅</div>

        <h2 className="text-lg font-semibold text-gray-800">
          {t("agenda.sem_entrevista")}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {t("agenda.msg_sem_entrevista")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("agenda.proxima_entrevista")}
          </h2>

          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
            {agenda.length}
          </span>
        </div>
      </div>

      <div className="p-6">
        {Object.entries(grupos).map(([titulo, itens]) => {
          const grupoSelecionado = itens.some(
            (item) => selectedDate === item.data_hora.slice(0, 10),
          );

          return (
            <div key={titulo} className="mb-8 last:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <h3
                  className={`font-semibold ${
                    grupoSelecionado ? "text-blue-700" : "text-gray-900"
                  }`}
                >
                  {titulo}
                </h3>

                <div
                  className={`flex-1 h-px ${
                    grupoSelecionado ? "bg-blue-200" : "bg-gray-200"
                  }`}
                />
              </div>

              <div className="space-y-4">
                {itens.map((item) => (
                  <AgendaCard
                    key={item.id}
                    agenda={item}
                    selected={selectedDate === item.data_hora.slice(0, 10)}
                    perfil={perfil}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
