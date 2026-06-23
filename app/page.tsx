"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const features = [
  {
    emoji: "🏡",
    title: "Organize sua casa",
    description:
      "Cadastre objetos, documentos, remédios, alimentos e tudo que você não quer perder.",
  },
  {
    emoji: "🍲",
    title: "Evite desperdício",
    description:
      "Veja quais alimentos vencem primeiro e use melhor o que já existe na sua cozinha.",
  },
  {
    emoji: "🌱",
    title: "Cuide da sua horta",
    description:
      "Registre suas plantas e acompanhe quando precisa regar novamente.",
  },
  {
    emoji: "🛒",
    title: "Lista de compras",
    description:
      "Anote o que acabou, marque o que já comprou e mantenha sua rotina organizada.",
  },
  {
    emoji: "🔔",
    title: "Lembretes úteis",
    description:
      "Receba atenção para datas importantes, manutenções e coisas que não podem ser esquecidas.",
  },
  {
    emoji: "🌤️",
    title: "Vida offline",
    description:
      "Missões simples para sair da tela, cuidar da vida real e viver com mais calma.",
  },
];

export default function HomePage() {
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
    <main className="min-h-screen bg-[#F7F3EA] px-4 py-5 text-[#2F3A2F] md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="text-xl font-black md:text-2xl">
            🌱 VivaRaiz
          </a>

          <div className="flex items-center gap-2">
            {!checkingUser && loggedIn ? (
              <a
                href="/dashboard"
                className="rounded-full bg-[#4F6F38] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3F5C2B]"
              >
                Abrir app
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="rounded-full px-4 py-3 text-sm font-black text-[#4F6F38]"
                >
                  Entrar
                </a>

                <a
                  href="/cadastro"
                  className="rounded-full bg-[#4F6F38] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3F5C2B]"
                >
                  Começar
                </a>
              </>
            )}
          </div>
        </header>

        <section className="mt-10 grid items-center gap-6 md:mt-16 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.5rem] bg-[#4F6F38] p-7 text-white shadow-sm md:p-10">
            <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
              VivaRaiz 1.0
            </p>

            <p className="mt-8 text-7xl">🌱</p>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              Organize sua vida real fora da tela.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              O VivaRaiz ajuda você a cuidar da casa, cozinha, horta, lembretes,
              compras e pequenos hábitos do dia a dia em um só lugar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!checkingUser && loggedIn ? (
                <a
                  href="/dashboard"
                  className="rounded-full bg-white px-7 py-4 text-center font-black text-[#4F6F38] transition hover:bg-[#EFE8DA]"
                >
                  Abrir meu VivaRaiz
                </a>
              ) : (
                <>
                  <a
                    href="/cadastro"
                    className="rounded-full bg-white px-7 py-4 text-center font-black text-[#4F6F38] transition hover:bg-[#EFE8DA]"
                  >
                    Criar conta grátis
                  </a>

                  <a
                    href="/login"
                    className="rounded-full border border-white/50 px-7 py-4 text-center font-black text-white transition hover:bg-white/10"
                  >
                    Já tenho conta
                  </a>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-white/80">
              <a href="/privacidade" className="underline underline-offset-4">
                Privacidade
              </a>

              <span>•</span>

              <a href="/termos" className="underline underline-offset-4">
                Termos de Uso
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-4xl">📱</p>

              <h2 className="mt-4 text-2xl font-black">Feito para celular</h2>

              <p className="mt-2 text-[#6B715F]">
                Use pelo navegador e instale na tela inicial como um aplicativo.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-4xl">🔐</p>

              <h2 className="mt-4 text-2xl font-black">
                Seus dados na sua conta
              </h2>

              <p className="mt-2 text-[#6B715F]">
                Cada usuário acessa apenas os próprios itens, plantas, compras e
                lembretes.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-4xl">🌤️</p>

              <h2 className="mt-4 text-2xl font-black">
                Menos bagunça, mais vida real
              </h2>

              <p className="mt-2 text-[#6B715F]">
                A proposta é simples: lembrar do que importa e viver melhor fora
                da tela.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-[#7A8F5A]">
              O que o VivaRaiz faz
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Tudo que você precisa para organizar o básico da rotina.
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="card-touch rounded-[1.8rem] bg-[#F7F3EA] p-5"
              >
                <p className="text-4xl">{feature.emoji}</p>

                <h3 className="mt-4 text-xl font-black">{feature.title}</h3>

                <p className="mt-2 text-sm leading-relaxed text-[#6B715F]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">1️⃣</p>

            <h2 className="mt-4 text-2xl font-black">Crie sua conta</h2>

            <p className="mt-2 text-[#6B715F]">
              Entre com e-mail e senha para salvar seus dados com segurança.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">2️⃣</p>

            <h2 className="mt-4 text-2xl font-black">Cadastre aos poucos</h2>

            <p className="mt-2 text-[#6B715F]">
              Comece por comida, documentos, remédios e coisas fáceis de
              esquecer.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">3️⃣</p>

            <h2 className="mt-4 text-2xl font-black">Use no dia a dia</h2>

            <p className="mt-2 text-[#6B715F]">
              Veja o painel, siga os lembretes e use melhor o que você já tem.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[2.5rem] bg-[#2F3A2F] p-7 text-white shadow-sm md:p-10">
          <p className="text-5xl">🌱</p>

          <h2 className="mt-5 text-3xl font-black md:text-5xl">
            Comece simples. Organize melhor.
          </h2>

          <p className="mt-3 max-w-2xl text-white/75">
            O VivaRaiz não é para complicar sua rotina. É para lembrar do que
            importa, evitar desperdício e cuidar melhor da vida real.
          </p>

          <div className="mt-7">
            {!checkingUser && loggedIn ? (
              <a
                href="/dashboard"
                className="inline-block rounded-full bg-white px-7 py-4 text-center font-black text-[#2F3A2F]"
              >
                Ir para o painel
              </a>
            ) : (
              <a
                href="/cadastro"
                className="inline-block rounded-full bg-white px-7 py-4 text-center font-black text-[#2F3A2F]"
              >
                Criar minha conta
              </a>
            )}
          </div>
        </section>

        <footer className="py-8 text-center text-sm text-[#6B715F]">
          <p>VivaRaiz 1.0 — feito para organizar a vida real 🌱</p>

          <div className="mt-4 flex justify-center gap-4 font-bold">
            <a href="/sobre" className="text-[#4F6F38]">
              Sobre
            </a>

            <a href="/privacidade" className="text-[#4F6F38]">
              Privacidade
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