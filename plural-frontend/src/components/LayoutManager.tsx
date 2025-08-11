'use client';

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "./Header";
// A importação de PageTransition foi removida daqui

// Defina aqui as rotas que um usuário deslogado PODE acessar
const PUBLIC_PATHS = ['/login', '/register', '/signup'];

export default function LayoutManager({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (!user && !isPublicPath) {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }
  
  if (!user && PUBLIC_PATHS.includes(pathname)) {
    // Apenas renderiza o conteúdo da página, sem o PageTransition
    return <main>{children}</main>;
  }

  if (user) {
    return (
      <>
        <Header />
        {/* Apenas renderiza o conteúdo da página, sem o PageTransition */}
        <main>{children}</main>
      </>
    );
  }

  return null;
}