"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type HomeItem = {
  id?: string;
  user_id?: string;
  name: string;
  category: string;
  location: string | null;
  quantity: string | null;
  expiration_date: string | null;
  reminder_date: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string | null;
};

type Plant = {
  id?: string;
  user_id?: string;
  name: string;
  place: string | null;
  watering_frequency: number;
  planted_at: string | null;
  next_watering_date: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string | null;
};

type OfflineMission = {
  id?: string;
  user_id?: string;
  title: string;
  description: string | null;
  category: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at?: string;
};

type VivaRaizBackup = {
  app: "VivaRaiz";
  version: string;
  exportedAt: string;
  items: HomeItem[];
  plants: Plant[];
  missions: OfflineMission[];
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

function mirrorItemsToLocalStorage(items: HomeItem[]) {
  const localItems: LocalHomeItem[] = items.map((item) => ({
    id: item.id || crypto.randomUUID(),
    name: item.name,
    category: item.category,
    location: item.location || "",
    quantity: item.quantity || "",
    expirationDate: item.expiration_date || "",
    reminderDate: item.reminder_date || "",
    notes: item.notes || "",
    createdAt: item.created_at || new Date().toISOString(),
  }));

  localStorage.setItem("vivaraiz_items", JSON.stringify(localItems));
}

function mirrorPlantsToLocalStorage(plants: Plant[]) {
  const localPlants: LocalPlant[] = plants.map((plant) => ({
    id: plant.id || crypto.randomUUID(),
    name: plant.name,
    place: plant.place || "outro",
    wateringFrequency: String(plant.watering_frequency),
    plantedAt: plant.planted_at || "",
    nextWateringDate: plant.next_watering_date || "",
    notes: plant.notes || "",
    createdAt: plant.created_at || new Date().toISOString(),
  }));

  localStorage.setItem("vivaraiz_plants", JSON.stringify(localPlants));
}

function mirrorMissionsToLocalStorage(missions: OfflineMission[]) {
  const localMissions: LocalOfflineMission[] = missions.map((mission) => ({
    id: mission.id || crypto.randomUUID(),
    title: mission.title,
    description: mission.description || "",
    category: mission.category || "",
    completed: mission.completed,
    completedAt: mission.completed_at,
    createdAt: mission.created_at || new Date().toISOString(),
  }));

  localStorage.setItem(
    "vivaraiz_offline_missions",
    JSON.stringify(localMissions)
  );
}

export default function BackupPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState("");

  const [itemsCount, setItemsCount] = useState(0);
  const [plantsCount, setPlantsCount] = useState(0);
  const [missionsCount, setMissionsCount] = useState(0);

  useEffect(() => {
    async function checkUserAndLoadCounts() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const currentUserId = data.session.user.id;

      setUserId(currentUserId);
      setLoadingAuth(false);

      await loadCounts(currentUserId);
    }

    checkUserAndLoadCounts();
  }, [router]);

  async function loadCounts(currentUserId: string) {
    setLoadingData(true);
    setMessage("");

    const [itemsResult, plantsResult, missionsResult] = await Promise.all([
      supabase
        .from("items")
        .select("id", { count: "exact" })
        .eq("user_id", currentUserId),

      supabase
        .from("plants")
        .select("id", { count: "exact" })
        .eq("user_id", currentUserId),

      supabase
        .from("offline_missions")
        .select("id", { count: "exact" })
        .eq("user_id", currentUserId),
    ]);

    setLoadingData(false);

    if (itemsResult.error) {
      setMessage(`Erro ao contar itens: ${itemsResult.error.message}`);
      return;
    }

    if (plantsResult.error) {
      setMessage(`Erro ao contar plantas: ${plantsResult.error.message}`);
      return;
    }

    if (missionsResult.error) {
      setMessage(`Erro ao contar missões: ${missionsResult.error.message}`);
      return;
    }

    setItemsCount(itemsResult.count || 0);
    setPlantsCount(plantsResult.count || 0);
    setMissionsCount(missionsResult.count || 0);
  }

  async function exportBackup() {
    if (!userId) {
      setMessage("Você precisa estar logado para exportar backup.");
      return;
    }

    setLoadingData(true);
    setMessage("");

    const [itemsResult, plantsResult, missionsResult] = await Promise.all([
      supabase
        .from("items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("plants")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("offline_missions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    setLoadingData(false);

    if (itemsResult.error) {
      setMessage(`Erro ao exportar itens: ${itemsResult.error.message}`);
      return;
    }

    if (plantsResult.error) {
      setMessage(`Erro ao exportar plantas: ${plantsResult.error.message}`);
      return;
    }

    if (missionsResult.error) {
      setMessage(`Erro ao exportar missões: ${missionsResult.error.message}`);
      return;
    }

    const backup: VivaRaizBackup = {
      app: "VivaRaiz",
      version: "2.0-supabase",
      exportedAt: new Date().toISOString(),
      items: (itemsResult.data || []) as HomeItem[],
      plants: (plantsResult.data || []) as Plant[],
      missions: (missionsResult.data || []) as OfflineMission[],
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const fileName = `vivaraiz-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);

    setMessage("Backup exportado com sucesso.");
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!userId) {
      setMessage("Você precisa estar logado para importar backup.");
      return;
    }

    const confirmImport = confirm(
      "A importação vai substituir os dados atuais da sua conta. Deseja continuar?"
    );

    if (!confirmImport) {
      event.target.value = "";
      return;
    }

    setLoadingData(true);
    setMessage("");

    try {
      const text = await file.text();
      const backup = JSON.parse(text) as VivaRaizBackup;

      if (!backup.items || !backup.plants || !backup.missions) {
        setMessage("Arquivo inválido. Esse JSON não parece ser um backup VivaRaiz.");
        setLoadingData(false);
        event.target.value = "";
        return;
      }

      const itemsToInsert = backup.items.map((item) => ({
        user_id: userId,
        name: item.name,
        category: item.category,
        location: item.location || null,
        quantity: item.quantity || null,
        expiration_date: item.expiration_date || null,
        reminder_date: item.reminder_date || null,
        notes: item.notes || null,
      }));

      const plantsToInsert = backup.plants.map((plant) => ({
        user_id: userId,
        name: plant.name,
        place: plant.place || "outro",
        watering_frequency: Number(plant.watering_frequency) || 1,
        planted_at: plant.planted_at || null,
        next_watering_date: plant.next_watering_date || null,
        notes: plant.notes || null,
      }));

      const missionsToInsert = backup.missions.map((mission) => ({
        user_id: userId,
        title: mission.title,
        description: mission.description || null,
        category: mission.category || null,
        completed: Boolean(mission.completed),
        completed_at: mission.completed_at || null,
      }));

      const deleteMissions = await supabase
        .from("offline_missions")
        .delete()
        .eq("user_id", userId);

      if (deleteMissions.error) {
        throw new Error(deleteMissions.error.message);
      }

      const deletePlants = await supabase
        .from("plants")
        .delete()
        .eq("user_id", userId);

      if (deletePlants.error) {
        throw new Error(deletePlants.error.message);
      }

      const deleteItems = await supabase
        .from("items")
        .delete()
        .eq("user_id", userId);

      if (deleteItems.error) {
        throw new Error(deleteItems.error.message);
      }

      if (itemsToInsert.length > 0) {
        const insertItems = await supabase.from("items").insert(itemsToInsert);

        if (insertItems.error) {
          throw new Error(insertItems.error.message);
        }
      }

      if (plantsToInsert.length > 0) {
        const insertPlants = await supabase
          .from("plants")
          .insert(plantsToInsert);

        if (insertPlants.error) {
          throw new Error(insertPlants.error.message);
        }
      }

      if (missionsToInsert.length > 0) {
        const insertMissions = await supabase
          .from("offline_missions")
          .insert(missionsToInsert);

        if (insertMissions.error) {
          throw new Error(insertMissions.error.message);
        }
      }

      const [itemsResult, plantsResult, missionsResult] = await Promise.all([
        supabase
          .from("items")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),

        supabase
          .from("plants")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),

        supabase
          .from("offline_missions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      mirrorItemsToLocalStorage((itemsResult.data || []) as HomeItem[]);
      mirrorPlantsToLocalStorage((plantsResult.data || []) as Plant[]);
      mirrorMissionsToLocalStorage(
        (missionsResult.data || []) as OfflineMission[]
      );

      await loadCounts(userId);

      setMessage("Backup importado com sucesso para sua conta.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido.";

      setMessage(`Erro ao importar backup: ${errorMessage}`);
    }

    setLoadingData(false);
    event.target.value = "";
  }

  async function clearCloudData() {
    if (!userId) {
      setMessage("Você precisa estar logado para apagar os dados.");
      return;
    }

    const confirmClear = confirm(
      "Tem certeza que deseja apagar seus itens, plantas e missões do Supabase?"
    );

    if (!confirmClear) return;

    const confirmAgain = confirm(
      "Essa ação não dá para desfazer sem backup. Confirma mesmo assim?"
    );

    if (!confirmAgain) return;

    setLoadingData(true);
    setMessage("");

    const deleteMissions = await supabase
      .from("offline_missions")
      .delete()
      .eq("user_id", userId);

    if (deleteMissions.error) {
      setLoadingData(false);
      setMessage(`Erro ao apagar missões: ${deleteMissions.error.message}`);
      return;
    }

    const deletePlants = await supabase
      .from("plants")
      .delete()
      .eq("user_id", userId);

    if (deletePlants.error) {
      setLoadingData(false);
      setMessage(`Erro ao apagar plantas: ${deletePlants.error.message}`);
      return;
    }

    const deleteItems = await supabase
      .from("items")
      .delete()
      .eq("user_id", userId);

    if (deleteItems.error) {
      setLoadingData(false);
      setMessage(`Erro ao apagar itens: ${deleteItems.error.message}`);
      return;
    }

    localStorage.removeItem("vivaraiz_items");
    localStorage.removeItem("vivaraiz_plants");
    localStorage.removeItem("vivaraiz_offline_missions");

    await loadCounts(userId);

    setLoadingData(false);
    setMessage("Dados apagados com sucesso.");
  }

  if (loadingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">📦</p>

          <h1 className="mt-4 text-2xl font-black">Carregando Backup...</h1>

          <p className="mt-2 text-[#6B715F]">Verificando sua conta.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-8 text-[#2F3A2F]">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/dashboard" className="text-2xl font-black">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-6 text-4xl font-black">Backup</h1>

            <p className="mt-2 text-[#6B715F]">
              Exporte, importe ou apague os dados da sua conta VivaRaiz no
              Supabase.
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

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🏡</p>

            <h2 className="mt-4 text-3xl font-black">{itemsCount}</h2>

            <p className="mt-1 text-[#6B715F]">itens no Supabase</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🌿</p>

            <h2 className="mt-4 text-3xl font-black">{plantsCount}</h2>

            <p className="mt-1 text-[#6B715F]">plantas no Supabase</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🌤️</p>

            <h2 className="mt-4 text-3xl font-black">{missionsCount}</h2>

            <p className="mt-1 text-[#6B715F]">missões no Supabase</p>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-[#4F6F38] p-8 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">
            Backup real do VivaRaiz
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Guarde uma cópia dos seus dados.
          </h2>

          <p className="mt-3 max-w-2xl text-white/80">
            O backup baixa um arquivo JSON com seus itens, plantas e missões. Ele
            pode ser importado depois para restaurar sua conta.
          </p>

          <button
            onClick={exportBackup}
            disabled={loadingData}
            className="mt-6 rounded-full bg-white px-6 py-4 font-black text-[#4F6F38] transition hover:bg-[#EFE8DA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingData ? "Processando..." : "Exportar backup"}
          </button>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-7 shadow-sm">
            <p className="text-4xl">📥</p>

            <h2 className="mt-5 text-2xl font-black">Importar backup</h2>

            <p className="mt-2 text-[#6B715F]">
              Use um arquivo JSON exportado pelo VivaRaiz. A importação substitui
              os dados atuais da sua conta.
            </p>

            <label className="mt-6 block cursor-pointer rounded-full bg-[#4F6F38] px-6 py-4 text-center font-black text-white transition hover:bg-[#3F5C2B]">
              Escolher arquivo JSON
              <input
                type="file"
                accept="application/json"
                onChange={importBackup}
                className="hidden"
              />
            </label>
          </div>

          <div className="rounded-[2rem] bg-white p-7 shadow-sm">
            <p className="text-4xl">🧹</p>

            <h2 className="mt-5 text-2xl font-black">Apagar dados</h2>

            <p className="mt-2 text-[#6B715F]">
              Apaga seus itens, plantas e missões salvos no Supabase. Faça backup
              antes.
            </p>

            <button
              onClick={clearCloudData}
              disabled={loadingData}
              className="mt-6 rounded-full bg-[#F2DED8] px-6 py-4 font-black text-[#8A3A2C] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingData ? "Processando..." : "Apagar meus dados"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}