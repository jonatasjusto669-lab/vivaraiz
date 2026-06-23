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

      const nameFromUser = user.user_metadata?.name || user.email || "você";
      setUserName(nameFromUser);

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

  const nextExpiringFood = expiringSoon[0];
  const nextReminder = reminders[0];
  const nextPlant = plantsNeedWater[0];

  const recommendedAction = useMemo(() => {
    if (dueReminders.length > 0) {
      return {
        emoji: "🔔",
        title: "Cuide dos lembretes de hoje",
        text: "Tem tarefa ou manutenção precisando de atenção agora.",
        href: "/lembretes",
        button: "Ver lembretes",
      };
    }

    if (expiringSoon.length > 0) {
      return {
        emoji: "🍅",
        title: "Use algo que está perto de vencer",
        text: "Abra sua cozinha e priorize os alimentos que vencem primeiro.",
        href: "/minha-cozinha",
        button: "Ver cozinha",
      };
    }

    if (plantsNeedWater.length > 0) {
      return {
        emoji: "🌿",
        title: "Cuide da sua horta",
        text: "Tem planta precisando de atenção hoje.",
        href: "/minha-horta",
        button: "Ver horta",
      };
    }

    if (pendingMission) {
      return {
        emoji: "🌤️",
        title: "Faça uma missão offline",
        text: pendingMission.title,
        href: "/vida-offline",
        button: "Ver missão",
      };
    }

    return {
      emoji: "🏡",
      title: "Alimente sua casa digital",
      text: "Cadastre mais itens para o VivaRaiz conseguir te ajudar melhor.",
      href: "/minha-casa",
      button: "Adicionar item",
    };
  }, [
    dueReminders.length,
    expiringSoon.length,
    plantsNeedWater.length,
    pendingMission,
  ]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
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
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-8 text-[#2F3A2F]">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/" className="text-2xl font-black">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-6 text-4xl font-black">
              Bom te ver por aqui, {userName}.
            </h1>

            <p className="mt-2 text-[#6B715F]">
              Seu painel conectado ao Supabase, cuidando da casa, da comida, da
              horta e da vida fora da tela.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-fit rounded-full border border-[#7A8F5A] px-5 py-3 text-center font-bold text-[#4F6F38]"
          >
            Sair
          </button>
        </header>

        {message && (
          <section className="mt-6 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#8A3A2C] shadow-sm">
            {message}
          </section>
        )}

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[2rem] bg-[#4F6F38] p-7 text-white shadow-sm">
            <p className="text-sm font-bold text-white/70">
              Jornada VivaRaiz de hoje
            </p>

            <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-5xl">{recommendedAction.emoji}</p>

                <h2 className="mt-4 text-4xl font-black leading-tight">
                  {recommendedAction.title}
                </h2>

                <p className="mt-3 max-w-xl text-white/80">
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
          </div>

          <div className="rounded-[2rem] bg-white p-7 shadow-sm">
            <p className="text-sm font-bold text-[#7A8F5A]">Resumo</p>

            <h2 className="mt-3 text-3xl font-black">
              Sua vida real está tomando forma.
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F7F3EA] p-4">
                <p className="text-2xl font-black">{items.length}</p>
                <p className="text-sm text-[#6B715F]">itens</p>
              </div>

              <div className="rounded-2xl bg-[#F7F3EA] p-4">
                <p className="text-2xl font-black">{plants.length}</p>
                <p className="text-sm text-[#6B715F]">plantas</p>
              </div>

              <div className="rounded-2xl bg-[#F7F3EA] p-4">
                <p className="text-2xl font-black">{reminders.length}</p>
                <p className="text-sm text-[#6B715F]">lembretes</p>
              </div>

              <div className="rounded-2xl bg-[#F7F3EA] p-4">
                <p className="text-2xl font-black">
                  {completedMissions.length}
                </p>
                <p className="text-sm text-[#6B715F]">missões</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <a
            href="/minha-cozinha"
            className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-3xl">🍅</p>

            <h2 className="mt-4 text-xl font-black">Vencendo em breve</h2>

            <p className="mt-2 text-sm text-[#6B715F]">
              {expiringSoon.length === 0
                ? "Nenhum alimento vencendo esta semana."
                : `${expiringSoon.length} alimento${
                    expiringSoon.length === 1 ? "" : "s"
                  } precisa${
                    expiringSoon.length === 1 ? "" : "m"
                  } de atenção.`}
            </p>

            {nextExpiringFood && (
              <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-3 text-sm font-bold text-[#4F6F38]">
                Próximo: {nextExpiringFood.name}
              </p>
            )}
          </a>

          <a
            href="/lembretes"
            className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-3xl">🔔</p>

            <h2 className="mt-4 text-xl font-black">Lembretes</h2>

            <p className="mt-2 text-sm text-[#6B715F]">
              {reminders.length === 0
                ? "Nenhum lembrete ativo."
                : dueReminders.length > 0
                ? `${dueReminders.length} lembrete${
                    dueReminders.length === 1 ? "" : "s"
                  } precisa${
                    dueReminders.length === 1 ? "" : "m"
                  } de atenção hoje.`
                : `${reminders.length} lembrete${
                    reminders.length === 1 ? "" : "s"
                  } ativo${reminders.length === 1 ? "" : "s"}.`}
            </p>

            {nextReminder && (
              <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-3 text-sm font-bold text-[#4F6F38]">
                Próximo: {nextReminder.name}
              </p>
            )}
          </a>

          <a
            href="/onde-guardei"
            className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-3xl">📦</p>

            <h2 className="mt-4 text-xl font-black">Onde guardei?</h2>

            <p className="mt-2 text-sm text-[#6B715F]">
              {items.length === 0
                ? "Cadastre itens para encontrar depois."
                : `${items.length} item${
                    items.length === 1 ? "" : "s"
                  } salvo${items.length === 1 ? "" : "s"} na sua casa.`}
            </p>
          </a>

          <a
            href="/minha-horta"
            className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-3xl">🌿</p>

            <h2 className="mt-4 text-xl font-black">Minha Horta</h2>

            <p className="mt-2 text-sm text-[#6B715F]">
              {plantsNeedWater.length === 0
                ? "Nenhuma planta precisa de rega agora."
                : `${plantsNeedWater.length} planta${
                    plantsNeedWater.length === 1 ? "" : "s"
                  } precisa${
                    plantsNeedWater.length === 1 ? "" : "m"
                  } de rega.`}
            </p>

            {nextPlant && (
              <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-3 text-sm font-bold text-[#4F6F38]">
                Próxima: {nextPlant.name}
              </p>
            )}
          </a>

          <a
            href="/vida-offline"
            className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-3xl">🌤️</p>

            <h2 className="mt-4 text-xl font-black">Missão offline</h2>

            <p className="mt-2 text-sm text-[#6B715F]">
              {pendingMission
                ? pendingMission.title
                : "Gere uma nova missão para hoje."}
            </p>
          </a>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-sm font-bold text-[#7A8F5A]">
              Áreas do VivaRaiz
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Escolha o que quer cuidar agora
            </h2>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-4">
            <a
              href="/minha-casa"
              className="rounded-[2rem] bg-[#4F6F38] p-7 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-md lg:col-span-2"
            >
              <p className="text-4xl">🏡</p>

              <h3 className="mt-5 text-3xl font-black">Minha Casa</h3>

              <p className="mt-3 max-w-xl text-white/80">
                Cadastre objetos, documentos, remédios, alimentos e tudo que você
                quer lembrar onde está.
              </p>

              <p className="mt-6 font-black">Abrir minha casa →</p>
            </a>

            <a
              href="/minha-cozinha"
              className="rounded-[2rem] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-4xl">🍲</p>

              <h3 className="mt-5 text-2xl font-black">Minha Cozinha</h3>

              <p className="mt-3 text-[#6B715F]">
                Veja o que está vencendo e o que dá para cozinhar.
              </p>
            </a>

            <a
              href="/minha-horta"
              className="rounded-[2rem] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-4xl">🌱</p>

              <h3 className="mt-5 text-2xl font-black">Minha Horta</h3>

              <p className="mt-3 text-[#6B715F]">
                Lembre regas e cuidados com suas plantas.
              </p>
            </a>

            <a
              href="/onde-guardei"
              className="rounded-[2rem] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-4xl">🔎</p>

              <h3 className="mt-5 text-2xl font-black">Onde guardei?</h3>

              <p className="mt-3 text-[#6B715F]">
                Encontre rápido onde colocou cada coisa.
              </p>
            </a>

            <a
              href="/lembretes"
              className="rounded-[2rem] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-4xl">🔔</p>

              <h3 className="mt-5 text-2xl font-black">Lembretes</h3>

              <p className="mt-3 text-[#6B715F]">
                Tarefas, manutenções e coisas importantes.
              </p>
            </a>

            <a
              href="/vida-offline"
              className="rounded-[2rem] bg-[#E3D8BD] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md lg:col-span-2"
            >
              <p className="text-4xl">🌤️</p>

              <h3 className="mt-5 text-3xl font-black">Vida Offline</h3>

              <p className="mt-3 max-w-xl text-[#5B4A2F]">
                Pequenas missões para sair da tela e cuidar da vida real com
                calma.
              </p>

              <p className="mt-6 font-black text-[#4F6F38]">
                Ver missão de hoje →
              </p>
            </a>

            <a
              href="/backup"
              className="rounded-[2rem] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-4xl">📦</p>

              <h3 className="mt-5 text-2xl font-black">Backup</h3>

              <p className="mt-3 text-[#6B715F]">
                Exporte e restaure seus dados locais.
              </p>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}