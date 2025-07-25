import JobCard from "./JobCard";

interface Job {
  logo: string;
  score: number;
  title: string;
  company: string;
  location: string;
  deadline: string;
  pcd?: boolean;
}

interface JobListProps {
  title: string;
  jobs: Job[];
}

export default function JobList({ title, jobs }: JobListProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <a href="#" className="text-sm text-purple-600 hover:underline">
          Ver mais
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {jobs.map((job, idx) => (
          <JobCard key={idx} {...job} />
        ))}
      </div>
    </section>
  );
}
