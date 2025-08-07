// Arquivo: src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Tipos para nosso contexto
type User = { id: string; email: string; name: string; };
type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Criamos o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Criamos o "Provedor" do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3000/auth/signin', {
        email,
        password,
      });
      const { access_token } = response.data;
      setToken(access_token);

      // Guardamos o token no localStorage para manter o login após recarregar a página
      localStorage.setItem('plural_token', access_token);

      // Buscamos os dados do usuário com o novo token
      const userResponse = await axios.get('http://localhost:3000/users/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setUser(userResponse.data);

      router.push('/'); // Redireciona para a home após o login
    } catch (error) {
      console.error('Falha no login', error);
      // Adicionar lógica para mostrar erro para o usuário
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('plural_token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Criamos um "hook" customizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}