export interface RespostaQuestionarioDTO {
  pergunta: string;
  resposta: string;
}

export interface AvaliacaoDetalheDTO {
  // Header
  skill: string;
  peso: number;
  peso_avaliador: number | null;
  data_avaliacao: string | null;
  questionario_titulo: string;

  // Questionário
  data_resposta_questionario: string | null;
  respostas: RespostaQuestionarioDTO[];
}
