"use client";

import { Listbox } from "@headlessui/react";
import { useTranslation } from "react-i18next";
//import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const languages = [
  { code: "pt", name: "Português", flagCode: "br" },
  { code: "en", name: "English", flagCode: "us" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "pt";

  const [selected, setSelected] = useState(
    languages.find((lang) => lang.code === currentLang) || languages[0]
  );

  const handleChange = (lang: typeof selected) => {
    setSelected(lang);
    i18n.changeLanguage(lang.code);
  };

  return (
    <div className="relative w-[40px] sm:w-[80px] text-sm">
      <Listbox value={selected} onChange={handleChange}>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              as="div"
              className="w-full cursor-pointer rounded px-2 py-1 flex items-center justify-center sm:justify-between transition"
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <span className={`fi fi-${selected.flagCode} rounded-sm`} />
                <span className="hidden sm:inline uppercase">
                  {selected.code}
                </span>
              </div>
            </Listbox.Button>

            {open && (
              <Listbox.Options className="absolute mt-1 z-50 w-full rounded bg-white shadow-lg max-h-60 overflow-auto">
                {languages.map((lang) => (
                  <Listbox.Option key={lang.code} value={lang} as="div">
                    {({ active }) => (
                      <div
                        className={`cursor-pointer px-3 py-2 flex items-center gap-2 ${
                          active ? "bg-gray-100" : ""
                        }`}
                      >
                        <span className={`fi fi-${lang.flagCode} rounded-sm`} />
                        <span className="hidden sm:inline uppercase">
                          {lang.code}
                        </span>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
}
