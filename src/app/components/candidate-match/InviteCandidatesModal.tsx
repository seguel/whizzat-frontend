"use client";

import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  GraduationCap,
  Handshake,
  Lightbulb,
  MessageCircle,
  Send,
  Users,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export type TipoConvite =
  | "OPORTUNIDADE"
  | "PALESTRA_EVENTO"
  | "MENTORIA"
  | "PROJETO_CONSULTORIA"
  | "NETWORKING"
  | "OUTRO";

export interface ConviteCandidatosPayload {
  tipo: TipoConvite;
  titulo: string;
  mensagem: string;
  candidato_ids: number[];
}

interface InviteCandidatesModalProps {
  aberto: boolean;
  candidatoIds: number[];
  enviando: boolean;
  onFechar: () => void;
  onEnviar: (payload: ConviteCandidatosPayload) => void;
}

const TIPOS: {
  value: TipoConvite;
  label: string;
  descricao: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "OPORTUNIDADE",
    label: "Oportunidade profissional",
    descricao: "Convite para uma oportunidade profissional.",
    icon: <BriefcaseBusiness className="h-4 w-4" />,
  },
  {
    value: "PALESTRA_EVENTO",
    label: "Palestra / evento",
    descricao: "Participação em palestra, evento ou encontro.",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  {
    value: "MENTORIA",
    label: "Mentoria",
    descricao: "Convite relacionado a mentoria ou orientação.",
    icon: <Lightbulb className="h-4 w-4" />,
  },
  {
    value: "PROJETO_CONSULTORIA",
    label: "Projeto / consultoria",
    descricao: "Participação em projeto ou trabalho de consultoria.",
    icon: <Handshake className="h-4 w-4" />,
  },
  {
    value: "NETWORKING",
    label: "Networking / conversa",
    descricao: "Contato profissional ou conversa inicial.",
    icon: <MessageCircle className="h-4 w-4" />,
  },
  {
    value: "OUTRO",
    label: "Outro",
    descricao: "Outro motivo de contato profissional.",
    icon: <Users className="h-4 w-4" />,
  },
];

export default function InviteCandidatesModal({
  aberto,
  candidatoIds,
  enviando,
  onFechar,
  onEnviar,
}: InviteCandidatesModalProps) {
  const { t } = useTranslation("common");
  const [tipo, setTipo] = useState<TipoConvite>("OPORTUNIDADE");

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!aberto) {
      return;
    }

    setTipo("OPORTUNIDADE");
    setTitulo("");
    setMensagem("");
  }, [aberto]);

  if (!aberto) {
    return null;
  }

  const podeEnviar =
    candidatoIds.length > 0 &&
    titulo.trim().length > 0 &&
    mensagem.trim().length > 0 &&
    !enviando;

  const handleEnviar = () => {
    if (!podeEnviar) {
      return;
    }

    onEnviar({
      tipo,
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      candidato_ids: candidatoIds,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("buscar_candidatos.convite_titulo")}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {t("buscar_candidatos.convite_descricao")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!enviando) {
                onFechar();
              }
            }}
            disabled={enviando}
            className="shrink-0 cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label={t("buscar_candidatos.convite_btn_fechar")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Quantidade */}

          <div className="mb-5 flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-4 w-4 text-purple-700" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {candidatoIds.length}{" "}
                {candidatoIds.length === 1
                  ? t("buscar_candidatos.convite_candidato_selecionado")
                  : t("buscar_candidatos.convite_candidatos_selecionados")}
              </p>

              <p className="text-xs text-gray-500">
                {t("buscar_candidatos.convite_mesma_mensagem")}
              </p>
            </div>
          </div>

          {/* Tipo */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("buscar_candidatos.convite_motivo")}
            </label>

            <p className="mt-1 text-xs text-gray-500">
              {t("buscar_candidatos.convite_motivo_descricao")}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TIPOS.map((item) => {
                const selecionado = tipo === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTipo(item.value)}
                    className={`cursor-pointer rounded-xl border p-3 text-left transition ${
                      selecionado
                        ? "border-purple-500 bg-purple-50 ring-1 ring-purple-100"
                        : "border-gray-200 bg-white hover:border-purple-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          selecionado
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {t(item.label)}
                        </p>

                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                          {t(item.descricao)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}

          <div className="mt-5">
            <label
              htmlFor="titulo-convite"
              className="text-sm font-medium text-gray-700"
            >
              {t("buscar_candidatos.convite_campo_titulo")}
            </label>

            <input
              id="titulo-convite"
              type="text"
              value={titulo}
              maxLength={120}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder={t("buscar_candidatos.convite_titulo_placeholder")}
              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-purple-400"
            />

            <div className="mt-1 text-right text-[11px] text-gray-400">
              {titulo.length}/120
            </div>
          </div>

          {/* Mensagem */}

          <div className="mt-4">
            <label
              htmlFor="mensagem-convite"
              className="text-sm font-medium text-gray-700"
            >
              {t("buscar_candidatos.convite_campo_mensagem")}
            </label>

            <textarea
              id="mensagem-convite"
              value={mensagem}
              maxLength={1500}
              rows={6}
              onChange={(event) => setMensagem(event.target.value)}
              placeholder={t("buscar_candidatos.convite_mensagem_placeholder")}
              className="mt-2 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-purple-400"
            />

            <div className="mt-1 flex justify-between gap-3 text-[11px] text-gray-400">
              <span>{t("buscar_candidatos.convite_mensagem_alerta")}</span>

              <span className="shrink-0">{mensagem.length}/1500</span>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            disabled={enviando}
            onClick={onFechar}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("buscar_candidatos.convite_btn_cancelar")}
          </button>

          <button
            type="button"
            disabled={!podeEnviar}
            onClick={handleEnviar}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />

            {enviando
              ? "Enviando..."
              : t("buscar_candidatos.convite_btn_enviar")}
          </button>
        </div>
      </div>
    </div>
  );
}
