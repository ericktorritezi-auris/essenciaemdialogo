import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Artigos" },
  { href: "/admin/news", label: "Notícias" },
  { href: "/admin/events", label: "Eventos" },
  { href: "/admin/media", label: "Mídia" },
];

export function AdminNav() {
  return (
    <nav className="border-b border-bronze/20 bg-charcoal px-6 py-4">
      <ul className="flex flex-wrap gap-6 text-sm">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-ivory/70 hover:text-terracotta">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
