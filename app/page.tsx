export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#2F3A2F]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            🌱 VivaRaiz
          </div>

          <a
            href="#como-funciona"
            className="rounded-full border border-[#7A8F5A] px-4 py-2 text-sm font-medium text-[#3F5132]"
          >
            Como funciona
          </a>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full bg-[#E3D8BD] px-4 py-2 text-sm font-semibold text-[#5B4A2F]">
              Menos tela. Mais vida real.
            </p>

            <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Organize sua casa e volte a viver fora da tela.
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-relaxed text-[#5F6B55]">
              O VivaRaiz ajuda você a cuidar da comida, da casa, da horta e da
              rotina simples. Lembre o que está vencendo, onde guardou as coisas
              e crie pequenos hábitos longe do celular.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/cadastro"
                className="rounded-full bg-[#4F6F38] px-7 py-4 text-center font-bold text-white shadow-lg transition hover:bg-[#3F5C2B]"
              >
                Começar agora
              </a>

              <a
                href="#como-funciona"
                className="rounded-full bg-white px-7 py-4 text-center font-bold text-[#4F6F38] shadow-sm transition hover:bg-[#EFE8DA]"
              >
                Ver como funciona
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="mb-4 rounded-3xl bg-[#F7F3EA] p-5">
              <p className="text-sm font-semibold text-[#7A8F5A]">
                Hoje na sua casa
              </p>
              <h2 className="mt-2 text-2xl font-black">
                3 coisas precisam da sua atenção
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#E5DEC9] p-4">
                <p className="font-bold">🍅 Tomate vence amanhã</p>
                <p className="text-sm text-[#6B715F]">
                  Use primeiro no almoço ou jantar.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5DEC9] p-4">
                <p className="font-bold">🌿 Regar o manjericão hoje</p>
                <p className="text-sm text-[#6B715F]">
                  Próxima tarefa da sua horta.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5DEC9] p-4">
                <p className="font-bold">📦 Carregador antigo</p>
                <p className="text-sm text-[#6B715F]">
                  Guardado na gaveta do quarto.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section id="como-funciona" className="pb-16">
          <h2 className="mb-6 text-3xl font-black">Como o VivaRaiz funciona</h2>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="mb-2 text-3xl">🏡</p>
              <h3 className="font-bold">Minha Casa</h3>
              <p className="mt-2 text-sm text-[#6B715F]">
                Salve onde estão objetos, documentos e remédios.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="mb-2 text-3xl">🍲</p>
              <h3 className="font-bold">Minha Cozinha</h3>
              <p className="mt-2 text-sm text-[#6B715F]">
                Veja alimentos vencendo e ideias do que cozinhar.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="mb-2 text-3xl">🌱</p>
              <h3 className="font-bold">Minha Horta</h3>
              <p className="mt-2 text-sm text-[#6B715F]">
                Lembre regas, cuidados e pequenas tarefas das plantas.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="mb-2 text-3xl">🌤️</p>
              <h3 className="font-bold">Vida Offline</h3>
              <p className="mt-2 text-sm text-[#6B715F]">
                Receba missões simples para viver mais fora da tela.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}