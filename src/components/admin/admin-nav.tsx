"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    apiFetch<{ count: number }>("/api/admin/contact-submissions/unread-count")
      .then((data) => setUnreadCount(data.count))
      .catch(() => {}); // não é crítico — badge só não aparece
  }, []);

  return (
    <nav className="border-b border-bronze/20 bg-charcoal px-6 py-4">
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
    </nav>
  );
}
