"use client";

const sections = [
  {
    emoji: "📌",
    title: "1. O que o VivaRaiz guarda",
    text: "O VivaRaiz pode guardar informações que você cadastra no app, como itens da casa, alimentos, plantas, lembretes, lista de compras, missões offline e dados básicos da sua conta.",
  },
  {
    emoji: "🔐",
    title: "2. Conta e acesso",
    text: "Para usar o app, você pode criar uma conta com e-mail e senha. Cada usuário acessa apenas os próprios dados cadastrados.",
  },
  {
    emoji: "🏡",
    title: "3. Dados da sua rotina",
    text: "As informações cadastradas servem para organizar sua casa, cozinha, horta, lembretes e compras. O VivaRaiz usa esses dados apenas para mostrar as funcionalidades dentro do próprio app.",
  },
  {
    emoji: "🧹",
    title: "4. Controle dos seus dados",
    text: "Você pode editar e excluir seus itens dentro do app. Na área de Backup, também pode exportar seus dados ou apagar informações salvas.",
  },
  {
    emoji: "🛡️",
    title: "5. Segurança",
    text: "O app usa autenticação para separar os dados de cada conta. Mesmo assim, é importante usar uma senha segura e não compartilhar seu acesso com outras pessoas.",
  },
  {
    emoji: "📱",
    title: "6. Uso no celular",
    text: "O VivaRaiz pode ser usado pelo navegador e instalado na tela inicial do celular como um aplicativo. Ele depende de internet para acessar e salvar os dados online.",
  },
];

export default function PrivacidadePage() {
  return (
    <main className="mobile-page bg-[#F7F3EA] px-4 pt-5 text-[#2F3A2F] md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <a href="/dashboard" className="text-xl font-black md:text-2xl">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Política de Privacidade
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Entenda de forma simples quais dados o VivaRaiz usa e como você
              controla suas informações.
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

          <p className="mt-7 text-7xl">🔐</p>

          <h2 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Seus dados devem ajudar sua rotina, não complicar sua vida.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            Esta página explica, de maneira simples, como o VivaRaiz lida com as
            informações que você cadastra no app.
          </p>
        </section>

        <section className="mt-6 grid gap-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="card-touch rounded-[2rem] bg-white p-6 shadow-sm"
            >
              <p className="text-4xl">{section.emoji}</p>

              <h2 className="mt-4 text-2xl font-black">{section.title}</h2>

              <p className="mt-3 leading-relaxed text-[#6B715F]">
                {section.text}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-4xl">📦</p>

          <h2 className="mt-4 text-2xl font-black md:text-3xl">
            Exportar ou apagar dados
          </h2>

          <p className="mt-3 text-[#6B715F]">
            Você pode acessar a tela de Backup para exportar seus dados ou apagar
            informações do VivaRaiz.
          </p>

          <a
            href="/backup"
            className="mt-6 inline-block rounded-full bg-[#E3D8BD] px-5 py-3 text-sm font-black text-[#5B4A2F]"
          >
            Abrir Backup
          </a>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-4xl">⚠️</p>

          <h2 className="mt-4 text-2xl font-black md:text-3xl">
            Observação importante
          </h2>

          <p className="mt-3 text-[#6B715F]">
            Esta é uma política simples para a versão inicial do app. Se o
            VivaRaiz crescer, receber domínio próprio, muitos usuários ou
            monetização, essa política pode precisar ser revisada com mais
            cuidado.
          </p>

          <p className="mt-4 rounded-2xl bg-[#F7F3EA] p-4 text-sm font-bold text-[#4F6F38]">
            Última atualização: versão VivaRaiz 1.0
          </p>
        </section>
      </div>
    </main>
  );
}