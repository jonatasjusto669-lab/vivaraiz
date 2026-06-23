"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-10 text-[#2F3A2F]">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">
        <section className="w-full rounded-[2rem] bg-white p-8 shadow-xl">
          <a href="/" className="text-2xl font-black">
            🌱 VivaRaiz
          </a>

          <h1 className="mt-10 text-4xl font-black">Entrar</h1>

          <p className="mt-2 text-[#6B715F]">
            Continue cuidando da sua casa, comida, horta e rotina offline.
          </p>

          {message && (
            <div className="mt-6 rounded-2xl bg-[#F7F3EA] p-4 text-sm font-bold text-[#8A3A2C]">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold">E-mail</label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@gmail.com"
                className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">Senha</label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="block w-full rounded-full bg-[#4F6F38] px-6 py-4 text-center font-black text-white transition hover:bg-[#3F5C2B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar no VivaRaiz"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B715F]">
            Ainda não tem conta?{" "}
            <a href="/cadastro" className="font-bold text-[#4F6F38]">
              Criar conta
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}