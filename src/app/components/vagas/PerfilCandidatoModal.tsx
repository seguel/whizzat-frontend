"use client";

import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  MapPin,
  User,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

interface PerfilSkill {
  skill_id: number;
  nome: string;
  tipo_skill_id: number;
  nivel: number;
  avaliado: boolean;
  data_ultima_avaliacao: string | null;
}

interface PerfilModalidade {
  modalidade_id: number;
  codigo: string;
  nome: string;
}

interface PerfilFormacao {
  id: number;
  graduacao_id: number;
  graduacao: string;
  formacao: string;
  certificado_file: string | null;
}

interface PerfilCertificacao {
  id: number;
  certificacao_id: number;
  certificacao: string;
  certificado_file: string | null;
}

interface PerfilCandidato {
  candidato_id: number;
  nome: string;
  logo: string | null;
  localizacao: string | null;
  apresentacao: string | null;
  modalidades: PerfilModalidade[];
  hard_skills: PerfilSkill[];
  soft_skills: PerfilSkill[];
  formacao: PerfilFormacao[];
  certificacoes: PerfilCertificacao[];
}

interface Props {
  candidatoId: number | null;
  aberto: boolean;
  onFechar: () => void;

  // opcional: usamos depois para selecionar direto pelo modal
  onSelecionar?: (candidatoId: number) => void;
  selecionado?: boolean;
}

export default function PerfilCandidatoModal({
  candidatoId,
  aberto,
  onFechar,
  onSelecionar,
  selecionado = false,
}: Props) {
  const { t, i18n } = useTranslation("common");

  const [perfil, setPerfil] = useState<PerfilCandidato | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!aberto || !candidatoId) {
      setPerfil(null);
      return;
    }

    const carregarPerfil = async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/candidate-match/candidato/${candidatoId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!res.ok) {
          const erro = await res.json().catch(() => null);

          throw new Error(erro?.message || t("perfil_candidato.erro_carregar"));
        }

        const data = await res.json();

        setPerfil(data);
      } catch (error) {
        console.error("Erro ao carregar perfil do candidato:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : t("perfil_candidato.erro_carregar"),
        );

        onFechar();
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [aberto, candidatoId]);

  useEffect(() => {
    if (!aberto) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onFechar();
      }
    };

    document.addEventListener("keydown", handleEscape);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = "";
    };
  }, [aberto, onFechar]);

  if (!aberto) {
    return null;
  }

  const formatarData = (data: string | null) => {
    if (!data) return null;

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
      return null;
    }
  };

  const renderSkill = (skill: PerfilSkill) => {
    return (
      <div
        key={skill.skill_id}
        className="rounded-xl border border-gray-200 bg-white p-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {skill.nome}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              {skill.avaliado ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />

                  {t("perfil_candidato.avaliado")}
                </span>
              ) : (
                <span className="text-xs text-gray-500">
                  {t("perfil_candidato.autoavaliacao")}
                </span>
              )}

              {skill.avaliado && skill.data_ultima_avaliacao && (
                <span className="text-xs text-gray-400">
                  {formatarData(skill.data_ultima_avaliacao)}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-800">
            {skill.nivel / 10}/10
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-purple-500"
            style={{
              width: `${Math.min(skill.nivel, 100)}%`,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onFechar();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-4 py-4 sm:px-6">
          {loading || !perfil ? (
            <div>
              <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-100" />
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                {perfil.logo ? (
                  <img
                    src={perfil.logo}
                    alt={perfil.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-400" />
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">
                  {perfil.nome}
                </h2>

                {perfil.localizacao && (
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 shrink-0" />

                    <span className="truncate">{perfil.localizacao}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onFechar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-52 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-52 animate-pulse rounded-xl bg-gray-100" />
              </div>
              <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
            </div>
          ) : perfil ? (
            <div className="space-y-6">
              {/* SOBRE */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" />

                  <h3 className="text-sm font-semibold text-gray-900">
                    {t("perfil_candidato.sobre")}
                  </h3>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                    {perfil.apresentacao?.trim() ||
                      t("perfil_candidato.sem_apresentacao")}
                  </p>
                </div>
              </section>

              {/* MODALIDADES */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-purple-600" />

                  <h3 className="text-sm font-semibold text-gray-900">
                    {t("perfil_candidato.modalidades")}
                  </h3>
                </div>

                {perfil.modalidades.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {perfil.modalidades.map((modalidade) => (
                      <span
                        key={modalidade.modalidade_id}
                        className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700"
                      >
                        {modalidade.nome}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {t("perfil_candidato.sem_modalidades")}
                  </p>
                )}
              </section>

              {/* SKILLS */}
              <section>
                <div className="grid gap-5 lg:grid-cols-2">
                  {/* HARD */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-600" />

                      <h3 className="text-sm font-semibold text-gray-900">
                        {t("perfil_candidato.hard_skills")}
                      </h3>
                    </div>

                    {perfil.hard_skills.length > 0 ? (
                      <div className="space-y-2">
                        {perfil.hard_skills.map(renderSkill)}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        {t("perfil_candidato.sem_skills")}
                      </p>
                    )}
                  </div>

                  {/* SOFT */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-600" />

                      <h3 className="text-sm font-semibold text-gray-900">
                        {t("perfil_candidato.soft_skills")}
                      </h3>
                    </div>

                    {perfil.soft_skills.length > 0 ? (
                      <div className="space-y-2">
                        {perfil.soft_skills.map(renderSkill)}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        {t("perfil_candidato.sem_skills")}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* FORMAÇÃO */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />

                  <h3 className="text-sm font-semibold text-gray-900">
                    {t("perfil_candidato.formacao")}
                  </h3>
                </div>

                {perfil.formacao.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {perfil.formacao.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <p className="text-sm font-semibold text-gray-900">
                          {item.formacao}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.graduacao}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {t("perfil_candidato.sem_formacao")}
                  </p>
                )}
              </section>

              {/* CERTIFICAÇÕES */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />

                  <h3 className="text-sm font-semibold text-gray-900">
                    {t("perfil_candidato.certificacoes")}
                  </h3>
                </div>

                {perfil.certificacoes.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {perfil.certificacoes.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <p className="text-sm font-semibold text-gray-900">
                          {item.certificacao}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {t("perfil_candidato.sem_certificacoes")}
                  </p>
                )}
              </section>
            </div>
          ) : null}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onFechar}
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
          >
            {t("perfil_candidato.fechar")}
          </button>

          {onSelecionar && perfil && (
            <button
              type="button"
              onClick={() => {
                onSelecionar(perfil.candidato_id);
              }}
              className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition sm:w-auto ${
                selecionado
                  ? "bg-gray-500 hover:bg-gray-600"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {selecionado
                ? t("perfil_candidato.remover_selecao")
                : t("perfil_candidato.selecionar")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
