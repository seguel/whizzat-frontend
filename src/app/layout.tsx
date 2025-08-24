import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./lib/i18n/i18nClient";
import { Toaster } from "react-hot-toast";

/* const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
}); */

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "400", "600", "700"], // escolha os pesos que vai usar
  variable: "--font-manrope", // cria uma CSS variable
});

export const metadata: Metadata = {
  title: "Whizzat - Conectando oportunidades a pessoas",
  description: "Whizzat - Conectando oportunidades a pessoas",
  icons: {
    icon: "/favicon_whizzat.svg", // ícone padrão
    shortcut: "/favicon_whizzat.svg", // fallback
    apple: "/favicon_whizzat.svg", // iOS
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={manrope.variable}>
      <body className="font-manrope">
        <Toaster
          position="top-center"
          toastOptions={{
            success: {
              style: {
                background: "#22c55e", // verde
                color: "#fff",
                padding: "12px 24px", // espaçamento confortável
                width: "auto", // largura automática conforme conteúdo
                maxWidth: "90vw", // máximo 90% da viewport para não estourar
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#16a34a",
              },
            },
            error: {
              style: {
                background: "#ef4444",
                color: "#fff",
                padding: "12px 24px",
                width: "auto",
                maxWidth: "90vw",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              },
            },
          }}
        />

        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
