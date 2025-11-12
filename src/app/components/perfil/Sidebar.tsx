"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ProfileType } from "./ProfileContext";
import { useNavItems, NavItem } from "../../util/sidebarNav";
import Image from "next/image";

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
  const router = useRouter();
  const pathname = usePathname();
  const navItems = useNavItems(profile);

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768 && setIsDrawerOpen) {
        setIsDrawerOpen(false);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsDrawerOpen]);

  const actualCollapsed = isMobile ? false : collapsed;

  const profileColorMap: Record<ProfileType, string> = {
    candidato: "bg-green-100",
    recrutador: "bg-purple-100",
    avaliador: "bg-blue-100",
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      // fecha o drawer no mobile
      setIsDrawerOpen?.(false);

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        console.error("Erro ao fazer logout");
      }
    } catch (err) {
      console.error("Erro ao se comunicar com o backend", err);
    }
  };

  const renderItem = (item: NavItem, idx: number) => {
    // Itens de link: calculamos ativo
    if (item.route) {
      const itemPath = item.route.split("?")[0];
      const isActive = pathname === itemPath;

      return (
        <Link href={item.route} key={idx}>
          <div
            onClick={() => isMobile && setIsDrawerOpen?.(false)}
            className={`relative flex items-center p-2 rounded cursor-pointer transition-all
              ${actualCollapsed ? "justify-center" : "gap-3"}
              ${isActive ? profileColorMap[profile] : "hover:bg-gray-100"}`}
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
    }

    // Itens de ação (ex: logout)
    return (
      <button
        key={idx}
        type="button"
        onClick={() => {
          if (item.action === "logout") handleLogout();
        }}
        className={`w-full text-left relative flex items-center p-2 rounded transition-all cursor-pointer
          ${actualCollapsed ? "justify-center" : "gap-3"} hover:bg-gray-100`}
      >
        <div className="relative">{item.icon}</div>
        {!actualCollapsed && (
          <span className="text-sm flex-1">{item.label}</span>
        )}
      </button>
    );
  };

  const navContent = (
    <nav className="flex flex-col gap-2 px-2 flex-1">
      {navItems.map(renderItem)}
    </nav>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <div
        className="hidden md:flex flex-col bg-white h-full transition-all"
        style={{ width: actualCollapsed ? 84 : 200 }}
      >
        <div className="flex items-center justify-between p-4">
          {actualCollapsed ? (
            <Image
              src="/assets/whizzat_icone.png"
              alt="icone whizzat"
              width={30}
              height={30}
              className="block"
            />
          ) : (
            <Image
              src="/assets/logofull_whizzat.png"
              alt="logo whizzat"
              width={100}
              height={100}
              className="hidden sm:block"
            />
          )}
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

      {/* Drawer mobile */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen?.(false)}
          />
          <div
            className="relative z-50 bg-white h-full shadow-lg flex flex-col"
            style={{ width: "14rem" }}
          >
            <div className="flex items-center justify-between p-4">
              <Image
                src="/assets/logofull_whizzat.png"
                alt="icone whizzat"
                width={100}
                height={100}
              />
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
