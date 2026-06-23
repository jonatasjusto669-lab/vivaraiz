"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type HomeItem = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  location: string | null;
  quantity: string | null;
  expiration_date: string | null;
  reminder_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

const categoryLabels: Record<string, string> = {
  comida: "Comida",
  objeto: "Objeto",
  documento: "Documento",
  remedio: "Remédio",
  manutencao: "Manutenção",
  planta: "Planta",
  outro: "Outro",
};

function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getDateDiffInDays(dateString: string) {
  const today = getTodayStart();
  const date = new Date(`${dateString}T00:00:00`);
  const diff = date.getTime() - today.getTime();

  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Sem data";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("pt-BR");
}

function getReminderStatus(dateString: string | null) {
  if (!dateString) return "Sem lembrete";

  const diff = getDateDiffInDays(dateString);

  if (diff < 0) {
    return `Atrasado há ${Math.abs(diff)} dia${
      Math.abs(diff) === 1 ? "" : "s"
    }`;
  }

  if (diff === 0) return "É hoje";
  if (diff === 1) return "É amanhã";
  if (diff <= 7) return `Em ${diff} dias`;

  return `Em ${diff} dias`;
}

function getReminderColor(dateString: string | null) {
  if (!dateString) return "bg-[#F7F3EA] text-[#6B715F]";

  const diff = getDateDiffInDays(dateString);

  if (diff < 0) return "bg-[#F2DED8] text-[#8A3A2C]";
  if (diff === 0) return "bg-[#F3E7C5] text-[#7A5318]";
  if (diff === 1) return "bg-[#E7EED8] text-[#4F6F38]";
  if (diff <= 7) return "bg-[#E7EED8] text-[#4F6F38]";

  return "bg-[#F7F3EA] text-[#6B715F]";
}

export default function LembretesPage() {
  const router = useRouter();

  const [items, setItems] = useState<HomeItem[]>([]);
  const [userId, setUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUserAndLoadReminders() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const currentUserId = data.session.user.id;

      setUserId(currentUserId);
      await loadReminders(currentUserId);
    }

    checkUserAndLoadReminders();
  }, [router]);

  async function loadReminders(currentUserId: string) {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", currentUserId)
      .not("reminder_date", "is", null)
      .order("reminder_date", { ascending: true });

    setLoading(false);

    if (error) {
      setMessage(`Erro ao carregar lembretes: ${error.message}`);
      return;
    }

    setItems((data || []) as HomeItem[]);
  }

  const overdueItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.reminder_date) return false;

      return getDateDiffInDays(item.reminder_date) < 0;
    });
  }, [items]);

  const todayItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.reminder_date) return false;

      return getDateDiffInDays(item.reminder_date) === 0;
    });
  }, [items]);

  const tomorrowItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.reminder_date) return false;

      return getDateDiffInDays(item.reminder_date) === 1;
    });
  }, [items]);

  const weekItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.reminder_date) return false;

      const diff = getDateDiffInDays(item.reminder_date);
      return diff >= 2 && diff <= 7;
    });
  }, [items]);

  const laterItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.reminder_date) return false;

      return getDateDiffInDays(item.reminder_date) > 7;
    });
  }, [items]);

  async function markAsDone(itemId: string) {
    if (!userId) {
      setMessage("Você precisa estar logado para resolver lembretes.");
      return;
    }

    const { error } = await supabase
      .from("items")
      .update({
        reminder_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .eq("user_id", userId);

    if (error) {
      setMessage(`Erro ao resolver lembrete: ${error.message}`);
      return;
    }

    setMessage("Lembrete marcado como resolvido.");
    await loadReminders(userId);
  }

  function ReminderCard({ item }: { item: HomeItem }) {
    return (
      <article className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span
              className={`inline-block rounded-full px-4 py-2 text-xs font-black ${getReminderColor(
                item.reminder_date
              )}`}
            >
              {getReminderStatus(item.reminder_date)}
            </span>

            <p className="mt-4 text-sm font-bold text-[#7A8F5A]">
              {categoryLabels[item.category] || "Outro"}
            </p>

            <h3 className="mt-1 text-2xl font-black">{item.name}</h3>

            <p className="mt-2 text-[#6B715F]">
              🔔 Lembrete: {formatDate(item.reminder_date)}
            </p>

            <p className="mt-1 text-[#6B715F]">
              📍 {item.location || "Local não informado"}
            </p>

            {item.quantity && (
              <p className="mt-1 text-[#6B715F]">
                Quantidade: {item.quantity}
              </p>
            )}

            {item.notes && (
              <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-3 text-sm text-[#5F6B55]">
                {item.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => markAsDone(item.id)}
              className="rounded-full bg-[#4F6F38] px-4 py-2 text-sm font-bold text-white"
            >
              Resolvido
            </button>

            <a
              href="/minha-casa"
              className="rounded-full bg-[#E3D8BD] px-4 py-2 text-center text-sm font-bold text-[#5B4A2F]"
            >
              Editar
            </a>
          </div>
        </div>
      </article>
    );
  }

  function ReminderSection({
    title,
    items,
  }: {
    title: string;
    items: HomeItem[];
  }) {
    if (items.length === 0) return null;

    return (
      <section>
        <h2 className="text-2xl font-black">{title}</h2>

        <div className="mt-4 grid gap-4">
          {items.map((item) => (
            <ReminderCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🔔</p>

          <h1 className="mt-4 text-2xl font-black">Carregando Lembretes...</h1>

          <p className="mt-2 text-[#6B715F]">
            Buscando seus lembretes no Supabase.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-8 text-[#2F3A2F]">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/dashboard" className="text-2xl font-black">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-6 text-4xl font-black">Lembretes</h1>

            <p className="mt-2 text-[#6B715F]">
              Veja tarefas, manutenções, documentos, alimentos e coisas
              importantes que precisam da sua atenção.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/minha-casa"
              className="rounded-full bg-[#4F6F38] px-5 py-3 text-center font-bold text-white"
            >
              Criar lembrete
            </a>

            <a
              href="/dashboard"
              className="rounded-full border border-[#7A8F5A] px-5 py-3 text-center font-bold text-[#4F6F38]"
            >
              Voltar ao painel
            </a>
          </div>
        </header>

        {message && (
          <section className="mt-6 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#4F6F38] shadow-sm">
            {message}
          </section>
        )}

        <section className="mt-10 grid gap-5 md:grid-cols-5">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🔔</p>

            <h2 className="mt-4 text-3xl font-black">{items.length}</h2>

            <p className="mt-1 text-[#6B715F]">lembretes ativos</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">⚠️</p>

            <h2 className="mt-4 text-3xl font-black">
              {overdueItems.length}
            </h2>

            <p className="mt-1 text-[#6B715F]">atrasados</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">⏰</p>

            <h2 className="mt-4 text-3xl font-black">{todayItems.length}</h2>

            <p className="mt-1 text-[#6B715F]">hoje</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">📅</p>

            <h2 className="mt-4 text-3xl font-black">
              {tomorrowItems.length + weekItems.length}
            </h2>

            <p className="mt-1 text-[#6B715F]">próximos dias</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🌱</p>

            <h2 className="mt-4 text-3xl font-black">{laterItems.length}</h2>

            <p className="mt-1 text-[#6B715F]">mais tarde</p>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="mt-8 rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <p className="text-5xl">🔔</p>

            <h2 className="mt-4 text-2xl font-black">
              Nenhum lembrete ativo
            </h2>

            <p className="mt-2 text-[#6B715F]">
              Vá em Minha Casa, cadastre ou edite um item e coloque uma data no
              campo lembrete.
            </p>

            <a
              href="/minha-casa"
              className="mt-6 inline-block rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white"
            >
              Criar lembrete
            </a>
          </section>
        ) : (
          <div className="mt-8 space-y-8">
            <ReminderSection title="⚠️ Atrasados" items={overdueItems} />
            <ReminderSection title="⏰ Hoje" items={todayItems} />
            <ReminderSection title="📅 Amanhã" items={tomorrowItems} />
            <ReminderSection title="🗓️ Esta semana" items={weekItems} />
            <ReminderSection title="🌱 Depois" items={laterItems} />
          </div>
        )}
      </div>
    </main>
  );
}