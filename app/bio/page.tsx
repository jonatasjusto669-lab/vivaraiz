"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const links = [
  {
    href: "/testar",
    emoji: "🌱",
    title: "Testar o VivaRaiz",
    description: "Conheça a versão 1.0 e teste gratuitamente.",
    primary: true,
  },
  {
  href: "/faq",
  emoji: "❓",
  title: "Perguntas frequentes",
  description: "Tire dúvidas antes de testar o app.",
  primary: false,
  },
  {
    href: "/cadastro",
    emoji: "✅",
    title: "Criar conta grátis",
    description: "Comece a organizar sua vida real.",
    primary: false,
  },
  {
    href: "/login",
    emoji: "🔐",
    title: "Entrar na conta",
    description: "Acesse seu painel do VivaRaiz.",
    primary: false,
  },
  {
    href: "/como-usar",
    emoji: "📘",
    title: "Como usar",
    description: "Veja o passo a passo para aproveitar melhor.",
    primary: false,
  },
  {
    href: "/sobre",
    emoji: "🏡",
    title: "Sobre o VivaRaiz",
    description: "Entenda a ideia e o propósito do app.",
    primary: false,
  },
  {
    href: "/privacidade",
    emoji: "🔐",
    title: "Privacidade",
    description: "Veja como seus dados são tratados.",
    primary: false,
  },
];

export default function BioPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      setLoggedIn(!!data.session);
      setCheckingUser(false);
    }

    checkSession();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-4 py-6 text-[#2F3A2F]">
      <div className="mx-auto max-w-xl">
        <section className="rounded-[2.5rem] bg-[#4F6F38] p-7 text-center text-white shadow-sm">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-[#F7F3EA] text-6xl">
            🌱
          </div>

          <h1 className="mt-5 text-4xl font-black leading-tight">
            VivaRaiz
          </h1>

          <p className="mt-3 text-white/85">
            Organize sua vida real fora da tela.
          </p>

          <div className="mt-5 rounded-[1.5rem] bg-white/10 p-4 text-sm font-bold text-white/85">
            🏡 Casa • 🍲 Cozinha • 🌱 Horta • 🛒 Compras • 🔔 Lembretes
          </div>

          {!checkingUser && loggedIn && (
            <a
              href="/dashboard"
              className="mt-5 block rounded-full bg-white px-6 py-4 font-black text-[#4F6F38]"
            >
              Abrir meu VivaRaiz
            </a>
          )}
        </section>

        <section className="mt-5 grid gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`card-touch rounded-[2rem] p-5 shadow-sm ${
                link.primary
                  ? "bg-[#2F3A2F] text-white"
                  : "bg-white text-[#2F3A2F]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${
                    link.primary ? "bg-white/10" : "bg-[#F7F3EA]"
                  }`}
                >
                  {link.emoji}
                </div>

                <div>
                  <h2 className="text-xl font-black">{link.title}</h2>

                  <p
                    className={`mt-1 text-sm ${
                      link.primary ? "text-white/75" : "text-[#6B715F]"
                    }`}
                  >
                    {link.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </section>

        <section className="mt-5 rounded-[2rem] bg-white p-5 text-center shadow-sm">
          <p className="text-3xl">💬</p>

          <h2 className="mt-3 text-2xl font-black">Testou?</h2>

          <p className="mt-2 text-sm text-[#6B715F]">
            Entre no app e envie sua opinião em Mais &gt; Feedback.
          </p>
        </section>

        <footer className="py-6 text-center text-sm text-[#6B715F]">
          <p>VivaRaiz 1.0 — teste aberto 🌱</p>

          <div className="mt-3 flex justify-center gap-4 font-bold">
            <a href="/" className="text-[#4F6F38]">
              Início
            </a>

            <a href="/termos" className="text-[#4F6F38]">
              Termos
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}