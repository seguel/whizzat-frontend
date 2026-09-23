export type AgendaCandidatoTipo =
  | "AVALIACAO_SKILL"
  | "VAGA"
  | "OPORTUNIDADE"
  | "PALESTRA_EVENTO"
  | "MENTORIA"
  | "PROJETO_CONSULTORIA"
  | "NETWORKING"
  | "OUTRO";

export interface AgendaCandidatoItemDTO {
  id: string;

  agendaId: number;
  referenciaId: number;

  origem: "AVALIACAO" | "RECRUTADOR";
  status: "ACEITO" | "PENDENTE";

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
}
