"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuBlocks, LuUsers, LuLogIn } from "react-icons/lu";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation("common");

  const [active, setActive] = useState("/");

  const menuItems = [
    {
      label: t("header_mnu_primeiro"),
      href: "/funciona",
      icon: <LuBlocks size={20} />,
    },
    {
      label: t("header_mnu_segundo"),
      href: "/sobre",
      icon: <LuUsers size={20} />,
    },
    {
      label: t("header_mnu_terceiro"),
      href: "/cadastro/login",
      icon: <LuLogIn size={20} />,
    },
  ];

  return (
    <header className="w-full flex items-center justify-between px-6 py-4">
      {/* Logo */}
      <div className="flex items-center">
        {/* Logo grande (desktop) */}
        <Image
          src="/assets/logofull.jpeg"
          alt="Logo grande"
          width={244}
          height={46}
          className="hidden sm:block"
        />
        {/* Logo pequeno (mobile) */}
        <Image
          src="/assets/logomobile.jpeg"
          alt="Logo pequeno"
          width={120}
          height={24}
          className="block sm:hidden"
        />
      </div>

      {/* Menu */}

      <nav className="flex gap-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setActive(item.href)}
            style={{ color: "var(--Primary-10, #010608)" }}
            className={`flex w-[140px] h-[36px] px-4 py-2 flex-col items-center justify-center text-sm leading-normal transition rounded-[20px]
              ${active === item.href ? "bg-[#A9DCF3] font-bold" : "text-black"}
              hidden sm:flex
            `}
          >
            {item.label}
          </Link>
        ))}

        {/* Ícones do menu (somente mobile) */}
        <div className="flex gap-2 sm:hidden">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActive(item.href)}
              className={`flex items-center justify-center w-10 h-10 text-xl rounded-full transition
                ${active === item.href ? "bg-[#A9DCF3]" : "bg-gray-100"}
              `}
            >
              {item.icon}
            </Link>
          ))}
        </div>

        <LanguageSwitcher />
      </nav>
    </header>
  );
}
