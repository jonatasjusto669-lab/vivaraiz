"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

type LocalOfflineMission = {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
};

type MissionTemplate = {
  title: string;
  description: string;
  category: string;
};

const missionTemplates: MissionTemplate[] = [
  {
    title: "Fique 30 minutos sem celular",
    description:
      "Escolha um horário do dia e deixe o celular longe de você por 30 minutos.",
    category: "Menos tela",
  },
  {
    title: "Organize uma gaveta",
    description:
      "Pegue uma gaveta pequena e tire dela o que não precisa mais estar ali.",
    category: "Casa",
  },
  {
    title: "Cozinhe algo com o que já tem",
    description:
      "Antes de pensar em comprar, veja o que existe na cozinha e prepare algo simples.",
    category: "Cozinha",
  },
  {
    title: "Regue uma planta",
    description:
      "Dê atenção a uma planta da casa, do quintal, do vaso ou do canteiro.",
    category: "Horta",
  },
  {
    title: "Caminhe 10 minutos sem fone",
    description:
      "Faça uma caminhada curta prestando atenção no ambiente ao seu redor.",
    category: "Ar livre",
  },
  {
    title: "Arrume a mesa sem celular",
    description:
      "Organize a mesa, balcão ou algum cantinho da casa sem mexer no celular.",
    category: "Casa",
  },
  {
    title: "Separe algo que está vencendo",
    description:
      "Olhe sua cozinha e separe um alimento que precisa ser usado primeiro.",
    category: "Cozinha",
  },
  {
    title: "Leia algo fora da tela por 15 minutos",
    description:
      "Pode ser Bíblia, livro, revista, caderno ou qualquer coisa em papel.",
    category: "Menos tela",
  },
  {
    title: "Planeje uma pequena horta",
    description:
      "Anote uma planta que você gostaria de cultivar e onde ela poderia ficar.",
    category: "Horta",
  },
  {
    title: "Converse com alguém da casa",
    description:
      "Puxe uma conversa simples sem ficar olhando para a tela enquanto fala.",
    category: "Relacionamento",
  },
  {
    title: "Limpe uma superfície",
    description:
      "Escolha uma mesa, prateleira ou bancada e deixe ela mais limpa hoje.",
    category: "Casa",
  },
  {
    title: "Faça uma lista do que você já tem",
    description:
      "Antes de comprar algo novo, liste coisas que você já tem guardadas.",
    category: "Organização",
  },
];

function getRandomMission() {
  const randomIndex = Math.floor(Math.random() * missionTemplates.length);
  return missionTemplates[randomIndex];
}

function mirrorMissionsToLocalStorage(missions: OfflineMission[]) {
  const localMissions: LocalOfflineMission[] = missions.map((mission) => ({
    id: mission.id,
    title: mission.title,
    description: mission.description || "",
    category: mission.category || "",
    completed: mission.completed,
    completedAt: mission.completed_at,
    createdAt: mission.created_at,
  }));

  localStorage.setItem(
    "vivaraiz_offline_missions",
    JSON.stringify(localMissions)
  );
}

export default function VidaOfflinePage() {
  const router = useRouter();

  const [missions, setMissions] = useState<OfflineMission[]>([]);
  const [userId, setUserId] = useState("");

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUserAndLoadMissions() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const currentUserId = data.session.user.id;

      setUserId(currentUserId);
      setLoadingAuth(false);

      await loadMissions(currentUserId);
    }

    checkUserAndLoadMissions();
  }, [router]);

  async function loadMissions(currentUserId: string) {
    setLoadingMissions(true);
    setMessage("");

    const { data, error } = await supabase
      .from("offline_missions")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });

    setLoadingMissions(false);

    if (error) {
      setMessage(`Erro ao carregar missões: ${error.message}`);
      return;
    }

    const loadedMissions = (data || []) as OfflineMission[];

    setMissions(loadedMissions);
    mirrorMissionsToLocalStorage(loadedMissions);
  }

  const pendingMission = useMemo(() => {
    return missions.find((mission) => !mission.completed);
  }, [missions]);

  const completedMissions = useMemo(() => {
    return missions.filter((mission) => mission.completed);
  }, [missions]);

  async function generateMission() {
    if (!userId) {
      setMessage("Você precisa estar logado para gerar uma missão.");
      return;
    }

    setSaving(true);
    setMessage("");

    const randomMission = getRandomMission();

    if (pendingMission) {
      const { error } = await supabase
        .from("offline_missions")
        .update({
          title: randomMission.title,
          description: randomMission.description,
          category: randomMission.category,
          completed: false,
          completed_at: null,
        })
        .eq("id", pendingMission.id)
        .eq("user_id", userId);

      setSaving(false);

      if (error) {
        setMessage(`Erro ao trocar missão: ${error.message}`);
        return;
      }

      setMessage("Nova missão gerada.");
      await loadMissions(userId);
      return;
    }

    const { error } = await supabase.from("offline_missions").insert({
      user_id: userId,
      title: randomMission.title,
      description: randomMission.description,
      category: randomMission.category,
      completed: false,
    });

    setSaving(false);

    if (error) {
      setMessage(`Erro ao gerar missão: ${error.message}`);
      return;
    }

    setMessage("Missão gerada com sucesso.");
    await loadMissions(userId);
  }

  async function completeMission() {
    if (!userId) {
      setMessage("Você precisa estar logado para concluir uma missão.");
      return;
    }

    if (!pendingMission) {
      setMessage("Não existe missão pendente para concluir.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("offline_missions")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", pendingMission.id)
      .eq("user_id", userId);

    setSaving(false);

    if (error) {
      setMessage(`Erro ao concluir missão: ${error.message}`);
      return;
    }

    setMessage("Missão concluída. Boa! Você viveu um pouco mais fora da tela.");
    await loadMissions(userId);
  }

  async function clearCompletedMissions() {
    if (!userId) {
      setMessage("Você precisa estar logado para limpar o histórico.");
      return;
    }

    const confirmClear = confirm("Deseja apagar o histórico de missões concluídas?");

    if (!confirmClear) return;

    setMessage("");

    const { error } = await supabase
      .from("offline_missions")
      .delete()
      .eq("user_id", userId)
      .eq("completed", true);

    if (error) {
      setMessage(`Erro ao limpar histórico: ${error.message}`);
      return;
    }

    setMessage("Histórico limpo com sucesso.");
    await loadMissions(userId);
  }

  if (loadingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🌤️</p>

          <h1 className="mt-4 text-2xl font-black">
            Carregando Vida Offline...
          </h1>

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

            <h1 className="mt-6 text-4xl font-black">Vida Offline</h1>

            <p className="mt-2 text-[#6B715F]">
              Pequenas missões para sair da tela e cuidar da vida real com mais
              calma.
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

        <section className="mt-10 rounded-[2rem] bg-[#4F6F38] p-8 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">
            Missão VivaRaiz de hoje
          </p>

          {loadingMissions ? (
            <div className="mt-8 text-center">
              <p className="text-5xl">🌤️</p>

              <h2 className="mt-4 text-3xl font-black">
                Carregando missão...
              </h2>
            </div>
          ) : pendingMission ? (
            <div className="mt-8">
              <p className="text-6xl">🌤️</p>

              <p className="mt-6 w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
                {pendingMission.category || "Missão"}
              </p>

              <h2 className="mt-5 text-4xl font-black leading-tight">
                {pendingMission.title}
              </h2>

              <p className="mt-4 max-w-2xl text-lg text-white/85">
                {pendingMission.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={completeMission}
                  disabled={saving}
                  className="rounded-full bg-white px-6 py-4 font-black text-[#4F6F38] transition hover:bg-[#EFE8DA] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Concluir missão"}
                </button>

                <button
                  onClick={generateMission}
                  disabled={saving}
                  className="rounded-full border border-white/50 px-6 py-4 font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Trocar missão
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <p className="text-6xl">🌤️</p>

              <h2 className="mt-5 text-4xl font-black leading-tight">
                Gere sua primeira missão offline.
              </h2>

              <p className="mt-4 max-w-2xl text-lg text-white/85">
                O VivaRaiz vai te dar uma tarefa simples para viver mais fora da
                tela hoje.
              </p>

              <button
                onClick={generateMission}
                disabled={saving}
                className="mt-8 rounded-full bg-white px-6 py-4 font-black text-[#4F6F38] transition hover:bg-[#EFE8DA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Gerando..." : "Gerar missão"}
              </button>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">✅</p>

            <h2 className="mt-4 text-2xl font-black">
              {completedMissions.length}
            </h2>

            <p className="mt-1 text-[#6B715F]">missões concluídas</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">🌱</p>

            <h2 className="mt-4 text-2xl font-black">
              {missions.length}
            </h2>

            <p className="mt-1 text-[#6B715F]">missões salvas</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-3xl">📵</p>

            <h2 className="mt-4 text-2xl font-black">
              {pendingMission ? "1" : "0"}
            </h2>

            <p className="mt-1 text-[#6B715F]">missão pendente</p>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Histórico</h2>

              <p className="mt-2 text-[#6B715F]">
                Veja as missões que você já concluiu.
              </p>
            </div>

            {completedMissions.length > 0 && (
              <button
                onClick={clearCompletedMissions}
                className="rounded-full bg-[#F2DED8] px-5 py-3 text-sm font-bold text-[#8A3A2C]"
              >
                Limpar histórico
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-4">
            {completedMissions.length === 0 ? (
              <div className="rounded-[2rem] bg-[#F7F3EA] p-6 text-center">
                <p className="text-4xl">🌤️</p>

                <h3 className="mt-4 text-xl font-black">
                  Nenhuma missão concluída ainda
                </h3>

                <p className="mt-2 text-[#6B715F]">
                  Conclua uma missão para ela aparecer aqui.
                </p>
              </div>
            ) : (
              completedMissions.map((mission) => (
                <article
                  key={mission.id}
                  className="rounded-[2rem] bg-[#F7F3EA] p-5"
                >
                  <p className="text-sm font-bold text-[#7A8F5A]">
                    {mission.category || "Missão"}
                  </p>

                  <h3 className="mt-1 text-xl font-black">
                    ✅ {mission.title}
                  </h3>

                  <p className="mt-2 text-[#6B715F]">
                    {mission.description}
                  </p>

                  {mission.completed_at && (
                    <p className="mt-3 text-sm font-bold text-[#4F6F38]">
                      Concluída em:{" "}
                      {new Date(mission.completed_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}