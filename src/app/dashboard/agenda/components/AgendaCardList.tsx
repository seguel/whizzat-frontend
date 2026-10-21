"use client";

import { useEffect, useRef } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import AgendaCard from "./AgendaCard";
import { AgendaItemDTO } from "../dto/AgendaItemDTO";
import { AgendaRecrutadorItemDTO } from "../dto/AgendaRecrutadorItemDTO";
import { AgendaCandidatoItemDTO } from "../dto/AgendaCandidatoItemDTO";
import { useTranslation } from "react-i18next";
import {
  getAgendaDateKey,
  getAgendaTomorrowKey,
  formatAgendaLongDate,
  getAgendaTodayKey,
} from "./agendaDate";

type AgendaDTO =
  | AgendaItemDTO
  | AgendaRecrutadorItemDTO
  | AgendaCandidatoItemDTO;

interface Props {
  agenda: AgendaDTO[];
  selectedDate: string | null;
  perfil: string;
}

export default function AgendaCardList({
  agenda,
  selectedDate,
  perfil,
}: Props) {
  const refs = useRef<Record<string | number, HTMLDivElement | null>>({});
  const { t, i18n } = useTranslation("common");

  const locale =
    i18n.language === "en"
      ? "en-US"
      : i18n.language === "es"
        ? "es-ES"
        : "pt-BR";

  function getTituloGrupo(
    data: string,
    locale: string,
    t: (key: string) => string,
  ) {
    const dateKey = getAgendaDateKey(data);

    if (dateKey === getAgendaTodayKey()) {
      return t("agenda.hoje");
    }

    if (dateKey === getAgendaTomorrowKey()) {
      return t("agenda.amanha");
    }

    return formatAgendaLongDate(data, locale);
  }

  const grupos = agenda.reduce(
    (acc, item) => {
      const titulo = getTituloGrupo(item.data_hora, locale, t);

      if (!acc[titulo]) {
        acc[titulo] = [];
      }

      acc[titulo].push(item);

      return acc;
    },
    {} as Record<string, AgendaDTO[]>,
  );

  useEffect(() => {
    if (!selectedDate) return;

    const item = agenda.find(
      (a) => getAgendaDateKey(a.data_hora) === selectedDate,
    );

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
            (item) => selectedDate === getAgendaDateKey(item.data_hora),
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
                    selected={selectedDate === getAgendaDateKey(item.data_hora)}
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
