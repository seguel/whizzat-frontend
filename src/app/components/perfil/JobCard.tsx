interface JobCardProps {
  logo: string;
  score: number;
  title: string;
  company: string;
  location: string;
  deadline: string;
  pcd?: boolean;
}

export default function JobCard({
  logo,
  score,
  title,
  company,
  location,
  deadline,
  pcd,
}: JobCardProps) {
  return (
    <div className="flex justify-between items-center rounded-lg p-4 bg-white shadow-sm">
      <div className="flex flex-col items-center">
        <img src={logo} alt="logo" className="w-10 h-10 object-contain" />
        <span className="text-green-600 font-bold mt-2">{score}</span>
      </div>
      <div className="flex-1 px-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-gray-500">{company}</p>
        <p className="text-xs text-gray-500">{location}</p>
      </div>
      <div className="text-xs text-center">
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
          PRAZO
          <br />
          {deadline}
        </div>
        {pcd && <span className="mt-2 inline-block">♿</span>}
      </div>
    </div>
  );
}
