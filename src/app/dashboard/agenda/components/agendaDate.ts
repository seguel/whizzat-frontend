const AGENDA_TIME_ZONE = "America/Sao_Paulo";

export function getAgendaDateKey(data: string | Date) {
  const date = typeof data === "string" ? new Date(data) : data;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: AGENDA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function getAgendaTime(data: string | Date) {
  const date = typeof data === "string" ? new Date(data) : data;

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: AGENDA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function getAgendaDateParts(data: string | Date) {
  const date = typeof data === "string" ? new Date(data) : data;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: AGENDA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    ano: parts.find((part) => part.type === "year")?.value ?? "",
    mes: parts.find((part) => part.type === "month")?.value ?? "",
    dia: parts.find((part) => part.type === "day")?.value ?? "",
  };
}

export function getAgendaTodayKey() {
  return getAgendaDateKey(new Date());
}

export function isAgendaPastDay(data: string | Date) {
  return getAgendaDateKey(data) < getAgendaTodayKey();
}

export function getAgendaTomorrowKey() {
  const agora = new Date();

  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);

  return getAgendaDateKey(amanha);
}

export function formatAgendaLongDate(data: string | Date, locale: string) {
  const date = typeof data === "string" ? new Date(data) : data;

  return new Intl.DateTimeFormat(locale, {
    timeZone: AGENDA_TIME_ZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
