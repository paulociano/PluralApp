'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext'; // Importe o useAuth

export default function SignupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // Novo estado para username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth(); // Use a função signup do contexto

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Chama a função centralizada do contexto
      await signup(name, username, email, password);
      // O redirecionamento já é feito dentro da função signup
    } catch (err: any) {
      console.error("Falha no cadastro:", err);
      const errorMessage = err.response?.data?.message || 'Não foi possível completar o cadastro.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center">
        <Image src="/plural-logo.svg" alt="Logo da Plural" width={150} height={40} className="mb-4" />
        <h2 className="text-2xl font-bold text-center text-gray-800 font-lora">Crie sua Conta</h2>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Campo Nome */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">Nome Completo</label>
          <input
            type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
            required disabled={isLoading}
          />
        </div>
        {/* Campo Nome de Usuário */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="username">Nome de Usuário</label>
          <input
            type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
            required disabled={isLoading} placeholder="ex: joao-silva"
          />
        </div>
        {/* Campo Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
            required disabled={isLoading}
          />
        </div>
        {/* Campo Senha */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">Senha</label>
          <input
            type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63A6A0]"
            required disabled={isLoading} minLength={8}
          />
        </div>
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
  );
}