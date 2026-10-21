export type AgendaRecrutadorTipo =
  | "VAGA"
  | "OPORTUNIDADE"
  | "PALESTRA_EVENTO"
  | "MENTORIA"
  | "PROJETO_CONSULTORIA"
  | "NETWORKING"
  | "OUTRO";

export type AgendaRecrutadorStatusProcesso =
  | "AGENDA_ENVIADA"
  | "AGENDADO"
  | "ENTREVISTA_CONFIRMADA";

export type AgendaRecrutadorPlataforma =
  | "GOOGLE_MEET"
  | "MICROSOFT_TEAMS"
  | "ZOOM"
  | "LINK_EXTERNO";

export interface AgendaRecrutadorItemDTO {
  id: number;
  conviteId: number;

  // status da agenda
  status: "PENDENTE" | "ACEITO";

  // status do processo
  status_processo: AgendaRecrutadorStatusProcesso;

  data_hora: string;

  tipo: AgendaRecrutadorTipo;
  titulo: string;

  candidato: {
    id: number;
    nome: string;
    cidade: string;
    estado: string;
  };

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
  } | null;

  plataforma: AgendaRecrutadorPlataforma | null;
  link_reuniao: string | null;
  data_envio_link: string | null;
}
