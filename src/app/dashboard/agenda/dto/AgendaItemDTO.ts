export interface AgendaItemDTO {
  id: number;
  avaliacaoId: number;
  skill: string;
  data_hora: string;

  // Somente avaliador
  nome?: string;
  cidade?: string;
  estado?: string;
  status?: "ACEITO" | "PENDENTE";

  // Entrevista
  status_avaliacao?: string;
  plataforma?:
    | "GOOGLE_MEET"
    | "MICROSOFT_TEAMS"
    | "ZOOM"
    | "LINK_EXTERNO"
    | null;
  link_reuniao?: string | null;
  data_envio_link?: string | null;
}
