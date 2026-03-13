"use client";

import { useState } from "react";
import Sidebar from "../../../components/perfil/Sidebar";
import TopBar from "../../../components/perfil/TopBar";
// import LoadingOverlay from "../../../components/LoadingOverlay";
import { ProfileType } from "../../../components/perfil/ProfileContext";
import { useTranslation } from "react-i18next";
import ListaPerguntasSortable, {
  Pergunta,
} from "../components/ListaPerguntasSortable";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  perfil: ProfileType;
}

export default function CriarQuestionarioPage({ perfil }: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [comentario, setComentario] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [salvando, setSalvando] = useState(false);

  const adicionarPergunta = () => {
    setPerguntas((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        pergunta: "",
        resposta_base: "",
        tipo: "CAIXA_TEXTO",
        ativo: true,
      },
    ]);
  };

  const salvar = async () => {
    if (!titulo.trim()) {
      toast.error(t("questionario.msg_titulo_obg"), {
        duration: 3000,
      });
      return;
    }

    if (perguntas.length === 0) {
      toast.error(t("questionario.msg_pergunta_obg"), {
        duration: 3000,
      });
      return;
    }

    const perguntasInvalidas = perguntas.some((p) => !p.pergunta.trim());

    if (perguntasInvalidas) {
      toast.error(t("questionario.msg_todaspergunta_obg"), {
        duration: 3000,
      });
      return;
    }

    setSalvando(true);

    const payload = {
      titulo: titulo.trim(),
      comentario: comentario?.trim() || null,
      ativo,
      perguntas: perguntas.map((p, index) => ({
        pergunta: p.pergunta.trim(),
        resposta_base: p.resposta_base?.trim() || null,
        tipo_pergunta: "CAIXA_TEXTO",
        ativo: p.ativo,
        ordem: index + 1,
      })),
    };

    // console.log("payload", payload);

    /* const url = !id
      ? `${process.env.NEXT_PUBLIC_API_URL}/questionario/create`
      : `${process.env.NEXT_PUBLIC_API_URL}/questionario/${id}`; */

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questionario/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao salvar");
      }

      toast.success(t("questionario.sucesso"), {
        duration: 3000,
      });

      setTimeout(() => {
        router.push(`/dashboard/questionario?perfil=${perfil}`);
      }, 800);
    } catch (err) {
      toast.error(t("questionario.erro"), {
        duration: 5000, // ← 5 segundos
      });
    }

    setSalvando(false);
  };

  // if (loading) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 overflow-y-auto bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        <main className="p-6 w-[98%] mx-auto max-w-5xl">
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-800">
              {t("questionario.titulo_pagina")}
            </h1>

            <p className="text-sm text-gray-500">
              {t("questionario.pagina_descricao")}
            </p>
          </div>

          {/* CARD */}
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
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("questionario.place_titulo")}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                {t("questionario.comentario")}
              </label>

              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("questionario.place_comentario")}
              />
            </div>

            {/* ATIVO */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="w-4 h-4"
              />

              <label className="text-sm text-gray-700">
                {t("questionario.ativo")}
              </label>
            </div>

            {/* PERGUNTAS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">
                  {t("questionario.pergunta")} ({perguntas.length})
                </label>
              </div>

              {perguntas.length > 0 && (
                <ListaPerguntasSortable
                  perguntas={perguntas}
                  setPerguntas={setPerguntas}
                />
              )}

              <button
                type="button"
                onClick={adicionarPergunta}
                className="mt-2 self-start px-3 py-2 text-sm rounded-md
  bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
              >
                + {t("questionario.btn_add_pergunta")}
              </button>

              {perguntas.length === 0 && (
                <div className="mt-2 border border-dashed rounded-lg p-6 text-center text-sm text-gray-500">
                  {t("questionario.sem_pergunta")}
                </div>
              )}
            </div>

            {/* BOTÕES */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() =>
                  router.push(`/dashboard/questionario?perfil=${perfil}`)
                }
                disabled={salvando}
                className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                {t("questionario.btn_cancelar")}
              </button>

              <button
                onClick={salvar}
                disabled={salvando}
                className="px-5 py-2 rounded-md text-sm font-semibold cursor-pointer
    bg-green-600 text-white hover:bg-green-700 transition
    flex items-center gap-2 disabled:opacity-70"
              >
                {salvando && (
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}

                {salvando
                  ? t("questionario.btn_salvando")
                  : t("questionario.btn_salvar")}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
