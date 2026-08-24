export function SiteFooter() {
  return (
    <footer className="border-t border-bronze/20 px-4 py-8 text-center text-sm text-ivory/50 sm:px-6">
      <p>© {new Date().getFullYear()} Essência em Diálogo. Todos os direitos reservados.</p>
      <p className="mt-1">Desenvolvido por Erick Torritezi.</p>
    </footer>
  );
}
