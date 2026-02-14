import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
  id_usuario: string;
  nombre: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      // Restaurar estado local inmediatamente
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      // Validar que el token siga siendo válido contra el backend
      api
        .get('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
        .then((res) => {
          const d = res.data;
          const u: User = { id_usuario: d.id_usuario, nombre: d.nombre, email: d.email };
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
          // Token inválido o expirado → cerrar sesión
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post('/api/auth/login', { email, password });
    const data = res.data;
    const u: User = { id_usuario: data.user_id, nombre: data.nombre, email: data.email };
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(data.access_token);
    setUser(u);
  }

  async function register(nombre: string, email: string, password: string) {
    const res = await api.post('/api/auth/register', { nombre, email, password });
    const data = res.data;
    const u: User = { id_usuario: data.user_id, nombre: data.nombre, email: data.email };
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(data.access_token);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
