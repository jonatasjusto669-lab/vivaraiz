"use client";

const values = [
  {
    emoji: "🌱",
    title: "Vida real primeiro",
    description:
      "O VivaRaiz nasceu para ajudar você a cuidar da casa, da comida, das plantas e da rotina fora da tela.",
  },
  {
    emoji: "🏡",
    title: "Organização simples",
    description:
      "Nada de complicar. A ideia é cadastrar aos poucos e encontrar rápido o que importa.",
  },
  {
    emoji: "🍲",
    title: "Menos desperdício",
    description:
      "A cozinha ajuda você a usar primeiro os alimentos que estão perto de vencer.",
  },
  {
    emoji: "🔐",
    title: "Dados por conta",
    description:
      "Cada usuário acessa apenas os próprios itens, plantas, compras, lembretes e missões.",
  },
];

export default function SobrePage() {
  return (
    <main className="mobile-page bg-[#F7F3EA] px-4 pt-5 text-[#2F3A2F] md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <a href="/dashboard" className="text-xl font-black md:text-2xl">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Sobre o VivaRaiz
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Um app simples para organizar a vida real, evitar desperdício e
              cuidar melhor da rotina.
            </p>
          </div>

          <a
            href="/mais"
            className="hidden rounded-full border border-[#7A8F5A] px-5 py-3 text-center font-bold text-[#4F6F38] md:block"
          >
            Voltar
          </a>
        </header>

        <section className="mt-6 rounded-[2.5rem] bg-[#4F6F38] p-7 text-white shadow-sm md:p-10">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            VivaRaiz 1.0
          </p>

          <p className="mt-7 text-7xl">🌱</p>

          <h2 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Organizar a casa para viver melhor fora da tela.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            O VivaRaiz foi criado para ajudar pessoas a lembrarem onde guardaram
            as coisas, cuidarem dos alimentos, organizarem compras, plantas,
            lembretes e pequenos hábitos do dia a dia.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/como-usar"
              className="rounded-full bg-white px-7 py-4 text-center font-black text-[#4F6F38] transition hover:bg-[#EFE8DA]"
            >
              Como usar
            </a>

            <a
              href="/dashboard"
              className="rounded-full border border-white/50 px-7 py-4 text-center font-black text-white transition hover:bg-white/10"
            >
              Abrir painel
            </a>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {values.map((item) => (
            <article
              key={item.title}
              className="card-touch rounded-[2rem] bg-white p-6 shadow-sm"
            >
              <p className="text-4xl">{item.emoji}</p>

              <h2 className="mt-4 text-2xl font-black">{item.title}</h2>

              <p className="mt-2 text-[#6B715F]">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-4xl">📌</p>

          <h2 className="mt-4 text-2xl font-black md:text-3xl">
            O que dá para fazer no VivaRaiz?
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <a
              href="/minha-casa"
              className="rounded-2xl bg-[#F7F3EA] p-4 font-black"
            >
              🏡 Organizar itens da casa
            </a>

            <a
              href="/minha-cozinha"
              className="rounded-2xl bg-[#F7F3EA] p-4 font-black"
            >
              🍲 Controlar alimentos
            </a>

            <a
              href="/minha-horta"
              className="rounded-2xl bg-[#F7F3EA] p-4 font-black"
            >
              🌱 Cuidar das plantas
            </a>

            <a
              href="/lista-compras"
              className="rounded-2xl bg-[#F7F3EA] p-4 font-black"
            >
              🛒 Fazer lista de compras
            </a>

            <a
              href="/lembretes"
              className="rounded-2xl bg-[#F7F3EA] p-4 font-black"
            >
              🔔 Ver lembretes
            </a>

            <a
              href="/vida-offline"
              className="rounded-2xl bg-[#F7F3EA] p-4 font-black"
            >
              🌤️ Fazer missões offline
            </a>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-4xl">🔐</p>

          <h2 className="mt-4 text-2xl font-black md:text-3xl">
            Privacidade e dados
          </h2>

          <div className="mt-4 space-y-3 text-[#6B715F]">
            <p>
              O VivaRaiz salva seus dados na sua conta para que você consiga
              acessar suas informações em outro celular ou computador.
            </p>

            <p>
              Cada pessoa vê apenas os próprios dados cadastrados, como itens,
              plantas, compras, lembretes e missões.
            </p>

            <p>
              Na tela de Backup, você pode exportar seus dados e também apagar
              suas informações do app.
            </p>
          </div>

          <a
            href="/backup"
            className="mt-6 inline-block rounded-full bg-[#E3D8BD] px-5 py-3 text-sm font-black text-[#5B4A2F]"
          >
            Abrir Backup
          </a>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-4xl">💬</p>

          <h2 className="mt-4 text-2xl font-black md:text-3xl">
            Sugestões e melhorias
          </h2>

          <p className="mt-2 text-[#6B715F]">
            O VivaRaiz ainda pode crescer com novas ideias, como notificações,
            receitas melhores, calendário da horta, modo família e mais.
          </p>

          <p className="mt-4 rounded-2xl bg-[#F7F3EA] p-4 text-sm font-bold text-[#4F6F38]">
            Versão atual: VivaRaiz 1.0
          </p>
        </section>
      </div>
    </main>
  );
}