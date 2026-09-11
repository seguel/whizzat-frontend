"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  Users,
  MapPin,
  BriefcaseBusiness,
  CheckCircle2,
  UserRound,
  MoreVertical,
  UserX,
  X,
  Send,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

type FaixaMatch = "ALTA" | "BOA" | "COMPATIVEL" | "TODOS";

interface MatchConfig {
  limite: number;
  faixa: FaixaMatch;
}

interface MatchCandidato {
  candidato_id: number;
  nome: string;
  localizacao: string | null;
  score: number;
  hard_skills: number;
  soft_skills: number;
  modalidade_compativel: boolean;
  oportunidade_compativel: boolean;
  skills_avaliadas: number;
  total_skills: number;
  publico_prioritario?: boolean;
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
    () => resultados.slice(0, LIMITE_CONVITES).map((item) => item.candidato_id),
    [resultados],
  );

  const todosSelecionados =
    idsSelecionaveis.length > 0 &&
    idsSelecionaveis.every((id) => selecionados.includes(id));

  const toggleSelecionado = (candidatoId: number) => {
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

  const handleConfirmarIgnorar = () => {
    if (!candidatoIgnorar) return;

    // MOCK:
    // futuramente aqui será POST para a tabela de candidatos ignorados.
    console.log("Ignorar candidato:", {
      candidato_id: candidatoIgnorar.candidato_id,
      motivo: motivoIgnorar || null,
    });

    setResultados((prev) =>
      prev.filter(
        (item) => item.candidato_id !== candidatoIgnorar.candidato_id,
      ),
    );

    setSelecionados((prev) =>
      prev.filter((id) => id !== candidatoIgnorar.candidato_id),
    );

    handleFecharIgnorar();
  };

  const handleConvidarSelecionados = () => {
    // Mock por enquanto.
    console.log("Candidatos selecionados:", selecionados);
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
          <div className="mt-6 pt-5 border-t border-purple-200">
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
                      onClick={handleConvidarSelecionados}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {t("vaga_match.convidar_selecionados")}
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
                  disabled={
                    !selecionados.includes(candidato.candidato_id) &&
                    selecionados.length >= LIMITE_CONVITES
                  }
                  onSelecionar={() => toggleSelecionado(candidato.candidato_id)}
                  onIgnorar={() => handleAbrirIgnorar(candidato)}
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
          onMotivoChange={setMotivoIgnorar}
          onCancelar={handleFecharIgnorar}
          onConfirmar={handleConfirmarIgnorar}
        />
      )}
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

interface CandidateMatchCardProps {
  candidato: MatchCandidato;
  selecionado: boolean;
  disabled: boolean;
  onSelecionar: () => void;
  onIgnorar: () => void;
}

function CandidateMatchCard({
  candidato,
  selecionado,
  disabled,
  onSelecionar,
  onIgnorar,
}: CandidateMatchCardProps) {
  const { t } = useTranslation("common");

  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div
      className={`relative rounded-xl border bg-white p-4 transition ${
        selecionado
          ? "border-purple-300 ring-1 ring-purple-100"
          : "border-gray-200 hover:border-purple-200 hover:shadow-sm"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Candidato */}
        <div className="flex items-start sm:items-center gap-3 min-w-0 lg:w-[30%]">
          <input
            type="checkbox"
            checked={selecionado}
            disabled={disabled}
            onChange={onSelecionar}
            className="mt-3 sm:mt-0 h-4 w-4 shrink-0 accent-purple-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          />

          <div className="w-11 h-11 shrink-0 rounded-full bg-purple-50 flex items-center justify-center">
            <UserRound className="w-5 h-5 text-purple-600" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-800 truncate">
              {candidato.nome}
            </p>

            {candidato.publico_prioritario && (
              <span className="mt-1 inline-flex w-fit items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                {t("vaga_match.publico_prioritario")}
              </span>
            )}

            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />

              <span className="truncate">{candidato.localizacao || "-"}</span>
            </div>
          </div>

          {/* Menu mobile */}
          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setMenuAberto((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuAberto && (
              <CandidateMenu
                onIgnorar={() => {
                  setMenuAberto(false);
                  onIgnorar();
                }}
              />
            )}
          </div>
        </div>

        {/* Match */}
        <div className="flex items-center gap-3 lg:w-[120px]">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-purple-100 shrink-0">
            <span className="text-sm font-bold text-purple-700">
              {candidato.score}%
            </span>
          </div>

          <div className="lg:hidden">
            <p className="text-xs font-medium text-gray-700">
              {t("vaga_match.match_geral")}
            </p>
          </div>
        </div>

        {/* Scores */}
        <div className="flex flex-col gap-2.5 flex-1 lg:max-w-[240px]">
          <ScoreItem
            label={t("vaga_match.hard_skills")}
            value={candidato.hard_skills}
          />

          <ScoreItem
            label={t("vaga_match.soft_skills")}
            value={candidato.soft_skills}
          />
        </div>

        {/* Compatibilidades */}
        <div className="flex flex-col gap-1.5 lg:min-w-[180px]">
          {candidato.modalidade_compativel && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <BriefcaseBusiness className="w-3.5 h-3.5 text-green-500" />

              {t("vaga_match.modalidade_compativel")}
            </div>
          )}

          {candidato.oportunidade_compativel && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />

              {t("vaga_match.oportunidade_compativel")}
            </div>
          )}

          <div className="text-[11px] text-gray-400">
            {candidato.skills_avaliadas}/{candidato.total_skills}{" "}
            {t("vaga_match.skills_avaliadas")}
          </div>
        </div>

        {/* Ações desktop */}
        <div className="flex items-center gap-2 lg:justify-end">
          <button
            type="button"
            className="flex-1 lg:flex-none rounded-lg border border-purple-200 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition cursor-pointer"
          >
            {t("vaga_match.ver_perfil")}
          </button>

          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setMenuAberto((prev) => !prev)}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition cursor-pointer"
              aria-label={t("vaga_match.mais_acoes")}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuAberto && (
              <CandidateMenu
                onIgnorar={() => {
                  setMenuAberto(false);
                  onIgnorar();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateMenu({ onIgnorar }: { onIgnorar: () => void }) {
  const { t } = useTranslation("common");

  return (
    <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={onIgnorar}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 transition cursor-pointer"
      >
        <UserX className="w-4 h-4" />

        {t("vaga_match.nao_mostrar_novamente")}
      </button>
    </div>
  );
}

interface IgnoreCandidateModalProps {
  candidato: MatchCandidato;
  motivo: string;
  onMotivoChange: (value: string) => void;
  onCancelar: () => void;
  onConfirmar: () => void;
}

function IgnoreCandidateModal({
  candidato,
  motivo,
  onMotivoChange,
  onCancelar,
  onConfirmar,
}: IgnoreCandidateModalProps) {
  const { t } = useTranslation("common");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {t("vaga_match.ignorar_titulo")}
            </h3>

            <p className="mt-1 text-xs text-gray-500">{candidato.nome}</p>
          </div>

          <button
            type="button"
            onClick={onCancelar}
            className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            {t("vaga_match.ignorar_descricao")}
          </p>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {t("vaga_match.ignorar_motivo")}
            </label>

            <select
              value={motivo}
              onChange={(e) => onMotivoChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400"
            >
              <option value="">
                {t("vaga_match.ignorar_motivo_opcional")}
              </option>

              <option value="PERFIL_NAO_ADERENTE">
                {t("vaga_match.motivo_perfil")}
              </option>

              <option value="HISTORICO_ENTREVISTA">
                {t("vaga_match.motivo_entrevista")}
              </option>

              <option value="JA_AVALIADO">
                {t("vaga_match.motivo_avaliado")}
              </option>

              <option value="OUTRO">{t("vaga_match.motivo_outro")}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-5 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancelar}
            className="w-full sm:w-auto rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            {t("vaga_match.cancelar")}
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition cursor-pointer"
          >
            <UserX className="w-4 h-4" />

            {t("vaga_match.confirmar_ignorar")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-[11px] text-gray-500 whitespace-nowrap">
          {label}
        </span>

        <span className="text-[11px] font-semibold text-gray-700">
          {value}%
        </span>
      </div>

      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}
