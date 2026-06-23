"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConfiguracoesPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [newName, setNewName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const user = data.session.user;
      const name = user.user_metadata?.name || "";

      setUserName(name || "Sem nome definido");
      setNewName(name || "");
      setUserEmail(user.email || "");
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function updateName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!newName.trim()) {
      setMessage("Digite um nome para salvar.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        name: newName.trim(),
      },
    });

    setSaving(false);

    if (error) {
      setMessage(`Erro ao atualizar nome: ${error.message}`);
      return;
    }

    setUserName(newName.trim());
    setMessage("Nome atualizado com sucesso.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function copyAppLink() {
    const link = window.location.origin;

    await navigator.clipboard.writeText(link);

    setMessage("Link do VivaRaiz copiado.");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">⚙️</p>

          <h1 className="mt-4 text-2xl font-black">
            Carregando configurações...
          </h1>

          <p className="mt-2 text-[#6B715F]">Verificando sua conta.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 pb-28 pt-8 text-[#2F3A2F]">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/dashboard" className="text-2xl font-black">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-6 text-4xl font-black">Configurações</h1>

            <p className="mt-2 text-[#6B715F]">
              Gerencie sua conta, seu perfil e informações do aplicativo.
            </p>
          </div>

          <a
            href="/mais"
            className="rounded-full border border-[#7A8F5A] px-5 py-3 text-center font-bold text-[#4F6F38]"
          >
            Voltar
          </a>
        </header>

        {message && (
          <section className="mt-6 rounded-[2rem] bg-white p-5 text-sm font-bold text-[#4F6F38] shadow-sm">
            {message}
          </section>
        )}

        <section className="mt-10 rounded-[2rem] bg-[#4F6F38] p-8 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">Sua conta</p>

          <h2 className="mt-3 text-3xl font-black">Olá, {userName}</h2>

          <p className="mt-2 text-white/80">{userEmail}</p>

          <button
            onClick={handleLogout}
            className="mt-6 rounded-full bg-white px-6 py-4 font-black text-[#4F6F38] transition hover:bg-[#EFE8DA]"
          >
            Sair da conta
          </button>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <form
            onSubmit={updateName}
            className="rounded-[2rem] bg-white p-7 shadow-sm"
          >
            <p className="text-4xl">👤</p>

            <h2 className="mt-5 text-2xl font-black">Perfil</h2>

            <p className="mt-2 text-[#6B715F]">
              Esse nome aparece no seu painel do VivaRaiz.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold">Nome</label>

              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white transition hover:bg-[#3F5C2B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar nome"}
            </button>
          </form>

          <section className="rounded-[2rem] bg-white p-7 shadow-sm">
            <p className="text-4xl">📱</p>

            <h2 className="mt-5 text-2xl font-black">Aplicativo</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-[#F7F3EA] p-4">
                <p className="text-sm font-bold text-[#7A8F5A]">Nome</p>
                <p className="mt-1 font-black">VivaRaiz</p>
              </div>

              <div className="rounded-2xl bg-[#F7F3EA] p-4">
                <p className="text-sm font-bold text-[#7A8F5A]">Versão</p>
                <p className="mt-1 font-black">1.0 MVP</p>
              </div>

              <div className="rounded-2xl bg-[#F7F3EA] p-4">
                <p className="text-sm font-bold text-[#7A8F5A]">Status</p>
                <p className="mt-1 font-black">Online com Supabase</p>
              </div>
            </div>

            <button
              onClick={copyAppLink}
              className="mt-5 w-full rounded-full bg-[#E3D8BD] px-6 py-4 font-black text-[#5B4A2F] transition hover:opacity-80"
            >
              Copiar link do app
            </button>
          </section>
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-7 shadow-sm">
          <p className="text-4xl">🌱</p>

          <h2 className="mt-5 text-2xl font-black">Sobre o VivaRaiz</h2>

          <p className="mt-3 text-[#6B715F]">
            O VivaRaiz foi criado para ajudar você a cuidar da casa, da comida,
            da horta, dos lembretes e da vida fora da tela. Quanto mais você
            cadastra sua vida real, mais o app consegue te ajudar.
          </p>
        </section>
      </div>
    </main>
  );
}