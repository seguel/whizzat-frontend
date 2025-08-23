"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProfileType } from "./ProfileContext";
import { getNavItems } from "../../util/sidebarNav";
import { usePathname } from "next/navigation";

interface SidebarProps {
  profile: ProfileType;
  isDrawerOpen?: boolean;
  setIsDrawerOpen?: (open: boolean) => void;
}

export default function Sidebar({
  profile,
  isDrawerOpen = false,
  setIsDrawerOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(profile);

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768 && setIsDrawerOpen) {
        setIsDrawerOpen(false); // Fecha o drawer no desktop
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsDrawerOpen]);

  const actualCollapsed = isMobile ? false : collapsed;

  const profileColorMap: Record<ProfileType, string> = {
    candidato: "bg-green-100", // ativo
    recrutador: "bg-purple-100", // ativo
    avaliador: "bg-blue-100", // ativo
  };

  const navContent = (
    <nav className="flex flex-col gap-2 px-2 flex-1">
      {navItems.map((item, idx) => {
        const itemPath = item.route ? item.route.split("?")[0] : "#";
        const isActive = pathname === itemPath;

        return (
          <Link href={item.route ?? "#"} key={idx}>
            <div
              className={`relative flex items-center p-2 rounded cursor-pointer transition-all
              ${actualCollapsed ? "justify-center" : "gap-3"}
              ${
                isActive
                  ? profileColorMap[profile] // cor de fundo do perfil
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="relative">
                {item.icon}
                {actualCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              {!actualCollapsed && (
                <span
                  className={`text-sm flex-1 ${
                    isActive ? "font-semibold text-gray-900" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </span>
              )}
              {!actualCollapsed && item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2">
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Sidebar padrão no desktop */}
      <div
        className="hidden md:flex flex-col bg-white h-full transition-all"
        style={{ width: actualCollapsed ? 84 : 200 }}
      >
        <div className="flex items-center justify-between p-4">
          <span className="text-2xl font-bold text-green-600">WC</span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-green-600 transition-transform duration-200 cursor-pointer"
            aria-label="Recolher menu"
            title={actualCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {actualCollapsed ? (
              <ChevronRight
                size={20}
                className="transition-transform duration-200 hover:scale-110"
              />
            ) : (
              <ChevronLeft
                size={20}
                className="transition-transform duration-200 hover:scale-110"
              />
            )}
          </button>
        </div>
        {navContent}
      </div>

      {/* Drawer no mobile */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen?.(false)}
          />
          {/* Menu lateral */}
          <div
            className="relative z-50 bg-white h-full shadow-lg flex flex-col"
            style={{ width: "14rem" }}
          >
            <div className="flex items-center justify-between p-4">
              <span className="text-2xl font-bold text-green-600">WC</span>
              <button
                onClick={() => setIsDrawerOpen?.(false)}
                aria-label="Fechar menu"
                className="text-gray-600 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 rounded"
              >
                <X size={24} />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
