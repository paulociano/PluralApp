
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
  const [isLoading, setIsLoading] = useState(true); // Estado para saber se estamos verificando o login
  const router = useRouter();

  // NOVO useEffect: Roda uma vez quando o app carrega
  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedToken = localStorage.getItem('plural_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Com o token, buscamos os dados do usuário para confirmar que é válido
          const userResponse = await axios.get('http://localhost:3000/users/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(userResponse.data);
        } catch (error) {
          // Se o token for inválido, limpa tudo
          console.error('Sessão inválida, limpando token.', error);
          localStorage.removeItem('plural_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false); // Finaliza o carregamento inicial
    };
    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    // ... (o resto da função de login continua igual)
    try {
      const response = await axios.post('http://localhost:3000/auth/signin', { email, password });
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('plural_token', access_token);
      const userResponse = await axios.get('http://localhost:3000/users/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setUser(userResponse.data);
      router.push('/');
    } catch (error) {
      console.error('Falha no login', error);
      throw error;
    }
  };

  const logout = () => {
    // ... (a função de logout continua igual)
    setUser(null);
    setToken(null);
    localStorage.removeItem('plural_token');
    router.push('/login');
  };

  // Passamos isLoading para que outros componentes saibam que estamos verificando o login
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