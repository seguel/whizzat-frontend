"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  Sparkles,
  Users,
  CheckCircle2,
  Send,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import PerfilCandidatoModal from "./PerfilCandidatoModal";
import CandidateMatchCard, {
  MatchCandidato,
} from "../candidate-match/CandidateMatchCard";
import IgnoreCandidateModal from "../candidate-match/IgnoreCandidateModal";
import ConfirmInviteCandidatesModal from "../candidate-match/ConfirmInviteCandidatesModal";

type FaixaMatch = "ALTA" | "BOA" | "COMPATIVEL" | "TODOS";

interface MatchConfig {
  limite: number;
  faixa: FaixaMatch;
}

interface Props {
  vagaId: string;
  empresaId: string;
}

export default function VagaMatchCandidates({ vagaId, empresaId }: Props) {
  const { t } = useTranslation("common");

  const [config, setConfig] = useState<MatchConfig>({
    limite: 15,
    faixa: "ALTA",
  });

  const [pesquisou, setPesquisou] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const [resultados, setResultados] = useState<MatchCandidato[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const [candidatoIgnorar, setCandidatoIgnorar] =
    useState<MatchCandidato | null>(null);

  const [motivoIgnorar, setMotivoIgnorar] = useState("");
  const [ignorando, setIgnorando] = useState(false);
  const [perfilCandidatoId, setPerfilCandidatoId] = useState<number | null>(
    null,
  );

  const [perfilAberto, setPerfilAberto] = useState(false);
  const resultadosRef = useRef<HTMLDivElement | null>(null);
  const [enviandoConvites, setEnviandoConvites] = useState(false);
  const [confirmarConviteAberto, setConfirmarConviteAberto] = useState(false);

  useEffect(() => {
    if (!pesquisou) {
      return;
    }

    const timer = window.setTimeout(() => {
      resultadosRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [pesquisou]);

  const abrirPerfil = (candidatoId: number) => {
    setPerfilCandidatoId(candidatoId);
    setPerfilAberto(true);
  };

  const fecharPerfil = () => {
    setPerfilAberto(false);
    setPerfilCandidatoId(null);
  };

  const handleBuscar = async () => {
    setBuscando(true);
    setPesquisou(false);
    setSelecionados([]);
    setResultados([]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/vaga/${vagaId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            empresa_id: Number(empresaId),
            limite: config.limite,
            faixa: config.faixa,
          }),
        },
      );

      if (!res.ok) {
        const erro = await res.json().catch(() => null);

        throw new Error(erro?.message || t("vaga_match.erro_buscar"));
      }

      const data = await res.json();

      setResultados(data.candidatos ?? []);
      setPesquisou(true);
    } catch (error) {
      console.error("Erro ao buscar candidatos:", error);

      toast.error(
        error instanceof Error ? error.message : t("vaga_match.erro_buscar"),
      );
    } finally {
      setBuscando(false);
    }
  };

  const LIMITE_CONVITES = 10;

  const idsSelecionaveis = useMemo(
    () =>
      resultados
        .filter((item) => !item.ja_convidado)
        .slice(0, LIMITE_CONVITES)
        .map((item) => item.candidato_id),
    [resultados],
  );

  const todosSelecionados =
    idsSelecionaveis.length > 0 &&
    idsSelecionaveis.every((id) => selecionados.includes(id));

  const toggleSelecionado = (candidatoId: number) => {
    const candidato = resultados.find(
      (item) => item.candidato_id === candidatoId,
    );

    if (!candidato || candidato.ja_convidado) {
      return;
    }

    const jaSelecionado = selecionados.includes(candidatoId);

    if (jaSelecionado) {
      setSelecionados((prev) => prev.filter((id) => id !== candidatoId));
      return;
    }

    if (selecionados.length >= LIMITE_CONVITES) {
      toast.error(t("vaga_match.limite_convites"));
      return;
    }

    setSelecionados((prev) => [...prev, candidatoId]);
  };

  const toggleSelecionarTodos = () => {
    if (todosSelecionados) {
      setSelecionados((prev) =>
        prev.filter((id) => !idsSelecionaveis.includes(id)),
      );
      return;
    }

    setSelecionados(idsSelecionaveis);
  };

  const handleAbrirIgnorar = (candidato: MatchCandidato) => {
    setCandidatoIgnorar(candidato);
    setMotivoIgnorar("");
  };

  const handleFecharIgnorar = () => {
    setCandidatoIgnorar(null);
    setMotivoIgnorar("");
  };

  const handleConfirmarIgnorar = async () => {
    if (!candidatoIgnorar || ignorando) return;

    setIgnorando(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/ignorar`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidato_id: candidatoIgnorar.candidato_id,
            motivo: motivoIgnorar || undefined,
          }),
        },
      );

      if (!res.ok) {
        const erro = await res.json().catch(() => null);

        throw new Error(erro?.message || t("vaga_match.erro_ignorar"));
      }

      setResultados((prev) =>
        prev.filter(
          (item) => item.candidato_id !== candidatoIgnorar.candidato_id,
        ),
      );

      setSelecionados((prev) =>
        prev.filter((id) => id !== candidatoIgnorar.candidato_id),
      );

      toast.success(t("vaga_match.ignorar_sucesso"));

      handleFecharIgnorar();
    } catch (error) {
      console.error("Erro ao ignorar candidato:", error);

      toast.error(
        error instanceof Error ? error.message : t("vaga_match.erro_ignorar"),
      );
    } finally {
      setIgnorando(false);
    }
  };

  const handleConvidarSelecionados = async () => {
    if (selecionados.length === 0 || enviandoConvites) {
      return;
    }

    setEnviandoConvites(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/convite/vaga`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            empresa_id: Number(empresaId),
            vaga_id: Number(vagaId),
            candidato_ids: selecionados,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || t("vaga_match.erro_enviar_convite"));
      }

      if (data.total === 0 && data.ja_convidados > 0) {
        toast.error(t("vaga_match.todos_ja_convidados"));
      } else if (data.ja_convidados > 0) {
        toast.success(
          t("vaga_match.convites_enviados_parcial", {
            total: data.total,
            jaConvidados: data.ja_convidados,
          }),
        );
      } else {
        toast.success(
          t("vaga_match.convites_enviados_sucesso", {
            total: data.total,
          }),
        );
      }

      const idsConvidados = new Set<number>(
        (data.convites ?? []).map(
          (convite: { candidato_id: number }) => convite.candidato_id,
        ),
      );

      setResultados((prev) =>
        prev.map((candidato) =>
          idsConvidados.has(candidato.candidato_id)
            ? {
                ...candidato,
                ja_convidado: true,
              }
            : candidato,
        ),
      );

      setSelecionados([]);
      setConfirmarConviteAberto(false);
    } catch (error) {
      console.error("Erro ao enviar convites:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : t("vaga_match.erro_enviar_convite"),
      );
    } finally {
      setEnviandoConvites(false);
    }
  };

  const handleAbrirConfirmacaoConvite = () => {
    if (selecionados.length === 0 || enviandoConvites) {
      return;
    }

    setConfirmarConviteAberto(true);
  };

  return (
    <>
      <section
        id="buscar-candidatos"
        className="w-full mt-8 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/40 p-4 sm:p-5 shadow-sm"
      >
        {/* Busca */}
        <div>
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div className="flex items-start gap-3 min-w-0 xl:max-w-[360px]">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-purple-700" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    {t("vaga_match.titulo")}
                  </h3>

                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>

                <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {t("vaga_match.descricao")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex gap-3 xl:items-start">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  {t("vaga_match.compatibilidade")}
                </label>

                <select
                  value={config.faixa}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      faixa: e.target.value as FaixaMatch,
                    }))
                  }
                  className="w-full sm:min-w-[190px] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400"
                >
                  <option value="ALTA">
                    {t("vaga_match.compatibilidade_alta")}
                  </option>

                  <option value="BOA">
                    {t("vaga_match.compatibilidade_boa")}
                  </option>

                  <option value="COMPATIVEL">
                    {t("vaga_match.compatibilidade_compativel")}
                  </option>

                  <option value="TODOS">
                    {t("vaga_match.compatibilidade_todos")}
                  </option>
                </select>

                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium text-purple-600">
                  <Info className="w-3.5 h-3.5 shrink-0" />

                  <span>
                    {t(
                      `vaga_match.compatibilidade_${config.faixa.toLowerCase()}_descricao`,
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  {t("vaga_match.quantidade")}
                </label>

                <select
                  value={config.limite}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      limite: Number(e.target.value),
                    }))
                  }
                  className="w-full sm:min-w-[130px] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleBuscar}
                disabled={buscando}
                className="sm:col-span-2 xl:col-span-1 xl:mt-[22px] inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60 transition cursor-pointer"
              >
                <Search className="w-4 h-4" />

                {buscando ? t("vaga_match.buscando") : t("vaga_match.buscar")}
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-purple-100">
            <p className="text-xs text-gray-500 mb-2">
              {t("vaga_match.criterios_considerados")}
            </p>

            <div className="flex flex-wrap gap-2">
              <CriterioBadge label={t("vaga_match.criterio_skills")} />
              <CriterioBadge label={t("vaga_match.criterio_modalidade")} />
              <CriterioBadge label={t("vaga_match.criterio_localizacao")} />
              <CriterioBadge label={t("vaga_match.criterio_oportunidade")} />
            </div>
          </div>
        </div>

        {/* Resultados */}
        {pesquisou && (
          <div
            ref={resultadosRef}
            className="mt-6 pt-5 border-t border-purple-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {t("vaga_match.resultados_titulo")}
                </h3>

                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {t("vaga_match.resultados_descricao")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* Resultado da busca */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users className="w-4 h-4" />
                    {resultados.length} {t("vaga_match.candidatos_encontrados")}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-purple-600 font-medium">
                    <Info className="w-3.5 h-3.5" />

                    {t(
                      `vaga_match.compatibilidade_${config.faixa.toLowerCase()}_descricao`,
                    )}
                  </div>
                </div>

                {/* Seleção / convite */}
                {selecionados.length > 0 && (
                  <div className="flex flex-col gap-1 sm:items-end">
                    <span className="text-xs text-gray-500">
                      {selecionados.length} {t("vaga_match.selecionados")}
                    </span>

                    <button
                      type="button"
                      onClick={handleAbrirConfirmacaoConvite}
                      disabled={selecionados.length === 0 || enviandoConvites}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition cursor-pointer"
                    >
                      <Send className="h-4 w-4" />

                      {enviandoConvites
                        ? t("vaga_match.enviando_convites")
                        : t("vaga_match.convidar_selecionados")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Selecionar todos */}
            {resultados.length > 0 && (
              <div className="flex items-center gap-2 mb-3 px-1">
                <input
                  type="checkbox"
                  checked={todosSelecionados}
                  onChange={toggleSelecionarTodos}
                  className="h-4 w-4 accent-purple-600 cursor-pointer"
                />

                <span className="text-xs text-gray-500">
                  {t("vaga_match.selecionar_todos")}
                </span>
              </div>
            )}

            <div className="space-y-3">
              {resultados.map((candidato) => (
                <CandidateMatchCard
                  key={candidato.candidato_id}
                  candidato={candidato}
                  selecionado={selecionados.includes(candidato.candidato_id)}
                  jaConvidado={candidato.ja_convidado}
                  disabled={
                    !selecionados.includes(candidato.candidato_id) &&
                    selecionados.length >= LIMITE_CONVITES
                  }
                  onSelecionar={() => toggleSelecionado(candidato.candidato_id)}
                  onIgnorar={() => handleAbrirIgnorar(candidato)}
                  onVerPerfil={() => abrirPerfil(candidato.candidato_id)}
                />
              ))}
            </div>

            {resultados.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <Users className="w-8 h-8 mx-auto text-gray-300" />

                <p className="mt-3 text-sm font-medium text-gray-700">
                  {t("vaga_match.sem_resultados")}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modal ignorar candidato */}
      {candidatoIgnorar && (
        <IgnoreCandidateModal
          candidato={candidatoIgnorar}
          motivo={motivoIgnorar}
          ignorando={ignorando}
          onMotivoChange={setMotivoIgnorar}
          onCancelar={handleFecharIgnorar}
          onConfirmar={handleConfirmarIgnorar}
        />
      )}

      <PerfilCandidatoModal
        candidatoId={perfilCandidatoId}
        aberto={perfilAberto}
        onFechar={fecharPerfil}
        selecionado={
          perfilCandidatoId != null && selecionados.includes(perfilCandidatoId)
        }
        onSelecionar={(candidatoId) => toggleSelecionado(candidatoId)}
      />

      <ConfirmInviteCandidatesModal
        aberto={confirmarConviteAberto}
        total={selecionados.length}
        enviando={enviandoConvites}
        onFechar={() => setConfirmarConviteAberto(false)}
        onConfirmar={handleConvidarSelecionados}
      />
    </>
  );
}

function CriterioBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">
      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
      {label}
    </span>
  );
}
