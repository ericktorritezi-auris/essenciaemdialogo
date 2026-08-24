"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }

      router.push(from);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-warm-black px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-bronze/30 bg-charcoal p-8"
      >
        <h1 className="font-display text-2xl text-ivory">Essência em Diálogo</h1>
        <p className="mt-1 text-sm text-ivory/60">Painel administrativo</p>

        <label className="mt-6 block text-sm text-ivory/80">
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 text-ivory outline-none focus:border-bronze"
          />
        </label>

        <label className="mt-4 block text-sm text-ivory/80">
          Senha
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 text-ivory outline-none focus:border-bronze"
          />
        </label>

        {error && (
          <p role="alert" className="mt-4 text-sm text-terracotta">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded bg-terracotta py-2 font-medium text-ivory disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
