"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const steps = [
  {
    emoji: "🏡",
    title: "1. Comece pela Minha Casa",
    description:
      "Cadastre alimentos, objetos, documentos, remédios e coisas importantes. Coloque o local onde está guardado para encontrar depois.",
    link: "/minha-casa",
    button: "Abrir Minha Casa",
  },
  {
    emoji: "🍲",
    title: "2. Use a Minha Cozinha",
    description:
      "Tudo que você cadastrar como comida aparece na cozinha. O VivaRaiz mostra o que vence primeiro e dá sugestões simples.",
    link: "/minha-cozinha",
    button: "Abrir Cozinha",
  },
  {
    emoji: "🌱",
    title: "3. Cuide da Minha Horta",
    description:
      "Cadastre suas plantas e diga de quantos em quantos dias quer ser lembrado depois de regar.",
    link: "/minha-horta",
    button: "Abrir Horta",
  },
  {
    emoji: "🔔",
    title: "4. Crie lembretes",
    description:
      "Na Minha Casa, coloque uma data no campo Lembrete. Depois o app mostra o que precisa da sua atenção.",
    link: "/lembretes",
    button: "Ver Lembretes",
  },
  {
    emoji: "🔎",
    title: "5. Use o Onde Guardei?",
    description:
      "Procure por nome, local, categoria ou observação. Serve para achar rápido onde você deixou cada coisa.",
    link: "/onde-guardei",
    button: "Buscar itens",
  },
  {
    emoji: "🌤️",
    title: "6. Faça missões offline",
    description:
      "A Vida Offline te dá pequenas missões para sair da tela e cuidar da vida real com mais calma.",
    link: "/vida-offline",
    button: "Ver Missões",
  },
];

export default function ComoUsarPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🌱</p>

          <h1 className="mt-4 text-2xl font-black">Carregando...</h1>

          <p className="mt-2 text-[#6B715F]">Preparando o guia do VivaRaiz.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-page bg-[#F7F3EA] px-4 pt-5 text-[#2F3A2F] md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <a href="/dashboard" className="text-xl font-black md:text-2xl">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Como usar
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Um guia simples para aproveitar melhor o VivaRaiz no dia a dia.
            </p>
          </div>

          <a
            href="/mais"
            className="hidden rounded-full border border-[#7A8F5A] px-5 py-3 text-center font-bold text-[#4F6F38] md:block"
          >
            Voltar
          </a>
        </header>

        <section className="mt-6 rounded-[2.2rem] bg-[#4F6F38] p-6 text-white shadow-sm md:p-8">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            Guia rápido
          </p>

          <p className="mt-6 text-6xl">📱</p>

          <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
            O VivaRaiz organiza sua vida real.
          </h2>

          <p className="mt-3 max-w-2xl text-white/80">
            A ideia é simples: você cadastra o que existe na sua casa, e o app te
            ajuda a lembrar, encontrar, usar antes de vencer e cuidar melhor da
            rotina fora da tela.
          </p>
        </section>

        <section className="mt-6 grid gap-4">
          {steps.map((step) => (
            <article
              key={step.title}
              className="card-touch rounded-[2rem] bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F3EA] text-3xl">
                  {step.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black md:text-2xl">
                    {step.title}
                  </h2>

                  <p className="mt-2 text-sm text-[#6B715F] md:text-base">
                    {step.description}
                  </p>

                  <a
                    href={step.link}
                    className="mt-4 inline-block rounded-full bg-[#E3D8BD] px-5 py-3 text-sm font-black text-[#5B4A2F]"
                  >
                    {step.button}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-4xl">📲</p>

          <h2 className="mt-4 text-2xl font-black">Instalar no celular</h2>

          <div className="mt-4 space-y-4 text-[#6B715F]">
            <p>
              <strong className="text-[#2F3A2F]">No iPhone:</strong> abra no
              Safari, toque em compartilhar e escolha “Adicionar à Tela de
              Início”.
            </p>

            <p>
              <strong className="text-[#2F3A2F]">No Android:</strong> abra no
              Chrome, toque nos três pontinhos e escolha “Instalar app” ou
              “Adicionar à tela inicial”.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-4xl">💡</p>

          <h2 className="mt-4 text-2xl font-black">Dica principal</h2>

          <p className="mt-2 text-[#6B715F]">
            O segredo do VivaRaiz é cadastrar aos poucos. Não precisa colocar a
            casa inteira de uma vez. Comece por comida, documentos importantes e
            coisas que você vive esquecendo onde guardou.
          </p>
        </section>
      </div>
    </main>
  );
}