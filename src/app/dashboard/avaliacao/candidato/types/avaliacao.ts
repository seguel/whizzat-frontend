export type AvaliacaoStatus =
  | "aguardando_avaliacao"
  | "questionario_enviado"
  | "questionario_respondido"
  | "agenda_sugerida"
  | "agenda_confirmada"
  | "entrevista_realizada"
  | "finalizado";

export interface AvaliacaoDetalhe {
  id: number;

  candidato_nome: string;
  cidade: string;

  skill: string;
  peso: number;

  nota_autoavaliacao: number;

  ultima_avaliacao?: {
    data: string;
    nota: number;
  };

  questionario_enviado: boolean;
  questionario_respondido: boolean;

  agenda_sugerida?: string;
  agenda_confirmada?: string;

  status: AvaliacaoStatus;
}

export interface PerguntaDTO {
  id: number;
  ordem: number;
  pergunta: string;
  tipo: string;
  resposta?: string;
}

export interface QuestionarioDTO {
  avaliacaoId: number;
  skill: string;
  questionarioId: number;
  titulo: string;
  comentario?: string;
  perguntas: PerguntaDTO[];
}
