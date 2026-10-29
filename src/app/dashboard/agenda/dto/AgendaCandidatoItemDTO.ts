export type AgendaCandidatoTipo =
  | "AVALIACAO_SKILL"
  | "VAGA"
  | "OPORTUNIDADE"
  | "PALESTRA_EVENTO"
  | "MENTORIA"
  | "PROJETO_CONSULTORIA"
  | "NETWORKING"
  | "OUTRO";

export type AgendaCandidatoStatus =
  | "ACEITO"
  | "PENDENTE"
  | "AGENDA_ENVIADA"
  | "AGENDADO"
  | "ENTREVISTA_CONFIRMADA";

export type AgendaCandidatoPlataforma =
  | "GOOGLE_MEET"
  | "MICROSOFT_TEAMS"
  | "ZOOM"
  | "LINK_EXTERNO";

export interface AgendaCandidatoItemDTO {
  id: string;

  agendaId: number;
  referenciaId: number;

  origem: "AVALIACAO" | "RECRUTADOR";

  status: AgendaCandidatoStatus;

  data_hora: string;

  titulo: string;
  tipo: AgendaCandidatoTipo;

  skill: string | null;
  autoavaliacao: number | null;

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
  } | null;

  plataforma: AgendaCandidatoPlataforma | null;
  link_reuniao: string | null;
  data_envio_link: string | null;
}
