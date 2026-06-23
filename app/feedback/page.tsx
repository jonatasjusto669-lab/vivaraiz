"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

const feedbackTypes: {
  value: FeedbackType;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    value: "sugestao",
    label: "Sugestão",
    emoji: "💡",
    description: "Ideia para melhorar o VivaRaiz.",
  },
  {
    value: "erro",
    label: "Erro",
    emoji: "🐞",
    description: "Algo que não funcionou direito.",
  },
  {
    value: "elogio",
    label: "Elogio",
    emoji: "🌱",
    description: "Algo que você gostou no app.",
  },
  {
    value: "outro",
    label: "Outro",
    emoji: "📌",
    description: "Qualquer outro comentário.",
  },
];

export default function FeedbackPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [type, setType] = useState<FeedbackType>("sugestao");
  const [title, setTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [page, setPage] = useState("");

  useEffect(() => {
    async function checkUserAndLoadFeedbacks() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const currentUserId = data.session.user.id;
      const currentUserEmail = data.session.user.email || "";

      setUserId(currentUserId);
      setUserEmail(currentUserEmail);
      setLoadingAuth(false);

      await loadFeedbacks(currentUserId);
    }

    checkUserAndLoadFeedbacks();
  }, [router]);

  async function loadFeedbacks(currentUserId: string) {
    setLoadingFeedbacks(true);

    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });

    setLoadingFeedbacks(false);

    if (error) {
      setMessage(`Erro ao carregar feedbacks: ${error.message}`);
      return;
    }

    setFeedbacks((data || []) as Feedback[]);
  }

  const totalErrors = useMemo(() => {
    return feedbacks.filter((item) => item.type === "erro").length;
  }, [feedbacks]);

  const totalSuggestions = useMemo(() => {
    return feedbacks.filter((item) => item.type === "sugestao").length;
  }, [feedbacks]);

  const totalCompliments = useMemo(() => {
    return feedbacks.filter((item) => item.type === "elogio").length;
  }, [feedbacks]);

  function resetForm() {
    setType("sugestao");
    setTitle("");
    setFeedbackMessage("");
    setPage("");
  }

  async function sendFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!userId) {
      setMessage("Você precisa estar logado para enviar feedback.");
      return;
    }

    if (!title.trim()) {
      setMessage("Digite um título para o feedback.");
      return;
    }

    if (!feedbackMessage.trim()) {
      setMessage("Digite a mensagem do feedback.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("feedbacks").insert({
      user_id: userId,
      user_email: userEmail || null,
      type,
      title: title.trim(),
      message: feedbackMessage.trim(),
      page: page.trim() || null,
    });

    setSaving(false);

    if (error) {
      setMessage(`Erro ao enviar feedback: ${error.message}`);
      return;
    }

    resetForm();
    setMessage("Feedback enviado com sucesso. Obrigado por ajudar o VivaRaiz!");
    await loadFeedbacks(userId);
  }

  async function deleteFeedback(id: string) {
    const confirmDelete = confirm("Deseja excluir este feedback?");

    if (!confirmDelete) return;

    if (!userId) {
      setMessage("Você precisa estar logado para excluir feedback.");
      return;
    }

    const { error } = await supabase
      .from("feedbacks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setMessage(`Erro ao excluir feedback: ${error.message}`);
      return;
    }

    setMessage("Feedback excluído.");
    await loadFeedbacks(userId);
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

  function getTypeInfo(typeValue: FeedbackType) {
    return (
      feedbackTypes.find((item) => item.value === typeValue) ||
      feedbackTypes[feedbackTypes.length - 1]
    );
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

  function FeedbackCard({ feedback }: { feedback: Feedback }) {
    const typeInfo = getTypeInfo(feedback.type);

    return (
      <article className="card-touch rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F3EA] text-3xl">
            {typeInfo.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[#7A8F5A]">
              {typeInfo.label}
            </p>

            <h3 className="mt-1 text-2xl font-black leading-tight">
              {feedback.title}
            </h3>

            <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-4 text-sm leading-relaxed text-[#5F6B55]">
              {feedback.message}
            </p>

            {feedback.page && (
              <p className="mt-3 text-sm font-bold text-[#6B715F]">
                Página: {feedback.page}
              </p>
            )}

            <p className="mt-2 text-xs text-[#8A8F80]">
              Enviado em {formatDate(feedback.created_at)}
            </p>

            <button
              onClick={() => deleteFeedback(feedback.id)}
              className="mt-4 rounded-full bg-[#F2DED8] px-4 py-3 text-sm font-black text-[#8A3A2C]"
            >
              Excluir
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (loadingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">💬</p>

          <h1 className="mt-4 text-2xl font-black">Carregando Feedback...</h1>

          <p className="mt-2 text-[#6B715F]">Verificando sua conta.</p>
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
              Feedback
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Envie sugestões, erros encontrados, elogios ou ideias para melhorar
              o VivaRaiz.
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
          <section className="mt-5 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#4F6F38] shadow-sm">
            {message}
          </section>
        )}

        <section className="mt-6 rounded-[2.5rem] bg-[#4F6F38] p-7 text-white shadow-sm md:p-10">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            Ajude o VivaRaiz a crescer
          </p>

          <p className="mt-7 text-7xl">💬</p>

          <h2 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Viu algo que pode melhorar?
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            Use essa tela para registrar ideias, problemas, elogios ou qualquer
            comentário sobre o app.
          </p>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard emoji="💬" value={feedbacks.length} label="feedbacks" />

          <SummaryCard
            emoji="💡"
            value={totalSuggestions}
            label="sugestões"
          />

          <SummaryCard emoji="🐞" value={totalErrors} label="erros" />

          <SummaryCard emoji="🌱" value={totalCompliments} label="elogios" />
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
          <p className="text-3xl">✍️</p>

          <h2 className="mt-3 text-2xl font-black">Enviar feedback</h2>

          <p className="mt-1 text-sm text-[#6B715F]">
            Quanto mais claro for o feedback, mais fácil fica melhorar o app.
          </p>

          <form onSubmit={sendFeedback} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold">Tipo</label>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as FeedbackType)
                }
                className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
              >
                {feedbackTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.emoji} {item.label}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-sm text-[#6B715F]">
                {getTypeInfo(type).description}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Título</label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex: Botão não funcionou, ideia para cozinha..."
                className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Mensagem</label>

              <textarea
                value={feedbackMessage}
                onChange={(event) => setFeedbackMessage(event.target.value)}
                placeholder="Explique sua ideia, erro ou sugestão..."
                rows={5}
                className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Página relacionada
              </label>

              <input
                value={page}
                onChange={(event) => setPage(event.target.value)}
                placeholder="Ex: Minha Cozinha, Dashboard, Login..."
                className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white transition hover:bg-[#3F5C2B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Enviando..." : "Enviar feedback"}
            </button>
          </form>
        </section>

        <section className="mt-6">
          {loadingFeedbacks ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-5xl">💬</p>

              <h2 className="mt-4 text-2xl font-black">
                Carregando feedbacks...
              </h2>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-5xl">💡</p>

              <h2 className="mt-4 text-2xl font-black">
                Nenhum feedback enviado
              </h2>

              <p className="mt-2 text-[#6B715F]">
                Envie sua primeira sugestão, erro encontrado ou elogio.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {feedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}