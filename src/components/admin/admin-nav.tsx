"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client/fetch";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/home", label: "Home" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/episodes", label: "Episódios" },
  { href: "/admin/articles", label: "Artigos" },
  { href: "/admin/news", label: "Notícias" },
  { href: "/admin/events", label: "Eventos" },
  { href: "/admin/media", label: "Mídia" },
  { href: "/admin/platforms", label: "Plataformas" },
  { href: "/admin/radio", label: "Rádio" },
  { href: "/admin/contact-submissions", label: "Perguntas" },
];

export function AdminNav() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    apiFetch<{ count: number }>("/api/admin/contact-submissions/unread-count")
      .then((data) => setUnreadCount(data.count))
      .catch(() => {}); // não é crítico — badge só não aparece
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <nav className="border-b border-bronze/20 bg-charcoal px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap gap-6 text-sm">
          {NAV_ITEMS.map((item) => (
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
