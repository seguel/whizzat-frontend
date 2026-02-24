"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "../../components/perfil/Sidebar";
import TopBar from "../../components/perfil/TopBar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ProfileType } from "../../components/perfil/ProfileContext";
import { Trash2, Star } from "lucide-react";
import { useNotifications } from "../../components/perfil/NotificationContext";
// import { useTranslation } from "react-i18next";

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

export default function NotificacoesListar({ perfil }: Props) {
  // const { t, i18n } = useTranslation("common");
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
        message: "Notificação excluída com sucesso",
        type: "success",
      });
    } catch (error) {
      setToast({
        message: "Erro ao excluir notificação",
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
                Todas
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
                Não lidas
              </button>
            </div>

            {/* Marcar todas */}
            {temNaoLidas && (
              <button
                onClick={marcarTodas}
                className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-900 hover:bg-blue-200 transition cursor-pointer"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {notificacoes.map((notificacao) => (
              <div
                key={notificacao.id}
                className={`group bg-white rounded-xl border shadow-sm p-4 flex flex-col justify-between
    transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
    ${removingId === notificacao.id ? "opacity-0 scale-95" : ""}
    ${notificacao.lida ? "border-gray-200" : "border-red-400 bg-red-50/30"}`}
              >
                {/* 🔹 Conteúdo */}
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                      {notificacao.titulo}
                    </h3>

                    {!notificacao.lida && (
                      <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">
                        Novo
                      </span>
                    )}
                  </div>

                  {notificacao.contexto?.skill && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-medium">
                      <Star size={12} />
                      {notificacao.contexto.skill}
                    </div>
                  )}

                  <p className="text-[11px] text-gray-400 mt-1">
                    <span className="font-medium text-gray-700">
                      Candidato: {notificacao.contexto?.nome}
                    </span>
                  </p>

                  <p className="text-[11px] text-gray-400 mt-1">
                    Enviado: {new Date(notificacao.criado_em).toLocaleString()}
                  </p>
                </div>

                {/* 🔹 Rodapé */}
                <div className="flex items-center mt-4 pt-3 border-t text-xs">
                  {/* Esquerda */}
                  <div className="flex-1">
                    {!notificacao.lida ? (
                      <button
                        onClick={() => marcarComoLida(notificacao.id)}
                        className="text-green-600 hover:text-green-700 font-medium transition-opacity opacity-80 hover:opacity-100 cursor-pointer"
                      >
                        ✓ Marcar como lida
                      </button>
                    ) : (
                      <span className="text-green-500 font-medium">✓ Lido</span>
                    )}
                  </div>

                  {/* Direita */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(notificacao.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition opacity-70 hover:opacity-100  cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
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
                  Carregando mais...
                </div>
              )}
            </div>
          )}

          {confirmDeleteId && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm animate-fadeIn">
                <h2 className="text-lg font-semibold text-gray-800">
                  Confirmar exclusão
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                  Deseja realmente excluir esta notificação?
                </p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-4 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={() => excluirNotificacao(confirmDeleteId)}
                    className="px-4 py-2 rounded-md text-sm bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
                  >
                    Excluir
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
