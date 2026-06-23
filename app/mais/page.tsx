"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const moreItems = [
  {
    href: "/como-usar",
    emoji: "📘",
    title: "Como usar",
    description: "Aprenda o passo a passo para aproveitar melhor o VivaRaiz.",
  },
  {
    href: "/configuracoes",
    emoji: "⚙️",
    title: "Configurações",
    description: "Veja sua conta, altere seu nome e informações do app.",
  },
  {
    href: "/onde-guardei",
    emoji: "🔎",
    title: "Onde Guardei?",
    description: "Encontre rápido objetos, documentos, remédios e alimentos.",
  },
  {
    href: "/lembretes",
    emoji: "🔔",
    title: "Lembretes",
    description: "Veja tarefas, manutenções e coisas importantes.",
  },
  {
    href: "/vida-offline",
    emoji: "🌤️",
    title: "Vida Offline",
    description: "Missões simples para sair da tela e viver melhor.",
  },
  {
    href: "/backup",
    emoji: "📦",
    title: "Backup",
    description: "Exporte, importe ou apague seus dados do VivaRaiz.",
  },
];

export default function MaisPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("você");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const user = data.session.user;

      setUserName(user.user_metadata?.name || "você");
      setUserEmail(user.email || "");
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🌱</p>

          <h1 className="mt-4 text-2xl font-black">Carregando...</h1>

          <p className="mt-2 text-[#6B715F]">Verificando sua conta.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-page bg-[#F7F3EA] px-4 pt-5 text-[#2F3A2F] md:px-8 md:py-8">
      <div className="mx-auto max-w-4xl">
        <header>
          <a href="/dashboard" className="text-xl font-black md:text-2xl">
            🌱 VivaRaiz
          </a>

          <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
            Mais
          </h1>

          <p className="mt-2 text-sm text-[#6B715F] md:text-base">
            Acesse outras áreas importantes do VivaRaiz.
          </p>
        </header>

        <section className="mt-6 rounded-[2.2rem] bg-[#4F6F38] p-6 text-white shadow-sm md:p-8">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            Sua conta
          </p>

          <h2 className="mt-5 text-3xl font-black">Olá, {userName}</h2>

          {userEmail && <p className="mt-2 text-white/80">{userEmail}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="/configuracoes"
              className="rounded-full bg-white px-6 py-4 text-center font-black text-[#4F6F38] transition hover:bg-[#EFE8DA]"
            >
              Ver configurações
            </a>

            <button
              onClick={handleLogout}
              className="rounded-full border border-white/50 px-6 py-4 font-black text-white transition hover:bg-white/10"
            >
              Sair da conta
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-4">
          {moreItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="card-touch rounded-[2rem] bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F3EA] text-3xl">
                  {item.emoji}
                </div>

                <div>
                  <h2 className="text-xl font-black md:text-2xl">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-[#6B715F] md:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-3xl">💡</p>

          <h2 className="mt-4 text-2xl font-black">Dica VivaRaiz</h2>

          <p className="mt-2 text-[#6B715F]">
            Quanto mais você cadastra sua vida real, mais o VivaRaiz consegue te
            ajudar a lembrar, organizar e viver melhor fora da tela.
          </p>
        </section>
      </div>
    </main>
  );
}