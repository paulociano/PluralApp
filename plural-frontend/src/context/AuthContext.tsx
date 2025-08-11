/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api'; // Usando nossa instância centralizada do Axios
import { useRouter } from 'next/navigation';

// Define a estrutura do usuário e do contexto
type User = {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'USER' | 'ADMIN';
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Cria o contexto com um valor padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente Provedor que envolve a aplicação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Efeito para carregar o usuário do localStorage ao iniciar a aplicação
  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedToken = localStorage.getItem('plural_token');
      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const userResponse = await api.get('/users/me');
          setUser(userResponse.data);
        } catch (error) {
          console.error('Sessão inválida, limpando token.', error);
          localStorage.removeItem('plural_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    loadUserFromStorage();
  }, []);

  // Função de LOGIN
  const login = async (email: any, password: any) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('plural_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);
      router.push('/');
    } catch (error) {
      console.error('Falha no login', error);
      throw error;
    }
  };

  // Função de CADASTRO (SIGNUP)
  const signup = async (name: any, username: any, email: any, password: any) => {
    try {
      const response = await api.post('/auth/signup', { name, username, email, password });
      const { access_token } = response.data;

      // Após o cadastro, loga o usuário automaticamente
      setToken(access_token);
      localStorage.setItem('plural_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);
      
      router.push('/'); // Redireciona para a home
    } catch (error) {
      console.error("Falha no cadastro:", error);
      throw error;
    }
  };

  // Função de LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('plural_token');
    delete api.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  const value = { user, token, isLoading, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
