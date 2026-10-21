export interface RecrutadorDashboardResumo {
  vagas_abertas: number;
  convites_pendentes: number;
  processos_andamento: number;
  entrevistas_agendadas: number;
  processos_finalizados: number;
}

export type PlataformaEntrevista =
  | "GOOGLE_MEET"
  | "MICROSOFT_TEAMS"
  | "ZOOM"
  | "LINK_EXTERNO";

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

  status_processo: "AGENDADO" | "ENTREVISTA_CONFIRMADA";

  plataforma: PlataformaEntrevista | null;
  link_reuniao: string | null;
  data_envio_link: string | null;

  atrasada: boolean;
}

export type RecrutadorDashboardAcao = "AGENDA" | "ENVIAR_LINK" | "FINALIZAR";

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
