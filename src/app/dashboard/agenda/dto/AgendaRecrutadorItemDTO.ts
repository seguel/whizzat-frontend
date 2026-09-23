export type AgendaRecrutadorTipo =
  | "VAGA"
  | "OPORTUNIDADE"
  | "PALESTRA_EVENTO"
  | "MENTORIA"
  | "PROJETO_CONSULTORIA"
  | "NETWORKING"
  | "OUTRO";

export interface AgendaRecrutadorItemDTO {
  id: number;
  conviteId: number;

  status: "PENDENTE" | "ACEITO";

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
}
