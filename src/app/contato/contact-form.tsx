"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, question, consent, website }),
      });
      setStatus("sent");
      setName("");
      setEmail("");
      setQuestion("");
      setConsent(false);
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Erro ao enviar. Tente novamente.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded border border-bronze/30 bg-charcoal p-6 text-center">
        <p className="text-ivory">Pergunta enviada! Obrigado por participar.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — invisível para humanos, some da tela mas continua no DOM */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px]"
      />

      <label className="block text-sm text-ivory/80">
        Nome
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory"
        />
      </label>

      <label className="block text-sm text-ivory/80">
        E-mail
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory"
        />
      </label>

      <label className="block text-sm text-ivory/80">
        Sua pergunta ou sugestão de tema
        <textarea
          required
          minLength={10}
          rows={5}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 w-full rounded border border-bronze/30 bg-charcoal px-3 py-2 text-ivory"
        />
      </label>

      <label className="flex items-start gap-2 text-xs text-ivory/60">
        <input
          required
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        Concordo que minha pergunta pode ser usada (de forma anônima) em um episódio futuro, e
        entendo que este canal não substitui atendimento terapêutico ou de emergência.
      </label>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded bg-terracotta px-6 py-3 text-sm font-medium text-ivory disabled:opacity-60"
      >
        {status === "sending" ? "Enviando…" : "Enviar pergunta"}
      </button>
    </form>
  );
}
