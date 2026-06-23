"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!name.trim()) {
      setMessage("Digite seu nome.");
      return;
    }

    if (!email.trim()) {
      setMessage("Digite seu e-mail.");
      return;
    }

    if (password.length < 6) {
      setMessage("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (!acceptedTerms) {
      setMessage(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade."
      );
      return;
    }

    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          name: name.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(`Erro ao criar conta: ${error.message}`);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      return;
    }

    setMessage(
      "Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login."
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

            <p className="mt-8 text-7xl">🏡</p>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              Comece a organizar sua vida real.
            </h1>

            <p className="mt-4 leading-relaxed text-white/85">
              Crie sua conta para salvar itens da casa, alimentos, plantas,
              compras, lembretes e missões offline.
            </p>

            <div className="mt-8 rounded-[2rem] bg-white/10 p-5">
              <p className="font-black">Com sua conta você pode:</p>

              <div className="mt-4 space-y-3 text-sm text-white/85">
                <p>✅ Acessar seus dados em outro celular</p>
                <p>✅ Salvar tudo no Supabase</p>
                <p>✅ Usar o VivaRaiz como app no celular</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-6 shadow-sm md:p-10">
            <div>
              <p className="text-sm font-black text-[#7A8F5A]">
                Cadastro gratuito
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Criar conta
              </h2>

              <p className="mt-2 text-[#6B715F]">
                Preencha seus dados para entrar no VivaRaiz.
              </p>
            </div>

            {message && (
              <div className="mt-5 rounded-2xl bg-[#F7F3EA] p-4 text-sm font-bold text-[#4F6F38]">
                {message}
              </div>
            )}

            <form onSubmit={handleSignUp} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">Nome</label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                />
              </div>

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
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-4 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl bg-[#F7F3EA] p-4 text-sm text-[#6B715F]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-1 h-5 w-5 accent-[#4F6F38]"
                />

                <span>
                  Li e aceito os{" "}
                  <a
                    href="/termos"
                    target="_blank"
                    className="font-black text-[#4F6F38] underline underline-offset-4"
                  >
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a
                    href="/privacidade"
                    target="_blank"
                    className="font-black text-[#4F6F38] underline underline-offset-4"
                  >
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#4F6F38] px-6 py-4 font-black text-white transition hover:bg-[#3F5C2B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Criando conta..." : "Criar minha conta"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#6B715F]">
              <p>
                Já tem conta?{" "}
                <a href="/login" className="font-black text-[#4F6F38]">
                  Entrar
                </a>
              </p>

              <div className="mt-4 flex justify-center gap-4 font-bold">
                <a href="/" className="text-[#4F6F38]">
                  Início
                </a>

                <a href="/privacidade" className="text-[#4F6F38]">
                  Privacidade
                </a>

                <a href="/termos" className="text-[#4F6F38]">
                  Termos
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}