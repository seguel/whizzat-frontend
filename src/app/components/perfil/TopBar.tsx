// components/perfil/TopBar.tsx
"use client";

import { Menu } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface TopBarProps {
  setIsDrawerOpen?: (open: boolean) => void;
  onStartLoading?: () => void;
}

// Mapa de cores por perfil (igual usamos no menu lateral)
const profileColorMap: Record<
  string,
  { bg: string; text: string; ring: string; avatar: string }
> = {
  candidato: {
    bg: "bg-green-100",
    text: "text-green-900",
    ring: "focus:ring-green-500",
    avatar: "bg-green-300",
  },
  recrutador: {
    bg: "bg-purple-100",
    text: "text-purple-900",
    ring: "focus:ring-purple-500",
    avatar: "bg-purple-300",
  },
  avaliador: {
    bg: "bg-blue-100",
    text: "text-blue-900",
    ring: "focus:ring-blue-500",
    avatar: "bg-blue-300",
  },
};

export default function TopBar({
  setIsDrawerOpen,
  onStartLoading,
}: TopBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProfile = searchParams.get("perfil") || "candidato";

  const colors = profileColorMap[currentProfile] || profileColorMap.candidato;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onStartLoading?.();
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
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm ${colors.bg} ${colors.text}`}
        >
          <span
            className={`rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold ${colors.avatar}`}
          >
            JP
          </span>

          <select
            value={currentProfile}
            onChange={handleChange}
            className={`bg-transparent text-sm px-2 py-1 rounded-md focus:outline-none focus:ring-2 ${colors.ring}`}
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
