"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { Star, CheckCircle } from "lucide-react";
import { useNotifications } from "../../components/perfil/NotificationContext";
import { useTranslation } from "react-i18next";

interface Props {
  perfil: ProfileType;
}

interface NotificacaoContexto {
  skill: string | null;
  nome: string;
}

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criado_em: string;
  tipo?: string;
  referencia_id?: number | null;
  contexto?: NotificacaoContexto;
}

function renderNotificacaoConteudo(notificacao: Notificacao, t: any) {
  switch (notificacao.tipo) {
    case "NOVA_SKILL":
      return (
        <>
          {notificacao.contexto?.skill && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-medium">
              <Star size={12} />
              {notificacao.contexto.skill}
            </div>
          )}

          {notificacao.contexto?.nome && (
            <p className="text-[11px] text-gray-400 mt-1">
              <span className="font-medium text-gray-700">
                {t("notificacao.candidato")} {notificacao.contexto.nome}
              </span>
            </p>
          )}
        </>
      );

    case "CADASTRO_AVALIADOR":
      return (
        <p className="text-[11px] text-gray-400 mt-1">
          <span className="font-medium text-gray-700">
            {notificacao.mensagem}
          </span>
        </p>
      );

    default:
      return (
        <p className="text-[11px] text-gray-400 mt-2">{notificacao.mensagem}</p>
      );
  }
}

export default function NotificacoesListar({ perfil }: Props) {
  const { t } = useTranslation("common");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { refresh } = useNotifications();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [filtro, setFiltro] = useState<"todas" | "naoLidas">("todas");

  const temNaoLidas = notificacoes.some((n) => !n.lida);

  const marcarComoLida = async (id: number) => {
    try {
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
      );

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/notificacoes/${id}/marcar-lida`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      refresh(); // 👈 atualiza badge
    } catch (error) {
      console.error("Erro ao marcar como lida", error);
    }
  };

  const excluirNotificacao = async (id: number) => {
    try {
      setRemovingId(id);

      setTimeout(() => {
        setNotificacoes((prev) => prev.filter((n) => n.id !== id));
      }, 300);

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/notificacoes/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      refresh();

      setToast({
        message: t("notificacao.msg_exclusao"),
        type: "success",
      });
    } catch (error) {
      setToast({
        message: t("notificacao.msg_erro"),
        type: "error",
      });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const marcarTodas = async () => {
    try {
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/notificacoes/marcar-todas-lidas`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      refresh();
    } catch (error) {
      console.error("Erro ao marcar todas", error);
    }
  };

  const fetchNotificacoes = async (pageNumber: number) => {
    try {
      if (pageNumber === 1) setIsLoading(true);
      else setLoadingMore(true);

      const naoLidas = filtro === "naoLidas";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${perfil}/notificacoes?page=${pageNumber}&naoLidas=${naoLidas}`,
        { credentials: "include" },
      );

      const novas: Notificacao[] = await res.json();

      if (pageNumber === 1) {
        setNotificacoes(novas);
      } else {
        setNotificacoes((prev) => [...prev, ...novas]);
      }

      console.log(novas);

      if (novas.length < 20) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Erro ao buscar notificações", err);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // 🔄 Quando perfil ou filtro mudar → resetar tudo
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setNotificacoes([]);
    fetchNotificacoes(1);
  }, [perfil, filtro]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchNotificacoes(nextPage);
        }
      },
      { threshold: 0.5 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [page, hasMore, loadingMore]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Filtros */}
            <div className="flex gap-2">
              <button
                onClick={() => setFiltro("todas")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition  cursor-pointer
                    ${
                      filtro === "todas"
                        ? "bg-blue-600 text-white shadow"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                  `}
              >
                {t("notificacao.filtro_todas")}
              </button>

              <button
                onClick={() => setFiltro("naoLidas")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition  cursor-pointer
        ${
          filtro === "naoLidas"
            ? "bg-blue-600 text-white shadow"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }
      `}
              >
                {t("notificacao.filtro_nao_lidas")}
              </button>
            </div>

            {/* Marcar todas */}
            {temNaoLidas && (
              <button
                onClick={marcarTodas}
                className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-900 hover:bg-blue-200 transition cursor-pointer"
              >
                {t("notificacao.marcar_todos")}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {notificacoes.map((notificacao) => (
              <div
                key={notificacao.id}
                className={`relative bg-white rounded-xl border shadow-sm
  flex flex-col h-full overflow-hidden
  transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
  ${removingId === notificacao.id ? "opacity-0 scale-95" : ""}
  ${notificacao.lida ? "border-gray-200" : "border-red-300 bg-red-50/30"}`}
              >
                {/* 🔹 Barra lateral */}
                <div
                  className={`absolute left-0 top-0 h-full w-1.5 ${
                    notificacao.lida ? "bg-green-500" : "bg-red-500"
                  }`}
                />

                <div className="p-3 pl-4 flex flex-col h-full">
                  {/* 🔹 CONTEÚDO */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                        {notificacao.titulo}
                      </h3>

                      <span
                        className={`ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1
  ${
    notificacao.lida ? "bg-green-100 text-green-700" : "bg-red-500 text-white"
  }`}
                      >
                        {notificacao.lida && <CheckCircle size={12} />}
                        {notificacao.lida
                          ? t("notificacao.lida")
                          : t("notificacao.novo")}
                      </span>
                    </div>

                    {renderNotificacaoConteudo(notificacao, t)}

                    <p className="text-[11px] text-gray-400 mt-3">
                      {t("notificacao.enviado")}{" "}
                      {new Date(notificacao.criado_em).toLocaleString()}
                    </p>
                  </div>

                  {/* 🔹 AÇÕES NO RODAPÉ */}
                  <div className="mt-4 pt-3 border-t flex gap-2">
                    {/* Excluir */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(notificacao.id);
                      }}
                      className="flex-1 py-2 rounded-lg border text-xs font-semibold cursor-pointer
                   text-red-600 border-red-200
                   hover:bg-red-50 transition"
                    >
                      Excluir
                    </button>

                    {/* Marcar como lida */}
                    {!notificacao.lida && (
                      <button
                        onClick={() => marcarComoLida(notificacao.id)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer
               bg-green-600 text-white
               hover:bg-green-700 transition"
                      >
                        {t("notificacao.marcar")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div
              ref={observerRef}
              className="h-10 flex justify-center items-center"
            >
              {loadingMore && (
                <div className="text-sm text-gray-400 animate-pulse">
                  {t("notificacao.carregando")}
                </div>
              )}
            </div>
          )}

          {confirmDeleteId && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm animate-fadeIn">
                <h2 className="text-lg font-semibold text-gray-800">
                  {t("notificacao.titulo_confirma_exclusao")}
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  {t("notificacao.msg_confirma_exclusao")}
                </p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-4 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                  >
                    {t("notificacao.botao_cancelar")}
                  </button>

                  <button
                    onClick={() => excluirNotificacao(confirmDeleteId)}
                    className="px-4 py-2 rounded-md text-sm bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
                  >
                    {t("notificacao.botao_excluir")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {toast && (
            <div className="fixed bottom-6 right-6 z-50">
              <div
                className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300
      ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
              >
                {toast.message}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
