import Link from "next/link";

export default function SemEmpresa() {
  return (
    <main className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-3 flex flex-col items-start p-6 bg-white rounded-lg shadow-sm w-full min-h-[550px]">
        <div className="pl-10 pt-8">
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Olá! Sua empresa ainda não tem uma página com as informações
            necessárias.
          </h2>
          <p className="text-sm text-gray-600 mb-1 pt-4">
            Assim que completar sua página, poderá criar anúncios de vagas para
            receber sugestões de candidatos compatíveis.
          </p>
          <p className="text-sm text-gray-600 mb-4 pb-4">
            Você poderá criar quantas páginas de empresas desejar.
          </p>
          <Link href="/dashboard/empresa_dados?perfil=recrutador">
            <button className="px-4 py-2 rounded-full text-sm font-semibold text-indigo-900 bg-purple-100 hover:bg-purple-200 transition cursor-pointer">
              Preencher dados da empresa
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
