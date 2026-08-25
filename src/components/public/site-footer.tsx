import Image from "next/image";
import Link from "next/link";
import { getEnabledNavigationItems, getActivePlatforms } from "@/lib/public/home-data";
import { WaveDivider } from "@/components/public/wave-divider";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

export async function SiteFooter() {
  const [items, platforms] = await Promise.all([
    getEnabledNavigationItems(),
    getActivePlatforms(),
  ]);

  return (
    <footer className="border-t border-bronze/20 bg-charcoal">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <div className="flex items-center gap-2.5">
              <Image src="/brand/logo-icon.png" alt="" width={28} height={28} className="h-7 w-7" />
              <span className="font-display text-base leading-none text-ivory">
                Essência <span className="italic text-terracotta">em diálogo</span>
              </span>
            </div>
            <p className="max-w-xs text-sm text-ivory/50">
              Duas perspectivas. Um tema. Uma conversa além da superfície.
            </p>
          </div>

          {items.length > 0 && (
            <nav aria-label="Links do rodapé">
              <ul className="flex flex-col items-center gap-2 text-sm sm:items-start">
                {items.map((item: NavItem) => (
                  <li key={item.id}>
                    <Link href={item.href} className="text-ivory/60 transition-colors hover:text-terracotta">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {platforms.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-bronze">Ouça também em</p>
              <ul className="mt-3 flex flex-col items-center gap-2 text-sm sm:items-start">
                {platforms.map((platform: { id: string; name: string }) => (
                  <li key={platform.id} className="text-ivory/60">
                    {platform.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <WaveDivider className="mt-12" />

        <div className="mt-6 text-center text-xs text-ivory/40">
          <p>© {new Date().getFullYear()} Essência em Diálogo. Todos os direitos reservados.</p>
          <p className="mt-1">Desenvolvido por Erick Torritezi.</p>
        </div>
      </div>
    </footer>
  );
}
