"use client";

import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
} from "date-fns";

import { ptBR } from "date-fns/locale";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface AgendaItem {
  id: number;
  skill: string;
  data_hora: string;
}

interface Props {
  agenda: AgendaItem[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function AgendaCalendar({
  agenda,
  selectedDate,
  onSelectDate,
}: Props) {
  const { t } = useTranslation("common");
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (agenda.length > 0) {
      return new Date(agenda[0].data_hora);
    }

    return new Date();
  });

  const agendaMap = useMemo(() => {
    return new Map(agenda.map((item) => [item.data_hora.slice(0, 10), item]));
  }, [agenda]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const calendarStart = startOfWeek(monthStart, {
    weekStartsOn: 0,
  });

  const calendarEnd = endOfWeek(monthEnd, {
    weekStartsOn: 0,
  });

  const rows = [];

  let day = calendarStart;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (day <= calendarEnd) {
    const days = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = day;

      const dayString = format(currentDay, "yyyy-MM-dd");

      const agendaInfo = agendaMap.get(dayString);

      const hasAgenda = !!agendaInfo;

      const atrasada =
        hasAgenda &&
        new Date(agendaInfo.data_hora).setHours(0, 0, 0, 0) < today.getTime();

      const isSelected = selectedDate === dayString;

      const isCurrentMonth = isSameMonth(currentDay, currentMonth);

      // if (hasAgenda) console.log(atrasada);

      days.push(
        <button
          key={dayString}
          disabled={!isCurrentMonth}
          onClick={() =>
            hasAgenda ? onSelectDate(isSelected ? null : dayString) : undefined
          }
          className={`
            relative
            h-11
            rounded-lg
            flex
            items-center
            justify-center
            text-sm
            transition-all

            ${
              !isCurrentMonth
                ? "text-gray-300 cursor-default"
                : hasAgenda
                  ? "cursor-pointer hover:bg-blue-50"
                  : "cursor-default text-gray-700"
            }

            ${isSelected ? "bg-blue-400 text-white font-semibold" : ""}
          `}
        >
          {format(currentDay, "d")}

          {hasAgenda && (
            <span
              className={`
                absolute
                bottom-1
                w-1.5
                h-1.5
                rounded-full
                ${
                  isSelected
                    ? "bg-white"
                    : atrasada
                      ? "bg-orange-500"
                      : "bg-blue-600"
                }
              `}
            />
          )}
        </button>,
      );

      day = addDays(day, 1);
    }

    rows.push(
      <div key={day.toISOString()} className="grid grid-cols-7 gap-1">
        {days}
      </div>,
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="text-gray-500 hover:text-blue-600 transition cursor-pointer"
        >
          ◀
        </button>

        <h2 className="font-semibold text-gray-900 capitalize">
          {format(currentMonth, "MMMM yyyy", {
            locale: ptBR,
          })}
        </h2>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="text-gray-500 hover:text-blue-600 transition cursor-pointer"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-center text-gray-400 font-medium">
        <span>{t("agenda.domingo")}</span>
        <span>{t("agenda.segunda")}</span>
        <span>{t("agenda.terca")}</span>
        <span>{t("agenda.quarta")}</span>
        <span>{t("agenda.quinta")}</span>
        <span>{t("agenda.sexta")}</span>
        <span>{t("agenda.sabado")}</span>
      </div>

      <div className="space-y-1">{rows}</div>

      <div className="mt-5 space-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          {t("agenda.entrevista_agendada")}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          {t("agenda.entrevista_pendente")}
        </div>
      </div>
    </div>
  );
}
