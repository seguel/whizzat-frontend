import JobCard from "./JobCard";

type TipoOportunidade = "AMPLA_CONCORRENCIA" | "AFIRMATIVA" | "EXCLUSIVA";

type PublicoAfirmativo =
  | "PCD"
  | "AFIRMATIVA_RACIAL"
  | "LGBTQIA"
  | "MULHERES"
  | "CINQUENTA_MAIS"
  | "DIVERSIDADE";

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
  tipo_oportunidade: TipoOportunidade;
  publicos_afirmativos: PublicoAfirmativo[];
  cidade_label: string;
  estado_sigla: string;
}

interface JobListProps {
  title: string;
  perfil: string;
  jobs: Job[];
  colorClass?: string;
}

export default function JobList({
  title,
  perfil,
  jobs,
  colorClass,
}: JobListProps) {
  return (
    <section className="w-full min-w-0">
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
        {jobs.map((job) => (
          <JobCard key={job.vaga_id} {...job} perfil={perfil} />
        ))}
      </div>
    </section>
  );
}
