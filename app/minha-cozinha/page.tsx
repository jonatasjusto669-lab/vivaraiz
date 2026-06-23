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

type IngredientGroup = {
  label: string;
  terms: string[];
};

type RecipeDefinition = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  required: IngredientGroup[];
  tip: string;
};

type RecipeSuggestion = RecipeDefinition & {
  missing: string[];
  matched: string[];
  usesPriorityFood: boolean;
};

const recipes: RecipeDefinition[] = [
  {
    id: "arroz-ovo",
    emoji: "🍚",
    title: "Arroz com ovo",
    description: "Receita rápida para usar arroz e ovo sem complicação.",
    required: [
      { label: "arroz", terms: ["arroz"] },
      { label: "ovo", terms: ["ovo", "ovos"] },
    ],
    tip: "Boa opção para almoço rápido ou janta simples.",
  },
  {
    id: "omelete-tomate",
    emoji: "🍳",
    title: "Omelete com tomate",
    description: "Usa poucos ingredientes e fica pronta rápido.",
    required: [
      { label: "ovo", terms: ["ovo", "ovos"] },
      { label: "tomate", terms: ["tomate"] },
    ],
    tip: "Use primeiro o tomate que estiver mais maduro.",
  },
  {
    id: "macarrao-molho",
    emoji: "🍝",
    title: "Macarrão com molho simples",
    description: "Uma receita boa para aproveitar tomate ou molho pronto.",
    required: [
      { label: "macarrão", terms: ["macarrao", "macarrão", "massa"] },
      { label: "tomate ou molho", terms: ["tomate", "molho"] },
    ],
    tip: "Dá para completar com queijo, frango ou ovo se tiver.",
  },
  {
    id: "vitamina-banana",
    emoji: "🥤",
    title: "Vitamina de banana",
    description: "Boa para usar banana madura antes de estragar.",
    required: [
      { label: "banana", terms: ["banana"] },
      { label: "leite", terms: ["leite"] },
    ],
    tip: "Se a banana estiver muito madura, essa é uma ótima saída.",
  },
  {
    id: "salada-basica",
    emoji: "🥗",
    title: "Salada simples",
    description: "Uma salada rápida com ingredientes frescos.",
    required: [
      { label: "alface", terms: ["alface"] },
      { label: "tomate", terms: ["tomate"] },
    ],
    tip: "Use primeiro as folhas, porque estragam mais rápido.",
  },
  {
    id: "frango-arroz",
    emoji: "🍗",
    title: "Frango com arroz",
    description: "Uma refeição simples usando comida de base.",
    required: [
      { label: "frango", terms: ["frango"] },
      { label: "arroz", terms: ["arroz"] },
    ],
    tip: "Se tiver legumes, dá para misturar e render mais.",
  },
  {
    id: "pao-queijo",
    emoji: "🥪",
    title: "Pão com queijo",
    description: "Lanche rápido para usar pão e queijo.",
    required: [
      { label: "pão", terms: ["pao", "pão"] },
      { label: "queijo", terms: ["queijo"] },
    ],
    tip: "Boa opção para café da manhã ou lanche.",
  },
  {
    id: "batata-ovo",
    emoji: "🥔",
    title: "Batata com ovo",
    description: "Pode ser cozida, frita ou mexida com ovo.",
    required: [
      { label: "batata", terms: ["batata"] },
      { label: "ovo", terms: ["ovo", "ovos"] },
    ],
    tip: "Receita simples e forte para aproveitar batata.",
  },
  {
    id: "feijao-arroz",
    emoji: "🍛",
    title: "Feijão com arroz",
    description: "O básico que resolve muita refeição.",
    required: [
      { label: "feijão", terms: ["feijao", "feijão"] },
      { label: "arroz", terms: ["arroz"] },
    ],
    tip: "Se tiver carne, ovo ou salada, vira prato completo.",
  },
  {
    id: "cuscuz-ovo",
    emoji: "🌽",
    title: "Cuscuz com ovo",
    description: "Uma opção simples, rápida e bem nordestina.",
    required: [
      { label: "cuscuz", terms: ["cuscuz", "flocao", "flocão"] },
      { label: "ovo", terms: ["ovo", "ovos"] },
    ],
    tip: "Boa opção para café, janta ou lanche reforçado.",
  },
  {
    id: "tapioca-queijo",
    emoji: "🫓",
    title: "Tapioca com queijo",
    description: "Lanche rápido usando goma de tapioca e queijo.",
    required: [
      { label: "tapioca", terms: ["tapioca", "goma"] },
      { label: "queijo", terms: ["queijo"] },
    ],
    tip: "Dá para fazer doce ou salgada dependendo do que tiver.",
  },
];

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

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

function foodMatchesTerms(food: FoodItem, terms: string[]) {
  const foodName = normalizeText(food.name);

  return terms.some((term) => foodName.includes(normalizeText(term)));
}

function hasIngredient(foods: FoodItem[], group: IngredientGroup) {
  return foods.some((food) => foodMatchesTerms(food, group.terms));
}

function recipeUsesPriorityFood(
  recipe: RecipeDefinition,
  priorityFoods: FoodItem[]
) {
  return priorityFoods.some((food) =>
    recipe.required.some((group) => foodMatchesTerms(food, group.terms))
  );
}

function getRecipeSuggestions(
  foods: FoodItem[],
  priorityFoods: FoodItem[]
): {
  possible: RecipeSuggestion[];
  almost: RecipeSuggestion[];
} {
  const possible: RecipeSuggestion[] = [];
  const almost: RecipeSuggestion[] = [];

  recipes.forEach((recipe) => {
    const matched: string[] = [];
    const missing: string[] = [];

    recipe.required.forEach((group) => {
      if (hasIngredient(foods, group)) {
        matched.push(group.label);
      } else {
        missing.push(group.label);
      }
    });

    const suggestion: RecipeSuggestion = {
      ...recipe,
      matched,
      missing,
      usesPriorityFood: recipeUsesPriorityFood(recipe, priorityFoods),
    };

    if (missing.length === 0) {
      possible.push(suggestion);
    }

    if (missing.length === 1) {
      almost.push(suggestion);
    }
  });

  const sortRecipes = (a: RecipeSuggestion, b: RecipeSuggestion) => {
    if (a.usesPriorityFood !== b.usesPriorityFood) {
      return a.usesPriorityFood ? -1 : 1;
    }

    return b.matched.length - a.matched.length;
  };

  return {
    possible: possible.sort(sortRecipes).slice(0, 5),
    almost: almost.sort(sortRecipes).slice(0, 4),
  };
}

export default function MinhaCozinhaPage() {
  const router = useRouter();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [userId, setUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<FoodFilter>("prioridade");
  const [search, setSearch] = useState("");
  const [addingToShoppingKey, setAddingToShoppingKey] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function loadFoods() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const currentUserId = sessionData.session.user.id;

      setUserId(currentUserId);

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

  const recipeSuggestions = useMemo(() => {
    return getRecipeSuggestions(foods, priorityFoods);
  }, [foods, priorityFoods]);

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

  const mainFood = priorityFoods[0];

  async function addFoodToShoppingList(food: FoodItem) {
    if (!userId) {
      setMessage("Você precisa estar logado para adicionar à lista.");
      return;
    }

    setMessage("");
    setAddingToShoppingKey(food.id);

    const { error } = await supabase.from("shopping_items").insert({
      user_id: userId,
      name: food.name,
      category: "mercado",
      quantity: food.quantity || null,
      notes: `Reposição adicionada pela Minha Cozinha. Local atual: ${
        food.location || "não informado"
      }.`,
      purchased: false,
    });

    setAddingToShoppingKey(null);

    if (error) {
      setMessage(`Erro ao adicionar na lista de compras: ${error.message}`);
      return;
    }

    setMessage(`${food.name} foi adicionado à Lista de Compras.`);
  }

  async function addIngredientToShoppingList(ingredient: string) {
    if (!userId) {
      setMessage("Você precisa estar logado para adicionar à lista.");
      return;
    }

    const key = `ingredient-${ingredient}`;

    setMessage("");
    setAddingToShoppingKey(key);

    const { error } = await supabase.from("shopping_items").insert({
      user_id: userId,
      name: ingredient,
      category: "mercado",
      quantity: null,
      notes: "Ingrediente sugerido pela Minha Cozinha.",
      purchased: false,
    });

    setAddingToShoppingKey(null);

    if (error) {
      setMessage(`Erro ao adicionar ingrediente: ${error.message}`);
      return;
    }

    setMessage(`${ingredient} foi adicionado à Lista de Compras.`);
  }

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

  function RecipeCard({ recipe }: { recipe: RecipeSuggestion }) {
    const missingIngredient = recipe.missing[0];
    const ingredientKey = missingIngredient
      ? `ingredient-${missingIngredient}`
      : "";

    return (
      <article className="card-touch rounded-[2rem] bg-[#F7F3EA] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl">
            {recipe.emoji}
          </div>

          <div className="min-w-0 flex-1">
            {recipe.usesPriorityFood && (
              <span className="inline-block rounded-full bg-[#E7EED8] px-3 py-1 text-xs font-black text-[#4F6F38]">
                Usa alimento em atenção
              </span>
            )}

            <h3 className="mt-3 text-xl font-black">{recipe.title}</h3>

            <p className="mt-2 text-sm text-[#6B715F]">{recipe.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {recipe.matched.map((ingredient) => (
                <span
                  key={ingredient}
                  className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#4F6F38]"
                >
                  ✅ {ingredient}
                </span>
              ))}

              {recipe.missing.map((ingredient) => (
                <span
                  key={ingredient}
                  className="rounded-full bg-[#F3E7C5] px-3 py-2 text-xs font-black text-[#7A5318]"
                >
                  Falta: {ingredient}
                </span>
              ))}
            </div>

            <p className="mt-4 rounded-2xl bg-white p-3 text-sm text-[#5F6B55]">
              💡 {recipe.tip}
            </p>

            {missingIngredient && (
              <button
                onClick={() => addIngredientToShoppingList(missingIngredient)}
                disabled={addingToShoppingKey === ingredientKey}
                className="mt-4 rounded-full bg-[#4F6F38] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingToShoppingKey === ingredientKey
                  ? "Adicionando..."
                  : `🛒 Comprar ${missingIngredient}`}
              </button>
            )}
          </div>
        </div>
      </article>
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

            <div className="mt-4 grid gap-2">
              <button
                onClick={() => addFoodToShoppingList(food)}
                disabled={addingToShoppingKey === food.id}
                className="rounded-full bg-[#4F6F38] px-4 py-3 text-center text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingToShoppingKey === food.id
                  ? "Adicionando..."
                  : "🛒 Comprar novamente"}
              </button>

              <a
                href="/minha-casa"
                className="block rounded-full bg-[#E3D8BD] px-4 py-3 text-center text-sm font-black text-[#5B4A2F]"
              >
                Editar na Minha Casa
              </a>
            </div>
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
              Veja o que vence primeiro e descubra receitas com o que você já
              tem.
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
          <section className="mt-5 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#4F6F38] shadow-sm">
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

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => addFoodToShoppingList(mainFood)}
                  disabled={addingToShoppingKey === mainFood.id}
                  className="rounded-full bg-white px-6 py-4 text-center font-black text-[#4F6F38] transition hover:bg-[#EFE8DA] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingToShoppingKey === mainFood.id
                    ? "Adicionando..."
                    : "🛒 Comprar novamente"}
                </button>

                <a
                  href="/minha-casa"
                  className="rounded-full border border-white/50 px-6 py-4 text-center font-black text-white transition hover:bg-white/10"
                >
                  Adicionar comida
                </a>
              </div>
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
          <SummaryCard
            emoji="🍽️"
            value={recipeSuggestions.possible.length}
            label="receitas"
          />
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm md:p-6">
          <div>
            <p className="text-sm font-bold text-[#7A8F5A]">
              Receitas inteligentes
            </p>

            <h2 className="mt-1 text-2xl font-black">
              🍽️ Dá para fazer com o que você tem
            </h2>

            <p className="mt-2 text-sm text-[#6B715F]">
              O VivaRaiz prioriza receitas que usam alimentos vencidos, vencendo
              hoje ou próximos da validade.
            </p>
          </div>

          {recipeSuggestions.possible.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#F7F3EA] p-5">
              <p className="text-3xl">🧺</p>

              <h3 className="mt-3 text-xl font-black">
                Ainda não encontrei uma receita completa
              </h3>

              <p className="mt-2 text-sm text-[#6B715F]">
                Cadastre mais alimentos em Minha Casa para aparecerem sugestões
                melhores aqui.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {recipeSuggestions.possible.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}

          {recipeSuggestions.almost.length > 0 && (
            <div className="mt-7">
              <h3 className="text-xl font-black">
                🛒 Falta só 1 item para fazer
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {recipeSuggestions.almost.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>
          )}
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

              <h2 className="mt-4 text-2xl font-black">Nada encontrado</h2>

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

            <a
              href="/lista-compras"
              className="mt-5 inline-block rounded-full bg-[#E3D8BD] px-5 py-3 text-sm font-black text-[#5B4A2F]"
            >
              Abrir Lista de Compras
            </a>
          </section>
        )}
      </div>
    </main>
  );
}