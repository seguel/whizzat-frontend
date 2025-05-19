//import Image from "next/image";
import Header from "./components/header/header";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="p-4">
        <div className="flex flex-col items-center justify-center w-full px-4 py-6">
          <div className="w-full max-w-[792px] flex flex-col items-center text-center gap-6 ">
            <div className=" text-black text-center font-extralight leading-normal">
              <p className="text-[32px] md:text-[50px]">
                As melhores oportunidades
              </p>
              <p className="text-[24px] md:text-[35px]">
                para as melhores pessoas e empresas
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-6 mt-10 w-full">
              {/* Empresa */}
              <div className="flex flex-col items-center rounded-lg p-4 flex-1 text-center">
                <p className="text-lg mb-2 text-[#18678A]">Empresa</p>
                <p className="text-sm text-[#636363]">
                  Os melhores especialistas e os profissionais certos para sua
                  empresa.
                </p>
              </div>

              {/* Candidato */}
              <div className="flex flex-col items-center rounded-lg p-4 flex-1 text-center">
                <p className="text-lg mb-2 text-[#18678A]">Candidato</p>
                <p className="text-sm text-[#636363]">
                  Acesso às oportunidades que combinam com seu perfil.
                </p>
              </div>

              {/* Especialista */}
              <div className="flex flex-col items-center rounded-lg p-4 flex-1 text-center">
                <p className="text-lg mb-2 text-[#18678A]">Especialista</p>
                <p className="text-sm text-[#636363]">
                  Visibilidade como profissional para empresas em crescimento.
                </p>
              </div>
            </div>
            <Link
              href="/cadastro/login"
              className="flex w-[140px] h-[36px] px-4 py-2 flex-col items-center justify-center text-sm leading-normal transition rounded-[20px] bg-[#A9DCF3] font-bold"
            >
              Comece Agora
            </Link>
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {/* Ícone 1: Instagram */}
              <Link href="https://instagram.com" passHref target="_blank">
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
              <Link href="https://linkedin.com" passHref target="_blank">
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
              <Link href="https://facebook.com" passHref target="_blank">
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
