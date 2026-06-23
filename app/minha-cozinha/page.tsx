"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FoodItem = {
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

type FoodFilter = "prioridade" | "vencidos" | "hoje" | "semana" | "todos";

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
  if (!dateString) return "Sem validade";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("pt-BR");
}

function getExpirationLabel(dateString: string | null) {
  if (!dateString) return "Sem validade";

  const diff = getDateDiffInDays(dateString);

  if (diff < 0) {
    return `Venceu há ${Math.abs(diff)} dia${
      Math.abs(diff) === 1 ? "" : "s"
    }`;
  }

  if (diff === 0) return "Vence hoje";
  if (diff === 1) return "Vence amanhã";
  if (diff <= 7) return `Vence em ${diff} dias`;

  return `Vence em ${diff} dias`;
}

function getExpirationStyle(dateString: string | null) {
  if (!dateString) return "bg-[#F7F3EA] text-[#6B715F]";

  const diff = getDateDiffInDays(dateString);

  if (diff < 0) return "bg-[#F2DED8] text-[#8A3A2C]";
  if (diff === 0) return "bg-[#F2DED8] text-[#8A3A2C]";
  if (diff <= 3) return "bg-[#F3E7C5] text-[#7A5318]";
  if (diff <= 7) return "bg-[#E7EED8] text-[#4F6F38]";

  return "bg-[#F7F3EA] text-[#6B715F]";
}

function hasFood(foods: FoodItem[], word: string) {
  return foods.some((food) => food.name.toLowerCase().includes(word));
}

function getSuggestions(foods: FoodItem[]) {
  const suggestions: string[] = [];

  if (hasFood(foods, "ovo") && hasFood(foods, "arroz")) {
    suggestions.push("Arroz com ovo simples.");
  }

  if (hasFood(foods, "tomate") && hasFood(foods, "ovo")) {
    suggestions.push("Omelete com tomate.");
  }

  if (hasFood(foods, "macarrão") || hasFood(foods, "macarrao")) {
    suggestions.push("Macarrão simples com o que tiver em casa.");
  }

  if (hasFood(foods, "frango") && hasFood(foods, "arroz")) {
    suggestions.push("Frango com arroz.");
  }

  if (hasFood(foods, "queijo") && hasFood(foods, "pão")) {
    suggestions.push("Pão com queijo.");
  }

  if (hasFood(foods, "alface") && hasFood(foods, "tomate")) {
    suggestions.push("Salada de alface com tomate.");
  }

  if (hasFood(foods, "batata")) {
    suggestions.push("Batata cozida, frita ou assada.");
  }

  if (hasFood(foods, "banana")) {
    suggestions.push("Vitamina de banana ou lanche rápido.");
  }

  if (suggestions.length === 0 && foods.length > 0) {
    suggestions.push(
      "Use primeiro o alimento com validade mais próxima em uma receita simples."
    );
  }

  return suggestions;
}

export default function MinhaCozinhaPage() {
  const router = useRouter();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<FoodFilter>("prioridade");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadFoods() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const currentUserId = sessionData.session.user.id;

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("category", "comida")
        .order("expiration_date", { ascending: true, nullsFirst: false });

      if (error) {
        setMessage(`Erro ao carregar cozinha: ${error.message}`);
        setLoading(false);
        return;
      }

      setFoods((data || []) as FoodItem[]);
      setLoading(false);
    }

    loadFoods();
  }, [router]);

  const expiredFoods = useMemo(() => {
    return foods.filter((food) => {
      if (!food.expiration_date) return false;

      return getDateDiffInDays(food.expiration_date) < 0;
    });
  }, [foods]);

  const todayFoods = useMemo(() => {
    return foods.filter((food) => {
      if (!food.expiration_date) return false;

      return getDateDiffInDays(food.expiration_date) === 0;
    });
  }, [foods]);

  const tomorrowFoods = useMemo(() => {
    return foods.filter((food) => {
      if (!food.expiration_date) return false;

      return getDateDiffInDays(food.expiration_date) === 1;
    });
  }, [foods]);

  const weekFoods = useMemo(() => {
    return foods.filter((food) => {
      if (!food.expiration_date) return false;

      const diff = getDateDiffInDays(food.expiration_date);
      return diff >= 2 && diff <= 7;
    });
  }, [foods]);

  const laterFoods = useMemo(() => {
    return foods.filter((food) => {
      if (!food.expiration_date) return false;

      return getDateDiffInDays(food.expiration_date) > 7;
    });
  }, [foods]);

  const noDateFoods = useMemo(() => {
    return foods.filter((food) => !food.expiration_date);
  }, [foods]);

  const priorityFoods = useMemo(() => {
    return [...expiredFoods, ...todayFoods, ...tomorrowFoods, ...weekFoods];
  }, [expiredFoods, todayFoods, tomorrowFoods, weekFoods]);

  const filteredFoods = useMemo(() => {
    let baseFoods: FoodItem[] = [];

    if (filter === "prioridade") {
      baseFoods = priorityFoods;
    }

    if (filter === "vencidos") {
      baseFoods = expiredFoods;
    }

    if (filter === "hoje") {
      baseFoods = [...todayFoods, ...tomorrowFoods];
    }

    if (filter === "semana") {
      baseFoods = weekFoods;
    }

    if (filter === "todos") {
      baseFoods = foods;
    }

    const searchText = search.trim().toLowerCase();

    if (!searchText) return baseFoods;

    return baseFoods.filter((food) => {
      return (
        food.name.toLowerCase().includes(searchText) ||
        food.location?.toLowerCase().includes(searchText) ||
        food.quantity?.toLowerCase().includes(searchText) ||
        food.notes?.toLowerCase().includes(searchText)
      );
    });
  }, [
    filter,
    foods,
    priorityFoods,
    expiredFoods,
    todayFoods,
    tomorrowFoods,
    weekFoods,
    search,
  ]);

  const suggestions = useMemo(() => {
    return getSuggestions(priorityFoods.length > 0 ? priorityFoods : foods);
  }, [priorityFoods, foods]);

  const mainFood = priorityFoods[0];

  function FilterButton({
    value,
    label,
    emoji,
  }: {
    value: FoodFilter;
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

  function FoodCard({ food }: { food: FoodItem }) {
    return (
      <article className="card-touch rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F3EA] text-3xl">
            🍲
          </div>

          <div className="min-w-0 flex-1">
            <span
              className={`inline-block rounded-full px-4 py-2 text-xs font-black ${getExpirationStyle(
                food.expiration_date
              )}`}
            >
              {getExpirationLabel(food.expiration_date)}
            </span>

            <h3 className="mt-4 text-2xl font-black leading-tight">
              {food.name}
            </h3>

            <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-3 text-sm font-bold text-[#4F6F38]">
              📍 {food.location || "Local não informado"}
            </p>

            <div className="mt-3 space-y-1 text-sm text-[#6B715F]">
              {food.quantity && <p>Quantidade: {food.quantity}</p>}

              <p>Validade: {formatDate(food.expiration_date)}</p>
            </div>

            {food.notes && (
              <p className="mt-3 rounded-2xl bg-[#FBF8F0] p-3 text-sm text-[#5F6B55]">
                {food.notes}
              </p>
            )}

            <a
              href="/minha-casa"
              className="mt-4 block rounded-full bg-[#E3D8BD] px-4 py-3 text-center text-sm font-black text-[#5B4A2F]"
            >
              Editar na Minha Casa
            </a>
          </div>
        </div>
      </article>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🍲</p>

          <h1 className="mt-4 text-2xl font-black">
            Carregando Minha Cozinha...
          </h1>

          <p className="mt-2 text-[#6B715F]">
            Buscando seus alimentos no Supabase.
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
            <a href="/dashboard" className="text-xl font-black md:text-2xl">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Minha Cozinha
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Veja o que vence primeiro e use melhor a comida que você já tem.
            </p>
          </div>

          <a
            href="/dashboard"
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

        <section className="mt-6 rounded-[2.2rem] bg-[#4F6F38] p-6 text-white shadow-sm md:p-8">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            Cozinha inteligente
          </p>

          {mainFood ? (
            <div className="mt-6">
              <p className="text-6xl">🍅</p>

              <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
                Use {mainFood.name} primeiro.
              </h2>

              <p className="mt-3 max-w-2xl text-white/80">
                {getExpirationLabel(mainFood.expiration_date)}. Ele está em{" "}
                {mainFood.location || "um local não informado"}.
              </p>

              <a
                href="/minha-casa"
                className="mt-6 inline-block rounded-full bg-white px-6 py-4 text-center font-black text-[#4F6F38] transition hover:bg-[#EFE8DA]"
              >
                Adicionar comida
              </a>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-6xl">🍲</p>

              <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
                Cadastre alimentos para evitar desperdício.
              </h2>

              <p className="mt-3 max-w-2xl text-white/80">
                Coloque comida na categoria “Comida” em Minha Casa para aparecer
                aqui.
              </p>

              <a
                href="/minha-casa"
                className="mt-6 inline-block rounded-full bg-white px-6 py-4 text-center font-black text-[#4F6F38] transition hover:bg-[#EFE8DA]"
              >
                Cadastrar comida
              </a>
            </div>
          )}
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard emoji="🍲" value={foods.length} label="alimentos" />
          <SummaryCard emoji="⚠️" value={expiredFoods.length} label="vencidos" />
          <SummaryCard
            emoji="⏰"
            value={todayFoods.length + tomorrowFoods.length}
            label="hoje/amanhã"
          />
          <SummaryCard emoji="📅" value={weekFoods.length} label="semana" />
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm md:p-6">
          <div>
            <p className="text-sm font-bold text-[#7A8F5A]">
              Sugestões simples
            </p>

            <h2 className="mt-1 text-2xl font-black">
              O que dá para fazer?
            </h2>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {suggestions.length === 0 ? (
              <p className="rounded-2xl bg-[#F7F3EA] p-4 text-[#6B715F]">
                Cadastre alimentos em Minha Casa para receber sugestões.
              </p>
            ) : (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="rounded-2xl bg-[#F7F3EA] p-4"
                >
                  <p className="font-black">🍽️ {suggestion}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              <FilterButton
                value="prioridade"
                label="Prioridade"
                emoji="🔥"
              />

              <FilterButton value="vencidos" label="Vencidos" emoji="⚠️" />

              <FilterButton value="hoje" label="Hoje" emoji="⏰" />

              <FilterButton value="semana" label="Semana" emoji="📅" />

              <FilterButton value="todos" label="Todos" emoji="🍲" />
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-bold">
            Buscar alimento
          </label>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, local ou observação..."
            className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
          />

          <p className="mt-4 text-sm text-[#6B715F]">
            {filteredFoods.length} alimento
            {filteredFoods.length === 1 ? "" : "s"} encontrado
            {filteredFoods.length === 1 ? "" : "s"}.
          </p>
        </section>

        <section className="mt-5">
          {foods.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-5xl">🍲</p>

              <h2 className="mt-4 text-2xl font-black">
                Nenhum alimento cadastrado
              </h2>

              <p className="mt-2 text-[#6B715F]">
                Vá em Minha Casa e cadastre itens na categoria comida.
              </p>

              <a
                href="/minha-casa"
                className="mt-6 inline-block rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white"
              >
                Cadastrar comida
              </a>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-5xl">🔎</p>

              <h2 className="mt-4 text-2xl font-black">
                Nada encontrado
              </h2>

              <p className="mt-2 text-[#6B715F]">
                Tente outro filtro ou outra busca.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}
        </section>

        {(laterFoods.length > 0 || noDateFoods.length > 0) && (
          <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
            <p className="text-3xl">📦</p>

            <h2 className="mt-4 text-2xl font-black">
              Outros alimentos salvos
            </h2>

            <p className="mt-2 text-[#6B715F]">
              {laterFoods.length} alimento
              {laterFoods.length === 1 ? "" : "s"} vencem depois e{" "}
              {noDateFoods.length} estão sem validade cadastrada.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}