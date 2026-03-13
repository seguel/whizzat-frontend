"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import ListaPerguntasSortable, { Pergunta } from "./ListaPerguntasSortable";

interface Props {
  perfil: string;
  titulo: string;
  setTitulo: (v: string) => void;
  comentario: string;
  setComentario: (v: string) => void;
  ativo: boolean;
  setAtivo: (v: boolean) => void;
  perguntas: Pergunta[];
  setPerguntas: (v: Pergunta[]) => void;
  adicionarPergunta: () => void;
  salvar: () => void;
  salvando: boolean;
}

export default function QuestionarioForm({
  perfil,
  titulo,
  setTitulo,
  comentario,
  setComentario,
  ativo,
  setAtivo,
  perguntas,
  setPerguntas,
  adicionarPergunta,
  salvar,
  salvando,
}: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
      {/* TITULO */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          {t("questionario.titulo")}
        </label>

        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* COMENTARIO */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          {t("questionario.comentario")}
        </label>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
        />
      </div>

      {/* ATIVO */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
        />

        <label className="text-sm text-gray-700">
          {t("questionario.ativo")}
        </label>
      </div>

      {/* PERGUNTAS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">
            {t("questionario.pergunta")}
          </h2>

          <button
            onClick={adicionarPergunta}
            className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white"
          >
            + {t("questionario.btn_add_pergunta")}
          </button>
        </div>

        <ListaPerguntasSortable
          perguntas={perguntas}
          setPerguntas={setPerguntas}
        />
      </div>

      {/* BOTÕES */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={() =>
            router.push(`/dashboard/questionario?perfil=${perfil}`)
          }
          className="px-4 py-2 rounded-md border text-sm"
        >
          {t("questionario.btn_cancelar")}
        </button>

        <button
          onClick={salvar}
          disabled={salvando}
          className="px-5 py-2 rounded-md text-sm font-semibold bg-green-600 text-white flex items-center gap-2"
        >
          {salvando && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          )}

          {salvando
            ? t("questionario.btn_salvando")
            : t("questionario.btn_salvar")}
        </button>
      </div>
    </div>
  );
}
