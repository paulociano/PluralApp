// Arquivo: src/components/Header.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Header() {
  // Pegamos o usuário e a função de logout do nosso contexto global
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800">
              Plural
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* A mágica acontece aqui: renderização condicional */}
            {user ? (
              // Se EXISTE um usuário logado...
              <>
                <span className="text-gray-700 hidden sm:block">Olá, {user.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600"
                >
                  Sair
                </button>
              </>
            ) : (
              // Se NÃO existe um usuário logado...
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/login" className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600">
                  Cadastre-se
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}