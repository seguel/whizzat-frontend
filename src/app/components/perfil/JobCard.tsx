import Link from "next/link";
import Image from "next/image";

interface JobCardProps {
  empresa_id: number;
  perfil: string;
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
}

export default function JobCard({
  vaga_id,
  empresa_id,
  perfil,
  logo,
  nome_vaga,
  nome_empresa,
  localizacao,
  prazo,
  pcd,
  lgbtq,
  mulheres,
  cinquenta_mais,
}: JobCardProps) {
  return (
    <Link
      href={`/dashboard/vagas?perfil=${perfil}&vagaid=${vaga_id}&id=${empresa_id}`}
      className="block w-full"
    >
      <div className="flex flex-col justify-between rounded-lg p-3 sm:p-4 bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-purple-200 transition w-full">
        {/* Linha superior: logo e informações */}
        <div className="flex flex-row justify-start items-start w-full">
          {/* Logo */}
          <div className="flex flex-col items-center sm:items-start mr-3 sm:mr-4 flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white overflow-hidden">
              {logo ? (
                <Image
                  src={logo}
                  alt="Logo da empresa"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-xs text-gray-400 text-center px-2">
                  Sem logo
                </div>
              )}
            </div>
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

        {/* Linha inferior: ícones de inclusão */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mt-3 pt-2  w-full">
          {pcd && (
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="text-[12px]">♿</span> PCD
            </span>
          )}
          {lgbtq && (
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="text-[12px]">🏳️‍🌈</span> LGBTQ+
            </span>
          )}
          {mulheres && (
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="text-[12px]">👩‍💼</span> Mulheres
            </span>
          )}
          {cinquenta_mais && (
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="text-[12px]">👴</span> 50+
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
