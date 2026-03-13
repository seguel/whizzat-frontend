"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../../components/perfil/Sidebar";
import TopBar from "../../../../components/perfil/TopBar";
import LoadingOverlay from "../../../../components/LoadingOverlay";
import ListaPerguntasSortable, {
  Pergunta,
} from "../../components/ListaPerguntasSortable";

import { ProfileType } from "../../../../components/perfil/ProfileContext";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  perfil: ProfileType;
  id: string;
}

export default function EditarPage({ perfil, id }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [comentario, setComentario] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);

  const adicionarPergunta = () => {
    setPerguntas((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        pergunta: "",
        resposta_base: "",
        tipo: "CAIXA_TEXTO",
        ativo: true,
      },
    ]);
  };

  // carregar questionário
  useEffect(() => {
    const fetchQuestionario = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/questionario/${id}`,
          {
            credentials: "include",
          },
        );

        const data = await response.json();

        setTitulo(data.titulo);
        setComentario(data.comentario || "");
        setAtivo(data.ativo);

        setPerguntas(
          data.pergunta.map((p: any) => ({
            id: String(p.id),
            pergunta: p.pergunta,
            resposta_base: p.resposta_base || "",
            tipo: "CAIXA_TEXTO",
            ativo: p.ativo,
          })),
        );
      } catch (error) {
        console.error(error);
        toast.error(t("questionario.erro"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionario();
  }, [id]);

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

    setSalvando(true);

    const payload = {
      id: Number(id),
      titulo: titulo.trim(),
      comentario: comentario?.trim() || null,
      ativo,
      perguntas: perguntas.map((p, index) => ({
        ...(p.id && !p.id.startsWith("new-") && { id: Number(p.id) }),
        pergunta: p.pergunta.trim(),
        resposta_base: p.resposta_base?.trim() || null,
        tipo_pergunta: "CAIXA_TEXTO",
        ativo: p.ativo,
        ordem: index,
      })),
    };

    // console.log(payload);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/questionario/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error();
      }

      toast.success(t("questionario.sucesso"));

      router.push(`/dashboard/questionario?perfil=${perfil}`);
    } catch (err) {
      toast.error(t("questionario.erro"));
    } finally {
      setSalvando(false);
    }
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        profile={perfil}
      />

      <div className="flex flex-col flex-1 overflow-y-auto bg-[#F5F6F6]">
        <TopBar setIsDrawerOpen={setIsDrawerOpen} />

        <main className="p-6 w-[98%] mx-auto">
          <div className="bg-white rounded-xl border p-6 flex flex-col gap-4">
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">
                {t("questionario.titulo_editar")}
              </h1>

              <button
                onClick={() =>
                  router.push(`/dashboard/questionario?perfil=${perfil}`)
                }
                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <ArrowLeft size={16} />
                {t("questionario.btn_voltar")}
              </button>
            </div>

            {/* titulo */}
            {/* ativo */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
              />
              {t("questionario.ativo")}
            </label>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                {t("questionario.titulo")}
              </label>

              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* comentario */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                {t("questionario.comentario")}
              </label>

              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* perguntas */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {t("questionario.pergunta")} ({perguntas.length})
                  </label>
                </div>
              </div>

              <ListaPerguntasSortable
                perguntas={perguntas}
                setPerguntas={setPerguntas}
              />

              <button
                type="button"
                onClick={adicionarPergunta}
                className="self-start px-3 py-2 text-sm rounded-md
               bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
              >
                + {t("questionario.btn_add_pergunta")}
              </button>
            </div>

            {/* salvar */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={salvar}
                disabled={salvando}
                className="px-5 py-2 rounded-md text-sm font-semibold
                bg-green-600 text-white hover:bg-green-700 transition cursor-pointer"
              >
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
