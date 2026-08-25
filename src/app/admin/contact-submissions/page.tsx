"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client/fetch";

interface Submission {
  id: string;
  name: string;
  email: string;
  question: string;
  createdAt: string;
}

export default function AdminContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ submissions: Submission[] }>("/api/admin/contact-submissions")
      .then((data) => setSubmissions(data.submissions))
      .catch((err) => setError(err.message));

    // Zera o contador de não lidas — "tudo visto de uma vez" ao abrir
    // esta tela, não por mensagem individual (Sprint 6/8).
    apiFetch("/api/admin/contact-submissions/mark-viewed", { method: "POST" }).catch(() => {
      // Silencioso — se isso falhar, o pior caso é o contador continuar
      // mostrando um número que já foi visto, não é crítico.
    });
  }, []);

  return (
    <main className="p-8">
      <h1 className="font-display text-2xl">Perguntas do público</h1>

      {error && <p className="mt-4 text-terracotta">{error}</p>}
      {!submissions && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}
      {submissions && submissions.length === 0 && (
        <p className="mt-8 text-ivory/50">Nenhuma pergunta recebida ainda.</p>
      )}

      {submissions && submissions.length > 0 && (
        <div className="mt-6 space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="rounded border border-bronze/20 bg-charcoal p-4">
              <div className="flex items-center justify-between text-xs text-ivory/40">
                <span>{s.name} · {s.email}</span>
                <span>{new Date(s.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
              </div>
              <p className="mt-2 text-ivory/90">{s.question}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
