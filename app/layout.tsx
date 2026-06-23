import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import BottomNav from "./components/BottomNav";

export const metadata: Metadata = {
  title: {
    default: "VivaRaiz",
    template: "%s | VivaRaiz",
  },
  description:
    "Organize sua casa, cozinha, horta, compras, lembretes e vida offline em um só lugar.",
  applicationName: "VivaRaiz",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "VivaRaiz",
    description:
      "Organize sua vida real fora da tela: casa, cozinha, horta, compras e lembretes.",
    siteName: "VivaRaiz",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary",
    title: "VivaRaiz",
    description:
      "Organize sua casa, cozinha, horta, compras, lembretes e vida offline.",
  },
  appleWebApp: {
    capable: true,
    title: "VivaRaiz",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F6F38",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}