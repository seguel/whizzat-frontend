"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  LockKeyhole,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

type DiscStatus = "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";

interface DiscAlternativa {
  id: number;
  letra: string;
  texto: string;
}

interface DiscPergunta {
  id: number;
  numero_bloco: number;
  alternativas: DiscAlternativa[];
}

interface DiscQuestionario {
  id: number;
  titulo: string;
  descricao: string | null;
  versao: number;
  perguntas: DiscPergunta[];
}

interface DiscResposta {
  pergunta_id: number;
  alternativa_mais_id: number;
  alternativa_menos_id: number;
  tempo_ms: number;
}

interface DiscAplicacao {
  id: number;
  status: DiscStatus;
  respostas?: DiscResposta[];
}

interface DiscResultadoConsulta {
  possui_resultado: boolean;
  resultado: unknown | null;
}

interface DiscQuestionarioModalProps {
  aberto: boolean;
  onFechar: () => void;
  onConcluido: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function discRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    const mensagem = Array.isArray(body?.message)
      ? body.message.join(", ")
      : typeof body?.message === "string"
        ? body.message
        : `HTTP ${response.status}`;

    throw new Error(mensagem);
  }

  const texto = await response.text();

  if (!texto.trim()) {
    return null as T;
  }

  return JSON.parse(texto) as T;
}

export default function DiscQuestionarioModal({
  aberto,
  onFechar,
  onConcluido,
}: DiscQuestionarioModalProps) {
  const { t } = useTranslation("common");

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [questionario, setQuestionario] = useState<DiscQuestionario | null>(
    null,
  );

  const [aplicacao, setAplicacao] = useState<DiscAplicacao | null>(null);

  const [indice, setIndice] = useState(0);

  const [respostas, setRespostas] = useState<Record<number, DiscResposta>>({});

  const [mais, setMais] = useState<number | null>(null);
  const [menos, setMenos] = useState<number | null>(null);

  const inicioBloco = useRef<number>(Date.now());
  const ocupadoRef = useRef(false);
  const sessaoRef = useRef(0);
  const onFecharRef = useRef(onFechar);
  const onConcluidoRef = useRef(onConcluido);
  onFecharRef.current = onFechar;
  onConcluidoRef.current = onConcluido;

  const perguntas = questionario?.perguntas ?? [];
  const perguntaAtual = perguntas[indice];

  const total = perguntas.length;
  const totalRespondidas = perguntas.filter((p) => respostas[p.id]).length;

  const todasRespondidas = total > 0 && totalRespondidas === total;

  const possuiSelecao = mais !== null && menos !== null && mais !== menos;

  const [consentimento, setConsentimento] = useState(false);
  const [aguardandoConsentimento, setAguardandoConsentimento] = useState(false);

  const carregarDados = useCallback(async () => {
    const sessao = ++sessaoRef.current;

    setCarregando(true);

    try {
      const resultado = await discRequest<DiscResultadoConsulta>(
        "/disc/meu-resultado",
      );

      if (sessao !== sessaoRef.current) return;

      if (resultado.possui_resultado) {
        toast.info(t("disc.modal_ja_concluido"));
        onConcluidoRef.current();
        return;
      }

      const [dadosQuestionario, dadosAplicacao] = await Promise.all([
        discRequest<DiscQuestionario>("/disc/questionario"),
        discRequest<DiscAplicacao | null>("/disc/minha-aplicacao"),
      ]);

      if (sessao !== sessaoRef.current) return;

      if (!dadosQuestionario || dadosQuestionario.perguntas.length !== 24) {
        throw new Error("Questionário DISC inválido.");
      }

      const perguntasOrdenadas = [...dadosQuestionario.perguntas].sort(
        (a, b) => a.numero_bloco - b.numero_bloco,
      );

      const mapa: Record<number, DiscResposta> = {};

      for (const resposta of dadosAplicacao?.respostas ?? []) {
        mapa[resposta.pergunta_id] = resposta;
      }

      const primeiraPendente = perguntasOrdenadas.findIndex((p) => !mapa[p.id]);

      setQuestionario({
        ...dadosQuestionario,
        perguntas: perguntasOrdenadas,
      });

      setAplicacao(dadosAplicacao);
      setRespostas(mapa);
      setIndice(primeiraPendente >= 0 ? primeiraPendente : 0);

      if (!dadosAplicacao || dadosAplicacao.status === "CANCELADO") {
        setAplicacao(null);
        setConsentimento(false);
        setAguardandoConsentimento(true);
        return;
      }

      if (dadosAplicacao.status === "CONCLUIDO") {
        onConcluidoRef.current();
        return;
      }

      setAguardandoConsentimento(false);
    } catch {
      if (sessao !== sessaoRef.current) return;

      toast.error(t("disc.erro_carregar"));
      onFecharRef.current();
    } finally {
      if (sessao === sessaoRef.current) {
        setCarregando(false);
      }
    }
  }, [t]);

  useEffect(() => {
    if (!aberto) {
      sessaoRef.current += 1;
      setQuestionario(null);
      setAplicacao(null);
      setRespostas({});
      setIndice(0);
      setMais(null);
      setMenos(null);
      setCarregando(false);
      setConsentimento(false);
      setAguardandoConsentimento(false);
      return;
    }

    void carregarDados();

    return () => {
      sessaoRef.current += 1;
    };
  }, [aberto, carregarDados]);

  useEffect(() => {
    if (!aberto || !perguntaAtual) return;

    const resposta = respostas[perguntaAtual.id];

    setMais(resposta?.alternativa_mais_id ?? null);
    setMenos(resposta?.alternativa_menos_id ?? null);

    inicioBloco.current = Date.now();

    // Restauramos a seleção ao mudar de bloco.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, perguntaAtual?.id]);

  const selecionarMais = (alternativaId: number) => {
    if (salvando) return;

    setMais(alternativaId);

    if (menos === alternativaId) {
      setMenos(null);
    }
  };

  const selecionarMenos = (alternativaId: number) => {
    if (salvando) return;

    setMenos(alternativaId);

    if (mais === alternativaId) {
      setMais(null);
    }
  };

  const iniciarAplicacao = async () => {
    if (
      ocupadoRef.current ||
      aplicacao ||
      !aguardandoConsentimento ||
      !consentimento
    )
      return;

    const sessao = sessaoRef.current;
    ocupadoRef.current = true;
    setSalvando(true);

    try {
      const novaAplicacao = await discRequest<DiscAplicacao>("/disc/iniciar", {
        method: "POST",
        body: JSON.stringify({ consentimento: true }),
      });

      if (sessao !== sessaoRef.current) return;

      const mapa: Record<number, DiscResposta> = {};
      for (const resposta of novaAplicacao.respostas ?? []) {
        mapa[resposta.pergunta_id] = resposta;
      }

      setAplicacao(novaAplicacao);
      setRespostas(mapa);
      const primeiraPendente = (questionario?.perguntas ?? []).findIndex(
        (pergunta) => !mapa[pergunta.id],
      );
      setIndice(primeiraPendente >= 0 ? primeiraPendente : 0);
      setAguardandoConsentimento(false);
    } catch {
      if (sessao === sessaoRef.current) toast.error(t("disc.erro_iniciar"));
    } finally {
      ocupadoRef.current = false;
      if (sessao === sessaoRef.current) setSalvando(false);
    }
  };

  const salvarRespostaAtual = async (): Promise<boolean> => {
    if (!aplicacao || !perguntaAtual || ocupadoRef.current) {
      return false;
    }

    const anterior = respostas[perguntaAtual.id];

    // Não exige preenchimento quando o usuário
    // apenas volta ou fecha um bloco ainda vazio.
    if (mais === null && menos === null) {
      return true;
    }

    if (!possuiSelecao) {
      toast.warning(t("disc.modal_selecione_ambas"));
      return false;
    }

    ocupadoRef.current = true;
    setSalvando(true);

    const tempoAnterior = anterior?.tempo_ms ?? 0;
    const tempoDecorrido = Math.max(0, Date.now() - inicioBloco.current);

    const resposta: DiscResposta = {
      pergunta_id: perguntaAtual.id,
      alternativa_mais_id: mais!,
      alternativa_menos_id: menos!,
      tempo_ms: Math.min(3600000, tempoAnterior + tempoDecorrido),
    };

    try {
      await discRequest(`/disc/aplicacoes/${aplicacao.id}/resposta`, {
        method: "PATCH",
        body: JSON.stringify(resposta),
      });

      setRespostas((prev) => ({
        ...prev,
        [perguntaAtual.id]: resposta,
      }));

      inicioBloco.current = Date.now();

      return true;
    } catch {
      toast.error(t("disc.modal_erro_salvar"));
      return false;
    } finally {
      ocupadoRef.current = false;
      setSalvando(false);
    }
  };

  const navegarPara = async (novoIndice: number) => {
    if (
      novoIndice < 0 ||
      novoIndice >= total ||
      novoIndice === indice ||
      ocupadoRef.current
    ) {
      return;
    }

    const salvo = await salvarRespostaAtual();

    if (!salvo) return;

    setIndice(novoIndice);
  };

  const proximo = async () => {
    if (!possuiSelecao) {
      toast.warning(t("disc.modal_selecione_ambas"));
      return;
    }

    await navegarPara(indice + 1);
  };

  const fechar = async () => {
    if (ocupadoRef.current) return;

    if (aplicacao && perguntaAtual) {
      const salvo = await salvarRespostaAtual();

      if (!salvo) return;
    }

    onFechar();
  };

  const finalizar = async () => {
    if (!aplicacao || !perguntaAtual || ocupadoRef.current) {
      return;
    }

    if (!possuiSelecao) {
      toast.warning(t("disc.modal_selecione_ambas"));
      return;
    }

    const totalAposSalvar =
      totalRespondidas + (respostas[perguntaAtual.id] ? 0 : 1);

    if (totalAposSalvar !== total) {
      toast.warning(t("disc.modal_incompleto"));
      return;
    }

    const confirmacao = await Swal.fire({
      title: t("disc.modal_confirmar_titulo"),
      text: t("disc.modal_confirmar_finalizacao"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("disc.modal_confirmar_sim"),
      cancelButtonText: t("disc.modal_confirmar_cancelar"),
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-lg px-5 py-2.5",
        cancelButton: "rounded-lg px-5 py-2.5",
      },
    });

    if (!confirmacao.isConfirmed) {
      return;
    }

    const salvo = await salvarRespostaAtual();

    if (!salvo) return;

    ocupadoRef.current = true;
    setSalvando(true);

    try {
      await discRequest(`/disc/aplicacoes/${aplicacao.id}/finalizar`, {
        method: "POST",
      });

      toast.success(t("disc.modal_sucesso"));

      onConcluido();
    } catch {
      toast.error(t("disc.modal_erro_finalizar"));
    } finally {
      ocupadoRef.current = false;
      setSalvando(false);
    }
  };

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("disc.titulo")}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-2 sm:p-5"
    >
      <div className="flex max-h-[96dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
              {t("disc.titulo")}
            </h2>

            {aplicacao && total > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {t("disc.modal_progresso", {
                  atual: indice + 1,
                  total,
                })}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void fechar()}
            disabled={salvando || carregando}
            aria-label={t("disc.modal_fechar")}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
          >
            <X size={22} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {carregando ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 size={30} className="animate-spin text-blue-600" />
            </div>
          ) : aguardandoConsentimento ? (
            <div className="mx-auto max-w-xl space-y-5 py-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <div className="mb-3 flex items-center gap-2 text-blue-800">
                  <LockKeyhole size={20} />
                  <h3 className="text-base font-semibold">
                    {t("disc.consentimento_titulo")}
                  </h3>
                </div>
                <p className="text-sm leading-6 text-blue-900">
                  {t("disc.consentimento_descricao")}
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={consentimento}
                  onChange={(event) => setConsentimento(event.target.checked)}
                  disabled={salvando}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                />
                <span className="text-sm leading-6 text-gray-700">
                  {t("disc.consentimento_aceite")}
                </span>
              </label>

              <button
                type="button"
                onClick={() => void iniciarAplicacao()}
                disabled={!consentimento || salvando}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando && <Loader2 size={17} className="animate-spin" />}
                {salvando ? t("disc.aguarde") : t("disc.consentimento_iniciar")}
              </button>
            </div>
          ) : perguntaAtual && aplicacao ? (
            <div className="space-y-5">
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${((indice + 1) / total) * 100}%`,
                  }}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {t("disc.modal_instrucao")}
                </p>

                <span className="text-xs font-medium text-gray-500">
                  {t("disc.modal_respondidas", {
                    quantidade: totalRespondidas,
                    total,
                  })}
                </span>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_52px_52px] items-center gap-2 px-3 text-center text-xs font-semibold text-gray-600 sm:grid-cols-[minmax(0,1fr)_72px_72px]">
                <span />
                <span>{t("disc.modal_mais")}</span>
                <span>{t("disc.modal_menos")}</span>
              </div>

              <div className="space-y-2">
                {perguntaAtual.alternativas.map((alternativa) => (
                  <div
                    key={alternativa.id}
                    className="grid grid-cols-[minmax(0,1fr)_52px_52px] items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-blue-200 sm:grid-cols-[minmax(0,1fr)_72px_72px]"
                  >
                    <span className="min-w-0 text-sm leading-5 text-gray-800">
                      {alternativa.texto}
                    </span>

                    <div className="flex justify-center">
                      <input
                        type="radio"
                        name={`disc-mais-${perguntaAtual.id}`}
                        checked={mais === alternativa.id}
                        onChange={() => selecionarMais(alternativa.id)}
                        disabled={salvando}
                        aria-label={`${t("disc.modal_mais")}: ${alternativa.texto}`}
                        className="h-5 w-5 cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className="flex justify-center">
                      <input
                        type="radio"
                        name={`disc-menos-${perguntaAtual.id}`}
                        checked={menos === alternativa.id}
                        onChange={() => selecionarMenos(alternativa.id)}
                        disabled={salvando}
                        aria-label={`${t("disc.modal_menos")}: ${alternativa.texto}`}
                        className="h-5 w-5 cursor-pointer accent-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="mb-3 text-xs font-semibold text-gray-600">
                  {t("disc.modal_navegar_blocos")}
                </p>

                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12">
                  {perguntas.map((p, i) => {
                    const respondida = Boolean(respostas[p.id]);
                    const atual = i === indice;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={salvando}
                        onClick={() => void navegarPara(i)}
                        aria-label={t("disc.modal_ir_bloco", {
                          numero: p.numero_bloco,
                        })}
                        aria-current={atual ? "step" : undefined}
                        className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition  cursor-pointer ${
                          atual
                            ? "bg-blue-600 text-white"
                            : respondida
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {p.numero_bloco}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-green-600" />
                    {t("disc.modal_respondido")}
                  </span>

                  <span className="flex items-center gap-1">
                    <Circle size={14} />
                    {t("disc.modal_pendente")}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {aplicacao && perguntaAtual && (
          <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <button
              type="button"
              disabled={indice === 0 || salvando}
              onClick={() => void navegarPara(indice - 1)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition  cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <ArrowLeft size={17} />
              {t("disc.modal_anterior")}
            </button>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {todasRespondidas && (
                <button
                  type="button"
                  disabled={salvando}
                  onClick={() => void finalizar()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition  cursor-pointer hover:bg-green-700 disabled:bg-gray-300 sm:w-auto"
                >
                  <CheckCircle2 size={17} />
                  {t("disc.modal_finalizar")}
                </button>
              )}

              {indice < total - 1 && (
                <button
                  type="button"
                  disabled={salvando || !possuiSelecao}
                  onClick={() => void proximo()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition  cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
                >
                  {salvando ? t("disc.aguarde") : t("disc.modal_proximo")}
                  <ArrowRight size={17} />
                </button>
              )}

              {indice === total - 1 && !todasRespondidas && (
                <button
                  type="button"
                  disabled={salvando || !possuiSelecao}
                  onClick={() => void salvarRespostaAtual()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition  cursor-pointer hover:bg-blue-700 disabled:bg-gray-300 sm:w-auto"
                >
                  {t("disc.modal_salvar_resposta")}
                </button>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
