"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const testSteps = [
  {
    emoji: "1️⃣",
    title: "Crie uma conta grátis",
    description:
      "Use um e-mail e senha para entrar no VivaRaiz e salvar seus dados.",
  },
  {
    emoji: "2️⃣",
    title: "Cadastre algumas coisas",
    description:
      "Adicione alimentos, objetos, documentos, plantas ou compras para testar o app.",
  },
  {
    emoji: "3️⃣",
    title: "Use no celular",
    description:
      "Abra pelo navegador e, se quiser, adicione o VivaRaiz à tela inicial.",
  },
  {
    emoji: "4️⃣",
    title: "Envie feedback",
    description:
      "Depois de testar, mande uma sugestão, erro encontrado, elogio ou ideia.",
  },
];

const features = [
  {
    emoji: "🏡",
    title: "Minha Casa",
    description: "Organize itens, objetos, documentos, remédios e alimentos.",
  },
  {
    emoji: "🍲",
    title: "Minha Cozinha",
    description: "Veja alimentos vencendo e receitas possíveis com o que tem.",
  },
  {
    emoji: "🌱",
    title: "Minha Horta",
    description: "Cadastre plantas e acompanhe quando precisa regar.",
  },
  {
    emoji: "🛒",
    title: "Lista de Compras",
    description: "Anote o que falta comprar e marque o que já comprou.",
  },
  {
    emoji: "🔔",
    title: "Lembretes",
    description: "Veja coisas importantes que precisam da sua atenção.",
  },
  {
    emoji: "💬",
    title: "Feedback",
    description: "Ajude o VivaRaiz a melhorar com sugestões e comentários.",
  },
];

export default function TestarPage() {
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
                  Testar
                </a>
              </>
            )}
          </div>
        </header>

        <section className="mt-10 grid items-center gap-6 md:mt-16 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.5rem] bg-[#4F6F38] p-7 text-white shadow-sm md:p-10">
            <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
              Teste aberto — VivaRaiz 1.0
            </p>

            <p className="mt-8 text-7xl">🌱</p>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              Teste o VivaRaiz e ajude a melhorar.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              O VivaRaiz é um app para organizar a vida real: casa, cozinha,
              horta, compras, lembretes e hábitos fora da tela.
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
                    Criar conta e testar
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

              <h2 className="mt-4 text-2xl font-black">Teste pelo celular</h2>

              <p className="mt-2 text-[#6B715F]">
                O VivaRaiz foi pensado para funcionar bem no celular, como um app
                instalado na tela inicial.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-4xl">🧪</p>

              <h2 className="mt-4 text-2xl font-black">Versão inicial</h2>

              <p className="mt-2 text-[#6B715F]">
                Esta é a versão 1.0. Algumas coisas ainda podem melhorar com o
                feedback dos primeiros usuários.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-4xl">💬</p>

              <h2 className="mt-4 text-2xl font-black">Sua opinião importa</h2>

              <p className="mt-2 text-[#6B715F]">
                Depois de testar, envie feedback dentro do app para ajudar a
                melhorar o VivaRaiz.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-[#7A8F5A]">
              Como testar
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Faça um teste simples em poucos minutos.
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {testSteps.map((step) => (
              <article
                key={step.title}
                className="card-touch rounded-[1.8rem] bg-[#F7F3EA] p-5"
              >
                <p className="text-4xl">{step.emoji}</p>

                <h3 className="mt-4 text-xl font-black">{step.title}</h3>

                <p className="mt-2 text-sm leading-relaxed text-[#6B715F]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-[#7A8F5A]">
              O que testar
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Experimente as principais áreas do app.
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

        <section className="mt-8 rounded-[2.5rem] bg-[#2F3A2F] p-7 text-white shadow-sm md:p-10">
          <p className="text-5xl">💬</p>

          <h2 className="mt-5 text-3xl font-black md:text-5xl">
            Depois de testar, envie feedback.
          </h2>

          <p className="mt-3 max-w-2xl text-white/75">
            Conte o que gostou, o que ficou confuso, o que deu erro e o que
            poderia melhorar.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {!checkingUser && loggedIn ? (
              <a
                href="/feedback"
                className="rounded-full bg-white px-7 py-4 text-center font-black text-[#2F3A2F]"
              >
                Enviar feedback
              </a>
            ) : (
              <a
                href="/cadastro"
                className="rounded-full bg-white px-7 py-4 text-center font-black text-[#2F3A2F]"
              >
                Criar conta para testar
              </a>
            )}

            <a
              href="/sobre"
              className="rounded-full border border-white/40 px-7 py-4 text-center font-black text-white"
            >
              Conhecer o app
            </a>
          </div>
        </section>

        <footer className="py-8 text-center text-sm text-[#6B715F]">
          <p>VivaRaiz 1.0 — teste aberto 🌱</p>

          <div className="mt-4 flex justify-center gap-4 font-bold">
            <a href="/" className="text-[#4F6F38]">
              Início
            </a>

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