"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client/fetch";

interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/home", label: "Home", adminOnly: true },
  { href: "/admin/menu", label: "Menu", adminOnly: true },
  { href: "/admin/episodes", label: "Episódios" },
  { href: "/admin/articles", label: "Artigos" },
  { href: "/admin/news", label: "Notícias" },
  { href: "/admin/events", label: "Eventos" },
  { href: "/admin/media", label: "Mídia" },
  { href: "/admin/platforms", label: "Plataformas", adminOnly: true },
  { href: "/admin/radio", label: "Rádio", adminOnly: true },
  { href: "/admin/contact-submissions", label: "Perguntas", adminOnly: true },
  { href: "/admin/users", label: "Usuários", adminOnly: true },
  { href: "/admin/audit-log", label: "Logs", adminOnly: true },
];

export function AdminNav() {
  const router = useRouter();
  const [role, setRole] = useState<"ADMIN" | "COLLABORATOR" | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    apiFetch<{ role: "ADMIN" | "COLLABORATOR" }>("/api/admin/me")
      .then((data) => setRole(data.role))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Só faz sentido buscar isso se o item "Perguntas" for aparecer
    // (admin only) — evita uma chamada de API que só voltaria 403 para
    // um Colaborador.
    if (role !== "ADMIN") return;
    apiFetch<{ count: number }>("/api/admin/contact-submissions/unread-count")
      .then((data) => setUnreadCount(data.count))
      .catch(() => {});
  }, [role]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");

  return (
    <nav className="border-b border-bronze/20 bg-charcoal px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap gap-6 text-sm">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="relative text-ivory/70 hover:text-terracotta">
                {item.label}
                {item.href === "/admin/contact-submissions" && unreadCount > 0 && (
                  <span
                    aria-label={`${unreadCount} pergunta(s) não lida(s)`}
                    className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1.5 text-xs font-medium text-ivory"
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin/profile" className="text-ivory/70 hover:text-terracotta">
            Meu perfil
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-ivory/70 hover:text-terracotta disabled:opacity-60"
          >
            {loggingOut ? "Saindo…" : "Sair"}
          </button>
        </div>
      </div>
    </nav>
  );
}
