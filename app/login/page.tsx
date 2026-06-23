"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.push("/dashboard");
        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!email.trim()) {
      setMessage("Digite seu e-mail.");
      return;
    }

    if (!password.trim()) {
      setMessage("Digite sua senha.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(`Erro ao entrar: ${error.message}`);
      return;
    }

    router.push("/dashboard");
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-6 text-[#2F3A2F]">
        <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-5xl">🌱</p>

          <h1 className="mt-4 text-2xl font-black">Abrindo VivaRaiz...</h1>

          <p className="mt-2 text-[#6B715F]">Verificando sua sessão.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-4 py-6 text-[#2F3A2F] md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <section className="grid w-full gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2.5rem] bg-[#4F6F38] p-7 text-white shadow-sm md:p-10">
            <a href="/" className="text-xl font-black md:text-2xl">
              🌱 VivaRaiz
            </a>

            <p className="mt-8 text-7xl">🔐</p>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              Entre e continue cuidando da sua vida real.
            </h1>

            <p className="mt-4 leading-relaxed text-white/85">
              Acesse sua casa, cozinha, horta, compras, lembretes e missões
              offline em um só lugar.
            </p>

            <div className="mt-8 rounded-[2rem] bg-white/10 p-5">
              <p className="font-black">No VivaRaiz você acompanha:</p>

              <div className="mt-4 space-y-3 text-sm text-white/85">
                <p>🏡 Itens guardados na casa</p>
                <p>🍲 Alimentos próximos do vencimento</p>
                <p>🌱 Plantas para regar</p>
                <p>🛒 Compras pendentes</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-6 shadow-sm md:p-10">
            <div>
              <p className="text-sm font-black text-[#7A8F5A]">
                Acesso à conta
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Entrar no VivaRaiz
              </h2>

              <p className="mt-2 text-[#6B715F]">
                Digite seu e-mail e senha para abrir seu painel.
              </p>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl bg-[#F7F3EA] p-4 text-sm font-bold text-[#8A3A2C]">
                {message}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">E-mail</label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@gmail.com"
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Senha</label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <div className="flex justify-end">
                <a
                  href="/esqueci-senha"
                  className="text-sm font-black text-[#4F6F38]"
                >
                  Esqueci minha senha
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white transition hover:bg-[#3F5C2B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-[#F7F3EA] p-4 text-center text-sm text-[#6B715F]">
              <p>
                Ainda não tem conta?{" "}
                <a href="/cadastro" className="font-black text-[#4F6F38]">
                  Criar conta grátis
                </a>
              </p>
            </div>

            <div className="mt-6 text-center text-sm text-[#6B715F]">
              <div className="flex flex-wrap justify-center gap-4 font-bold">
                <a href="/" className="text-[#4F6F38]">
                  Início
                </a>

                <a href="/sobre" className="text-[#4F6F38]">
                  Sobre
                </a>

                <a href="/privacidade" className="text-[#4F6F38]">
                  Privacidade
                </a>

                <a href="/termos" className="text-[#4F6F38]">
                  Termos
                </a>
              </div>

              <p className="mt-4">
                VivaRaiz 1.0 — organize sua vida real 🌱
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}