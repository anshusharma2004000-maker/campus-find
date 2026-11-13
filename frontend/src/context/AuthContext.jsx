import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('campusfind_user')); } catch { return null; } });
  const [loading, setLoading] = useState(true);
  const save = useCallback(data => {
    localStorage.setItem('campusfind_token', data.token);
    localStorage.setItem('campusfind_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem('campusfind_token');
    localStorage.removeItem('campusfind_user');
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('campusfind_token')) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    api.get('/auth/me')
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        localStorage.setItem('campusfind_user', JSON.stringify(data.user));
      })
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [logout]);

  const value = useMemo(() => ({ user, loading, save, logout }), [user, loading, save, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
};
