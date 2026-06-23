"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FeedbackType = "sugestao" | "erro" | "elogio" | "outro";

type Feedback = {
  id: string;
  user_id: string;
  user_email: string | null;
  type: FeedbackType;
  title: string;
  message: string;
  page: string | null;
  created_at: string;
};

type FilterType = "todos" | "sugestao" | "erro" | "elogio" | "outro";

const ADMIN_EMAIL = "iphonedejonatas24@gmail.com";

const feedbackTypes: {
  value: FeedbackType;
  label: string;
  emoji: string;
}[] = [
  { value: "sugestao", label: "Sugestão", emoji: "💡" },
  { value: "erro", label: "Erro", emoji: "🐞" },
  { value: "elogio", label: "Elogio", emoji: "🌱" },
  { value: "outro", label: "Outro", emoji: "📌" },
];

export default function AdminFeedbacksPage() {
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<FilterType>("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function checkAdminAndLoad() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const userEmail = data.session.user.email || "";

      if (userEmail !== ADMIN_EMAIL) {
        setLoading(false);
        setLoadingFeedbacks(false);
        setMessage("Acesso negado. Esta área é apenas do administrador.");
        return;
      }

      setLoading(false);
      await loadFeedbacks();
    }

    checkAdminAndLoad();
  }, [router]);

  async function loadFeedbacks() {
    setLoadingFeedbacks(true);
    setMessage("");

    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false });

    setLoadingFeedbacks(false);

    if (error) {
      setMessage(`Erro ao carregar feedbacks: ${error.message}`);
      return;
    }

    setFeedbacks((data || []) as Feedback[]);
  }

  const filteredFeedbacks = useMemo(() => {
    let baseFeedbacks = feedbacks;

    if (filter !== "todos") {
      baseFeedbacks = baseFeedbacks.filter((item) => item.type === filter);
    }

    const searchText = search.trim().toLowerCase();

    if (!searchText) return baseFeedbacks;

    return baseFeedbacks.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchText) ||
        item.message.toLowerCase().includes(searchText) ||
        item.page?.toLowerCase().includes(searchText) ||
        item.user_email?.toLowerCase().includes(searchText) ||
        item.user_id.toLowerCase().includes(searchText)
      );
    });
  }, [feedbacks, filter, search]);

  const totalSuggestions = useMemo(() => {
    return feedbacks.filter((item) => item.type === "sugestao").length;
  }, [feedbacks]);

  const totalErrors = useMemo(() => {
    return feedbacks.filter((item) => item.type === "erro").length;
  }, [feedbacks]);

  const totalCompliments = useMemo(() => {
    return feedbacks.filter((item) => item.type === "elogio").length;
  }, [feedbacks]);

  async function deleteFeedback(id: string) {
    const confirmDelete = confirm("Deseja excluir este feedback?");

    if (!confirmDelete) return;

    const { error } = await supabase.from("feedbacks").delete().eq("id", id);

    if (error) {
      setMessage(`Erro ao excluir feedback: ${error.message}`);
      return;
    }

    setMessage("Feedback excluído.");
    await loadFeedbacks();
  }

  function getTypeInfo(typeValue: FeedbackType) {
    return (
      feedbackTypes.find((item) => item.value === typeValue) ||
      feedbackTypes[feedbackTypes.length - 1]
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function SummaryCard({
    emoji,
    value,
    label,
  }: {
    emoji: string;
    value: number;
    label: string;
  }) {
    return (
      <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
        <p className="text-2xl">{emoji}</p>

        <p className="mt-3 text-2xl font-black">{value}</p>

        <p className="mt-1 text-sm text-[#6B715F]">{label}</p>
      </div>
    );
  }

  function FilterButton({
    value,
    label,
    emoji,
  }: {
    value: FilterType;
    label: string;
    emoji: string;
  }) {
    const active = filter === value;

    return (
      <button
        onClick={() => setFilter(value)}
        className={`shrink-0 rounded-full px-5 py-3 text-sm font-black transition ${
          active
            ? "bg-[#4F6F38] text-white shadow-sm"
            : "bg-white text-[#6B715F]"
        }`}
      >
        {emoji} {label}
      </button>
    );
  }

  function FeedbackCard({ feedback }: { feedback: Feedback }) {
    const typeInfo = getTypeInfo(feedback.type);

    return (
      <article className="card-touch rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F3EA] text-3xl">
            {typeInfo.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#E7EED8] px-3 py-1 text-xs font-black text-[#4F6F38]">
                {typeInfo.label}
              </span>

              <span className="rounded-full bg-[#F7F3EA] px-3 py-1 text-xs font-bold text-[#6B715F]">
                {formatDate(feedback.created_at)}
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-black leading-tight">
              {feedback.title}
            </h3>

            <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-4 text-sm leading-relaxed text-[#5F6B55]">
              {feedback.message}
            </p>

            <div className="mt-4 space-y-2 text-sm text-[#6B715F]">
              <p>
                <strong className="text-[#2F3A2F]">Usuário:</strong>{" "}
                {feedback.user_email || "E-mail não salvo"}
              </p>

              {feedback.page && (
                <p>
                  <strong className="text-[#2F3A2F]">Página:</strong>{" "}
                  {feedback.page}
                </p>
              )}

              <p className="break-all">
                <strong className="text-[#2F3A2F]">User ID:</strong>{" "}
                {feedback.user_id}
              </p>
            </div>

            <button
              onClick={() => deleteFeedback(feedback.id)}
              className="mt-4 rounded-full bg-[#F2DED8] px-4 py-3 text-sm font-black text-[#8A3A2C]"
            >
              Excluir feedback
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🛡️</p>

          <h1 className="mt-4 text-2xl font-black">
            Verificando administrador...
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-page bg-[#F7F3EA] px-4 pt-5 text-[#2F3A2F] md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <a href="/dashboard" className="text-xl font-black md:text-2xl">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Admin Feedbacks
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Área do administrador para ver sugestões, erros, elogios e ideias
              enviados pelos usuários.
            </p>
          </div>

          <a
            href="/mais"
            className="hidden rounded-full border border-[#7A8F5A] px-5 py-3 text-center font-bold text-[#4F6F38] md:block"
          >
            Voltar
          </a>
        </header>

        {message && (
          <section className="mt-5 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#8A3A2C] shadow-sm">
            {message}
          </section>
        )}

        <section className="mt-6 rounded-[2.5rem] bg-[#4F6F38] p-7 text-white shadow-sm md:p-10">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            Painel interno
          </p>

          <p className="mt-7 text-7xl">🛡️</p>

          <h2 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Feedbacks dos usuários
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            Aqui você vê tudo que os usuários mandarem pela tela de Feedback.
          </p>

          <button
            onClick={loadFeedbacks}
            className="mt-6 rounded-full bg-white px-6 py-4 font-black text-[#4F6F38]"
          >
            Atualizar lista
          </button>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard emoji="💬" value={feedbacks.length} label="total" />
          <SummaryCard
            emoji="💡"
            value={totalSuggestions}
            label="sugestões"
          />
          <SummaryCard emoji="🐞" value={totalErrors} label="erros" />
          <SummaryCard emoji="🌱" value={totalCompliments} label="elogios" />
        </section>

        <section className="mt-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              <FilterButton value="todos" label="Todos" emoji="💬" />
              <FilterButton value="sugestao" label="Sugestões" emoji="💡" />
              <FilterButton value="erro" label="Erros" emoji="🐞" />
              <FilterButton value="elogio" label="Elogios" emoji="🌱" />
              <FilterButton value="outro" label="Outros" emoji="📌" />
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-bold">
            Buscar feedback
          </label>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, mensagem, usuário ou página..."
            className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
          />

          <p className="mt-4 text-sm text-[#6B715F]">
            {filteredFeedbacks.length} resultado
            {filteredFeedbacks.length === 1 ? "" : "s"}.
          </p>
        </section>

        <section className="mt-5">
          {loadingFeedbacks ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-5xl">💬</p>

              <h2 className="mt-4 text-2xl font-black">
                Carregando feedbacks...
              </h2>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-5xl">🔎</p>

              <h2 className="mt-4 text-2xl font-black">
                Nenhum feedback encontrado
              </h2>

              <p className="mt-2 text-[#6B715F]">
                Quando alguém enviar feedback, ele vai aparecer aqui.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFeedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}