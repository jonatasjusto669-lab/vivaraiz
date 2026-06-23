"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCadastro(event: FormEvent<HTMLFormElement>) {
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

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Conta criada com sucesso. Agora entre com seu e-mail e senha.");

    setTimeout(() => {
      router.push("/login");
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-10 text-[#2F3A2F]">
      <div className="mx-auto flex min-h-[85vh] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] bg-white shadow-xl md:grid-cols-2">
          <section className="bg-[#4F6F38] p-8 text-white md:p-12">
            <a href="/" className="text-2xl font-black">
              🌱 VivaRaiz
            </a>

            <h1 className="mt-12 text-4xl font-black leading-tight">
              Comece a organizar sua vida real.
            </h1>

            <p className="mt-5 text-white/80">
              Cadastre sua casa, sua cozinha, sua horta e receba pequenas
              missões para viver mais fora da tela.
            </p>

            <div className="mt-10 space-y-4">
              <p>🍅 Evite comida vencendo</p>
              <p>📦 Lembre onde guardou as coisas</p>
              <p>🌿 Cuide melhor da sua horta</p>
              <p>🌤️ Viva mais fora do celular</p>
            </div>
          </section>

          <section className="p-8 md:p-12">
            <h2 className="text-3xl font-black">Criar conta</h2>

            <p className="mt-2 text-[#6B715F]">
              Entre para começar sua rotina VivaRaiz.
            </p>

            {message && (
              <div className="mt-6 rounded-2xl bg-[#F7F3EA] p-4 text-sm font-bold text-[#4F6F38]">
                {message}
              </div>
            )}

            <form onSubmit={handleCadastro} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold">Nome</label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                />
              </div>

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
                  placeholder="Crie uma senha com no mínimo 6 caracteres"
                  className="w-full rounded-2xl border border-[#DDD2BC] bg-[#FBF8F0] px-4 py-3 outline-none focus:border-[#4F6F38]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="block w-full rounded-full bg-[#4F6F38] px-6 py-4 text-center font-black text-white transition hover:bg-[#3F5C2B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Criando conta..." : "Criar minha conta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#6B715F]">
              Já tem conta?{" "}
              <a href="/login" className="font-bold text-[#4F6F38]">
                Entrar
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}