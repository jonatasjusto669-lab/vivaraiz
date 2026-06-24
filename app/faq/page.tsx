"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const questions = [
  {
    emoji: "🌱",
    question: "O que é o VivaRaiz?",
    answer:
      "O VivaRaiz é um app simples para organizar coisas da vida real, como itens da casa, alimentos, plantas, compras, lembretes e pequenos hábitos da rotina.",
  },
  {
    emoji: "📱",
    question: "Preciso baixar na Play Store ou App Store?",
    answer:
      "Não. Nesta versão, o VivaRaiz funciona pelo navegador. Você pode abrir no celular e adicionar à tela inicial, como se fosse um aplicativo.",
  },
  {
    emoji: "💰",
    question: "O VivaRaiz é gratuito?",
    answer:
      "A versão 1.0 está em teste gratuito. A ideia agora é receber feedbacks, melhorar o app e entender o que as pessoas mais precisam.",
  },
  {
    emoji: "🔐",
    question: "Meus dados ficam separados dos outros usuários?",
    answer:
      "Sim. Cada conta acessa apenas os próprios itens, plantas, compras, lembretes, alimentos e feedbacks cadastrados.",
  },
  {
    emoji: "🍲",
    question: "Como funciona a Minha Cozinha?",
    answer:
      "Você cadastra alimentos na Minha Casa usando a categoria Comida. Depois, a Minha Cozinha mostra o que está vencendo e sugere receitas simples com o que você já tem.",
  },
  {
    emoji: "🛒",
    question: "Para que serve a Lista de Compras?",
    answer:
      "Ela serve para anotar o que falta comprar e marcar quando já comprou. A Minha Cozinha também pode mandar alimentos direto para a lista.",
  },
  {
    emoji: "🌱",
    question: "Como funciona a Minha Horta?",
    answer:
      "Você cadastra suas plantas e define de quantos em quantos dias quer lembrar de regar. Depois é só tocar em Reguei hoje quando cuidar dela.",
  },
  {
    emoji: "💬",
    question: "Como posso ajudar o VivaRaiz a melhorar?",
    answer:
      "Depois de testar, entre no app e vá em Mais > Feedback. Lá você pode enviar sugestão, erro encontrado, elogio ou ideia.",
  },
];

export default function FaqPage() {
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
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <a href="/" className="text-xl font-black md:text-2xl">
            🌱 VivaRaiz
          </a>

          <div className="flex items-center gap-2">
            {!checkingUser && loggedIn ? (
              <a
                href="/dashboard"
                className="rounded-full bg-[#4F6F38] px-5 py-3 text-sm font-black text-white"
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
                  className="rounded-full bg-[#4F6F38] px-5 py-3 text-sm font-black text-white"
                >
                  Começar
                </a>
              </>
            )}
          </div>
        </header>

        <section className="mt-10 rounded-[2.5rem] bg-[#4F6F38] p-7 text-white shadow-sm md:p-10">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            Perguntas Frequentes
          </p>

          <p className="mt-7 text-7xl">❓</p>

          <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Dúvidas sobre o VivaRaiz
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            Veja as respostas principais antes de testar o app.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {!checkingUser && loggedIn ? (
              <a
                href="/dashboard"
                className="rounded-full bg-white px-7 py-4 text-center font-black text-[#4F6F38]"
              >
                Abrir meu VivaRaiz
              </a>
            ) : (
              <a
                href="/cadastro"
                className="rounded-full bg-white px-7 py-4 text-center font-black text-[#4F6F38]"
              >
                Criar conta grátis
              </a>
            )}

            <a
              href="/testar"
              className="rounded-full border border-white/50 px-7 py-4 text-center font-black text-white"
            >
              Página de teste
            </a>
          </div>
        </section>

        <section className="mt-6 grid gap-4">
          {questions.map((item) => (
            <article
              key={item.question}
              className="card-touch rounded-[2rem] bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F3EA] text-3xl">
                  {item.emoji}
                </div>

                <div>
                  <h2 className="text-xl font-black md:text-2xl">
                    {item.question}
                  </h2>

                  <p className="mt-3 leading-relaxed text-[#6B715F]">
                    {item.answer}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[2.5rem] bg-[#2F3A2F] p-7 text-white shadow-sm md:p-10">
          <p className="text-5xl">🌱</p>

          <h2 className="mt-5 text-3xl font-black md:text-5xl">
            Pronto para testar?
          </h2>

          <p className="mt-3 max-w-2xl text-white/75">
            Crie sua conta, teste pelo celular e mande sua opinião pelo Feedback.
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
                Criar conta grátis
              </a>
            )}

            <a
              href="/bio"
              className="rounded-full border border-white/40 px-7 py-4 text-center font-black text-white"
            >
              Ver links principais
            </a>
          </div>
        </section>

        <footer className="py-8 text-center text-sm text-[#6B715F]">
          <p>VivaRaiz 1.0 — perguntas frequentes 🌱</p>

          <div className="mt-4 flex flex-wrap justify-center gap-4 font-bold">
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