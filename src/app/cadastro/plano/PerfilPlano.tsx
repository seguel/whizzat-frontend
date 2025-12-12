"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import LogoutButton from "../../components/perfil/logoutButton";
import { toast } from "react-hot-toast";

const profiles = {
  candidato: {
    avatar: "/assets/imagem_perfil_candidato.png",
    ilustracao: "/assets/imagem_perfil.png",
  },
  recrutador: {
    avatar: "/assets/imagem_perfil_recrutador.png",
    ilustracao: "/assets/imagem_perfil.png",
  },
  avaliador: {
    avatar: "/assets/imagem_perfil_avaliador.png",
    ilustracao: "/assets/imagem_perfil.png",
  },
} as const;

type PerfilKey = keyof typeof profiles;

export default function PerfilPlanoPage({ perfil }: { perfil: PerfilKey }) {
  const { t } = useTranslation("common");
  const { ilustracao } = profiles[perfil];
  const titulo = t(`perfil.selecionado_${perfil}_titulo`);
  const descricaoCurta = t(`perfil.selecionado_${perfil}_descricao_curta`);
  const descricaoLonga = t(`perfil.card_${perfil}_descricao`);
  const cor = t(`perfil.selecionado_${perfil}_cor`);
  const cor_css = t(`perfil.selecionado_${perfil}_cor_css`);

  const borderClass = `border-${cor_css}-400`;
  const bgClass = `bg-${cor_css}-400`;
  const textClass = `text-${cor_css}-300`;
  // const hoverTextClass = `hover:text-${cor_css}-300`;
  const hoverBgClass = `hover:bg-${cor_css}-400`;

  const router = useRouter();
  //const data = profiles[perfil];

  const inserePlano = async (planoPeriodoId: number) => {
    const perfilId =
      perfil === "recrutador" ? 2 : perfil === "avaliador" ? 3 : 1;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/planos/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ perfilId, planoPeriodoId }),
      });

      if (!res.ok) {
        toast.error("Erro ao gravar o plano selecionado.", {
          duration: 2000,
        });
        console.log(res);
        return;
      }

      const data = await res.json();
      console.log("plano", data);

      // 3. Redirecionar após sucesso
      router.push(`/dashboard?perfil=${perfil}`);
    } catch (err) {
      console.error("Erro ao enviar requisição:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      {/* Header fixo no topo */}
      <header className="w-full bg-gray-100 sticky top-0 z-50 px-4">
        <div className=" flex items-center justify-between py-4 ">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/assets/logofull_whizzat.png"
              alt="Logo grande"
              width={160}
              height={40}
            />
          </Link>

          {/* Botão de Logout */}
          <LogoutButton color={cor_css} />
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col lg:flex-row items-center justify-center px-6 gap-12">
        {/* Ilustração */}
        <div className="w-[300px] h-auto">
          <Image
            src={ilustracao}
            alt="Pessoa com laptop"
            width={300}
            height={300}
            className="hidden sm:block w-full h-auto"
          />
        </div>

        {/* Texto */}
        <div className="max-w-xl text-center lg:text-left space-y-6">
          <h1 className="text-3xl font-semibold text-gray-800">{titulo}</h1>
          <p className="text-gray-700">
            {/* {t("perfil.selecionado_titulo_primeiro")} */}
            Voce ainda nao possui um plano, selecione abaixo
          </p>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end items-center mt-10 mb-10 px-5">
        <div className="flex gap-4">
          <button
            onClick={(e) => inserePlano(1)}
            className={`px-6 py-1 rounded-full ${bgClass} font-semibold ${hoverBgClass} transition cursor-pointer`}
          >
            {t("perfil.btn_avancar")}
          </button>
        </div>
      </div>
    </div>
  );
}
