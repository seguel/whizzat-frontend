"use client";

import { Send, Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfirmInviteCandidatesModalProps {
  aberto: boolean;
  total: number;
  enviando: boolean;
  onFechar: () => void;
  onConfirmar: () => void;
}

export default function ConfirmInviteCandidatesModal({
  aberto,
  total,
  enviando,
  onFechar,
  onConfirmar,
}: ConfirmInviteCandidatesModalProps) {
  const { t } = useTranslation("common");

  if (!aberto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}

        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("vaga_match.confirmar_convite_titulo")}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {t("vaga_match.confirmar_convite_descricao")}
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={enviando}
            aria-label={t("vaga_match.confirmar_convite_fechar")}
            className="shrink-0 cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}

        <div className="px-5 py-5">
          <div className="flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-5 w-5 text-purple-700" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {total === 1
                  ? t("vaga_match.confirmar_convite_um")
                  : t("vaga_match.confirmar_convite_varios", {
                      total,
                    })}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {t("vaga_match.confirmar_convite_aviso")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onFechar}
            disabled={enviando}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("vaga_match.confirmar_convite_cancelar")}
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={enviando}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />

            {enviando
              ? t("vaga_match.enviando_convites")
              : t("vaga_match.confirmar_convite_enviar")}
          </button>
        </div>
      </div>
    </div>
  );
}
