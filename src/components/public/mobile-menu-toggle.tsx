"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NavItem {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
}

export function MobileMenuToggle({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  // Fecha com Esc — acessibilidade básica de overlay (Seção 20).
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded text-ivory"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Menu principal (mobile)"
          className="fixed inset-x-0 top-[57px] z-[var(--z-overlay)] border-t border-bronze/20 bg-warm-black px-4 py-6"
        >
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-lg text-ivory/90 hover:text-terracotta"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/busca"
                onClick={() => setOpen(false)}
                className="block py-2 text-lg text-ivory/90 hover:text-terracotta"
              >
                Buscar
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
