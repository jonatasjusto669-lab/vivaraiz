"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ItemCategory =
  | "comida"
  | "objeto"
  | "documento"
  | "remedio"
  | "manutencao"
  | "planta"
  | "outro";

type HomeItem = {
  id: string;
  user_id: string;
  name: string;
  category: ItemCategory;
  location: string | null;
  quantity: string | null;
  expiration_date: string | null;
  reminder_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

type LocalHomeItem = {
  id: string;
  name: string;
  category: ItemCategory;
  location: string;
  quantity: string;
  expirationDate: string;
  reminderDate: string;
  notes: string;
  createdAt: string;
};

const categories: { value: ItemCategory; label: string; emoji: string }[] = [
  { value: "comida", label: "Comida", emoji: "🍅" },
  { value: "objeto", label: "Objeto", emoji: "📦" },
  { value: "documento", label: "Documento", emoji: "📄" },
  { value: "remedio", label: "Remédio", emoji: "💊" },
  { value: "manutencao", label: "Manutenção", emoji: "🛠️" },
  { value: "planta", label: "Planta", emoji: "🌿" },
  { value: "outro", label: "Outro", emoji: "🏡" },
];

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

function formatDate(dateString: string | null) {
  if (!dateString) return "";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("pt-BR");
}

export default function MinhaCasaPage() {
  const router = useRouter();

  const [items, setItems] = useState<HomeItem[]>([]);
  const [userId, setUserId] = useState("");

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | ItemCategory>("todos");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("comida");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [notes, setNotes] = useState("");

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
      .from("items")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });

    setLoadingItems(false);

    if (error) {
      setMessage(`Erro ao carregar itens: ${error.message}`);
      return;
    }

    const loadedItems = (data || []) as HomeItem[];

    setItems(loadedItems);
    mirrorItemsToLocalStorage(loadedItems);
  }

  const foodsCount = useMemo(() => {
    return items.filter((item) => item.category === "comida").length;
  }, [items]);

  const remindersCount = useMemo(() => {
    return items.filter((item) => item.reminder_date).length;
  }, [items]);

  const locationCount = useMemo(() => {
    return items.filter((item) => item.location).length;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        item.name.toLowerCase().includes(searchText) ||
        item.location?.toLowerCase().includes(searchText) ||
        item.notes?.toLowerCase().includes(searchText) ||
        item.quantity?.toLowerCase().includes(searchText);

      const matchesFilter = filter === "todos" || item.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  function resetForm() {
    setName("");
    setCategory("comida");
    setLocation("");
    setQuantity("");
    setExpirationDate("");
    setReminderDate("");
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
        .from("items")
        .update({
          name: name.trim(),
          category,
          location: location.trim() || null,
          quantity: quantity.trim() || null,
          expiration_date: expirationDate || null,
          reminder_date: reminderDate || null,
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

    const { error } = await supabase.from("items").insert({
      user_id: userId,
      name: name.trim(),
      category,
      location: location.trim() || null,
      quantity: quantity.trim() || null,
      expiration_date: expirationDate || null,
      reminder_date: reminderDate || null,
      notes: notes.trim() || null,
    });

    setSaving(false);

    if (error) {
      setMessage(`Erro ao salvar item: ${error.message}`);
      return;
    }

    resetForm();
    setShowForm(false);
    setMessage("Item salvo com sucesso.");
    await loadItems(userId);
  }

  function startEditing(item: HomeItem) {
    setEditingItemId(item.id);
    setName(item.name);
    setCategory(item.category);
    setLocation(item.location || "");
    setQuantity(item.quantity || "");
    setExpirationDate(item.expiration_date || "");
    setReminderDate(item.reminder_date || "");
    setNotes(item.notes || "");
    setShowForm(true);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  }

  async function deleteItem(id: string) {
    const confirmDelete = confirm("Deseja excluir este item?");

    if (!confirmDelete) return;

    if (!userId) {
      setMessage("Você precisa estar logado para excluir itens.");
      return;
    }

    setMessage("");

    const { error } = await supabase
      .from("items")
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

  function getCategoryData(categoryValue: ItemCategory) {
    return (
      categories.find((categoryItem) => categoryItem.value === categoryValue) ||
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

  function ItemCard({ item }: { item: HomeItem }) {
    const categoryData = getCategoryData(item.category);

    return (
      <article className="card-touch rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F3EA] text-3xl">
            {categoryData.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#7A8F5A]">
              {categoryData.label}
            </p>

            <h3 className="mt-1 text-2xl font-black leading-tight">
              {item.name}
            </h3>

            <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-3 text-sm font-bold text-[#4F6F38]">
              📍 {item.location || "Local não informado"}
            </p>

            <div className="mt-3 space-y-1 text-sm text-[#6B715F]">
              {item.quantity && <p>Quantidade: {item.quantity}</p>}

              {item.expiration_date && (
                <p>Validade: {formatDate(item.expiration_date)}</p>
              )}

              {item.reminder_date && (
                <p>Lembrete: {formatDate(item.reminder_date)}</p>
              )}
            </div>

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
          <p className="text-5xl">🌱</p>

          <h1 className="mt-4 text-2xl font-black">Carregando Minha Casa...</h1>

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
              Minha Casa
            </h1>

            <p className="mt-2 max-w-xl text-sm text-[#6B715F] md:text-base">
              Salve alimentos, objetos, documentos, remédios e lembre onde tudo
              está.
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

        <section className="mt-6 grid grid-cols-3 gap-3">
          <SummaryCard emoji="📦" value={items.length} label="itens" />
          <SummaryCard emoji="🍅" value={foodsCount} label="comidas" />
          <SummaryCard emoji="🔔" value={remindersCount} label="lembretes" />
        </section>

        <section className="mt-5 rounded-[2rem] bg-[#4F6F38] p-5 text-white shadow-sm md:p-7">
          <p className="text-sm font-bold text-white/70">Organize sua casa</p>

          <h2 className="mt-3 text-2xl font-black md:text-3xl">
            Cadastre algo que você quer lembrar depois.
          </h2>

          <p className="mt-2 text-sm text-white/80 md:text-base">
            Exemplo: arroz no armário, documento na gaveta, remédio na caixa ou
            carregador no quarto.
          </p>

          <button
            onClick={openNewItemForm}
            className="mt-5 w-full rounded-full bg-white px-6 py-4 font-black text-[#4F6F38] transition hover:bg-[#EFE8DA] md:w-auto"
          >
            + Adicionar item
          </button>
        </section>

        {showForm && (
          <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-3xl">{editingItemId ? "✏️" : "📦"}</p>

                <h2 className="mt-3 text-2xl font-black">
                  {editingItemId ? "Editar item" : "Novo item"}
                </h2>

                <p className="mt-1 text-sm text-[#6B715F]">
                  {editingItemId
                    ? "Altere as informações e salve."
                    : "Preencha só o que fizer sentido."}
                </p>
              </div>

              <button
                type="button"
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
                  placeholder="Ex: tomate, carregador, certidão..."
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
                    setCategory(event.target.value as ItemCategory)
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
                  Onde está guardado?
                </label>

                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Ex: geladeira, gaveta do quarto..."
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Quantidade
                </label>

                <input
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Ex: 2 unidades, 1 pacote, 500g..."
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Validade
                  </label>

                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(event) =>
                      setExpirationDate(event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Lembrete
                  </label>

                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(event) => setReminderDate(event.target.value)}
                    className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Observação
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ex: usar primeiro, documento importante..."
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
                  : "Salvar item"}
              </button>
            </form>
          </section>
        )}

        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-2xl font-black">Itens cadastrados</h2>

          <div className="mt-5 space-y-3 md:grid md:grid-cols-[1fr_240px] md:gap-3 md:space-y-0">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar item, local ou observação..."
              className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
            />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as "todos" | ItemCategory)
              }
              className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
            >
              <option value="todos">Todas categorias</option>
              {categories.map((categoryOption) => (
                <option key={categoryOption.value} value={categoryOption.value}>
                  {categoryOption.emoji} {categoryOption.label}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-4 text-sm text-[#6B715F]">
            {filteredItems.length} resultado
            {filteredItems.length === 1 ? "" : "s"} encontrado
            {filteredItems.length === 1 ? "" : "s"}.
          </p>
        </section>

        <section className="mt-5">
          {loadingItems ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-4xl">🌱</p>

              <h3 className="mt-4 text-xl font-black">
                Carregando seus itens...
              </h3>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-5xl">🏡</p>

              <h3 className="mt-4 text-2xl font-black">
                Nenhum item encontrado
              </h3>

              <p className="mt-2 text-[#6B715F]">
                Cadastre algo da sua casa para começar.
              </p>

              <button
                onClick={openNewItemForm}
                className="mt-6 rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white"
              >
                Adicionar primeiro item
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <p className="text-3xl">📍</p>

          <h2 className="mt-4 text-2xl font-black">
            {locationCount} item{locationCount === 1 ? "" : "s"} com local
            informado
          </h2>

          <p className="mt-2 text-[#6B715F]">
            Quanto mais você preenche o campo “Onde está guardado”, melhor fica
            a busca do VivaRaiz.
          </p>
        </section>
      </div>
    </main>
  );
}