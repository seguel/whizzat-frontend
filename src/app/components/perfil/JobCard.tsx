import Link from "next/link";

interface JobCardProps {
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

export default function JobCard({
  vaga_id,
  logo,
  nome_vaga,
  nome_empresa,
  localizacao,
  prazo,
  pcd,
}: JobCardProps) {
  return (
    <Link href={`/dashboard/vaga_detalhe/${vaga_id}`} className="block w-full">
      <div className="flex flex-row justify-start items-start rounded-lg p-3 sm:p-4 bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-purple-200 transition w-full">
        {/* Logo e Badge PCD */}
        <div className="flex flex-col items-center sm:items-start mr-3 sm:mr-4 flex-shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white overflow-hidden">
            <img
              src={logo}
              alt="logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
          </div>
          {pcd && (
            <span className="mt-1 sm:mt-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
              ♿ PCD
            </span>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm break-words">{nome_vaga}</h3>
          <p className="text-xs text-gray-500 break-words">{nome_empresa}</p>
          <p className="text-xs text-gray-500 break-words">{localizacao}</p>

          <p className="flex items-center justify-center text-xs px-2 py-1 rounded-lg bg-purple-100 mt-2 sm:mt-4 max-w-full">
            <strong>Aberta até: {prazo}</strong>
          </p>
        </div>
      </div>
    </Link>
  );
}
