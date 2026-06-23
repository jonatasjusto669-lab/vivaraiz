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

function formatDate(dateString: string | null) {
  if (!dateString) return "";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("pt-BR");
}

export default function OndeGuardeiPage() {
  const router = useRouter();

  const [items, setItems] = useState<HomeItem[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUserAndLoadItems() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const currentUserId = data.session.user.id;

      const { data: itemsData, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`Erro ao carregar itens: ${error.message}`);
        setLoading(false);
        return;
      }

      setItems((itemsData || []) as HomeItem[]);
      setLoading(false);
    }

    checkUserAndLoadItems();
  }, [router]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) => {
      const name = item.name.toLowerCase();
      const category = categoryLabels[item.category]?.toLowerCase() || "";
      const location = item.location?.toLowerCase() || "";
      const quantity = item.quantity?.toLowerCase() || "";
      const notes = item.notes?.toLowerCase() || "";

      return (
        name.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        location.includes(normalizedSearch) ||
        quantity.includes(normalizedSearch) ||
        notes.includes(normalizedSearch)
      );
    });
  }, [items, search]);

  const itemsWithLocation = useMemo(() => {
    return items.filter((item) => item.location);
  }, [items]);

  function ItemCard({ item }: { item: HomeItem }) {
    return (
      <article className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-[#7A8F5A]">
              {categoryLabels[item.category] || "Outro"}
            </p>

            <h3 className="mt-1 text-2xl font-black">{item.name}</h3>

            <div className="mt-4 rounded-2xl bg-[#F7F3EA] p-4">
              <p className="text-sm font-bold text-[#7A8F5A]">
                Está guardado em:
              </p>

              <p className="mt-1 text-xl font-black text-[#4F6F38]">
                📍 {item.location || "Local não informado"}
              </p>
            </div>

            {item.quantity && (
              <p className="mt-3 text-[#6B715F]">
                Quantidade: {item.quantity}
              </p>
            )}

            {item.expiration_date && (
              <p className="mt-1 text-[#6B715F]">
                Validade: {formatDate(item.expiration_date)}
              </p>
            )}

            {item.reminder_date && (
              <p className="mt-1 text-[#6B715F]">
                Lembrete: {formatDate(item.reminder_date)}
              </p>
            )}

            {item.notes && (
              <p className="mt-3 rounded-2xl bg-[#FBF8F0] p-3 text-sm text-[#5F6B55]">
                {item.notes}
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
          <p className="text-5xl">🔎</p>

          <h1 className="mt-4 text-2xl font-black">
            Carregando Onde Guardei...
          </h1>

          <p className="mt-2 text-[#6B715F]">
            Buscando seus itens no Supabase.
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

            <h1 className="mt-6 text-4xl font-black">Onde Guardei?</h1>

            <p className="mt-2 text-[#6B715F]">
              Encontre rápido objetos, documentos, alimentos e tudo que você
              cadastrou na sua casa.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/minha-casa"
              className="rounded-full bg-[#4F6F38] px-5 py-3 text-center font-bold text-white"
            >
              Adicionar item
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

        <section className="mt-10 rounded-[2rem] bg-[#4F6F38] p-7 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">Busca rápida</p>

          <h2 className="mt-3 text-3xl font-black">
            O que você está procurando?
          </h2>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex: carregador, certidão, tomate, remédio..."
              className="w-full rounded-2xl border border-white/30 bg-white px-5 py-4 text-[#2F3A2F] outline-none placeholder:text-[#8A8F7A]"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="rounded-2xl border border-white/40 px-5 py-4 font-bold text-white"
              >
                Limpar
              </button>
            )}
          </div>

          <p className="mt-4 text-white/80">
            Você tem {items.length} item{items.length === 1 ? "" : "s"} salvo
            {items.length === 1 ? "" : "s"} e {itemsWithLocation.length} com
            local informado.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">📦</p>

            <h2 className="mt-4 text-3xl font-black">{items.length}</h2>

            <p className="mt-1 text-[#6B715F]">itens cadastrados</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">📍</p>

            <h2 className="mt-4 text-3xl font-black">
              {itemsWithLocation.length}
            </h2>

            <p className="mt-1 text-[#6B715F]">com local informado</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🔎</p>

            <h2 className="mt-4 text-3xl font-black">
              {filteredItems.length}
            </h2>

            <p className="mt-1 text-[#6B715F]">resultado da busca</p>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="mt-8 rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <p className="text-5xl">📦</p>

            <h2 className="mt-4 text-2xl font-black">
              Nenhum item cadastrado
            </h2>

            <p className="mt-2 text-[#6B715F]">
              Vá em Minha Casa e cadastre seus primeiros itens.
            </p>

            <a
              href="/minha-casa"
              className="mt-6 inline-block rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white"
            >
              Cadastrar item
            </a>
          </section>
        ) : filteredItems.length === 0 ? (
          <section className="mt-8 rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <p className="text-5xl">🔎</p>

            <h2 className="mt-4 text-2xl font-black">
              Nada encontrado
            </h2>

            <p className="mt-2 text-[#6B715F]">
              Tente buscar por outro nome, local ou categoria.
            </p>
          </section>
        ) : (
          <section className="mt-8">
            <h2 className="text-2xl font-black">
              {search
                ? `Resultado para “${search}”`
                : "Itens salvos na sua casa"}
            </h2>

            <div className="mt-4 grid gap-4">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}