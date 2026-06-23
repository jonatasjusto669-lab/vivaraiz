"use client";

import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Painel",
    emoji: "🏡",
  },
  {
    href: "/minha-casa",
    label: "Casa",
    emoji: "📦",
  },
  {
    href: "/minha-cozinha",
    label: "Cozinha",
    emoji: "🍲",
  },
  {
    href: "/minha-horta",
    label: "Horta",
    emoji: "🌱",
  },
  {
    href: "/mais",
    label: "Mais",
    emoji: "☰",
  },
];

const moreRoutes = [
  "/mais",
  "/como-usar",
  "/sobre",
  "/privacidade",
  "/termos",
  "/feedback",
  "/configuracoes",
  "/onde-guardei",
  "/lembretes",
  "/vida-offline",
  "/backup",
  "/lista-compras",
];

export default function BottomNav() {
  const pathname = usePathname();

  const hiddenRoutes = [
    "/",
    "/login",
    "/cadastro",
    "/esqueci-senha",
    "/redefinir-senha",
  ];

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[#DDD2BC] bg-white/95 p-2 shadow-2xl backdrop-blur">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/mais" && moreRoutes.includes(pathname));

            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex min-h-[64px] flex-col items-center justify-center rounded-[1.4rem] px-2 py-2 text-[11px] font-black transition ${
                  active
                    ? "bg-[#4F6F38] text-white shadow-md"
                    : "text-[#6B715F] active:bg-[#F7F3EA] hover:bg-[#F7F3EA]"
                }`}
              >
                <span className="text-[22px] leading-none">{item.emoji}</span>
                <span className="mt-1 leading-none">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}