"use client";

import SkillsPanel from "../../../components/perfil/SkillsPanel";

type Skill = {
  skill_id?: number;
  nome?: string;
  peso: number;
  peso_avaliador?: number | null;
  tipo_skill_id?: number;
};

interface Props {
  skills: Skill[];
}

export default function SkillsOverview({ skills }: Props) {
  const hardSkills = skills.filter((skill) => skill.tipo_skill_id === 1);
  const softSkills = skills.filter((skill) => skill.tipo_skill_id === 2);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Meu perfil</h2>

        <p className="text-sm text-gray-500 mt-1">
          Compare seu nível informado com a avaliação recebida.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
        {/* Radar */}
        <div className="w-full flex justify-center xl:justify-start">
          <SkillsPanel
            skills={skills}
            perfil="candidato"
            className="md:max-w-[320px] shadow-none"
          />
        </div>

        {/* Barras */}
        <div className="min-w-0">
          {hardSkills.length > 0 && (
            <SkillGroup title="Hard Skills" skills={hardSkills} />
          )}

          {softSkills.length > 0 && (
            <div className={hardSkills.length > 0 ? "mt-10" : ""}>
              <SkillGroup title="Soft Skills" skills={softSkills} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SkillGroup({ title, skills }: { title: string; skills: Skill[] }) {
  const isHardSkill = title === "Hard Skills";
  return (
    <div>
      <div
        className={`mb-5 rounded-xl border px-4 py-3 ${
          isHardSkill
            ? "bg-green-50/70 border-green-100"
            : "bg-blue-50/70 border-blue-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm text-lg">
            {title === "Hard Skills" ? "⚙️" : "🤝"}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

            <p className="text-xs text-gray-500 mt-0.5">
              {title === "Hard Skills"
                ? "Competências técnicas"
                : "Competências comportamentais"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {skills.map((skill, index) => (
          <SkillBars
            key={skill.skill_id ?? `${skill.nome}-${index}`}
            skill={skill}
          />
        ))}
      </div>
    </div>
  );
}

function SkillBars({ skill }: { skill: Skill }) {
  const perfil = skill.peso / 10;

  const avaliador =
    skill.peso_avaliador != null ? skill.peso_avaliador / 10 : null;

  const perfilPercent = Math.min((perfil / 10) * 100, 100);

  const avaliadorPercent =
    avaliador != null ? Math.min((avaliador / 10) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">
          {skill.nome}
        </span>
      </div>

      {/* Perfil */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">Perfil</span>

          <span className="font-semibold text-green-600">
            {perfil.toFixed(1)}
          </span>
        </div>

        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${perfilPercent}%` }}
          />
        </div>
      </div>

      {/* Avaliador */}
      {avaliador != null ? (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Avaliador</span>

            <span className="font-semibold text-blue-600">
              {avaliador.toFixed(1)}
            </span>
          </div>

          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${avaliadorPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-400 mt-2">
          Avaliação ainda não disponível
        </div>
      )}
    </div>
  );
}
