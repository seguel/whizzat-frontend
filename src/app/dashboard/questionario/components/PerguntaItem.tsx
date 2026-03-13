"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Trash2, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  id: string;
  index: number;

  value: string;
  onChange: (value: string) => void;

  respostaBase: string;
  onChangeRespostaBase: (value: string) => void;

  ativo: boolean;
  onToggleAtivo: (value: boolean) => void;

  onRemove: () => void;
  onDuplicate?: () => void;
}

export default function PerguntaItem({
  id,
  index,
  value,
  onChange,
  respostaBase,
  onChangeRespostaBase,
  ativo,
  onToggleAtivo,
  onRemove,
  onDuplicate,
}: Props) {
  const { t } = useTranslation("common");

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 shadow-sm flex flex-col gap-4"
    >
      {/* Header da pergunta */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          {t("questionario.ver_pergunta")} {index + 1}
        </span>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-xs text-gray-500 ">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => onToggleAtivo(e.target.checked)}
            />
            Ativa
          </label>

          {onDuplicate && (
            <button
              title={t("questionario.duplicar_pergunta")}
              onClick={onDuplicate}
              className="cursor-pointer"
            >
              <Copy size={16} />
            </button>
          )}

          <button
            onClick={onRemove}
            title={t("questionario.excluir_pergunta")}
            className="cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Linha da pergunta */}
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600 mt-7"
        >
          <GripVertical size={18} />
        </button>

        <div className="flex-1 flex flex-col gap-1">
          {/* Label pergunta */}
          <label className="text-xs text-gray-500 font-medium">
            {t("questionario.ver_pergunta")}
          </label>

          {/* Input pergunta */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Digite a pergunta..."
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tipo pergunta */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            {t("questionario.tipo_resposta")}
          </label>

          <select
            disabled
            className="border rounded-md px-2 py-2 text-sm bg-gray-100 text-gray-500"
          >
            <option>Caixa de texto</option>
          </select>
        </div>
      </div>

      {/* Resposta base */}
      <div className="flex flex-col gap-1 ml-7">
        <label className="text-xs text-gray-500 font-medium">
          {t("questionario.resposta_base")}
        </label>

        <textarea
          value={respostaBase}
          onChange={(e) => onChangeRespostaBase(e.target.value)}
          placeholder="Resposta esperada ou pontos que o avaliador espera ver..."
          className="border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>
    </div>
  );
}
