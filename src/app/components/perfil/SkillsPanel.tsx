"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type Skill = {
  nome?: string;
  peso: number; // escala de 1 a 10
};

type SkillsPanelProps = {
  skills?: Skill[];
  perfil: "candidato" | "avaliador" | "recrutador";
};

export default function SkillsPanel({ skills, perfil }: SkillsPanelProps) {
  // Conversão dos dados para o gráfico
  const radarData = (skills ?? []).map((skill) => ({
    skill: skill.nome,
    value: skill.peso / 10,
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

  const nmrScore = `text-lg font-bold
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
      {/* Score circular */}
      <div className="flex flex-col items-center">
        <svg className="w-28 h-28" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e5e7eb" // cinza claro
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#9333EA"
            strokeWidth="10"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            strokeLinecap="round"
          />
          <text
            x="60"
            y="52"
            textAnchor="middle"
            className="text-[13px] fill-gray-500 font-semibold"
          >
            Score Médio
          </text>
          <text x="60" y="78" textAnchor="middle" className={nmrScore}>
            {media}
          </text>
        </svg>
      </div>

      {/* Radar Chart */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-center mb-2">
          Distribuição de skills
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart cx="50%" cy="50%" outerRadius="45%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
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
    </aside>
  );
}
