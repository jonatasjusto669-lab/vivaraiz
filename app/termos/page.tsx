"use client";

const sections = [
  {
    emoji: "🌱",
    title: "1. O que é o VivaRaiz",
    text: "O VivaRaiz é um aplicativo de organização pessoal criado para ajudar você a cuidar da casa, cozinha, horta, compras, lembretes e pequenos hábitos da vida real.",
  },
  {
    emoji: "👤",
    title: "2. Conta do usuário",
    text: "Para usar o app, você pode criar uma conta com e-mail e senha. Você é responsável por manter seus dados de acesso em segurança e por não compartilhar sua senha com outras pessoas.",
  },
  {
    emoji: "🏡",
    title: "3. Uso do app",
    text: "O VivaRaiz deve ser usado para organização pessoal e doméstica. Você pode cadastrar, editar e excluir informações como itens, alimentos, plantas, compras, lembretes e missões offline.",
  },
  {
    emoji: "📌",
    title: "4. Informações cadastradas",
    text: "As informações que você adiciona ao app são usadas para mostrar suas próprias listas, lembretes, alimentos, plantas e demais recursos dentro da sua conta.",
  },
  {
    emoji: "⚠️",
    title: "5. Responsabilidade do usuário",
    text: "O VivaRaiz ajuda na organização, mas não substitui sua atenção. Você ainda deve conferir datas, alimentos, remédios, compromissos e qualquer informação importante antes de tomar decisões.",
  },
  {
    emoji: "🔐",
    title: "6. Privacidade",
    text: "O tratamento dos dados cadastrados no app é explicado na página de Política de Privacidade. Recomendamos que você leia essa página para entender melhor como seus dados são usados.",
  },
  {
    emoji: "🧪",
    title: "7. Versão inicial",
    text: "O VivaRaiz 1.0 é uma versão inicial do app. Algumas funcionalidades podem mudar, melhorar ou ser ajustadas com o tempo.",
  },
];

export default function TermosPage() {
  return (
    <main className="mobile-page bg-[#F7F3EA] px-4 pt-5 text-[#2F3A2F] md:px-8 md:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <a href="/dashboard" className="text-xl font-black md:text-2xl">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Termos de Uso
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Regras simples para usar o VivaRaiz com clareza e responsabilidade.
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

          <p className="mt-7 text-7xl">📄</p>

          <h2 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Use o VivaRaiz para organizar melhor sua vida real.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            Estes termos explicam, de forma simples, como o app deve ser usado e
            quais cuidados são importantes.
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
          <p className="text-4xl">🔐</p>

          <h2 className="mt-4 text-2xl font-black md:text-3xl">
            Leia também a Política de Privacidade
          </h2>

          <p className="mt-3 text-[#6B715F]">
            A Política de Privacidade explica quais informações o VivaRaiz usa e
            como você controla seus dados dentro do app.
          </p>

          <a
            href="/privacidade"
            className="mt-6 inline-block rounded-full bg-[#E3D8BD] px-5 py-3 text-sm font-black text-[#5B4A2F]"
          >
            Abrir Privacidade
          </a>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <p className="text-4xl">⚠️</p>

          <h2 className="mt-4 text-2xl font-black md:text-3xl">
            Observação importante
          </h2>

          <p className="mt-3 text-[#6B715F]">
            Estes termos são simples e feitos para a versão inicial do app. Se o
            VivaRaiz crescer, receber muitos usuários, pagamentos, planos pagos
            ou uso comercial maior, os termos deverão ser revisados com mais
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