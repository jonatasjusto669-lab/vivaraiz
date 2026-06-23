export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] px-4 py-6 text-[#2F3A2F] md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <section className="grid w-full gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2.5rem] bg-[#4F6F38] p-7 text-white shadow-sm md:p-10">
            <a href="/" className="text-xl font-black md:text-2xl">
              🌱 VivaRaiz
            </a>

            <p className="mt-8 text-7xl">🔎</p>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              Essa página não foi encontrada.
            </h1>

            <p className="mt-4 leading-relaxed text-white/85">
              O link pode estar errado, ter mudado de lugar ou não existir mais
              no VivaRaiz.
            </p>

            <div className="mt-8 rounded-[2rem] bg-white/10 p-5">
              <p className="font-black">O que você pode fazer:</p>

              <div className="mt-4 space-y-3 text-sm text-white/85">
                <p>✅ Voltar para a página inicial</p>
                <p>✅ Entrar na sua conta</p>
                <p>✅ Abrir o painel do VivaRaiz</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-6 shadow-sm md:p-10">
            <p className="text-sm font-black text-[#7A8F5A]">
              Erro 404
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Caminho perdido 🌱
            </h2>

            <p className="mt-2 text-[#6B715F]">
              Escolha uma opção abaixo para continuar usando o VivaRaiz.
            </p>

            <div className="mt-6 grid gap-3">
              <a
                href="/"
                className="rounded-full bg-[#4F6F38] px-6 py-4 text-center font-black text-white transition hover:bg-[#3F5C2B]"
              >
                Ir para o início
              </a>

              <a
                href="/dashboard"
                className="rounded-full bg-[#E3D8BD] px-6 py-4 text-center font-black text-[#5B4A2F]"
              >
                Abrir painel
              </a>

              <a
                href="/login"
                className="rounded-full border border-[#DDD2BC] px-6 py-4 text-center font-black text-[#4F6F38]"
              >
                Fazer login
              </a>
            </div>

            <div className="mt-8 rounded-[2rem] bg-[#F7F3EA] p-5">
              <p className="text-3xl">💡</p>

              <h3 className="mt-3 text-xl font-black">
                Talvez você esteja procurando:
              </h3>

              <div className="mt-4 grid gap-3 text-sm font-black text-[#4F6F38]">
                <a href="/minha-casa">🏡 Minha Casa</a>
                <a href="/minha-cozinha">🍲 Minha Cozinha</a>
                <a href="/minha-horta">🌱 Minha Horta</a>
                <a href="/lista-compras">🛒 Lista de Compras</a>
                <a href="/mais">☰ Mais opções</a>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-[#6B715F]">
              <div className="flex flex-wrap justify-center gap-4 font-bold">
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

              <p className="mt-4">
                VivaRaiz 1.0 — organize sua vida real 🌱
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}