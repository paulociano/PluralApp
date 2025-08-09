// Arquivo: src/components/LayoutManager.tsx
'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import PageTransition from './PageTransition';

// Este componente decide o que mostrar com base na rota
export default function LayoutManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Lista de rotas onde o Header NÃO deve aparecer
  const noHeaderRoutes = ['/login', '/signup'];

  const showHeader = !noHeaderRoutes.includes(pathname);

  return (
    <>
      {showHeader && <Header />}
      <main><PageTransition>{children}</PageTransition></main>
    </>
  );
}