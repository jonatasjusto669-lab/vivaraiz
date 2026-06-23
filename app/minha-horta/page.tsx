"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PlantPlace = "vaso" | "quintal" | "canteiro" | "horta" | "sitio" | "outro";

type Plant = {
  id: string;
  user_id: string;
  name: string;
  place: PlantPlace;
  watering_frequency: number;
  planted_at: string | null;
  next_watering_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

type LocalPlant = {
  id: string;
  name: string;
  place: PlantPlace;
  wateringFrequency: string;
  plantedAt: string;
  nextWateringDate: string;
  notes: string;
  createdAt: string;
};

const places: { value: PlantPlace; label: string }[] = [
  { value: "vaso", label: "Vaso" },
  { value: "quintal", label: "Quintal" },
  { value: "canteiro", label: "Canteiro" },
  { value: "horta", label: "Horta" },
  { value: "sitio", label: "Sítio" },
  { value: "outro", label: "Outro" },
];

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setHours(12, 0, 0, 0);
  newDate.setDate(newDate.getDate() + days);

  return formatDateLocal(newDate);
}

function getDateDiffInDays(dateString: string) {
  const today = getTodayStart();
  const date = new Date(`${dateString}T00:00:00`);
  const diff = date.getTime() - today.getTime();

  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function getWateringStatus(nextWateringDate: string | null) {
  if (!nextWateringDate) return "Sem próxima rega";

  const diff = getDateDiffInDays(nextWateringDate);

  if (diff < 0) return "Rega atrasada";
  if (diff === 0) return "Regar hoje";
  if (diff === 1) return "Regar amanhã";

  return `Regar em ${diff} dias`;
}

function getFrequencyText(frequency: number | string) {
  const days = Number(frequency);

  if (!days || days <= 0) return "Frequência não definida";
  if (days === 1) return "Depois de regar, lembrar amanhã";
  if (days === 2) return "Depois de regar, lembrar depois de amanhã";

  return `Depois de regar, lembrar em ${days} dias`;
}

function mirrorPlantsToLocalStorage(plants: Plant[]) {
  const localPlants: LocalPlant[] = plants.map((plant) => ({
    id: plant.id,
    name: plant.name,
    place: plant.place,
    wateringFrequency: String(plant.watering_frequency),
    plantedAt: plant.planted_at || "",
    nextWateringDate: plant.next_watering_date || "",
    notes: plant.notes || "",
    createdAt: plant.created_at,
  }));

  localStorage.setItem("vivaraiz_plants", JSON.stringify(localPlants));
}

export default function MinhaHortaPage() {
  const router = useRouter();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [userId, setUserId] = useState("");

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [place, setPlace] = useState<PlantPlace>("vaso");
  const [wateringFrequency, setWateringFrequency] = useState("");
  const [plantedAt, setPlantedAt] = useState("");
  const [nextWateringDate, setNextWateringDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function checkUserAndLoadPlants() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const currentUserId = data.session.user.id;

      setUserId(currentUserId);
      setLoadingAuth(false);

      await loadPlants(currentUserId);
    }

    checkUserAndLoadPlants();
  }, [router]);

  async function loadPlants(currentUserId: string) {
    setLoadingPlants(true);
    setMessage("");

    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("user_id", currentUserId)
      .order("next_watering_date", { ascending: true, nullsFirst: false });

    setLoadingPlants(false);

    if (error) {
      setMessage(`Erro ao carregar plantas: ${error.message}`);
      return;
    }

    const loadedPlants = (data || []) as Plant[];

    setPlants(loadedPlants);
    mirrorPlantsToLocalStorage(loadedPlants);
  }

  const sortedPlants = useMemo(() => {
    return [...plants].sort((a, b) => {
      if (!a.next_watering_date) return 1;
      if (!b.next_watering_date) return -1;

      return (
        new Date(`${a.next_watering_date}T00:00:00`).getTime() -
        new Date(`${b.next_watering_date}T00:00:00`).getTime()
      );
    });
  }, [plants]);

  const wateringToday = useMemo(() => {
    return plants.filter(
      (plant) =>
        plant.next_watering_date &&
        getDateDiffInDays(plant.next_watering_date) <= 0
    );
  }, [plants]);

  function resetForm() {
    setEditingPlantId(null);
    setName("");
    setPlace("vaso");
    setWateringFrequency("");
    setPlantedAt("");
    setNextWateringDate("");
    setNotes("");
  }

  async function savePlant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!userId) {
      setMessage("Você precisa estar logado para salvar plantas.");
      return;
    }

    if (!name.trim()) {
      setMessage("Digite o nome da planta.");
      return;
    }

    if (!wateringFrequency.trim()) {
      setMessage("Digite quando quer ser lembrado após regar.");
      return;
    }

    const days = Number(wateringFrequency);

    if (!days || days <= 0) {
      setMessage("Digite uma frequência válida. Exemplo: 1, 2, 3 ou 7.");
      return;
    }

    setSaving(true);

    if (editingPlantId) {
      const { error } = await supabase
        .from("plants")
        .update({
          name,
          place,
          watering_frequency: days,
          planted_at: plantedAt || null,
          next_watering_date: nextWateringDate || formatDateLocal(new Date()),
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingPlantId)
        .eq("user_id", userId);

      setSaving(false);

      if (error) {
        setMessage(`Erro ao editar planta: ${error.message}`);
        return;
      }

      resetForm();
      setMessage("Planta atualizada com sucesso.");
      await loadPlants(userId);
      return;
    }

    const { error } = await supabase.from("plants").insert({
      user_id: userId,
      name,
      place,
      watering_frequency: days,
      planted_at: plantedAt || null,
      next_watering_date: nextWateringDate || formatDateLocal(new Date()),
      notes: notes || null,
    });

    setSaving(false);

    if (error) {
      setMessage(`Erro ao salvar planta: ${error.message}`);
      return;
    }

    resetForm();
    setMessage("Planta salva com sucesso.");
    await loadPlants(userId);
  }

  function startEditing(plant: Plant) {
    setEditingPlantId(plant.id);
    setName(plant.name);
    setPlace(plant.place);
    setWateringFrequency(String(plant.watering_frequency));
    setPlantedAt(plant.planted_at || "");
    setNextWateringDate(plant.next_watering_date || "");
    setNotes(plant.notes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deletePlant(id: string) {
    const confirmDelete = confirm("Deseja excluir esta planta?");

    if (!confirmDelete) return;

    if (!userId) {
      setMessage("Você precisa estar logado para excluir plantas.");
      return;
    }

    setMessage("");

    const { error } = await supabase
      .from("plants")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setMessage(`Erro ao excluir planta: ${error.message}`);
      return;
    }

    if (editingPlantId === id) {
      resetForm();
    }

    setMessage("Planta excluída com sucesso.");
    await loadPlants(userId);
  }

  async function markWatered(plant: Plant) {
    if (!userId) {
      setMessage("Você precisa estar logado para atualizar plantas.");
      return;
    }

    const days = Number(plant.watering_frequency);

    if (!days || days <= 0) {
      setMessage("Essa planta precisa ter uma frequência de rega válida.");
      return;
    }

    const nextDate = addDays(new Date(), days);

    const { error } = await supabase
      .from("plants")
      .update({
        next_watering_date: nextDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", plant.id)
      .eq("user_id", userId);

    if (error) {
      setMessage(`Erro ao marcar rega: ${error.message}`);
      return;
    }

    setMessage(`Rega registrada. Próxima lembrança: ${nextDate}.`);
    await loadPlants(userId);
  }

  function getPlaceLabel(placeValue: PlantPlace) {
    return places.find((item) => item.value === placeValue)?.label || "Outro";
  }

  if (loadingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🌱</p>

          <h1 className="mt-4 text-2xl font-black">Carregando Minha Horta...</h1>

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

            <h1 className="mt-6 text-4xl font-black">Minha Horta</h1>

            <p className="mt-2 text-[#6B715F]">
              Cadastre suas plantas, lembre as regas e cuide melhor do verde da
              sua casa.
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

        <section className="mt-10 rounded-[2rem] bg-[#4F6F38] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">Resumo da horta</p>

          <h2 className="mt-2 text-3xl font-black">
            Você tem {plants.length} planta
            {plants.length === 1 ? "" : "s"} cadastrada
            {plants.length === 1 ? "" : "s"}.
          </h2>

          <p className="mt-3 text-white/80">
            {wateringToday.length > 0
              ? `${wateringToday.length} planta${
                  wateringToday.length === 1 ? "" : "s"
                } precisa${
                  wateringToday.length === 1 ? "" : "m"
                } de atenção hoje.`
              : "Nenhuma planta precisa de rega agora."}
          </p>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={savePlant}
            className="rounded-[2rem] bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">
                  {editingPlantId ? "Editar planta" : "Adicionar planta"}
                </h2>

                <p className="mt-1 text-sm text-[#6B715F]">
                  {editingPlantId
                    ? "Altere as informações da planta e salve novamente."
                    : "Agora suas plantas ficam salvas na sua conta VivaRaiz."}
                </p>
              </div>

              {editingPlantId && (
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
                  Nome da planta
                </label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex: manjericão, tomate, morango..."
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Onde está?
                </label>

                <select
                  value={place}
                  onChange={(event) =>
                    setPlace(event.target.value as PlantPlace)
                  }
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                >
                  {places.map((placeOption) => (
                    <option key={placeOption.value} value={placeOption.value}>
                      {placeOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Depois de regar, lembrar novamente em:
                </label>

                <input
                  type="number"
                  min="1"
                  value={wateringFrequency}
                  onChange={(event) => setWateringFrequency(event.target.value)}
                  placeholder="1 = amanhã, 2 = depois de amanhã, 7 = semana que vem"
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                />

                <p className="mt-2 text-xs text-[#6B715F]">
                  Exemplo: coloque 1 para plantas que precisam de água todos os
                  dias.
                </p>

                {wateringFrequency && (
                  <p className="mt-2 rounded-2xl bg-[#F7F3EA] px-4 py-3 text-sm font-bold text-[#4F6F38]">
                    {getFrequencyText(wateringFrequency)}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Data de plantio
                  </label>

                  <input
                    type="date"
                    value={plantedAt}
                    onChange={(event) => setPlantedAt(event.target.value)}
                    className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Quando quer ser lembrado primeiro?
                  </label>

                  <input
                    type="date"
                    value={nextWateringDate}
                    onChange={(event) =>
                      setNextWateringDate(event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                  />

                  <p className="mt-2 text-xs text-[#6B715F]">
                    Se deixar em branco, o VivaRaiz considera que precisa cuidar
                    hoje.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Observação
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ex: gosta de sol fraco, não encharcar, regar pela manhã..."
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
                  : editingPlantId
                  ? "Salvar alterações"
                  : "Salvar planta"}
              </button>
            </div>
          </form>

          <section>
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Plantas cadastradas</h2>

              <p className="mt-2 text-[#6B715F]">
                As plantas com rega mais próxima aparecem primeiro.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              {loadingPlants ? (
                <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
                  <p className="text-5xl">🌱</p>

                  <h3 className="mt-4 text-xl font-black">
                    Carregando suas plantas...
                  </h3>
                </div>
              ) : sortedPlants.length === 0 ? (
                <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
                  <p className="text-5xl">🌿</p>

                  <h3 className="mt-4 text-xl font-black">
                    Nenhuma planta cadastrada
                  </h3>

                  <p className="mt-2 text-[#6B715F]">
                    Cadastre sua primeira planta para começar a cuidar da horta.
                  </p>
                </div>
              ) : (
                sortedPlants.map((plant) => (
                  <article
                    key={plant.id}
                    className="rounded-[2rem] bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#7A8F5A]">
                          {getPlaceLabel(plant.place)}
                        </p>

                        <h3 className="mt-1 text-2xl font-black">
                          🌱 {plant.name}
                        </h3>

                        <p className="mt-2 text-[#6B715F]">
                          {getFrequencyText(plant.watering_frequency)}
                        </p>

                        {plant.planted_at && (
                          <p className="mt-1 text-[#6B715F]">
                            Plantada em: {plant.planted_at}
                          </p>
                        )}

                        {plant.next_watering_date && (
                          <p className="mt-1 font-bold text-[#4F6F38]">
                            {getWateringStatus(plant.next_watering_date)} —{" "}
                            {plant.next_watering_date}
                          </p>
                        )}

                        {plant.notes && (
                          <p className="mt-3 rounded-2xl bg-[#F7F3EA] p-3 text-sm text-[#5F6B55]">
                            {plant.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => markWatered(plant)}
                          className="rounded-full bg-[#4F6F38] px-4 py-2 text-sm font-bold text-white"
                        >
                          Reguei hoje
                        </button>

                        <button
                          onClick={() => startEditing(plant)}
                          className="rounded-full bg-[#E3D8BD] px-4 py-2 text-sm font-bold text-[#5B4A2F]"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => deletePlant(plant.id)}
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