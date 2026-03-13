"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  titulo: string;
  mensagem: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ModalConfirm({
  titulo,
  mensagem,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  const { t } = useTranslation("common");

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{titulo}</h2>

        <p className="text-sm text-gray-600 mb-6">{mensagem}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50  cursor-pointer"
          >
            {t("questionario.btn_cancelar")}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
          >
            {loading
              ? t("questionario.btn_excluindo")
              : t("questionario.btn_excluir")}
          </button>
        </div>
      </div>
    </div>
  );
}
