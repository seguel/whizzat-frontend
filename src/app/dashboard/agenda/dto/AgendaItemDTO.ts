export interface AgendaItemDTO {
  id: number;
  avaliacaoId: number;
  skill: string;
  data_hora: string;

  // somente avaliador
  nome?: string;
  cidade?: string;
  estado?: string;
  status?: "ACEITO" | "PENDENTE";
}
