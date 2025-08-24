"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTranslation } from "react-i18next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function LoginInner() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/cadastro/perfil";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [repeteSenha, setRepeteSenha] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");

  const [displayTelaLogin, setDisplayTelaLogin] = useState(true);
  const [displayTelasqueceuSenha, setDisplayTelaEsqueceuSenha] =
    useState(false);

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [loadingReenvio, setLoadingReenvio] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [erroEnvio, setErroEnvio] = useState("");
  const [sucessoCadastro, setSucessoCadastro] = useState("");
  const [sucessoEnvio, setSucessoEnvio] = useState("");

  const isFormFilled = email.trim() !== "" && senha.trim() !== "";
  const isFormCreateFilled =
    nome.trim() !== "" &&
    sobrenome.trim() !== "" &&
    email.trim() !== "" &&
    senha.trim() !== "" &&
    repeteSenha.trim() !== "";

  const isFormEsqueceuSenhaFilled = email.trim() !== "";
  const isLoginValid = email && senha;
  const isCadastroValid = nome && sobrenome && email && senha && repeteSenha;

  const isValidPassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/;
    return regex.test(password);
  };

  useEffect(() => {
    LimpaTela();
  }, []);

  type TipoTela = "login" | "cadastro" | "esqueci";

  interface ConstraintError {
    property: string;
    constraints?: { [type: string]: string };
  }

  const SetaStatusTela = (tipoTela: TipoTela) => {
    const estadosIniciais = {
      login: () => {
        setDisplayTelaLogin(true);
        setDisplayTelaEsqueceuSenha(false);
      },
      cadastro: () => {
        setDisplayTelaLogin(false);
        setDisplayTelaEsqueceuSenha(false);
      },
      esqueci: () => {
        setDisplayTelaLogin(false);
        setDisplayTelaEsqueceuSenha(true);
      },
    };

    if (estadosIniciais[tipoTela]) {
      estadosIniciais[tipoTela]();
    } else {
      console.warn("Tipo de tela desconhecido:", tipoTela);
    }
  };

  const LimpaTela = () => {
    setLoadingLogin(false);
    setErroLogin("");
    setEmail("");
    setSenha("");
    setErroEnvio("");

    setErroCadastro("");
    setLoadingCadastro(false);
    setNome("");
    setSobrenome("");
    setRepeteSenha("");

    setSucessoEnvio("");
    setLoadingReenvio(false);
  };

  const handleLogin = async () => {
    setLoadingLogin(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": i18n.language,
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErroLogin(data.message || "Erro ao logar");

        setLoadingLogin(false);

        setTimeout(() => {
          setErroLogin("");
          setLoadingLogin(false);
        }, 3000);
        return;
      }

      setTimeout(() => {
        LimpaTela();
        router.replace(data.redirectTo || redirectTo);
      }, 1000);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao fazer login."
      );
      setLoadingLogin(false);
    }
  };

  const handleCadastro = async () => {
    if (senha !== repeteSenha) {
      setErroCadastro(t("cadastro.erro_repete_senha"));
      setTimeout(() => {
        setErroCadastro("");
        setLoadingCadastro(false);
      }, 3000);
      return;
    }

    if (!isValidPassword(senha)) {
      setErroCadastro(t("cadastro.senha_invalida"));
      setTimeout(() => {
        setErroCadastro("");
        setLoadingCadastro(false);
      }, 8000);
      return;
    }

    setLoadingCadastro(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": i18n.language,
        },
        body: JSON.stringify({
          primeiro_nome: nome,
          ultimo_nome: sobrenome,
          email,
          senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let mensagemErro = "Erro ao cadastrar";

        if (Array.isArray(data.message)) {
          // Tentamos extrair as mensagens de erro dos "constraints"
          mensagemErro = data.message
            .map((err: ConstraintError) => {
              const constraints = err.constraints;
              return constraints ? Object.values(constraints).join(", ") : null;
            })
            .filter(Boolean)
            .join(" - ");
        } else if (typeof data.message === "string") {
          mensagemErro = data.message;
        }

        setErroCadastro(mensagemErro);
        setTimeout(() => {
          setErroCadastro("");
          setLoadingCadastro(false);
        }, 3000);
        return;
      }

      setLoadingCadastro(false);
      setSucessoCadastro(t("cadastro.sucesso"));

      setTimeout(() => {
        LimpaTela();
      }, 1000);

      setTimeout(() => {
        setSucessoCadastro("");
      }, 6000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
      } else {
        console.log("Erro desconhecido ao fazer cadastro.");
      }
      setLoadingCadastro(false);
    }
  };

  const handleEsqueciSenha = async () => {
    setLoadingReenvio(true);

    try {
      const res = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": i18n.language,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErroEnvio(data.message || "Erro ao enviar");
        setTimeout(() => {
          setErroEnvio("");
          setLoadingReenvio(false);
        }, 3000);
        throw new Error(data.message || "Erro ao enviar");
      }

      setSucessoEnvio(t("esqueceu.sucesso"));
      setTimeout(() => {
        LimpaTela();
      }, 6000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro desconhecido ao solicitar redefinição de senha.");
      }
      setLoadingReenvio(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="flex flex-col sm:flex-row w-full max-w-[800px] h-auto sm:h-[550px] bg-[#E6FEF6] shadow-[0px_20px_40px_0px_rgba(2,227,149,0.25)] rounded-lg overflow-hidden">
        {/* Lado esquerdo - Formulário */}
        <div className="w-full sm:w-1/2 h-auto sm:h-full flex flex-col justify-center items-center px-3 py-10 gap-2">
          {/* Logo */}
          <div>
            <Link href="/">
              <Image
                src="/assets/logofull_whizzat.png"
                alt="Logo grande"
                width={180}
                height={40}
                
              />
            </Link>
          </div>

          {/* Logo pequeno (mobile) */}
          
          {displayTelasqueceuSenha ? (
            <>
              {/* Título e link */}
              <div className="flex items-center justify-between w-full font-semibold mt-2">
                <button
                  type="button"
                  onClick={() => SetaStatusTela("login")}
                  className="hover:underline text-[#808080] text-[12px] md:text-[16px] cursor-pointer"
                >
                  {t("login.mnu_entrar")}
                </button>

                <button
                  type="button"
                  onClick={() => SetaStatusTela("cadastro")}
                  className="hover:underline text-[#808080] text-[12px] md:text-[16px] cursor-pointer"
                >
                  {t("login.mnu_criar")}
                </button>
              </div>

              {/* Reenvio de senha */}

              <form
                className="flex flex-col gap-2 w-full max-w-[340px] mt-5"
                onSubmit={(e) => {
                  e.preventDefault();

                  if (isFormEsqueceuSenhaFilled) handleEsqueciSenha();
                }}
              >
                <label className="text-[#010608] text-[14px] mb-1">
                  {t("login.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.placehold_email")}
                  className="border border-[#7DCBED] rounded-[8px] px-3 py-1 focus:outline-none bg-white"
                />
                {erroEnvio ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mt-2 text-sm flex items-center gap-2">
                    <ExclamationCircleIcon className="w-6 h-6 text-red-700" />
                    {erroEnvio}
                  </div>
                ) : sucessoEnvio ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative mt-2 text-sm flex items-center gap-2">
                    <CheckCircleIcon className="w-6 h-6 text-green-700" />
                    {sucessoEnvio}
                  </div>
                ) : (
                  <button
                    type="submit"
                    className={`py-2 mt-3 rounded-[8px] font-medium transition ${
                      isFormEsqueceuSenhaFilled
                        ? "bg-[#A9DCF3] text-black hover:bg-[#A9DCF4] cursor-pointer"
                        : "bg-[#F0F0F0] text-[#BBB] cursor-not-allowed"
                    }`}
                    disabled={!isFormEsqueceuSenhaFilled}
                  >
                    {loadingReenvio ? (
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
                        <span>{t("login.carregando")}</span>
                      </div>
                    ) : (
                      t("esqueceu.btn_reenviar")
                    )}
                  </button>
                )}
              </form>
            </>
          ) : (
            <>
              {/* Formulário Login */}
              {displayTelaLogin ? (
                <>
                  {/* Título e link */}
                  <div className="flex items-center justify-between w-full font-semibold mt-2">
                    <span className="text-[16px] md:text-[24px] text-[#010608]">
                      {t("login.mnu_entrar")}
                    </span>
                    <button
                      type="button"
                      onClick={() => SetaStatusTela("cadastro")}
                      className="hover:underline text-[#808080] text-[12px] md:text-[16px] cursor-pointer"
                    >
                      {t("login.mnu_criar")}
                    </button>
                  </div>
                  <form
                    className="flex flex-col gap-2 w-full max-w-[340px] mt-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (isLoginValid) handleLogin();
                    }}
                  >
                    <label className="text-[#010608] text-[14px] mb-1">
                      {t("login.email")}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("login.placehold_email")}
                      className="border border-[#7DCBED] rounded-[8px] px-3 py-1 focus:outline-none bg-white"
                    />

                    <label className="text-[#010608] text-[14px] mb-1">
                      {t("login.senha")}
                    </label>
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder={t("login.placehold_senha")}
                      className="border border-[#7DCBED] rounded-[8px] px-3 py-1 focus:outline-none bg-white"
                    />
                    {erroLogin ? (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mt-2 text-sm flex items-center gap-2">
                        <ExclamationCircleIcon className="w-6 h-6 text-red-700" />
                        {erroLogin}
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className={`py-2 mt-3 rounded-[8px] font-medium transition ${
                          isFormFilled && !loadingLogin
                            ? "bg-[#A9DCF3] text-black hover:bg-[#A9DCF4] cursor-pointer"
                            : "bg-[#F0F0F0] text-[#BBB] cursor-not-allowed"
                        }`}
                        disabled={!isFormFilled || loadingLogin}
                      >
                        {loadingLogin ? (
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
                            <span>{t("login.carregando")}</span>
                          </div>
                        ) : (
                          t("login.btn_entrar")
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => SetaStatusTela("esqueci")}
                      className="text-[#808080] hover:underline bg-transparent border-none p-0 m-0 cursor-pointer text-[14px] mt-3"
                    >
                      {t("login.link_esqueceu_senha")}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Formulario Cadastro */}
                  <div className="flex items-center justify-between w-full font-semibold mt-2">
                    <button
                      type="button"
                      onClick={() => SetaStatusTela("login")}
                      className="hover:underline text-[#808080] text-[12px] md:text-[16px] cursor-pointer"
                    >
                      {t("login.mnu_entrar")}
                    </button>
                    <span className="text-[16px] md:text-[24px] text-[#010608]">
                      {t("login.mnu_criar")}
                    </span>
                  </div>
                  <form
                    className="flex flex-col gap-2 w-full max-w-[340px]"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (isCadastroValid) handleCadastro();
                    }}
                  >
                    {/* Nome e Sobrenome */}
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="text-[#010608] text-[14px] mb-1 block">
                          {t("cadastro.nome")}
                        </label>
                        <input
                          type="text"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          placeholder={t("cadastro.placehold_nome")}
                          className="border border-[#7DCBED] rounded-[8px] px-3 py-1 w-full bg-white focus:outline-none"
                        />
                      </div>

                      <div className="w-1/2">
                        <label className="text-[#010608] text-[14px] mb-1 block">
                          {t("cadastro.sobrenome")}
                        </label>
                        <input
                          type="text"
                          value={sobrenome}
                          onChange={(e) => setSobrenome(e.target.value)}
                          placeholder={t("cadastro.placehold_sobrenome")}
                          className="border border-[#7DCBED] rounded-[8px] px-3 py-1 w-full bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <label className="text-[#010608] text-[14px] mt-2">
                      {t("login.email")}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("login.placehold_email")}
                      className="border border-[#7DCBED] rounded-[8px] px-3 py-1 bg-white focus:outline-none"
                    />

                    <label className="text-[#010608] text-[14px] mt-2">
                      {t("login.senha")}
                    </label>
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder={t("cadastro.placehold_senha")}
                      className="border border-[#7DCBED] rounded-[8px] px-3 py-1 bg-white focus:outline-none"
                    />

                    <label className="text-[#010608] text-[14px] mt-2">
                      {t("cadastro.repete_senha")}
                    </label>
                    <input
                      type="password"
                      value={repeteSenha}
                      onChange={(e) => setRepeteSenha(e.target.value)}
                      placeholder={t("cadastro.placehold_repete_senha")}
                      className="border border-[#7DCBED] rounded-[8px] px-3 py-1 bg-white focus:outline-none"
                    />
                    {erroCadastro ? (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mt-2 text-sm flex items-center gap-2">
                        <ExclamationCircleIcon className="w-6 h-6 text-red-700" />
                        {erroCadastro}
                      </div>
                    ) : sucessoCadastro ? (
                      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative mt-2 text-sm flex items-center gap-2">
                        <CheckCircleIcon className="w-10 h-10 text-green-700" />
                        {sucessoCadastro}
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className={`py-2 mt-3 rounded-[8px] font-medium transition ${
                          isFormCreateFilled && !loadingCadastro
                            ? "bg-[#A9DCF3] text-black hover:bg-[#A9DCF4] cursor-pointer"
                            : "bg-[#F0F0F0] text-[#BBB] cursor-not-allowed"
                        }`}
                        disabled={!isFormCreateFilled || loadingCadastro}
                      >
                        {loadingCadastro ? (
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
                            <span>{t("login.carregando")}</span>
                          </div>
                        ) : (
                          t("cadastro.btn")
                        )}
                      </button>
                    )}
                  </form>
                </>
              )}
            </>
          )}
        </div>

        {displayTelaLogin ? (
          <>
            {/* Lado direito - Imagem */}
            <div className="hidden sm:block w-full sm:w-1/2 h-full">
              <Image
                src="/assets/imagem_login.png"
                alt="Imagem Login"
                width={400}
                height={550}
                className="h-full w-full object-cover"
              />
            </div>
          </>
        ) : (
          <>
            <div className="hidden sm:block w-full sm:w-1/2 h-full">
              <Image
                src="/assets/imagem_cadastro.png"
                alt="Imagem Login"
                width={400}
                height={550}
                className="h-full w-full object-cover"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginInner />
    </Suspense>
  );
}
