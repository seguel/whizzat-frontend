import { useRouter } from "next/navigation";

interface SemDadosProps {
  tipo: "empresa" | "vaga" | "perfil"; // pode adicionar mais depois
  perfil: "candidato" | "avaliador" | "recrutador";
}

export default function SemDados({ tipo, perfil }: SemDadosProps) {
  const router = useRouter();
  const renderBloco = () => {
    switch (tipo) {
      case "empresa":
        return (
          <>
            <div className="flex flex-col items-center justify-center h-full text-center w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-lg sm:text-xl font-medium text-gray-700">
                Olá! Sua empresa ainda não possui uma página cadastrada.
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Complete os dados da sua empresa para poder criar anúncios de
                vagas e receber sugestões de candidatos compatíveis.
              </p>
              <p className="text-sm text-gray-500 mb-4 pb-4">
                Você poderá cadastrar quantas empresas quiser. Clique no botão
                abaixo para começar.
              </p>
              <button
                onClick={() =>
                  router.push(`/dashboard/empresa_dados?perfil=recrutador&op=N`)
                }
                className="px-4 py-2 rounded-full text-sm font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
              >
                Preencher dados da empresa
              </button>
            </div>
          </>
        );

      case "vaga":
        return (
          <>
            <div className="flex flex-col items-center justify-center h-full text-center w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-lg sm:text-xl font-medium text-gray-700">
                Nenhuma vaga cadastrada até o momento.
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Crie a primeira oportunidade clicando no botão abaixo.
              </p>
              <button
                onClick={() =>
                  router.push(`/dashboard/vagas?perfil=recrutador&op=N`)
                }
                className="mt-5 px-4 py-2 rounded-full text-sm font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
              >
                Cadastrar vaga
              </button>
            </div>
          </>
        );

      case "perfil":
        return (
          <>
            <div className="flex flex-col items-center justify-center h-full text-center w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-lg sm:text-xl font-medium text-gray-700">
                Olá! Seu perfil de {perfil} ainda não está completo ou ativo.
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Ative ou complete os dados para poder utilizar os recursos do seu perfil.
              </p>
              <button
                onClick={() =>
                  router.push(`/dashboard/perfil?perfil=${perfil}`)
                }
                className="mt-5 px-4 py-2 rounded-full text-sm font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer"
              >
                Adicionar {perfil}
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <main className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-3 flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm w-full min-h-[550px] text-center">
        {renderBloco()}
      </div>
    </main>
  );
}
