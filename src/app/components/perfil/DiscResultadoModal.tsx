"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BrainCircuit,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

type Dimensao = "D" | "I" | "S" | "C";

interface DiscResultado {
  id: number;
  status: string;
  iniciado_em: string;
  finalizado_em: string | null;
  scores: Record<Dimensao, number | null>;
  dominante: string | null;
  secundaria: string | null;
  blend_codigo: string | null;
  blend_titulo: string | null;
  tempo_total_ms: number | null;
  tempo_medio_ms: number | null;
  bloco_mais_rapido: number | null;
  bloco_mais_lento: number | null;
  alerta_tempo: string | null;
  compartilhar_recrutador: boolean;
}

interface DiscResultadoResponse {
  possui_resultado: boolean;
  resultado: DiscResultado | null;
}

interface DiscResultadoModalProps {
  aberto: boolean;
  onFechar: () => void;
}

const dimensoes: {
  codigo: Dimensao;
  cor: string;
  corTexto: string;
  corFundo: string;
}[] = [
  {
    codigo: "D",
    cor: "bg-red-500",
    corTexto: "text-red-700",
    corFundo: "bg-red-50",
  },
  {
    codigo: "I",
    cor: "bg-yellow-500",
    corTexto: "text-yellow-700",
    corFundo: "bg-yellow-50",
  },
  {
    codigo: "S",
    cor: "bg-green-500",
    corTexto: "text-green-700",
    corFundo: "bg-green-50",
  },
  {
    codigo: "C",
    cor: "bg-blue-500",
    corTexto: "text-blue-700",
    corFundo: "bg-blue-50",
  },
];

export default function DiscResultadoModal({
  aberto,
  onFechar,
}: DiscResultadoModalProps) {
  const { t, i18n } = useTranslation("common");

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<DiscResultado | null>(null);
  const [erro, setErro] = useState(false);

  const [compartilhar, setCompartilhar] = useState(false);
  const [salvandoCompartilhamento, setSalvandoCompartilhamento] =
    useState(false);

  useEffect(() => {
    if (!aberto) return;

    const controller = new AbortController();
    let ativo = true;

    const carregarResultado = async () => {
      setLoading(true);
      setErro(false);
      setResultado(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/disc/meu-resultado`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const texto = await response.text();

        if (!texto.trim()) {
          throw new Error("Resposta DISC vazia");
        }

        const dados: DiscResultadoResponse = JSON.parse(texto);

        if (!ativo) return;

        const resultadoCarregado = dados.possui_resultado
          ? dados.resultado
          : null;

        setResultado(resultadoCarregado);
        setCompartilhar(resultadoCarregado?.compartilhar_recrutador ?? false);
      } catch (error) {
        if (!ativo || controller.signal.aborted) return;

        console.error("Erro ao carregar resultado DISC:", error);
        setErro(true);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    void carregarResultado();

    return () => {
      ativo = false;
      controller.abort();
    };
  }, [aberto]);

  const atualizarCompartilhamento = async (novoValor: boolean) => {
    if (!resultado || salvandoCompartilhamento) return;

    setSalvandoCompartilhamento(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/disc/minha-aplicacao/compartilhamento`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            compartilhar_recrutador: novoValor,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setCompartilhar(novoValor);

      setResultado((prev) =>
        prev
          ? {
              ...prev,
              compartilhar_recrutador: novoValor,
            }
          : prev,
      );
    } catch (error) {
      console.error("Erro ao atualizar compartilhamento DISC:", error);
      toast.error(t("disc.resultado_compartilhar_erro"));
    } finally {
      setSalvandoCompartilhamento(false);
    }
  };

  if (!aberto) return null;

  const scores = dimensoes.map((dimensao) => ({
    ...dimensao,
    valor: Number(resultado?.scores?.[dimensao.codigo] ?? 0),
  }));

  // Os scores podem ser negativos ou positivos.
  // A escala é calculada a partir dos valores reais,
  // sem presumir que sejam porcentagens.
  const menorScore = Math.min(0, ...scores.map((s) => s.valor));
  const maiorScore = Math.max(0, ...scores.map((s) => s.valor));

  const amplitude = Math.max(1, maiorScore - menorScore);

  const posicaoZero = ((0 - menorScore) / amplitude) * 100;

  const formatarTempo = (tempoMs: number | null) => {
    if (tempoMs == null) return "-";

    const segundos = Math.round(tempoMs / 1000);

    if (segundos < 60) {
      return `${segundos}s`;
    }

    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    return `${minutos}min ${segundosRestantes}s`;
  };

  const formatarData = (data: string | null) => {
    if (!data) return "-";

    return new Intl.DateTimeFormat(i18n.language, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(data));
  };

  const nomeDimensao = (codigo: string | null) => {
    if (!codigo) return "-";

    const nomes: Record<string, string> = {
      D: t("disc.resultado_dimensao_d"),
      I: t("disc.resultado_dimensao_i"),
      S: t("disc.resultado_dimensao_s"),
      C: t("disc.resultado_dimensao_c"),
    };

    return nomes[codigo] ?? codigo;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("disc.resultado_titulo")}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-2 sm:p-5"
    >
      <div className="flex max-h-[96dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BrainCircuit size={25} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                {t("disc.resultado_titulo")}
              </h2>

              <p className="text-xs text-gray-500">
                {t("disc.resultado_subtitulo")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            aria-label={t("disc.modal_fechar")}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100  cursor-pointer"
          >
            <X size={22} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <Loader2 size={30} className="animate-spin text-blue-600" />
            </div>
          ) : erro ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {t("disc.resultado_erro")}
            </div>
          ) : !resultado ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
              {t("disc.resultado_indisponivel")}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  <CheckCircle2 size={15} />
                  {t("disc.concluido")}
                </span>

                <span className="text-xs text-gray-500">
                  {t("disc.resultado_data")}:{" "}
                  {formatarData(resultado.finalizado_em)}
                </span>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {t("disc.resultado_perfil_predominante")}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {resultado.blend_codigo ?? resultado.dominante ?? "-"}
                </h3>

                {resultado.blend_titulo && (
                  <p className="mt-1 text-base font-medium text-gray-700">
                    {resultado.blend_titulo}
                  </p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-gray-500">
                      {t("disc.resultado_dominante")}
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {nomeDimensao(resultado.dominante)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-gray-500">
                      {t("disc.resultado_secundaria")}
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {nomeDimensao(resultado.secundaria)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base font-bold text-gray-900">
                  {t("disc.resultado_grafico_titulo")}
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {t("disc.resultado_grafico_descricao")}
                </p>

                <div className="mt-6 space-y-5">
                  {scores.map((item) => {
                    const posicao =
                      ((item.valor - menorScore) / amplitude) * 100;

                    const inicio = Math.min(posicaoZero, posicao);
                    const largura = Math.abs(posicao - posicaoZero);

                    return (
                      <div key={item.codigo}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span
                            className={`text-sm font-semibold ${item.corTexto}`}
                          >
                            {item.codigo} — {nomeDimensao(item.codigo)}
                          </span>

                          <span className="text-sm font-bold tabular-nums text-gray-800">
                            {item.valor}
                          </span>
                        </div>

                        <div className="relative h-4 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="absolute inset-y-0 w-px bg-gray-400"
                            style={{ left: `${posicaoZero}%` }}
                          />

                          <div
                            className={`absolute inset-y-0 rounded-full ${item.cor}`}
                            style={{
                              left: `${inicio}%`,
                              width: `${largura}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-5 text-xs leading-5 text-gray-500">
                  {t("disc.resultado_escala")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock3 size={19} />
                    <h3 className="text-sm font-semibold text-gray-900">
                      {t("disc.resultado_tempo_titulo")}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm text-gray-600">
                    {t("disc.resultado_tempo_total")}:{" "}
                    <strong>{formatarTempo(resultado.tempo_total_ms)}</strong>
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {t("disc.resultado_tempo_medio")}:{" "}
                    <strong>{formatarTempo(resultado.tempo_medio_ms)}</strong>
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      {compartilhar ? (
                        <ShieldCheck size={19} />
                      ) : (
                        <LockKeyhole size={19} />
                      )}

                      <h3 className="text-sm font-semibold text-gray-900">
                        {t("disc.resultado_privacidade_titulo")}
                      </h3>
                    </div>

                    <label className="mt-4 flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={compartilhar}
                        disabled={salvandoCompartilhamento}
                        onChange={(e) =>
                          void atualizarCompartilhamento(e.target.checked)
                        }
                        className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
                      />

                      <span className="text-sm font-medium leading-6 text-gray-800">
                        {t("disc.resultado_permitir_compartilhar")}
                      </span>
                    </label>

                    <p className="mt-3 text-xs leading-5 text-gray-500">
                      {compartilhar
                        ? t("disc.resultado_compartilhado")
                        : t("disc.resultado_privado")}
                    </p>

                    {salvandoCompartilhamento && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                        <Loader2 size={14} className="animate-spin" />
                        {t("disc.resultado_salvando_compartilhamento")}
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {resultado.compartilhar_recrutador
                      ? t("disc.resultado_compartilhado")
                      : t("disc.resultado_privado")}
                  </p>
                </div>
              </div>

              <p className="text-xs leading-5 text-gray-500">
                {t("disc.resultado_observacao")}
              </p>
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-gray-200 p-4 sm:px-6">
          <button
            type="button"
            onClick={onFechar}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition  cursor-pointer hover:bg-blue-700 sm:w-auto"
          >
            {t("disc.modal_fechar")}
          </button>
        </footer>
      </div>
    </div>
  );
}
