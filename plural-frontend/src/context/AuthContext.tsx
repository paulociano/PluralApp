'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type User = { id: string; email: string; name: string; };
type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedToken = localStorage.getItem('plural_token');
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // Adicionado para consistência
        try {
          // CORREÇÃO AQUI: Adicionado o /api
          const userResponse = await axios.get('http://localhost:3000/api/users/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
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

  const login = async (email, password) => {
    try {
      // CORREÇÃO AQUI: Adicionado o /api
      const response = await axios.post('http://localhost:3000/api/auth/signin', { email, password });
      
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('plural_token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Com o header padrão do axios já configurado, não precisamos mais passar o header aqui
      // CORREÇÃO AQUI: Adicionado o /api
      const userResponse = await axios.get('http://localhost:3000/api/users/me');
      
      setUser(userResponse.data);
      router.push('/');
    } catch (error) {
      console.error('Falha no login', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('plural_token');
    delete axios.defaults.headers.common['Authorization']; // Limpa o header padrão
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
