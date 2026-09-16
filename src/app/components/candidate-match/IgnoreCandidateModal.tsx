"use client";

import { UserX, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { MatchCandidato } from "./CandidateMatchCard";

interface IgnoreCandidateModalProps {
  candidato: MatchCandidato;
  motivo: string;
  ignorando: boolean;
  onMotivoChange: (value: string) => void;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export default function IgnoreCandidateModal({
  candidato,
  motivo,
  ignorando,
  onMotivoChange,
  onCancelar,
  onConfirmar,
}: IgnoreCandidateModalProps) {
  const { t } = useTranslation("common");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {t("vaga_match.ignorar_titulo")}
            </h3>

            <p className="mt-1 text-xs text-gray-500">{candidato.nome}</p>
          </div>

          <button
            type="button"
            onClick={onCancelar}
            className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            {t("vaga_match.ignorar_descricao")}
          </p>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {t("vaga_match.ignorar_motivo")}
            </label>

            <select
              value={motivo}
              disabled={ignorando}
              onChange={(e) => onMotivoChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 disabled:bg-gray-50 disabled:opacity-60"
            >
              <option value="">
                {t("vaga_match.ignorar_motivo_opcional")}
              </option>

              <option value="PERFIL_NAO_ADERENTE">
                {t("vaga_match.motivo_perfil")}
              </option>

              <option value="HISTORICO_ENTREVISTA">
                {t("vaga_match.motivo_entrevista")}
              </option>

              <option value="JA_AVALIADO">
                {t("vaga_match.motivo_avaliado")}
              </option>

              <option value="OUTRO">{t("vaga_match.motivo_outro")}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-5 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancelar}
            disabled={ignorando}
            className="w-full sm:w-auto rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {t("vaga_match.cancelar")}
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={ignorando}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <UserX className="w-4 h-4" />

            {ignorando
              ? t("vaga_match.ignorando")
              : t("vaga_match.confirmar_ignorar")}
          </button>
        </div>
      </div>
    </div>
  );
}
