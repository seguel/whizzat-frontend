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
  lgbtq?: boolean;
  mulheres?: boolean;
  cinquenta_mais?: boolean;
  cidade_label: string;
  estado_sigla: string;
}

interface JobListProps {
  title: string;
  perfil: string;
  jobs: Job[];
  colorClass?: string; // cor da faixa
}

export default function JobList({
  title,
  perfil,
  jobs,
  colorClass,
}: JobListProps) {
  return (
    <section>
      {title.trim().length > 0 && (
        <div
          className={`px-4 py-1 rounded-full font-semibold text-sm ${colorClass}`}
        >
          {title}
        </div>
      )}

      {perfil == "candidato" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {jobs.map((job, idx) => (
            <JobCard key={idx} {...job} perfil={perfil} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          {jobs.map((job, idx) => (
            <JobCard key={idx} {...job} perfil={perfil} />
          ))}
        </div>
      )}
    </section>
  );
}
