"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!email.trim()) {
      setMessage("Digite seu e-mail.");
      return;
    }

    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/redefinir-senha`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setMessage(`Erro ao enviar recuperação: ${error.message}`);
      return;
    }

    setMessage(
      "Pronto! Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
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

            <p className="mt-8 text-7xl">🔑</p>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              Esqueceu a senha? A gente resolve.
            </h1>

            <p className="mt-4 leading-relaxed text-white/85">
              Digite o e-mail da sua conta e enviaremos um link para você criar
              uma nova senha com segurança.
            </p>

            <div className="mt-8 rounded-[2rem] bg-white/10 p-5">
              <p className="font-black">Depois de redefinir:</p>

              <div className="mt-4 space-y-3 text-sm text-white/85">
                <p>✅ Volte para o login</p>
                <p>✅ Entre com a nova senha</p>
                <p>✅ Continue usando seu VivaRaiz normalmente</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-6 shadow-sm md:p-10">
            <div>
              <p className="text-sm font-black text-[#7A8F5A]">
                Recuperação de acesso
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Redefinir senha
              </h2>

              <p className="mt-2 text-[#6B715F]">
                Informe o e-mail usado no cadastro do VivaRaiz.
              </p>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl bg-[#F7F3EA] p-4 text-sm font-bold text-[#4F6F38]">
                {message}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white transition hover:bg-[#3F5C2B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-[#F7F3EA] p-4 text-center text-sm text-[#6B715F]">
              <p>
                Lembrou sua senha?{" "}
                <a href="/login" className="font-black text-[#4F6F38]">
                  Voltar para o login
                </a>
              </p>
            </div>

            <div className="mt-6 text-center text-sm text-[#6B715F]">
              <div className="flex flex-wrap justify-center gap-4 font-bold">
                <a href="/" className="text-[#4F6F38]">
                  Início
                </a>

                <a href="/cadastro" className="text-[#4F6F38]">
                  Criar conta
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