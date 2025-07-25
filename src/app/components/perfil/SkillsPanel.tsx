import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { skill: "Lógica de Programação", value: 90 },
  { skill: "Comunicação", value: 65 },
  { skill: "Fit Cult", value: 80 },
  { skill: "Colaboração", value: 60 },
  { skill: "Adaptabilidade", value: 70 },
];

export default function SkillsPanel() {
  return (
    <aside className="bg-white rounded-xl p-4 shadow-sm w-full md:max-w-xs">
      <div className="flex flex-col items-center">
        <svg className="w-28 h-28" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#d1fae5"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#10b981"
            strokeWidth="10"
            strokeDasharray="251"
            strokeDashoffset="50"
            transform="rotate(-90 60 60)"
          />
          <text
            x="60"
            y="52"
            textAnchor="middle"
            className="text-[13px] fill-gray-500 font-semibold"
          >
            Seu Score
          </text>
          <text
            x="60"
            y="78"
            textAnchor="middle"
            className="text-lg fill-green-600 font-bold"
          >
            82
          </text>
        </svg>
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-center mb-2">Suas Skills</h3>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar
              name="skills"
              dataKey="value"
              stroke="#10b981"
              fill="#6ee7b7"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </aside>
  );
}
