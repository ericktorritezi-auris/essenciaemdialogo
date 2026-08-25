"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client/fetch";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityLabel: string | null;
  actorRole: string | null;
  createdAt: string;
  actor: { name: string; email: string } | null;
}

const ENTITY_TYPES = [
  "Article", "News", "Event", "Episode", "Media", "User",
  "HomeSection", "NavigationItem", "Platform", "RadioConfiguration", "ContactSubmission",
];

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (entityType) params.set("entityType", entityType);

    apiFetch<{ entries: AuditEntry[]; total: number }>(`/api/admin/audit-log?${params}`)
      .then((data) => {
        setEntries(data.entries);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message));
  }, [page, entityType]);

  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="font-display text-2xl">Log de atividades</h1>
      <p className="mt-2 text-sm text-ivory/50">
        Registro completo de ações administrativas — retenção de 12 meses (ver docs/AUDIT.md).
      </p>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-ivory/80">
          Filtrar por tipo:
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="ml-2 rounded border border-bronze/30 bg-charcoal px-2 py-1 text-sm text-ivory"
          >
            <option value="">Todos</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mt-4 text-terracotta">{error}</p>}
      {!entries && !error && <p className="mt-8 text-ivory/50">Carregando…</p>}
      {entries && entries.length === 0 && <p className="mt-8 text-ivory/50">Nenhum registro encontrado.</p>}

      {entries && entries.length > 0 && (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bronze/20 text-ivory/50">
              <th className="py-2 font-normal">Quando</th>
              <th className="py-2 font-normal">Quem</th>
              <th className="py-2 font-normal">Ação</th>
              <th className="py-2 font-normal">Entidade</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-bronze/10">
                <td className="py-2.5 text-ivory/50">
                  {new Date(entry.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </td>
                <td className="py-2.5 text-ivory/70">{entry.actor?.name ?? "—"}</td>
                <td className="py-2.5 text-ivory">{entry.action}</td>
                <td className="py-2.5 text-ivory/70">
                  {entry.entityType}
                  {entry.entityLabel && <span className="text-ivory/40"> · {entry.entityLabel}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-ivory/70 hover:text-terracotta disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="text-ivory/50">Página {page} de {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-ivory/70 hover:text-terracotta disabled:opacity-30"
          >
            Próxima →
          </button>
        </div>
      )}
    </main>
  );
}
