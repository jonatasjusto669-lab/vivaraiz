"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ShoppingCategory =
  | "mercado"
  | "limpeza"
  | "remedio"
  | "horta"
  | "casa"
  | "outro";

type ShoppingItem = {
  id: string;
  user_id: string;
  name: string;
  category: ShoppingCategory;
  quantity: string | null;
  notes: string | null;
  purchased: boolean;
  created_at: string;
  updated_at: string | null;
};

type FilterType = "pendentes" | "comprados" | "todos";

const categories: { value: ShoppingCategory; label: string; emoji: string }[] =
  [
    { value: "mercado", label: "Mercado", emoji: "🛒" },
    { value: "limpeza", label: "Limpeza", emoji: "🧼" },
    { value: "remedio", label: "Remédio", emoji: "💊" },
    { value: "horta", label: "Horta", emoji: "🌱" },
    { value: "casa", label: "Casa", emoji: "🏡" },
    { value: "outro", label: "Outro", emoji: "📦" },
  ];

export default function ListaComprasPage() {
  const router = useRouter();

  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [userId, setUserId] = useState("");

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>("mercado");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const [filter, setFilter] = useState<FilterType>("pendentes");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function checkUserAndLoadItems() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const currentUserId = data.session.user.id;

      setUserId(currentUserId);
      setLoadingAuth(false);

      await loadItems(currentUserId);
    }

    checkUserAndLoadItems();
  }, [router]);

  async function loadItems(currentUserId: string) {
    setLoadingItems(true);
    setMessage("");

    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("user_id", currentUserId)
      .order("purchased", { ascending: true })
      .order("created_at", { ascending: false });

    setLoadingItems(false);

    if (error) {
      setMessage(`Erro ao carregar lista: ${error.message}`);
      return;
    }

    setItems((data || []) as ShoppingItem[]);
  }

  const pendingItems = useMemo(() => {
    return items.filter((item) => !item.purchased);
  }, [items]);

  const purchasedItems = useMemo(() => {
    return items.filter((item) => item.purchased);
  }, [items]);

  const filteredItems = useMemo(() => {
    let baseItems: ShoppingItem[] = [];

    if (filter === "pendentes") {
      baseItems = pendingItems;
    }

    if (filter === "comprados") {
      baseItems = purchasedItems;
    }

    if (filter === "todos") {
      baseItems = items;
    }

    const searchText = search.trim().toLowerCase();

    if (!searchText) return baseItems;

    return baseItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchText) ||
        item.quantity?.toLowerCase().includes(searchText) ||
        item.notes?.toLowerCase().includes(searchText) ||
        getCategoryData(item.category).label.toLowerCase().includes(searchText)
      );
    });
  }, [filter, items, pendingItems, purchasedItems, search]);

  function resetForm() {
    setName("");
    setCategory("mercado");
    setQuantity("");
    setNotes("");
    setEditingItemId(null);
  }

  function openNewItemForm() {
    resetForm();
    setShowForm(true);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!userId) {
      setMessage("Você precisa estar logado para salvar itens.");
      return;
    }

    if (!name.trim()) {
      setMessage("Digite o nome do item.");
      return;
    }

    setSaving(true);

    if (editingItemId) {
      const { error } = await supabase
        .from("shopping_items")
        .update({
          name: name.trim(),
          category,
          quantity: quantity.trim() || null,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingItemId)
        .eq("user_id", userId);

      setSaving(false);

      if (error) {
        setMessage(`Erro ao editar item: ${error.message}`);
        return;
      }

      resetForm();
      setShowForm(false);
      setMessage("Item atualizado com sucesso.");
      await loadItems(userId);
      return;
    }

    const { error } = await supabase.from("shopping_items").insert({
      user_id: userId,
      name: name.trim(),
      category,
      quantity: quantity.trim() || null,
      notes: notes.trim() || null,
      purchased: false,
    });

    setSaving(false);

    if (error) {
      setMessage(`Erro ao salvar item: ${error.message}`);
      return;
    }

    resetForm();
    setShowForm(false);
    setMessage("Item adicionado à lista.");
    await loadItems(userId);
  }

  function startEditing(item: ShoppingItem) {
    setEditingItemId(item.id);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity || "");
    setNotes(item.notes || "");
    setShowForm(true);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  async function togglePurchased(item: ShoppingItem) {
    if (!userId) {
      setMessage("Você precisa estar logado para atualizar a lista.");
      return;
    }

    const { error } = await supabase
      .from("shopping_items")
      .update({
        purchased: !item.purchased,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("user_id", userId);

    if (error) {
      setMessage(`Erro ao atualizar item: ${error.message}`);
      return;
    }

    await loadItems(userId);
  }

  async function deleteItem(id: string) {
    const confirmDelete = confirm("Deseja excluir este item da lista?");

    if (!confirmDelete) return;

    if (!userId) {
      setMessage("Você precisa estar logado para excluir itens.");
      return;
    }

    const { error } = await supabase
      .from("shopping_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setMessage(`Erro ao excluir item: ${error.message}`);
      return;
    }

    if (editingItemId === id) {
      closeForm();
    }

    setMessage("Item excluído com sucesso.");
    await loadItems(userId);
  }

  async function clearPurchased() {
    if (!userId) {
      setMessage("Você precisa estar logado para limpar a lista.");
      return;
    }

    const confirmClear = confirm("Deseja apagar todos os itens comprados?");

    if (!confirmClear) return;

    const { error } = await supabase
      .from("shopping_items")
      .delete()
      .eq("user_id", userId)
      .eq("purchased", true);

    if (error) {
      setMessage(`Erro ao limpar comprados: ${error.message}`);
      return;
    }

    setMessage("Itens comprados apagados.");
    await loadItems(userId);
  }

  function getCategoryData(categoryValue: ShoppingCategory) {
    return (
      categories.find((item) => item.value === categoryValue) ||
      categories[categories.length - 1]
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

  function ShoppingCard({ item }: { item: ShoppingItem }) {
    const categoryData = getCategoryData(item.category);

    return (
      <article
        className={`card-touch rounded-[2rem] bg-white p-5 shadow-sm ${
          item.purchased ? "opacity-70" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={() => togglePurchased(item)}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
              item.purchased
                ? "bg-[#4F6F38] text-white"
                : "bg-[#F7F3EA] text-[#4F6F38]"
            }`}
          >
            {item.purchased ? "✓" : categoryData.emoji}
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#7A8F5A]">
              {categoryData.label}
            </p>

            <h3
              className={`mt-1 text-2xl font-black leading-tight ${
                item.purchased ? "line-through" : ""
              }`}
            >
              {item.name}
            </h3>

            {item.quantity && (
              <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-3 text-sm font-bold text-[#4F6F38]">
                Quantidade: {item.quantity}
              </p>
            )}

            {item.notes && (
              <p className="mt-3 rounded-2xl bg-[#FBF8F0] p-3 text-sm text-[#5F6B55]">
                {item.notes}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => startEditing(item)}
                className="rounded-full bg-[#E3D8BD] px-4 py-3 text-sm font-black text-[#5B4A2F]"
              >
                Editar
              </button>

              <button
                onClick={() => deleteItem(item.id)}
                className="rounded-full bg-[#F2DED8] px-4 py-3 text-sm font-black text-[#8A3A2C]"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (loadingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🛒</p>

          <h1 className="mt-4 text-2xl font-black">
            Carregando Lista de Compras...
          </h1>

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
              Lista de Compras
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Anote o que precisa comprar e marque quando já comprou.
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

        <section className="mt-6 rounded-[2.2rem] bg-[#4F6F38] p-6 text-white shadow-sm md:p-8">
          <p className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white/80">
            Compras da vida real
          </p>

          <p className="mt-6 text-6xl">🛒</p>

          <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
            O que falta comprar?
          </h2>

          <p className="mt-3 max-w-2xl text-white/80">
            Adicione itens do mercado, limpeza, casa, horta ou remédios.
          </p>

          <button
            onClick={openNewItemForm}
            className="mt-6 w-full rounded-full bg-white px-6 py-4 font-black text-[#4F6F38] transition hover:bg-[#EFE8DA] md:w-auto"
          >
            + Adicionar compra
          </button>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <SummaryCard emoji="🛒" value={items.length} label="total" />
          <SummaryCard emoji="📌" value={pendingItems.length} label="faltam" />
          <SummaryCard
            emoji="✅"
            value={purchasedItems.length}
            label="comprados"
          />
        </section>

        {showForm && (
          <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl">{editingItemId ? "✏️" : "🛒"}</p>

                <h2 className="mt-3 text-2xl font-black">
                  {editingItemId ? "Editar compra" : "Nova compra"}
                </h2>

                <p className="mt-1 text-sm text-[#6B715F]">
                  Preencha o nome e, se quiser, a quantidade.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-full bg-[#F7F3EA] px-4 py-2 text-sm font-black text-[#4F6F38]"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={saveItem} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Nome do item
                </label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex: arroz, detergente, remédio..."
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Categoria
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as ShoppingCategory)
                  }
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                >
                  {categories.map((categoryOption) => (
                    <option
                      key={categoryOption.value}
                      value={categoryOption.value}
                    >
                      {categoryOption.emoji} {categoryOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Quantidade
                </label>

                <input
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Ex: 1 pacote, 2 unidades, 500g..."
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Observação
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ex: comprar se estiver barato..."
                  rows={3}
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white transition hover:bg-[#3F5C2B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Salvando..."
                  : editingItemId
                  ? "Salvar alterações"
                  : "Adicionar à lista"}
              </button>
            </form>
          </section>
        )}

        <section className="mt-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              <FilterButton
                value="pendentes"
                label="Pendentes"
                emoji="📌"
              />

              <FilterButton
                value="comprados"
                label="Comprados"
                emoji="✅"
              />

              <FilterButton value="todos" label="Todos" emoji="🛒" />
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[2rem] bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-bold">Buscar item</label>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, categoria ou observação..."
            className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-[#6B715F]">
              {filteredItems.length} resultado
              {filteredItems.length === 1 ? "" : "s"}.
            </p>

            {purchasedItems.length > 0 && (
              <button
                onClick={clearPurchased}
                className="text-sm font-black text-[#8A3A2C]"
              >
                Limpar comprados
              </button>
            )}
          </div>
        </section>

        <section className="mt-5">
          {loadingItems ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-5xl">🛒</p>

              <h2 className="mt-4 text-2xl font-black">
                Carregando sua lista...
              </h2>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-5xl">🛒</p>

              <h2 className="mt-4 text-2xl font-black">
                Sua lista está vazia
              </h2>

              <p className="mt-2 text-[#6B715F]">
                Adicione o primeiro item que você precisa comprar.
              </p>

              <button
                onClick={openNewItemForm}
                className="mt-6 rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white"
              >
                Adicionar primeiro item
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
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
              {filteredItems.map((item) => (
                <ShoppingCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}