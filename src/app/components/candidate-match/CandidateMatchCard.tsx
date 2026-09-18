"use client";

import { useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  MapPin,
  MoreVertical,
  UserRound,
  UserX,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export interface MatchCandidato {
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
  ja_convidado?: boolean;
}

interface CandidateMatchCardProps {
  candidato: MatchCandidato;
  selecionado: boolean;
  disabled: boolean;
  jaConvidado?: boolean;

  bloquearJaConvidado?: boolean;

  onSelecionar: () => void;
  onIgnorar: () => void;
  onVerPerfil: () => void;
}

export default function CandidateMatchCard({
  candidato,
  selecionado,
  disabled,
  jaConvidado = false,
  bloquearJaConvidado = true,
  onSelecionar,
  onIgnorar,
  onVerPerfil,
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
          {jaConvidado && bloquearJaConvidado ? (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
              {t("vaga_match.ja_convidado")}
            </span>
          ) : (
            <input
              type="checkbox"
              checked={selecionado}
              disabled={disabled && !selecionado}
              onChange={onSelecionar}
            />
          )}

          <div className="w-11 h-11 shrink-0 rounded-full bg-purple-50 flex items-center justify-center">
            <UserRound className="w-5 h-5 text-purple-600" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-800 truncate">
              {candidato.nome}
            </p>
            {jaConvidado && !bloquearJaConvidado && (
              <p className="mt-0.5 text-[11px] font-medium text-gray-400">
                {t("vaga_match.ja_convidado_anteriormente")}
              </p>
            )}

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
            onClick={onVerPerfil}
            className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 cursor-pointer"
          >
            {t("perfil_candidato.ver_perfil")}
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
