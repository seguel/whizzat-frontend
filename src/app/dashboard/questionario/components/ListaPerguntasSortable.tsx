"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import PerguntaItem from "./PerguntaItem";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

export interface Pergunta {
  id: string;
  pergunta: string;
  resposta_base: string;
  tipo: "CAIXA_TEXTO";
  ativo: boolean;
}

interface Props {
  perguntas: Pergunta[];
  setPerguntas: (p: Pergunta[]) => void;
}

export default function ListaPerguntasSortable({
  perguntas,
  setPerguntas,
}: Props) {
  const { t } = useTranslation("common");
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = perguntas.findIndex((p) => p.id === active.id);
    const newIndex = perguntas.findIndex((p) => p.id === over.id);

    if (oldIndex !== newIndex) {
      setPerguntas(arrayMove(perguntas, oldIndex, newIndex));
    }
  };

  const atualizarPergunta = (index: number, novaPergunta: Pergunta) => {
    const novas = [...perguntas];
    novas[index] = novaPergunta;
    setPerguntas(novas);
  };

  const removerPergunta = (id: string) => {
    setPerguntas(perguntas.filter((p) => p.id !== id));
    toast.error(t("questionario.msg_exclusao_pergunta"), {
      duration: 3000,
    });
  };

  const duplicarPergunta = (index: number) => {
    const pergunta = perguntas[index];

    const nova = {
      ...pergunta,
      id: `new-${Date.now()}`,
    };

    const novas = [...perguntas];
    novas.splice(index + 1, 0, nova);

    setPerguntas(novas);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={perguntas.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {perguntas.length === 0 && (
            <div className="text-sm text-gray-400 border rounded-lg p-4 text-center">
              {t("questionario.msg_nenhuma_pergunta")}.
            </div>
          )}

          {perguntas.map((p, index) => (
            <PerguntaItem
              key={p.id}
              id={p.id}
              index={index}
              value={p.pergunta}
              respostaBase={p.resposta_base}
              ativo={p.ativo}
              onChange={(value) =>
                atualizarPergunta(index, { ...p, pergunta: value })
              }
              onChangeRespostaBase={(value) =>
                atualizarPergunta(index, { ...p, resposta_base: value })
              }
              onToggleAtivo={(value) =>
                atualizarPergunta(index, { ...p, ativo: value })
              }
              onRemove={() => removerPergunta(p.id)}
              onDuplicate={() => duplicarPergunta(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
