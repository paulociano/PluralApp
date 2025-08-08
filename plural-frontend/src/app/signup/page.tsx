/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import ParticlesBackground from '@/components/ParticlesBackground';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Adicionamos estado de carregamento
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Chama o endpoint de CADASTRO no backend
      await axios.post('http://localhost:3000/auth/signup', {
        email,
        password,
        name,
      });

      // 2. Se o cadastro for bem-sucedido, mostra uma mensagem de sucesso
      alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');

      // 3. Redireciona para a página de login
      router.push('/login');

    } catch (err: any) {
      console.error("Falha no cadastro:", err);
      const errorMessage = err.response?.data?.message || 'Não foi possível completar o cadastro.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
            <h2 className="text-2xl font-bold text-center text-gray-800">Crie sua Conta</h2>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Campo Nome */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">Nome</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
                required
                disabled={isLoading}
              />
            </div>
            {/* Campo Email */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
                required
                disabled={isLoading}
              />
            </div>
            {/* Campo Senha */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
                required
                disabled={isLoading}
              />
            </div>
            {/* Exibição de Erro */}
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-bold text-[#2D4F5A] hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}