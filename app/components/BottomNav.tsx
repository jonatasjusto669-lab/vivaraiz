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
  "/configuracoes",
  "/onde-guardei",
  "/lembretes",
  "/vida-offline",
  "/backup",
];

export default function BottomNav() {
  const pathname = usePathname();

  const hiddenRoutes = ["/", "/login", "/cadastro"];

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-24px)] max-w-xl -translate-x-1/2 rounded-full border border-[#DDD2BC] bg-white/95 px-2 py-2 shadow-xl backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/mais" && moreRoutes.includes(pathname));

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-full px-2 py-2 text-xs font-black transition ${
                active
                  ? "bg-[#4F6F38] text-white"
                  : "text-[#6B715F] hover:bg-[#F7F3EA]"
              }`}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="mt-1">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}