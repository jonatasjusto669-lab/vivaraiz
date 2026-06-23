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

type Plant = {
  id: string;
  user_id: string;
  name: string;
  place: string | null;
  watering_frequency: number;
  planted_at: string | null;
  next_watering_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

type OfflineMission = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

type LocalHomeItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: string;
  expirationDate: string;
  reminderDate: string;
  notes: string;
  createdAt: string;
};

type LocalPlant = {
  id: string;
  name: string;
  place: string;
  wateringFrequency: string;
  plantedAt: string;
  nextWateringDate: string;
  notes: string;
  createdAt: string;
};

type LocalOfflineMission = {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
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

function mirrorItemsToLocalStorage(items: HomeItem[]) {
  const localItems: LocalHomeItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    location: item.location || "",
    quantity: item.quantity || "",
    expirationDate: item.expiration_date || "",
    reminderDate: item.reminder_date || "",
    notes: item.notes || "",
    createdAt: item.created_at,
  }));

  localStorage.setItem("vivaraiz_items", JSON.stringify(localItems));
}

function mirrorPlantsToLocalStorage(plants: Plant[]) {
  const localPlants: LocalPlant[] = plants.map((plant) => ({
    id: plant.id,
    name: plant.name,
    place: plant.place || "outro",
    wateringFrequency: String(plant.watering_frequency),
    plantedAt: plant.planted_at || "",
    nextWateringDate: plant.next_watering_date || "",
    notes: plant.notes || "",
    createdAt: plant.created_at,
  }));

  localStorage.setItem("vivaraiz_plants", JSON.stringify(localPlants));
}

function mirrorMissionsToLocalStorage(missions: OfflineMission[]) {
  const localMissions: LocalOfflineMission[] = missions.map((mission) => ({
    id: mission.id,
    title: mission.title,
    description: mission.description || "",
    category: mission.category || "",
    completed: mission.completed,
    completedAt: mission.completed_at,
    createdAt: mission.created_at,
  }));

  localStorage.setItem(
    "vivaraiz_offline_missions",
    JSON.stringify(localMissions)
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [items, setItems] = useState<HomeItem[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [missions, setMissions] = useState<OfflineMission[]>([]);
  const [userName, setUserName] = useState("você");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const user = data.session.user;
      const currentUserId = user.id;

      setUserName(user.user_metadata?.name || user.email || "você");

      const [itemsResult, plantsResult, missionsResult] = await Promise.all([
        supabase
          .from("items")
          .select("*")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false }),

        supabase
          .from("plants")
          .select("*")
          .eq("user_id", currentUserId)
          .order("next_watering_date", {
            ascending: true,
            nullsFirst: false,
          }),

        supabase
          .from("offline_missions")
          .select("*")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false }),
      ]);

      if (itemsResult.error) {
        setMessage(`Erro ao carregar itens: ${itemsResult.error.message}`);
      }

      if (plantsResult.error) {
        setMessage(`Erro ao carregar plantas: ${plantsResult.error.message}`);
      }

      if (missionsResult.error) {
        setMessage(
          `Erro ao carregar missões: ${missionsResult.error.message}`
        );
      }

      const loadedItems = (itemsResult.data || []) as HomeItem[];
      const loadedPlants = (plantsResult.data || []) as Plant[];
      const loadedMissions = (missionsResult.data || []) as OfflineMission[];

      setItems(loadedItems);
      setPlants(loadedPlants);
      setMissions(loadedMissions);

      mirrorItemsToLocalStorage(loadedItems);
      mirrorPlantsToLocalStorage(loadedPlants);
      mirrorMissionsToLocalStorage(loadedMissions);

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const foods = useMemo(() => {
    return items.filter((item) => item.category === "comida");
  }, [items]);

  const expiringSoon = useMemo(() => {
    return foods
      .filter((food) => {
        if (!food.expiration_date) return false;

        const diff = getDateDiffInDays(food.expiration_date);
        return diff <= 7;
      })
      .sort((a, b) => {
        if (!a.expiration_date || !b.expiration_date) return 0;

        return (
          new Date(`${a.expiration_date}T00:00:00`).getTime() -
          new Date(`${b.expiration_date}T00:00:00`).getTime()
        );
      });
  }, [foods]);

  const reminders = useMemo(() => {
    return items
      .filter((item) => item.reminder_date)
      .sort((a, b) => {
        if (!a.reminder_date || !b.reminder_date) return 0;

        return (
          new Date(`${a.reminder_date}T00:00:00`).getTime() -
          new Date(`${b.reminder_date}T00:00:00`).getTime()
        );
      });
  }, [items]);

  const dueReminders = useMemo(() => {
    return reminders.filter((item) => {
      if (!item.reminder_date) return false;

      const diff = getDateDiffInDays(item.reminder_date);
      return diff <= 0;
    });
  }, [reminders]);

  const plantsNeedWater = useMemo(() => {
    return plants.filter((plant) => {
      if (!plant.next_watering_date) return false;

      const diff = getDateDiffInDays(plant.next_watering_date);
      return diff <= 0;
    });
  }, [plants]);

  const completedMissions = useMemo(() => {
    return missions.filter((mission) => mission.completed);
  }, [missions]);

  const pendingMission = useMemo(() => {
    return missions.find((mission) => !mission.completed);
  }, [missions]);

  const recommendedAction = useMemo(() => {
    if (dueReminders.length > 0) {
      return {
        emoji: "🔔",
        label: "Prioridade de hoje",
        title: "Cuide dos seus lembretes",
        text: "Tem algo precisando da sua atenção agora.",
        href: "/lembretes",
        button: "Ver lembretes",
      };
    }

    if (expiringSoon.length > 0) {
      return {
        emoji: "🍅",
        label: "Evite desperdício",
        title: "Use algo perto de vencer",
        text: `${expiringSoon[0].name} precisa de atenção na cozinha.`,
        href: "/minha-cozinha",
        button: "Abrir cozinha",
      };
    }

    if (plantsNeedWater.length > 0) {
      return {
        emoji: "🌿",
        label: "Cuidado com a horta",
        title: "Tem planta pedindo água",
        text: `${plantsNeedWater[0].name} precisa de cuidado hoje.`,
        href: "/minha-horta",
        button: "Ver horta",
      };
    }

    if (pendingMission) {
      return {
        emoji: "🌤️",
        label: "Vida fora da tela",
        title: "Faça uma missão offline",
        text: pendingMission.title,
        href: "/vida-offline",
        button: "Ver missão",
      };
    }

    return {
      emoji: "🏡",
      label: "Comece por aqui",
      title: "Cadastre sua vida real",
      text: "Adicione itens, comidas, plantas e lembretes para o VivaRaiz te ajudar melhor.",
      href: "/minha-casa",
      button: "Adicionar item",
    };
  }, [dueReminders, expiringSoon, plantsNeedWater, pendingMission]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function StatCard({
    emoji,
    value,
    label,
  }: {
    emoji: string;
    value: number;
    label: string;
  }) {
    return (
      <div className="rounded-[1.6rem] bg-white p-4 shadow-sm">
        <p className="text-2xl">{emoji}</p>

        <p className="mt-3 text-2xl font-black">{value}</p>

        <p className="mt-1 text-sm text-[#6B715F]">{label}</p>
      </div>
    );
  }

  function QuickCard({
    href,
    emoji,
    title,
    description,
    highlight,
  }: {
    href: string;
    emoji: string;
    title: string;
    description: string;
    highlight?: boolean;
  }) {
    return (
      <a
        href={href}
        className={`card-touch rounded-[2rem] p-5 shadow-sm ${
          highlight ? "bg-[#4F6F38] text-white" : "bg-white text-[#2F3A2F]"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${
              highlight ? "bg-white/15" : "bg-[#F7F3EA]"
            }`}
          >
            {emoji}
          </div>

          <div>
            <h3 className="text-xl font-black">{title}</h3>

            <p
              className={`mt-1 text-sm ${
                highlight ? "text-white/80" : "text-[#6B715F]"
              }`}
            >
              {description}
            </p>
          </div>
        </div>
      </a>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🌱</p>

          <h1 className="mt-4 text-2xl font-black">Carregando VivaRaiz...</h1>

          <p className="mt-2 text-[#6B715F]">
            Buscando seus dados no Supabase.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-page bg-[#F7F3EA] px-4 pt-5 text-[#2F3A2F] md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <a href="/" className="text-xl font-black md:text-2xl">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Olá, {userName}.
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Cuide da casa, da comida, da horta e da vida fora da tela.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="hidden rounded-full border border-[#7A8F5A] px-5 py-3 text-center font-bold text-[#4F6F38] md:block"
          >
            Sair
          </button>
        </header>

        {message && (
          <section className="mt-5 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#8A3A2C] shadow-sm">
            {message}
          </section>
        )}

        <section className="mt-6 rounded-[2.2rem] bg-[#4F6F38] p-6 text-white shadow-sm md:mt-10 md:p-8">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            {recommendedAction.label}
          </p>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-6xl">{recommendedAction.emoji}</p>

              <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
                {recommendedAction.title}
              </h2>

              <p className="mt-3 max-w-2xl text-white/80">
                {recommendedAction.text}
              </p>
            </div>

            <a
              href={recommendedAction.href}
              className="rounded-full bg-white px-6 py-4 text-center font-black text-[#4F6F38] transition hover:bg-[#EFE8DA]"
            >
              {recommendedAction.button}
            </a>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-4">
          <StatCard emoji="📦" value={items.length} label="itens" />
          <StatCard emoji="🌿" value={plants.length} label="plantas" />
          <StatCard emoji="🔔" value={reminders.length} label="lembretes" />
          <StatCard
            emoji="🌤️"
            value={completedMissions.length}
            label="missões"
          />
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#7A8F5A]">
                Ações rápidas
              </p>

              <h2 className="mt-1 text-2xl font-black md:text-3xl">
                O que vamos cuidar agora?
              </h2>
            </div>

            <a
              href="/mais"
              className="hidden rounded-full bg-white px-5 py-3 text-sm font-black text-[#4F6F38] shadow-sm md:block"
            >
              Ver tudo
            </a>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <QuickCard
              href="/minha-casa"
              emoji="🏡"
              title="Minha Casa"
              description="Cadastre objetos, alimentos, documentos e remédios."
              highlight
            />

            <QuickCard
              href="/minha-cozinha"
              emoji="🍲"
              title="Minha Cozinha"
              description={
                expiringSoon.length > 0
                  ? `${expiringSoon.length} alimento${
                      expiringSoon.length === 1 ? "" : "s"
                    } perto de vencer.`
                  : "Veja comidas e sugestões simples."
              }
            />

            <QuickCard
              href="/minha-horta"
              emoji="🌱"
              title="Minha Horta"
              description={
                plantsNeedWater.length > 0
                  ? `${plantsNeedWater.length} planta${
                      plantsNeedWater.length === 1 ? "" : "s"
                    } precisa${
                      plantsNeedWater.length === 1 ? "" : "m"
                    } de água.`
                  : "Cuide das regas e plantas."
              }
            />

            <QuickCard
              href="/lembretes"
              emoji="🔔"
              title="Lembretes"
              description={
                dueReminders.length > 0
                  ? `${dueReminders.length} lembrete${
                      dueReminders.length === 1 ? "" : "s"
                    } para hoje.`
                  : "Veja tarefas e coisas importantes."
              }
            />

            <QuickCard
              href="/onde-guardei"
              emoji="🔎"
              title="Onde Guardei?"
              description="Encontre rápido onde cada coisa está."
            />

            <QuickCard
              href="/vida-offline"
              emoji="🌤️"
              title="Vida Offline"
              description={
                pendingMission
                  ? pendingMission.title
                  : "Gere uma missão para sair da tela."
              }
            />
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🍅</p>

            <h2 className="mt-4 text-2xl font-black">Cozinha agora</h2>

            {expiringSoon.length === 0 ? (
              <p className="mt-2 text-[#6B715F]">
                Nenhum alimento vencendo esta semana.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {expiringSoon.slice(0, 3).map((food) => (
                  <div
                    key={food.id}
                    className="rounded-2xl bg-[#F7F3EA] p-4"
                  >
                    <p className="font-black">{food.name}</p>

                    <p className="mt-1 text-sm text-[#6B715F]">
                      Validade: {food.expiration_date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🌿</p>

            <h2 className="mt-4 text-2xl font-black">Horta agora</h2>

            {plantsNeedWater.length === 0 ? (
              <p className="mt-2 text-[#6B715F]">
                Nenhuma planta precisa de rega agora.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {plantsNeedWater.slice(0, 3).map((plant) => (
                  <div
                    key={plant.id}
                    className="rounded-2xl bg-[#F7F3EA] p-4"
                  >
                    <p className="font-black">{plant.name}</p>

                    <p className="mt-1 text-sm text-[#6B715F]">
                      Próxima rega: {plant.next_watering_date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}