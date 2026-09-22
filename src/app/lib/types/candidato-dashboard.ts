export type DashboardResumo = {
  processos_seletivos: number;
  outras_oportunidades: number;
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

export type DashboardTipoConvite =
  | "VAGA"
  | "PALESTRA_EVENTO"
  | "MENTORIA"
  | "PROJETO_CONSULTORIA"
  | "NETWORKING"
  | "OUTRO";

export type DashboardEntrevista = {
  id: number;
  referencia_id: number;

  tipo: "AVALIACAO_SKILL" | "RECRUTADOR";
  tipo_convite: DashboardTipoConvite | null;

  titulo: string;
  subtitulo: string | null;

  data_hora: string;
  agenda_status: string;
  status: string;

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
  } | null;

  atrasada: boolean;
};

export type DashboardOportunidade = {
  id: number;

  tipo: DashboardTipoConvite;

  titulo: string;

  status:
    | "CONVITE_ACEITO"
    | "AGENDA_ENVIADA"
    | "AGENDADO"
    | "ENTREVISTA_REALIZADA";

  compatibilidade: number | null;

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
  } | null;

  agenda: {
    id: number;
    data_hora: string;
    status: string;
  } | null;

  data_convite: string;
  data_aceite: string | null;
};

export type DashboardMovimentacao = {
  id: string;

  evento:
    | "CONVITE_RECEBIDO"
    | "CONVITE_ACEITO"
    | "AGENDA_ENVIADA"
    | "AGENDA_CONFIRMADA"
    | "PROCESSO_FINALIZADO";

  origem: "RECRUTADOR";
  referencia_id: number;
  tipo_convite: DashboardTipoConvite;
  descricao: string;
  empresa: string | null;
  data: string;
};

export type CandidatoDashboardResponse = {
  resumo: DashboardResumo;
  skills: DashboardSkill[];
  oportunidades: DashboardOportunidade[];
  movimentacoes_recentes: DashboardMovimentacao[];
  entrevistas_agendadas: DashboardEntrevista[];
};
