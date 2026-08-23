"use client";

import { useTranslation } from "react-i18next";
import { AvaliadorDashboardTopSkill } from "../../../lib/types/avaliador-dashboard";

interface Props {
  skills: AvaliadorDashboardTopSkill[];
}

export default function TopEvaluatedSkills({ skills }: Props) {
  const { t } = useTranslation("common");

  const maiorTotal =
    skills.length > 0 ? Math.max(...skills.map((skill) => skill.total)) : 0;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("dash_avaliador.top_skills_titulo")}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {t("dash_avaliador.top_skills_descricao")}
        </p>
      </div>

      {skills.length > 0 ? (
        <div className="space-y-4">
          {skills.map((skill, index) => {
            const percent =
              maiorTotal > 0 ? (skill.total / maiorTotal) * 100 : 0;

            return (
              <div key={skill.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-400 w-4">
                      {index + 1}
                    </span>

                    <span className="font-medium text-gray-800 truncate">
                      {skill.nome}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-gray-600">
                    {skill.total}
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${percent}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">
            {t("dash_avaliador.sem_top_skills")}
          </p>
        </div>
      )}
    </section>
  );
}
