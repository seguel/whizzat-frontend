export interface RecrutadorDashboardResumo {
  vagas_abertas: number;
  convites_pendentes: number;
  processos_andamento: number;
  entrevistas_agendadas: number;
  processos_finalizados: number;
}

export interface RecrutadorDashboardAgenda {
  id: number;
  convite_id: number;

  candidato: {
    id: number;
    nome: string;
  };

  titulo: string;
  tipo: string;

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
  } | null;

  data_hora: string;
  status: string;
  atrasada: boolean;
}

export type RecrutadorDashboardAcao = "AGENDA" | "FINALIZAR";

export interface RecrutadorDashboardPendencia {
  id: number;

  candidato: {
    id: number;
    nome: string;
  };

  titulo: string;
  tipo: string;
  status: string;

  empresa: {
    id: number;
    nome_empresa: string;
  } | null;

  vaga: {
    vaga_id: number;
    nome_vaga: string;
  } | null;

  data_convite: string;
  data_aceite: string | null;

  acao: RecrutadorDashboardAcao;
}

export interface RecrutadorDashboardResponse {
  resumo: RecrutadorDashboardResumo;
  agendas: RecrutadorDashboardAgenda[];
  pendencias: RecrutadorDashboardPendencia[];
}
