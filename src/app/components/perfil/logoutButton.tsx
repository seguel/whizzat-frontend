"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include", // ✅ envia o cookie
        }
      );

      if (res.ok) {
        router.push("/"); // redireciona para login ou home
        router.refresh();
      } else {
        console.error("Erro ao fazer logout");
      }
    } catch (err) {
      console.error("Erro ao se comunicar com o backend", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 p-2 hover:opacity-80 cursor-pointer"
      title="Sair"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="33"
        height="32"
        viewBox="0 0 33 32"
        fill="none"
      >
        <g clipPath="url(#clip0_1029_27508)">
          <path
            d="M24.7012 20V16H14.7012V12H24.7012V8L30.7012 14L24.7012 20ZM22.7012 18V26H12.7012V32L0.701172 26V0H22.7012V10H20.7012V2H4.70117L12.7012 6V24H20.7012V18H22.7012Z"
            fill="black"
          />
        </g>
        <defs>
          <clipPath id="clip0_1029_27508">
            <rect
              width="32"
              height="32"
              fill="white"
              transform="translate(0.701172)"
            />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}
