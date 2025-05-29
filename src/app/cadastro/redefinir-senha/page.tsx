"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

const RedefinirSenha = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erroReset, setErroReset] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const isPassValid = novaSenha.trim() !== "";

  // ✅ Lê token da URL *após* renderização inicial
  useEffect(() => {
    if (!searchParams) return;
    const t = searchParams.get("token");
    setToken(t);
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!token) {
      setErroReset("Token inválido ou ausente.");
      setTimeout(() => {
        setErroReset("");
        setLoading(false);
      }, 3000);
      return;
    }

    if (novaSenha.length < 6) {
      setErroReset("A senha deve ter pelo menos 6 caracteres.");
      setTimeout(() => {
        setErroReset("");
        setLoading(false);
      }, 3000);
      return;
    }

    setLoading(true);
    setErroReset("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, novaSenha }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMensagemSucesso(data.message || "Senha redefinida com sucesso.");
        setTimeout(() => router.push("/cadastro/login"), 3000);
      } else {
        setErroReset(data.message || "Erro ao redefinir a senha.");
        setLoading(false);
      }
    } catch {
      setErroReset("Erro ao redefinir a senha. Tente novamente.");
      setLoading(false);
    } finally {
      setTimeout(() => setErroReset(""), 4000);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="flex flex-col sm:flex-row w-full max-w-[800px] h-auto sm:h-[550px] bg-[#E6FEF6] shadow-[0px_20px_40px_0px_rgba(2,227,149,0.25)] rounded-lg overflow-hidden">
        <div className="w-full sm:w-1/2 h-auto sm:h-full flex flex-col justify-center items-center px-3 py-10 gap-2">
          <Link href="/">
            <Image
              src="/assets/logofull.jpeg"
              alt="Logo grande"
              width={180}
              height={40}
              className="hidden sm:block"
            />
          </Link>
          <Link href="/">
            <Image
              src="/assets/logomobile.jpeg"
              alt="Logo pequeno"
              width={100}
              height={24}
              className="block sm:hidden"
            />
          </Link>

          <form
            className="flex flex-col gap-2 w-full max-w-[340px] mt-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (isPassValid) handleSubmit();
            }}
          >
            <label className="text-[#010608] text-[14px] mt-2">
              Nova Senha
            </label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite sua nova senha"
              className="border border-[#7DCBED] rounded-[8px] px-3 py-1 bg-white focus:outline-none"
            />

            {erroReset ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mt-2 text-sm flex items-center gap-2">
                <ExclamationCircleIcon className="w-6 h-6 text-red-700" />
                {erroReset}
              </div>
            ) : mensagemSucesso ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative mt-2 text-sm flex items-center gap-2">
                <CheckCircleIcon className="w-10 h-10 text-green-700" />
                {mensagemSucesso}
              </div>
            ) : (
              <button
                type="submit"
                className={`py-2 mt-3 rounded-[8px] font-medium transition ${
                  !loading && isPassValid
                    ? "bg-[#A9DCF3] text-black hover:bg-[#A9DCF4] cursor-pointer"
                    : "bg-[#F0F0F0] text-[#BBB] cursor-not-allowed"
                }`}
                disabled={loading || !isPassValid}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    <span>Redefinindo...</span>
                  </div>
                ) : (
                  "Redefinir Senha"
                )}
              </button>
            )}
          </form>
        </div>

        <div className="hidden sm:block w-full sm:w-1/2 h-full">
          <Image
            src="/assets/imagem_cadastro.png"
            alt="Imagem Login"
            width={400}
            height={550}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </main>
  );
};

export default RedefinirSenha;
