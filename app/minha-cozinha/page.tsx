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
  if (!dateString) return "Sem validade cadastrada";

  const diff = getDateDiffInDays(dateString);

  if (diff < 0) return `Venceu há ${Math.abs(diff)} dia${Math.abs(diff) === 1 ? "" : "s"}`;
  if (diff === 0) return "Vence hoje";
  if (diff === 1) return "Vence amanhã";
  if (diff <= 7) return `Vence em ${diff} dias`;

  return `Vence em ${diff} dias`;
}

function getExpirationColor(dateString: string | null) {
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
      "Escolha o alimento que vence primeiro e tente usar ele hoje em uma receita simples."
    );
  }

  return suggestions;
}

export default function MinhaCozinhaPage() {
  const router = useRouter();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

  const suggestions = useMemo(() => {
    return getSuggestions(priorityFoods.length > 0 ? priorityFoods : foods);
  }, [priorityFoods, foods]);

  function FoodCard({ food }: { food: FoodItem }) {
    return (
      <article className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span
              className={`inline-block rounded-full px-4 py-2 text-xs font-black ${getExpirationColor(
                food.expiration_date
              )}`}
            >
              {getExpirationLabel(food.expiration_date)}
            </span>

            <h3 className="mt-4 text-2xl font-black">{food.name}</h3>

            <p className="mt-2 text-[#6B715F]">
              📍 {food.location || "Local não informado"}
            </p>

            {food.quantity && (
              <p className="mt-1 text-[#6B715F]">
                Quantidade: {food.quantity}
              </p>
            )}

            <p className="mt-1 text-[#6B715F]">
              Validade: {formatDate(food.expiration_date)}
            </p>

            {food.notes && (
              <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-3 text-sm text-[#5F6B55]">
                {food.notes}
              </p>
            )}
          </div>

          <a
            href="/minha-casa"
            className="rounded-full bg-[#E3D8BD] px-4 py-2 text-center text-sm font-bold text-[#5B4A2F]"
          >
            Editar
          </a>
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
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-8 text-[#2F3A2F]">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/dashboard" className="text-2xl font-black">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-6 text-4xl font-black">Minha Cozinha</h1>

            <p className="mt-2 text-[#6B715F]">
              Veja o que está vencendo primeiro e use melhor o que você já tem
              em casa.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/minha-casa"
              className="rounded-full bg-[#4F6F38] px-5 py-3 text-center font-bold text-white"
            >
              Adicionar comida
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
          <section className="mt-6 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#8A3A2C] shadow-sm">
            {message}
          </section>
        )}

        <section className="mt-10 grid gap-5 md:grid-cols-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🍅</p>

            <h2 className="mt-4 text-3xl font-black">{foods.length}</h2>

            <p className="mt-1 text-[#6B715F]">alimentos cadastrados</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">⚠️</p>

            <h2 className="mt-4 text-3xl font-black">{expiredFoods.length}</h2>

            <p className="mt-1 text-[#6B715F]">vencidos</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">⏰</p>

            <h2 className="mt-4 text-3xl font-black">
              {todayFoods.length + tomorrowFoods.length}
            </h2>

            <p className="mt-1 text-[#6B715F]">vencem hoje/amanhã</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">📅</p>

            <h2 className="mt-4 text-3xl font-black">{weekFoods.length}</h2>

            <p className="mt-1 text-[#6B715F]">vencem esta semana</p>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-[#4F6F38] p-7 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">
            Sugestões simples
          </p>

          <h2 className="mt-3 text-3xl font-black">
            O que dá para fazer com o que você já tem?
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {suggestions.length === 0 ? (
              <p className="rounded-2xl bg-white/10 p-4 text-white/85">
                Cadastre alimentos em Minha Casa para receber sugestões.
              </p>
            ) : (
              suggestions.map((suggestion) => (
                <p
                  key={suggestion}
                  className="rounded-2xl bg-white/10 p-4 font-bold text-white"
                >
                  🍲 {suggestion}
                </p>
              ))
            )}
          </div>
        </section>

        {foods.length === 0 ? (
          <section className="mt-8 rounded-[2rem] bg-white p-8 text-center shadow-sm">
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
          </section>
        ) : (
          <section className="mt-8 space-y-8">
            {expiredFoods.length > 0 && (
              <div>
                <h2 className="text-2xl font-black">⚠️ Vencidos</h2>

                <div className="mt-4 grid gap-4">
                  {expiredFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              </div>
            )}

            {todayFoods.length > 0 && (
              <div>
                <h2 className="text-2xl font-black">⏰ Vence hoje</h2>

                <div className="mt-4 grid gap-4">
                  {todayFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              </div>
            )}

            {tomorrowFoods.length > 0 && (
              <div>
                <h2 className="text-2xl font-black">📅 Vence amanhã</h2>

                <div className="mt-4 grid gap-4">
                  {tomorrowFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              </div>
            )}

            {weekFoods.length > 0 && (
              <div>
                <h2 className="text-2xl font-black">🗓️ Vence esta semana</h2>

                <div className="mt-4 grid gap-4">
                  {weekFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              </div>
            )}

            {laterFoods.length > 0 && (
              <div>
                <h2 className="text-2xl font-black">🌱 Depois</h2>

                <div className="mt-4 grid gap-4">
                  {laterFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              </div>
            )}

            {noDateFoods.length > 0 && (
              <div>
                <h2 className="text-2xl font-black">📦 Sem validade</h2>

                <div className="mt-4 grid gap-4">
                  {noDateFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}