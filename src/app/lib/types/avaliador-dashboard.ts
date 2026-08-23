export type AvaliadorDashboardAgenda = {
  id: number;
  avaliacao_id: number;
  candidato: string;
  skill: string;
  data_hora: string;
  agenda_status: string;
  status_avaliacao: string;
  atrasada: boolean;
};

export type AvaliadorDashboardResumo = {
  avaliacoes_pendentes: number;
  entrevistas_agendadas: number;
  skills_avaliadas: number;
  pontuacao: number;
};

export type AvaliadorDashboardPendenciaAcao =
  | "QUESTIONARIO"
  | "AGENDA"
  | "REAGENDAR"
  | "FINALIZAR";

export type AvaliadorDashboardPendencia = {
  id: number;
  avaliacao_id: number;
  candidato: string;
  skill: string;
  acao: AvaliadorDashboardPendenciaAcao;
  status_avaliacao: string;
  agenda_status: string | null;
  data_agenda: string | null;
};

export type AvaliadorDashboardTopSkill = {
  id: number;
  nome: string;
  total: number;
};

export type AvaliadorDashboardRanking = {
  posicao: number;
};

export type AvaliadorDashboardResponse = {
  resumo: AvaliadorDashboardResumo;
  agendas: AvaliadorDashboardAgenda[];
  pendencias: AvaliadorDashboardPendencia[];
  top_skills: AvaliadorDashboardTopSkill[];
  ranking: AvaliadorDashboardRanking;
};
