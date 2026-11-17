"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BrainCircuit,
  Clock3,
  FileQuestion,
  LockKeyhole,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

type DiscStatus = "NAO_INICIADO" | "EM_ANDAMENTO" | "CONCLUIDO";

interface DiscStepProps {
  status: DiscStatus;
  loading?: boolean;
  candidatoExistente: boolean;
  onVoltar: () => void;
  onAvancar: () => void;
  onResponder: () => Promise<void> | void;
  onVisualizarResultado?: () => void;
}
export default function DiscStep({
  status,
  loading = false,
  candidatoExistente,
  onVoltar,
  onAvancar,
  onResponder,
  onVisualizarResultado,
}: DiscStepProps) {
  const { t } = useTranslation("common");

  const [consentimento, setConsentimento] = useState(false);

  const concluido = status === "CONCLUIDO";
  const emAndamento = status === "EM_ANDAMENTO";

  const podeResponder =
    candidatoExistente &&
    !loading &&
    (emAndamento || (!concluido && consentimento));

  return (
    <section className="w-full max-w-4xl mx-auto space-y-5 pb-6">
      <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <BrainCircuit size={30} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {t("disc.opcional")}
              </span>

              {concluido && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {t("disc.concluido")}
                </span>
              )}

              {emAndamento && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {t("disc.em_andamento")}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {t("disc.titulo")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {t("disc.descricao")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: FileQuestion,
              texto: t("disc.total_perguntas"),
            },
            {
              icon: Clock3,
              texto: t("disc.tempo_estimado"),
            },
            {
              icon: ShieldCheck,
              texto: t("disc.participacao_voluntaria"),
            },
          ].map(({ icon: Icon, texto }) => (
            <div
              key={texto}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <Icon size={19} className="shrink-0 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{texto}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            {t("disc.informacoes_titulo")}
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {t("disc.informacoes_descricao")}
          </p>
        </div>

        {!candidatoExistente && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">
              {t("disc.apos_publicacao_titulo")}
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-700">
              {t("disc.apos_publicacao_descricao")}
            </p>
          </div>
        )}

        {!candidatoExistente ? null : concluido ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              {t("disc.mensagem_concluido")}
            </p>

            {onVisualizarResultado && (
              <button
                type="button"
                onClick={onVisualizarResultado}
                className="mt-4 w-full rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition  cursor-pointer hover:bg-green-700 sm:w-auto"
              >
                {t("disc.visualizar_resultado")}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {!emAndamento && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={consentimento}
                  onChange={(e) => setConsentimento(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-blue-600"
                />

                <span className="text-sm leading-6 text-gray-700">
                  {t("disc.consentimento")}
                </span>
              </label>
            )}

            <div className="flex items-start gap-2 text-xs leading-5 text-gray-500">
              <LockKeyhole size={16} className="shrink-0" />
              <span>{t("disc.privacidade")}</span>
            </div>

            <button
              type="button"
              disabled={!podeResponder}
              onClick={onResponder}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 sm:w-auto"
            >
              <BrainCircuit size={18} />

              {loading
                ? t("disc.aguarde")
                : emAndamento
                  ? t("disc.continuar_questionario")
                  : t("disc.responder_questionario")}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onVoltar}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-300 bg-white px-5 py-3 text-sm font-semibold cursor-pointer text-green-700 hover:bg-green-50 sm:w-auto"
        >
          <ArrowLeft size={17} />
          {t("tela_perfil_candidato.item_botao_voltar")}
        </button>

        <button
          type="button"
          onClick={onAvancar}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 sm:w-auto  cursor-pointer"
        >
          {t("disc.continuar_cadastro")}
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}
