//import Image from "next/image";
import Header from "../components/header/header";
import Link from "next/link";
import { Check } from "lucide-react";

interface PlanCardProps {
  title: string;
  domainText: string;
  oldPrice: string;
  price: string;
  monthLabel: string;
  total: string;
  discount: string;
  features: string[];
  buttonColor: "blue" | "yellow";
  highlight?: boolean;
}

function PlanCard(props: PlanCardProps) {
  const buttonClass =
    props.buttonColor === "blue"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-yellow-400 hover:bg-yellow-300 text-gray-900";

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg p-6 border transition-all 
      ${
        props.highlight
          ? "border-yellow-400 shadow-2xl scale-[1.03]"
          : "border-gray-200"
      }`}
    >
      {props.highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md">
          Recomendado
        </div>
      )}

      {/* Título */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-800">
        {props.title}
      </h2>
      <p className="mt-1 text-xs sm:text-sm text-green-600 font-semibold">
        {props.domainText}
      </p>

      {/* Preço */}
      <p className="mt-3 line-through text-gray-400 text-xs sm:text-sm">
        {props.oldPrice}
      </p>

      <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">
        R$ {props.price}
        <span className="text-lg font-semibold">{props.monthLabel}</span>
      </p>

      <p className="text-xs sm:text-sm text-gray-500">{props.total}</p>
      <p className="text-green-600 text-xs sm:text-sm font-semibold mt-1">
        {props.discount}
      </p>

      {/* Botão */}
      <button
        className={`mt-4 w-full py-2 rounded-lg font-semibold text-sm sm:text-base ${buttonClass}`}
      >
        Comprar agora
      </button>

      {/* Lista de features */}
      <ul className="mt-6 space-y-2 text-xs sm:text-sm">
        {props.features.map((item, i) => (
          <li key={i} className="flex gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PlansPage() {
  return (
    <div>
      <Header />
      <main className="p-4">
        <div className="flex flex-col items-center justify-center w-full px-4 py-12">
          <div className="w-full max-w-[1200px] xl:max-w-[1400px] flex flex-col items-center text-center gap-6">
            <div className=" text-black text-center font-extralight leading-normal">
              <p className="text-[32px] md:text-[50px]">Nossos Planos</p>
            </div>
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* PLANO P */}
              <PlanCard
                title="Plano P"
                domainText="+ domínio grátis"
                oldPrice="R$ 142,44/ano"
                price="9,89"
                monthLabel="/mês"
                total="R$ 355,44 por 3 anos"
                discount="Economize R$ 1.143,22"
                buttonColor="blue"
                features={[
                  "Crie 1 site",
                  "100 GB de armazenamento NVMe",
                  "Servidores no Brasil",
                  "Até 30 mil visitas/mês",
                  "E-mails grátis (contas limitadas)",
                  "Migração grátis e ilimitada",
                  "Certificado SSL grátis",
                ]}
              />

              {/* PLANO M — RECOMENDADO */}
              <PlanCard
                highlight
                title="Plano M"
                domainText="+ domínio grátis"
                oldPrice="R$ 212,44/ano"
                price="11,79"
                monthLabel="/mês"
                total="R$ 424,44 por 3 anos"
                discount="Economize R$ 1.287,22"
                buttonColor="yellow"
                features={[
                  "Crie +60 sites",
                  "100 GB NVMe ultra potente",
                  "Servidores no Brasil",
                  "Até 100 mil visitas/mês",
                  "E-mails grátis (contas ilimitadas)",
                  "WooCommerce pré-instalado para lojas",
                  "Agente de IA para Marketing",
                  "Agente de IA que cria conteúdo",
                ]}
              />

              {/* PLANO TURBO */}
              <PlanCard
                title="Plano Turbo"
                domainText="+ 2 domínios grátis"
                oldPrice="R$ 322,44/ano"
                price="25,69"
                monthLabel="/mês"
                total="R$ 923,44 por 3 anos"
                discount="Economize R$ 1.543,78"
                buttonColor="blue"
                features={[
                  "Crie +150 sites",
                  "150 GB NVMe ultra potente",
                  "Até 400 mil visitas/mês",
                  "E-mails grátis (contas ilimitadas)",
                  "Carregamento instantâneo",
                  "Mais estabilidade em alto tráfego",
                  "Agente de IA que cria campanhas",
                  "Agente de IA que cria anúncios",
                ]}
              />
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {/* Ícone 1: Instagram */}
              <Link href="https://instagram.com" passHref>
                <div
                  className="relative group cursor-pointer"
                  title="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="27"
                    height="27"
                    viewBox="0 0 28 28"
                    fill="none"
                    className="hover:scale-110 transition-transform"
                  >
                    <rect
                      width="27"
                      height="27"
                      transform="translate(0.7 0.18)"
                      fill="white"
                    />
                    <path
                      d="M19.83 2.44H8.58C5.47 2.44 2.95 4.95 2.95 8.06v11.25c0 3.11 2.52 5.63 5.63 5.63h11.25c3.11 0 5.63-2.52 5.63-5.63V8.06c0-3.11-2.52-5.63-5.63-5.63Z"
                      stroke="black"
                      strokeOpacity="0.5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.7 12.98c.14.94-.02 1.9-.46 2.74-.43.84-1.12 1.52-1.96 1.94-.84.43-1.8.58-2.73.42-.94-.14-1.8-.59-2.47-1.26-.67-.67-1.12-1.53-1.27-2.47-.14-.94.02-1.89.46-2.73.44-.84 1.13-1.52 1.96-1.95.84-.43 1.79-.58 2.74-.42.95.14 1.83.59 2.51 1.26.67.67 1.12 1.52 1.26 2.47Z"
                      stroke="black"
                      strokeOpacity="0.5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20.39 7.5h.01"
                      stroke="black"
                      strokeOpacity="0.5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    Instagram
                  </span>
                </div>
              </Link>

              {/* Ícone 2: LinkedIn */}
              <Link href="https://linkedin.com" passHref>
                <div className="relative group cursor-pointer" title="LinkedIn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="27"
                    height="27"
                    viewBox="0 0 28 28"
                    fill="none"
                    className="hover:scale-110 transition-transform"
                  >
                    {/* SVG paths aqui */}
                    <rect
                      width="27"
                      height="27"
                      transform="translate(0.7 0.18)"
                      fill="white"
                    />
                    <path
                      d="M18.7 9.19c1.79 0 3.5.71 4.77 1.98 1.27 1.27 1.98 2.98 1.98 4.78v7.87h-4.5v-7.88c0-.6-.24-1.17-.66-1.6-.42-.42-1-.66-1.6-.66s-1.17.24-1.6.66-.66 1-.66 1.6v7.88h-4.5v-7.88c0-1.79.71-3.5 1.97-4.77 1.27-1.27 2.98-1.98 4.77-1.98ZM7.45 10.31H2.95v13.5h4.5V10.31ZM5.2 6.94a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                      stroke="black"
                      strokeOpacity="0.5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    LinkedIn
                  </span>
                </div>
              </Link>

              {/* Ícone 3: Facebook */}
              <Link href="https://facebook.com" passHref>
                <div className="relative group cursor-pointer" title="Facebook">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="26"
                    viewBox="0 0 19 26"
                    fill="none"
                    className="hover:scale-110 transition-transform"
                  >
                    <path
                      d="M17.7 1.08h-4.36c-1.93 0-3.78.61-5.14 1.7-1.36 1.09-2.13 2.56-2.13 4.1v3.48H1.7v4.64h4.36v9.28h5.82v-9.28h4.36l1.45-4.64h-5.81V6.89c0-.31.15-.6.43-.82.27-.22.64-.34 1.02-.34h4.36V1.08Z"
                      fill="white"
                      stroke="black"
                      strokeOpacity="0.5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    Facebook
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
