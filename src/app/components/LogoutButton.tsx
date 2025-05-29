"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
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
      } else {
        console.error("Erro ao fazer logout");
      }
    } catch (err) {
      console.error("Erro ao se comunicar com o backend", err);
    }
  };

  return (
    <button
      onClick={logout}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
    >
      Sair
    </button>
  );
}
