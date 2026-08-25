"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface NavItem {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
}

export function MobileMenuToggle({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Fecha com Esc e devolve o foco ao botão que abriu o menu —
  // acessibilidade de overlay (Seção 20).
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleButtonRef.current?.focus();
        return;
      }

      // Focus trap simples: Tab não deixa o foco escapar do overlay
      // enquanto ele estiver aberto.
      if (e.key === "Tab" && navRef.current) {
        const focusable = navRef.current.querySelectorAll<HTMLElement>("a[href], button");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // Move o foco para o primeiro link ao abrir.
    const firstLink = navRef.current?.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleButtonRef}
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
          ref={navRef}
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
