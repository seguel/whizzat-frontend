// components/perfil/TopBar.tsx
"use client";

import { Menu } from "lucide-react";
//import { useProfile } from "./ProfileContext";
import { useSearchParams, useRouter } from "next/navigation";

interface TopBarProps {
  setIsDrawerOpen?: (open: boolean) => void;
  onStartLoading?: () => void;
}

export default function TopBar({
  setIsDrawerOpen,
  onStartLoading,
}: TopBarProps) {
  //const { profile } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProfile = searchParams.get("perfil") || "candidato";

  /* const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProfile = e.target.value;
    router.push(`?perfil=${newProfile}`);
  }; */

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onStartLoading?.(); // dispara o loading antes da navegação
    const newProfile = e.target.value;
    router.push(`?perfil=${newProfile}`);
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 bg-[#F5F6F6] shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsDrawerOpen?.(true)}
          className="md:hidden text-gray-600 hover:text-green-600"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
        <input
          type="text"
          placeholder="Pesquisar"
          className="hidden sm:block border rounded px-3 py-1 text-sm w-64"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-green-100 text-green-900 px-3 py-1.5 rounded-full shadow-sm">
          <span className="bg-green-300 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
            JP
          </span>

          <select
            value={currentProfile}
            onChange={handleChange}
            className="bg-transparent text-sm px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="candidato">Candidato(a)</option>
            <option value="recrutador">Recrutador(a)</option>
            <option value="avaliador">Avaliador(a)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
