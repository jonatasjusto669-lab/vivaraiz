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

const categories: { value: ItemCategory; label: string }[] = [
  { value: "comida", label: "Comida" },
  { value: "objeto", label: "Objeto" },
  { value: "documento", label: "Documento" },
  { value: "remedio", label: "Remédio" },
  { value: "manutencao", label: "Manutenção" },
  { value: "planta", label: "Planta" },
  { value: "outro", label: "Outro" },
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

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
          name,
          category,
          location: location || null,
          quantity: quantity || null,
          expiration_date: expirationDate || null,
          reminder_date: reminderDate || null,
          notes: notes || null,
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
      setMessage("Item atualizado com sucesso.");
      await loadItems(userId);
      return;
    }

    const { error } = await supabase.from("items").insert({
      user_id: userId,
      name,
      category,
      location: location || null,
      quantity: quantity || null,
      expiration_date: expirationDate || null,
      reminder_date: reminderDate || null,
      notes: notes || null,
    });

    setSaving(false);

    if (error) {
      setMessage(`Erro ao salvar item: ${error.message}`);
      return;
    }

    resetForm();
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
      resetForm();
    }

    setMessage("Item excluído com sucesso.");
    await loadItems(userId);
  }

  function getCategoryLabel(categoryValue: ItemCategory) {
    return (
      categories.find((category) => category.value === categoryValue)?.label ||
      "Outro"
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
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-8 text-[#2F3A2F]">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/dashboard" className="text-2xl font-black">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-6 text-4xl font-black">Minha Casa</h1>

            <p className="mt-2 text-[#6B715F]">
              Cadastre alimentos, objetos, documentos, remédios e tudo que você
              quer lembrar onde está.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-full border border-[#7A8F5A] px-5 py-3 text-center font-bold text-[#4F6F38]"
          >
            Voltar ao painel
          </a>
        </header>

        {message && (
          <section className="mt-6 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#4F6F38] shadow-sm">
            {message}
          </section>
        )}

        <section className="mt-10 grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={saveItem}
            className="rounded-[2rem] bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">
                  {editingItemId ? "Editar item" : "Adicionar item"}
                </h2>

                <p className="mt-1 text-sm text-[#6B715F]">
                  {editingItemId
                    ? "Altere as informações e salve novamente."
                    : "Agora seus itens ficam salvos na sua conta VivaRaiz."}
                </p>
              </div>

              {editingItemId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full bg-[#F7F3EA] px-4 py-2 text-sm font-bold text-[#4F6F38]"
                >
                  Cancelar
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Nome do item
                </label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex: tomate, carregador, certidão..."
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
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
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                >
                  {categories.map((categoryOption) => (
                    <option
                      key={categoryOption.value}
                      value={categoryOption.value}
                    >
                      {categoryOption.label}
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
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
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
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
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
                    className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
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
                    className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
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
                  placeholder="Ex: usar primeiro, pertence à escola, documento importante..."
                  rows={3}
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
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
            </div>
          </form>

          <section>
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Itens cadastrados</h2>

              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar item..."
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                />

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as "todos" | ItemCategory)
                  }
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                >
                  <option value="todos">Todas categorias</option>
                  {categories.map((categoryOption) => (
                    <option
                      key={categoryOption.value}
                      value={categoryOption.value}
                    >
                      {categoryOption.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {loadingItems ? (
                <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
                  <p className="text-4xl">🌱</p>

                  <h3 className="mt-4 text-xl font-black">
                    Carregando seus itens...
                  </h3>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
                  <p className="text-4xl">🏡</p>

                  <h3 className="mt-4 text-xl font-black">
                    Nenhum item encontrado
                  </h3>

                  <p className="mt-2 text-[#6B715F]">
                    Cadastre o primeiro item da sua casa para começar.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[2rem] bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#7A8F5A]">
                          {getCategoryLabel(item.category)}
                        </p>

                        <h3 className="mt-1 text-2xl font-black">
                          {item.name}
                        </h3>

                        <p className="mt-2 text-[#6B715F]">
                          📍{" "}
                          {item.location
                            ? item.location
                            : "Local não informado"}
                        </p>

                        {item.quantity && (
                          <p className="mt-1 text-[#6B715F]">
                            Quantidade: {item.quantity}
                          </p>
                        )}

                        {item.expiration_date && (
                          <p className="mt-1 text-[#6B715F]">
                            Validade: {item.expiration_date}
                          </p>
                        )}

                        {item.reminder_date && (
                          <p className="mt-1 text-[#6B715F]">
                            Lembrete: {item.reminder_date}
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
                          onClick={() => startEditing(item)}
                          className="rounded-full bg-[#E3D8BD] px-4 py-2 text-sm font-bold text-[#5B4A2F]"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="rounded-full bg-[#F2DED8] px-4 py-2 text-sm font-bold text-[#8A3A2C]"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}