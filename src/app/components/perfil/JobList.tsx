import JobCard from "./JobCard";

interface Job {
  empresa_id: number;
  vaga_id: number;
  logo: string;
  nome_empresa: string;
  nome_vaga: string;
  localizacao: string;
  data_cadastro: string;
  qtde_dias_aberta: number;
  prazo: string;
  pcd?: boolean;
}

interface JobListProps {
  title: string;
  jobs: Job[];
  colorClass?: string; // cor da faixa
}

export default function JobList({ title, jobs, colorClass }: JobListProps) {
  return (
    <section>
      {/* Cabeçalho */}
      <div
        className={`px-4 py-1 rounded-full font-semibold text-sm ${colorClass}`}
      >
        {title}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3 mt-2">
        {jobs.map((job, idx) => (
          <JobCard key={idx} {...job} />
        ))}
      </div>
    </section>
  );
}
