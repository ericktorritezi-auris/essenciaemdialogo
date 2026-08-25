"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";

interface Me {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "COLLABORATOR";
}

export default function AdminProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    apiFetch<Me>("/api/admin/me")
      .then((data) => {
        setMe(data);
        setName(data.name);
      })
      .catch(() => {});
  }, []);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameSaving(true);
    setNameError(null);
    setNameSaved(false);
    try {
      await apiFetch("/api/admin/profile", { method: "PATCH", body: JSON.stringify({ name }) });
      setNameSaved(true);
    } catch (err) {
      setNameError(err instanceof ApiError ? err.message : "Erro ao salvar.");
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("A confirmação não bate com a nova senha.");
      return;
    }

    setPasswordSaving(true);
    try {
      await apiFetch("/api/admin/profile/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Erro ao trocar senha.");
    } finally {
      setPasswordSaving(false);
    }
  }

  if (!me) return <main className="p-8 text-ivory/50">Carregando…</main>;

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="font-display text-2xl">Meu perfil</h1>

      <section className="mt-8 rounded border border-bronze/20 bg-charcoal p-6">
        <h2 className="text-sm uppercase tracking-wide text-bronze">Dados da conta</h2>
        <form onSubmit={handleSaveName} className="mt-4 space-y-4">
          <label className="block text-sm text-ivory/80">
            Nome
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 text-ivory"
            />
          </label>
          <label className="block text-sm text-ivory/80">
            E-mail
            <input
              disabled
              value={me.email}
              className="mt-1 w-full rounded border border-bronze/20 bg-warm-black/50 px-3 py-2 text-ivory/50"
            />
          </label>
          <p className="text-xs text-ivory/40">Papel: {me.role === "ADMIN" ? "Administrador" : "Colaborador"}</p>

          {nameError && <p className="text-sm text-terracotta">{nameError}</p>}
          {nameSaved && <p className="text-sm text-bronze">Nome atualizado.</p>}

          <button
            type="submit"
            disabled={nameSaving}
            className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory disabled:opacity-60"
          >
            {nameSaving ? "Salvando…" : "Salvar nome"}
          </button>
        </form>
      </section>

      <section className="mt-6 rounded border border-bronze/20 bg-charcoal p-6">
        <h2 className="text-sm uppercase tracking-wide text-bronze">Trocar senha</h2>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <label className="block text-sm text-ivory/80">
            Senha atual
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 text-ivory"
            />
          </label>
          <label className="block text-sm text-ivory/80">
            Nova senha
            <input
              required
              type="password"
              minLength={12}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 text-ivory"
            />
            <span className="mt-1 block text-xs text-ivory/40">Mínimo de 12 caracteres.</span>
          </label>
          <label className="block text-sm text-ivory/80">
            Confirmar nova senha
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 text-ivory"
            />
          </label>

          {passwordError && <p className="text-sm text-terracotta">{passwordError}</p>}
          {passwordSaved && <p className="text-sm text-bronze">Senha alterada com sucesso.</p>}

          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory disabled:opacity-60"
          >
            {passwordSaving ? "Alterando…" : "Trocar senha"}
          </button>
        </form>
      </section>
    </main>
  );
}
