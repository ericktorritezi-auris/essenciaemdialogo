"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client/fetch";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "COLLABORATOR";
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "COLLABORATOR">("COLLABORATOR");
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  function load() {
    apiFetch<{ users: User[] }>("/api/admin/users")
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setCreatedCredentials(null);
    try {
      const data = await apiFetch<{ user: User; generatedPassword: string }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ name, email, role }),
      });
      setCreatedCredentials({ email: data.user.email, password: data.generatedPassword });
      setName("");
      setEmail("");
      setRole("COLLABORATOR");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao criar usuário.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(user: User) {
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !user.active }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao atualizar.");
    }
  }

  async function toggleRole(user: User) {
    const newRole = user.role === "ADMIN" ? "COLLABORATOR" : "ADMIN";
    if (!confirm(`Trocar o papel de ${user.name} para ${newRole === "ADMIN" ? "Administrador" : "Colaborador"}?`)) return;
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao atualizar.");
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-display text-2xl">Usuários</h1>
      <p className="mt-2 text-sm text-ivory/50">
        Colaboradores criam/editam conteúdo e enviam para revisão. Administradores têm acesso total.
      </p>

      {error && <p className="mt-4 text-terracotta">{error}</p>}

      {createdCredentials && (
        <div className="mt-6 rounded border border-terracotta/50 bg-charcoal p-4">
          <p className="text-sm text-ivory">
            Conta criada. <strong>Copie a senha agora — ela não aparece de novo em lugar nenhum:</strong>
          </p>
          <p className="mt-2 font-mono text-sm text-ivory/90">E-mail: {createdCredentials.email}</p>
          <p className="mt-1 font-mono text-sm text-terracotta">Senha: {createdCredentials.password}</p>
        </div>
      )}

      <form onSubmit={handleCreate} className="mt-6 rounded border border-bronze/20 bg-charcoal p-6">
        <h2 className="text-sm uppercase tracking-wide text-bronze">Novo usuário</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 text-ivory"
            />
          </label>
          <label className="block text-sm text-ivory/80">
            Papel
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "COLLABORATOR")}
              className="mt-1 w-full rounded border border-bronze/30 bg-warm-black px-3 py-2 text-ivory"
            >
              <option value="COLLABORATOR">Colaborador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded bg-terracotta px-4 py-2 text-sm font-medium text-ivory disabled:opacity-60"
        >
          {creating ? "Criando…" : "Criar usuário"}
        </button>
      </form>

      {!users && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}

      {users && users.length > 0 && (
        <div className="mt-6 space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded border border-bronze/20 bg-charcoal p-4">
              <div>
                <p className="text-ivory">
                  {user.name} <span className="text-xs text-ivory/40">({user.email})</span>
                </p>
                <p className="mt-1 text-xs text-bronze">
                  {user.role === "ADMIN" ? "Administrador" : "Colaborador"}
                  {!user.active && <span className="ml-2 text-terracotta">Inativo</span>}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <button type="button" onClick={() => toggleRole(user)} className="text-ivory/70 hover:text-terracotta">
                  Trocar papel
                </button>
                <button type="button" onClick={() => toggleActive(user)} className="text-ivory/70 hover:text-terracotta">
                  {user.active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
