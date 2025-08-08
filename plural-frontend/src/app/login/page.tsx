// Arquivo: src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import ParticlesBackground from '@/components/ParticlesBackground'; // Importe nosso novo fundo

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error("Falha ao tentar logar");
    }
  };

  return (
    <>
      <ParticlesBackground />
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center">
            <Image
              src="/plural-logo.svg"
              alt="Logo da Plural"
              width={150}
              height={40}
              className="mb-4"
            />
            <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-gray-700 px-3 py-2 border-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-gray-700 px-3 py-2 border-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
                required
              />
            </div>
            <Button type="submit">
              Entrar
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Ainda não tem uma conta?{' '}
              <Link href="/signup" className="font-bold text-[#2D4F5A] hover:underline">
                Cadastre-se
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <Link href="/forgot-password" className="font-bold text-[#2D4F5A] hover:underline">
                Esqueci minha senha
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}