"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RotateCcw,
  UserX,
  MapPin,
  CalendarDays,
  CheckSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

import LoadingOverlay from "../../components/LoadingOverlay";
import SemDados from "../SemDados";

interface CandidatoIgnorado {
  candidato_id: number;
  nome: string;
  logo: string | null;
  localizacao: string | null;
  motivo: string | null;
  data_ignorado: string;
}

export default function CandidatosIgnorados() {
  const { t, i18n } = useTranslation("common");

  const [candidatos, setCandidatos] = useState<CandidatoIgnorado[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [restaurando, setRestaurando] = useState(false);

  const todosSelecionados = useMemo(() => {
    return (
      candidatos.length > 0 &&
      candidatos.every((candidato) =>
        selecionados.includes(candidato.candidato_id),
      )
    );
  }, [candidatos, selecionados]);

  const carregarCandidatos = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/ignorados`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const erro = await res.json().catch(() => null);

        throw new Error(
          erro?.message || t("candidatos_ignorados.erro_carregar"),
        );
      }

      const data = await res.json();

      setCandidatos(Array.isArray(data) ? data : []);
      setSelecionados([]);
    } catch (error) {
      console.error("Erro ao carregar candidatos ignorados:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : t("candidatos_ignorados.erro_carregar"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCandidatos();
  }, []);

  const toggleSelecionado = (candidatoId: number) => {
    setSelecionados((prev) => {
      if (prev.includes(candidatoId)) {
        return prev.filter((id) => id !== candidatoId);
      }

      return [...prev, candidatoId];
    });
  };

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      setSelecionados([]);
      return;
    }

    setSelecionados(candidatos.map((candidato) => candidato.candidato_id));
  };

  const restaurarCandidato = async (candidatoId: number) => {
    if (restaurando) return;

    setRestaurando(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/ignorados/${candidatoId}/restaurar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const erro = await res.json().catch(() => null);

        throw new Error(
          erro?.message || t("candidatos_ignorados.erro_restaurar"),
        );
      }

      setCandidatos((prev) =>
        prev.filter((candidato) => candidato.candidato_id !== candidatoId),
      );

      setSelecionados((prev) => prev.filter((id) => id !== candidatoId));

      toast.success(t("candidatos_ignorados.restaurar_sucesso"));
    } catch (error) {
      console.error("Erro ao restaurar candidato:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : t("candidatos_ignorados.erro_restaurar"),
      );
    } finally {
      setRestaurando(false);
    }
  };

  const restaurarSelecionados = async () => {
    if (selecionados.length === 0 || restaurando) {
      return;
    }

    const idsSelecionados = [...selecionados];

    setRestaurando(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/ignorados/restaurar`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidato_ids: idsSelecionados,
          }),
        },
      );

      if (!res.ok) {
        const erro = await res.json().catch(() => null);

        throw new Error(
          erro?.message || t("candidatos_ignorados.erro_restaurar"),
        );
      }

      setCandidatos((prev) =>
        prev.filter(
          (candidato) => !idsSelecionados.includes(candidato.candidato_id),
        ),
      );

      setSelecionados([]);

      toast.success(t("candidatos_ignorados.restaurar_varios_sucesso"));
    } catch (error) {
      console.error("Erro ao restaurar candidatos:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : t("candidatos_ignorados.erro_restaurar"),
      );
    } finally {
      setRestaurando(false);
    }
  };

  const getMotivoLabel = (motivo: string | null) => {
    if (!motivo) {
      return t("candidatos_ignorados.sem_motivo");
    }

    const motivos: Record<string, string> = {
      PERFIL_NAO_ADERENTE: "candidatos_ignorados.motivo_perfil",

      HISTORICO_ENTREVISTA: "candidatos_ignorados.motivo_entrevista",

      JA_AVALIADO: "candidatos_ignorados.motivo_avaliado",

      OUTRO: "candidatos_ignorados.motivo_outro",
    };

    const chave = motivos[motivo];

    return chave ? t(chave) : motivo;
  };

  const formatarData = (data: string) => {
    try {
      return new Intl.DateTimeFormat(
        i18n.language === "en" ? "en-US" : "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
      ).format(new Date(data));
    } catch {
      return "-";
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <UserX className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              {t("candidatos_ignorados.titulo")}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {t("candidatos_ignorados.descricao")}
            </p>
          </div>
        </div>
      </div>

      {candidatos.length === 0 ? (
        <SemDados tipo="candidato_ignorado" perfil="recrutador" />
      ) : (
        <div className="space-y-4">
          {/* Barra de ações */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={todosSelecionados}
                    disabled={restaurando}
                    onChange={toggleSelecionarTodos}
                    className="h-4 w-4 cursor-pointer accent-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  {t("candidatos_ignorados.selecionar_todos")}
                </label>

                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckSquare className="h-3.5 w-3.5" />

                  <span>
                    {selecionados.length}{" "}
                    {t("candidatos_ignorados.selecionados")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={selecionados.length === 0 || restaurando}
                onClick={restaurarSelecionados}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />

                {restaurando
                  ? t("candidatos_ignorados.restaurando")
                  : t("candidatos_ignorados.restaurar_selecionados")}
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-3">
            {candidatos.map((candidato) => {
              const selecionado = selecionados.includes(candidato.candidato_id);

              return (
                <div
                  key={candidato.candidato_id}
                  className={`rounded-xl border bg-white p-4 transition sm:p-5 ${
                    selecionado
                      ? "border-purple-300 ring-1 ring-purple-100"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Checkbox */}
                    <div className="flex items-start sm:items-center">
                      <input
                        type="checkbox"
                        checked={selecionado}
                        disabled={restaurando}
                        onChange={() =>
                          toggleSelecionado(candidato.candidato_id)
                        }
                        className="h-4 w-4 cursor-pointer accent-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {/* Avatar */}
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                        {candidato.logo ? (
                          <img
                            src={candidato.logo}
                            alt={candidato.nome}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserX className="h-5 w-5 text-gray-400" />
                        )}
                      </div>

                      {/* Informações */}
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                          {candidato.nome}
                        </h2>

                        <div className="mt-2 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />

                            <span className="truncate">
                              {candidato.localizacao || "-"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                            <span>{formatarData(candidato.data_ignorado)}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="inline-flex max-w-full rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                            <span className="truncate">
                              {getMotivoLabel(candidato.motivo)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ação */}
                    <div className="sm:ml-auto">
                      <button
                        type="button"
                        disabled={restaurando}
                        onClick={() =>
                          restaurarCandidato(candidato.candidato_id)
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        <RotateCcw className="h-4 w-4" />

                        {t("candidatos_ignorados.voltar_mostrar")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
