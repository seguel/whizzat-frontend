"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    Cookies.remove("token");
    router.push("/");
  };

  return (
    <button
      onClick={logout}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
    >
      Sair
    </button>
  );
}
