"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RedefinirSenhaPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkRecoverySession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setMessage(
          "Abra esta página pelo link de redefinição enviado para o seu e-mail."
        );
      }

      setLoadingPage(false);
    }

    checkRecoverySession();
  }, []);

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (password.length < 6) {
      setMessage("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("As senhas não são iguais.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSaving(false);

    if (error) {
      setMessage(`Erro ao redefinir senha: ${error.message}`);
      return;
    }

    setMessage("Senha redefinida com sucesso. Você já pode entrar novamente.");

    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }, 1500);
  }

  if (loadingPage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🔐</p>

          <h1 className="mt-4 text-2xl font-black">
            Carregando redefinição...
          </h1>

          <p className="mt-2 text-[#6B715F]">Verificando o link.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-10 text-[#2F3A2F]">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">
        <section className="w-full rounded-[2rem] bg-white p-8 shadow-xl">
          <a href="/" className="text-2xl font-black">
            🌱 VivaRaiz
          </a>

          <h1 className="mt-10 text-4xl font-black">Criar nova senha</h1>

          <p className="mt-2 text-[#6B715F]">
            Digite sua nova senha para voltar a acessar sua conta VivaRaiz.
          </p>

          {message && (
            <div className="mt-6 rounded-2xl bg-[#F7F3EA] p-4 text-sm font-bold text-[#4F6F38]">
              {message}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold">
                Nova senha
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Confirmar nova senha
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Digite a senha novamente"
                className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="block w-full rounded-full bg-[#4F6F38] px-6 py-4 text-center font-black text-white transition hover:bg-[#3F5C2B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B715F]">
            Voltar para{" "}
            <a href="/login" className="font-bold text-[#4F6F38]">
              login
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}