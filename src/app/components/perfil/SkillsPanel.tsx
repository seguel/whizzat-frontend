"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

type Skill = {
  nome?: string;
  peso: number; // escala de 1 a 10
  tipo_skill_id?: number;
};

type SkillsPanelProps = {
  skills?: Skill[];
  perfil: "candidato" | "avaliador" | "recrutador";
};

export default function SkillsPanel({ skills, perfil }: SkillsPanelProps) {
  const { t, i18n } = useTranslation("common");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
    } else {
      const onInit = () => setReady(true);
      i18n.on("initialized", onInit);
      return () => {
        i18n.off("initialized", onInit);
      };
    }
  }, [i18n]);

  if (!ready) return null;

  // Conversão dos dados para o gráfico
  const radarData = (skills ?? []).map((skill) => ({
    skill: skill.nome,
    value: skill.peso / 10,
    tipo_skill_id: skill.tipo_skill_id,
  }));

  // Map para classes de cor de acordo com o perfil
  const perfilColors: Record<
    "candidato" | "avaliador" | "recrutador",
    { bg: string; hover: string; text: string; fill: string; grafico: string }
  > = {
    candidato: {
      bg: "bg-green-500",
      hover: "hover:bg-green-200",
      text: "text-green-500",
      fill: "fill-green-600",
      grafico: "#16A34A",
    },
    recrutador: {
      bg: "bg-purple-500",
      hover: "hover:bg-purple-200",
      text: "text-purple-500",
      fill: "fill-purple-600",
      grafico: "#9810fa",
    },
    avaliador: {
      bg: "bg-blue-500",
      hover: "hover:bg-blue-200",
      text: "text-blue-500",
      fill: "fill-blue-600",
      grafico: "#155dfc",
    },
  };

  const nmrScore = `text-[40px] font-bold
   ${perfilColors[perfil].fill}
    `;

  const corGrafico = `${perfilColors[perfil].grafico}`;

  // Cálculo da média para o score (em % de 100)
  const media =
    skills && skills.length > 0
      ? Math.round(
          (skills.reduce((sum, skill) => sum + skill.peso / 10, 0) /
            skills.length) *
            10
        )
      : 0;

  // Para o círculo: cálculo do dashoffset
  const dashArray = 314; // circunferência de r=50 => 2πr ≈ 314
  const dashOffset = dashArray - (media / 100) * dashArray;

  return (
    <aside className="bg-white rounded-xl p-3 shadow-sm w-full md:max-w-[280px] ">
      {/* Radar Chart */}
      <div>
        <h3 className="text-sm font-semibold text-center">
          {t("tela_vaga_dados.item_label_panel_hardskill")}
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="70%"
            data={radarData.filter((s) => s.tipo_skill_id == 1)}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
            <Radar
              name="skills"
              dataKey="value"
              stroke="#9333EA"
              fill={corGrafico}
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      {radarData.filter((s) => s.tipo_skill_id == 2).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-center">
            {t("tela_vaga_dados.item_label_panel_softskill")}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="75%"
              data={radarData.filter((s) => s.tipo_skill_id == 2)}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} />
              <Radar
                name="skills"
                dataKey="value"
                stroke="#9333EA"
                fill={corGrafico}
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Score circular */}
      <div className="flex flex-row items-center justify-center">
        <h2 className="text-sm text-center mr-3">
          {t("tela_vaga_dados.item_label_panel_score")}
        </h2>
        <svg className="w-15 h-15" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb" // cinza claro
            strokeWidth="7"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={corGrafico}
            strokeWidth="7"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            strokeLinecap="round"
          />

          <text x="60" y="75" textAnchor="middle" className={nmrScore}>
            {media}
          </text>
        </svg>
      </div>
    </aside>
  );
}
