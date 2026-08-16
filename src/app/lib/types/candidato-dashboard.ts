export type DashboardResumo = {
  processos_seletivos: number;
  entrevistas_agendadas: number;
  entrevistas_realizadas: number;
  skills_avaliadas: number;
};

export type DashboardSkill = {
  id: number;
  skill_id: number;
  nome: string;
  tipo_skill_id: number;
  peso: number;
  peso_avaliador?: number | null;
};

export type DashboardEntrevista = {
  id: number;
  avaliacao_id: number;
  tipo: "AVALIACAO_SKILL" | "PROCESSO_SELETIVO";
  skill: string;
  data_hora: string;
  agenda_status: string;
  status_avaliacao: string;
  atrasada: boolean;
};

export type CandidatoDashboardResponse = {
  resumo: DashboardResumo;
  skills: DashboardSkill[];
  entrevistas_agendadas: DashboardEntrevista[];
};
