import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./lib/i18n/i18nClient";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={manrope.variable}>
      <body className="font-manrope">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
