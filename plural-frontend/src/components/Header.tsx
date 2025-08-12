'use client';

import { useAuth } from '@/context/AuthContext';
import { useHeader } from '@/context/HeaderContext';
import Link from 'next/link';
import Image from 'next/image';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';
import { FiShield } from 'react-icons/fi';

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  const { isTopicPage, topicActions } = useHeader();

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado Esquerdo */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/" aria-label="Página Principal da Plural">
                <Image
                  src="/plural-logo.svg"
                  alt="Logo da Plural"
                  width={80}
                  height={80}
                  priority
                />
              </Link>
            </div>
            {isTopicPage && (
              <div className="hidden md:flex items-center space-x-2 border-l border-gray-200 pl-4">
                {topicActions}
              </div>
            )}
          </div>

          {/* Lado Direito */}
          <div className="flex items-center space-x-4">
            {!isLoading && user && (
              <>
                <div className="flex items-center space-x-4">
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" aria-label="Painel do Administrador" className="text-gray-500 hover:text-[#2D4F5A]">
                      <FiShield size={22} />
                    </Link>
                  )}
                  <NotificationBell />
                </div>

                <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

                <div className="flex items-center space-x-3">
                  <Link href={`/profile/${user.username || user.id}`} aria-label={`Ver perfil de ${user.name}`} className="flex items-center space-x-2 text-gray-700 hover:text-[#2D4F5A] transition-colors rounded-full p-1">
                    <Avatar name={user.name} size={32} />
                    <span className="hidden sm:block font-medium">Olá, {user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="bg-[#63A6A0] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-[#2D4F5A] transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            )}
            {!isLoading && !user && (
              <div className="space-x-2">
                <Link href="/login" className="text-gray-700 hover:text-[#2D4F5A]">
                  Entrar
                </Link>
                <Link href="/register" className="bg-[#63A6A0] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-[#2D4F5A] transition-colors">
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}