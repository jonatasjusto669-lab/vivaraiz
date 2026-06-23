"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = {
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
  place: string;
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

type ShoppingItem = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: string | null;
  notes: string | null;
  purchased: boolean;
  created_at: string;
  updated_at: string | null;
};

function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getDiffInDays(dateString: string) {
  const today = getTodayStart();
  const date = new Date(`${dateString}T00:00:00`);
  const diff = date.getTime() - today.getTime();

  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Sem data";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("pt-BR");
}

function getUrgencyText(dateString: string | null) {
  if (!dateString) return "Sem data";

  const diff = getDiffInDays(dateString);

  if (diff < 0) return `Atrasado há ${Math.abs(diff)} dia${Math.abs(diff) === 1 ? "" : "s"}`;
  if (diff === 0) return "É hoje";
  if (diff === 1) return "Amanhã";

  return `Em ${diff} dias`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("você");
  const [items, setItems] = useState<Item[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [missions, setMissions] = useState<OfflineMission[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const user = sessionData.session.user;
      const currentUserId = user.id;

      setUserName(user.user_metadata?.name || "você");

      const [itemsResponse, plantsResponse, missionsResponse, shoppingResponse] =
        await Promise.all([
          supabase
            .from("items")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false }),

          supabase
            .from("plants")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false }),

          supabase
            .from("offline_missions")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false }),

          supabase
            .from("shopping_items")
            .select("*")
            .eq("user_id", currentUserId)
            .order("purchased", { ascending: true })
            .order("created_at", { ascending: false }),
        ]);

      if (itemsResponse.error) {
        setMessage(`Erro ao carregar itens: ${itemsResponse.error.message}`);
      }

      if (plantsResponse.error) {
        setMessage(`Erro ao carregar plantas: ${plantsResponse.error.message}`);
      }

      if (missionsResponse.error) {
        setMessage(`Erro ao carregar missões: ${missionsResponse.error.message}`);
      }

      if (shoppingResponse.error) {
        setMessage(`Erro ao carregar compras: ${shoppingResponse.error.message}`);
      }

      const loadedItems = (itemsResponse.data || []) as Item[];
      const loadedPlants = (plantsResponse.data || []) as Plant[];
      const loadedMissions = (missionsResponse.data || []) as OfflineMission[];
      const loadedShoppingItems = (shoppingResponse.data || []) as ShoppingItem[];

      setItems(loadedItems);
      setPlants(loadedPlants);
      setMissions(loadedMissions);
      setShoppingItems(loadedShoppingItems);

      localStorage.setItem("vivaraiz-items", JSON.stringify(loadedItems));
      localStorage.setItem("vivaraiz-plants", JSON.stringify(loadedPlants));
      localStorage.setItem("vivaraiz-missions", JSON.stringify(loadedMissions));
      localStorage.setItem(
        "vivaraiz-shopping-items",
        JSON.stringify(loadedShoppingItems)
      );

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const foodItems = useMemo(() => {
    return items.filter((item) => item.category === "comida");
  }, [items]);

  const expiringFoods = useMemo(() => {
    return foodItems.filter((item) => {
      if (!item.expiration_date) return false;

      const diff = getDiffInDays(item.expiration_date);
      return diff <= 7;
    });
  }, [foodItems]);

  const reminderItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.reminder_date) return false;

      return getDiffInDays(item.reminder_date) <= 7;
    });
  }, [items]);

  const plantsToWater = useMemo(() => {
    return plants.filter((plant) => {
      if (!plant.next_watering_date) return false;

      return getDiffInDays(plant.next_watering_date) <= 0;
    });
  }, [plants]);

  const pendingShoppingItems = useMemo(() => {
    return shoppingItems.filter((item) => !item.purchased);
  }, [shoppingItems]);

  const completedMissions = useMemo(() => {
    return missions.filter((mission) => mission.completed);
  }, [missions]);

  const mainAction = useMemo(() => {
    if (pendingShoppingItems.length > 0) {
      return {
        emoji: "🛒",
        title: "Você tem compras pendentes",
        description: `${pendingShoppingItems.length} item${
          pendingShoppingItems.length === 1 ? "" : "s"
        } na sua lista de compras.`,
        href: "/lista-compras",
        button: "Ver lista",
      };
    }

    if (expiringFoods.length > 0) {
      return {
        emoji: "🍲",
        title: "Use uma comida antes de vencer",
        description: `${expiringFoods.length} alimento${
          expiringFoods.length === 1 ? "" : "s"
        } precisam de atenção na cozinha.`,
        href: "/minha-cozinha",
        button: "Abrir cozinha",
      };
    }

    if (plantsToWater.length > 0) {
      return {
        emoji: "🌱",
        title: "Tem planta para regar",
        description: `${plantsToWater.length} planta${
          plantsToWater.length === 1 ? "" : "s"
        } precisam de água hoje.`,
        href: "/minha-horta",
        button: "Regar plantas",
      };
    }

    if (reminderItems.length > 0) {
      return {
        emoji: "🔔",
        title: "Você tem lembretes próximos",
        description: `${reminderItems.length} lembrete${
          reminderItems.length === 1 ? "" : "s"
        } para verificar.`,
        href: "/lembretes",
        button: "Ver lembretes",
      };
    }

    return {
      emoji: "🌱",
      title: "Tudo tranquilo por enquanto",
      description:
        "Continue cadastrando sua casa, sua cozinha, suas plantas e suas compras.",
      href: "/minha-casa",
      button: "Adicionar algo",
    };
  }, [pendingShoppingItems, expiringFoods, plantsToWater, reminderItems]);

  function StatCard({
    emoji,
    value,
    label,
    href,
  }: {
    emoji: string;
    value: number;
    label: string;
    href: string;
  }) {
    return (
      <a href={href} className="card-touch rounded-[1.5rem] bg-white p-4 shadow-sm">
        <p className="text-2xl">{emoji}</p>

        <p className="mt-3 text-2xl font-black">{value}</p>

        <p className="mt-1 text-sm text-[#6B715F]">{label}</p>
      </a>
    );
  }

  function QuickCard({
    emoji,
    title,
    description,
    href,
  }: {
    emoji: string;
    title: string;
    description: string;
    href: string;
  }) {
    return (
      <a href={href} className="card-touch rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F3EA] text-3xl">
            {emoji}
          </div>

          <div>
            <h2 className="text-xl font-black">{title}</h2>

            <p className="mt-2 text-sm text-[#6B715F]">{description}</p>
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

          <h1 className="mt-4 text-2xl font-black">
            Carregando seu VivaRaiz...
          </h1>

          <p className="mt-2 text-[#6B715F]">
            Buscando sua casa, horta, cozinha e compras.
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
            <p className="text-xl font-black md:text-2xl">🌱 VivaRaiz</p>

            <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Olá, {userName}
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Veja o que precisa da sua atenção hoje.
            </p>
          </div>

          <a
            href="/configuracoes"
            className="hidden rounded-full border border-[#7A8F5A] px-5 py-3 text-center font-bold text-[#4F6F38] md:block"
          >
            Configurações
          </a>
        </header>

        {message && (
          <section className="mt-5 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#8A3A2C] shadow-sm">
            {message}
          </section>
        )}

        <section className="mt-6 rounded-[2.2rem] bg-[#4F6F38] p-6 text-white shadow-sm md:p-8">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            Ação recomendada
          </p>

          <p className="mt-6 text-6xl">{mainAction.emoji}</p>

          <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
            {mainAction.title}
          </h2>

          <p className="mt-3 max-w-2xl text-white/80">
            {mainAction.description}
          </p>

          <a
            href={mainAction.href}
            className="mt-6 inline-block rounded-full bg-white px-6 py-4 text-center font-black text-[#4F6F38] transition hover:bg-[#EFE8DA]"
          >
            {mainAction.button}
          </a>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            emoji="📦"
            value={items.length}
            label="itens salvos"
            href="/minha-casa"
          />

          <StatCard
            emoji="🍲"
            value={expiringFoods.length}
            label="comidas em atenção"
            href="/minha-cozinha"
          />

          <StatCard
            emoji="🌱"
            value={plantsToWater.length}
            label="plantas para regar"
            href="/minha-horta"
          />

          <StatCard
            emoji="🛒"
            value={pendingShoppingItems.length}
            label="compras pendentes"
            href="/lista-compras"
          />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <QuickCard
            emoji="🏡"
            title="Minha Casa"
            description="Cadastre objetos, documentos, remédios, alimentos e coisas importantes."
            href="/minha-casa"
          />

          <QuickCard
            emoji="🍲"
            title="Minha Cozinha"
            description="Veja alimentos vencendo e use primeiro o que precisa."
            href="/minha-cozinha"
          />

          <QuickCard
            emoji="🛒"
            title="Lista de Compras"
            description="Anote o que falta comprar e marque quando já comprou."
            href="/lista-compras"
          />

          <QuickCard
            emoji="🌱"
            title="Minha Horta"
            description="Cuide das plantas e veja o que precisa ser regado."
            href="/minha-horta"
          />

          <QuickCard
            emoji="🔔"
            title="Lembretes"
            description="Veja datas importantes, manutenções e coisas próximas."
            href="/lembretes"
          />

          <QuickCard
            emoji="🔎"
            title="Onde Guardei?"
            description="Encontre rápido onde você guardou cada coisa."
            href="/onde-guardei"
          />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <p className="text-3xl">🛒</p>

            <h2 className="mt-4 text-2xl font-black">Próximas compras</h2>

            {pendingShoppingItems.length === 0 ? (
              <p className="mt-2 text-sm text-[#6B715F]">
                Nenhuma compra pendente.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {pendingShoppingItems.slice(0, 3).map((item) => (
                  <a
                    key={item.id}
                    href="/lista-compras"
                    className="block rounded-2xl bg-[#F7F3EA] p-4"
                  >
                    <p className="font-black">{item.name}</p>

                    {item.quantity && (
                      <p className="mt-1 text-sm text-[#6B715F]">
                        {item.quantity}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <p className="text-3xl">🍲</p>

            <h2 className="mt-4 text-2xl font-black">Cozinha</h2>

            {expiringFoods.length === 0 ? (
              <p className="mt-2 text-sm text-[#6B715F]">
                Nenhuma comida vencendo em breve.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {expiringFoods.slice(0, 3).map((food) => (
                  <a
                    key={food.id}
                    href="/minha-cozinha"
                    className="block rounded-2xl bg-[#F7F3EA] p-4"
                  >
                    <p className="font-black">{food.name}</p>

                    <p className="mt-1 text-sm text-[#6B715F]">
                      {getUrgencyText(food.expiration_date)} •{" "}
                      {formatDate(food.expiration_date)}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <p className="text-3xl">🌱</p>

            <h2 className="mt-4 text-2xl font-black">Horta</h2>

            {plantsToWater.length === 0 ? (
              <p className="mt-2 text-sm text-[#6B715F]">
                Nenhuma planta precisa de água agora.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {plantsToWater.slice(0, 3).map((plant) => (
                  <a
                    key={plant.id}
                    href="/minha-horta"
                    className="block rounded-2xl bg-[#F7F3EA] p-4"
                  >
                    <p className="font-black">{plant.name}</p>

                    <p className="mt-1 text-sm text-[#6B715F]">
                      {getUrgencyText(plant.next_watering_date)} •{" "}
                      {formatDate(plant.next_watering_date)}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-3xl">🌤️</p>

          <h2 className="mt-4 text-2xl font-black">Vida Offline</h2>

          <p className="mt-2 text-[#6B715F]">
            Você já concluiu {completedMissions.length} missão
            {completedMissions.length === 1 ? "" : "ões"} offline.
          </p>

          <a
            href="/vida-offline"
            className="mt-5 inline-block rounded-full bg-[#E3D8BD] px-5 py-3 text-sm font-black text-[#5B4A2F]"
          >
            Ver missões
          </a>
        </section>
      </div>
    </main>
  );
}