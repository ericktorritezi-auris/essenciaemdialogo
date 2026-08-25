import Image from "next/image";
import Link from "next/link";
import { getEnabledNavigationItems } from "@/lib/public/home-data";
import { MobileMenuToggle } from "@/components/public/mobile-menu-toggle";
import { OnAirBar } from "@/components/public/on-air-bar";

interface NavItem {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
}

export async function SiteHeader() {
  const items: NavItem[] = await getEnabledNavigationItems();

  return (
    <header className="sticky top-0 z-[var(--z-header)] border-b border-bronze/20 bg-warm-black/95 backdrop-blur">
      <OnAirBar />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/brand/logo-icon.png"
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 sm:h-9 sm:w-9"
            priority
          />
          <span className="font-display text-lg leading-none text-ivory">
            Essência
            <span className="block font-display text-[0.7em] italic text-terracotta">em diálogo</span>
          </span>
        </Link>

        {/* Menu desktop */}
        <nav aria-label="Menu principal" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm tracking-wide">
            {items.map((item: NavItem) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  className="text-ivory/80 transition-colors hover:text-terracotta"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/busca" aria-label="Buscar" className="text-ivory/80 transition-colors hover:text-terracotta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Menu mobile — client component isolado só para o estado de abrir/fechar */}
        <MobileMenuToggle items={items} />
      </div>
    </header>
  );
}
