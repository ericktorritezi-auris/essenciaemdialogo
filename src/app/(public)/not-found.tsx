import { NotFoundContent } from "@/components/public/not-found-content";

/**
 * 404 dentro do grupo público — renderiza dentro de `(public)/layout.tsx`,
 * então já ganha cabeçalho/rodapé automaticamente (Sprint 12).
 */
export default function NotFound() {
  return <NotFoundContent />;
}
