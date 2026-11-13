import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { isDemoToken } from '../services/demo';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('campusfind_user')); } catch { return null; } });
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem('campusfind_demo_mode') === 'true');
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
  const enableDemoMode = useCallback(() => {
    localStorage.setItem('campusfind_demo_mode', 'true');
    setDemoMode(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('campusfind_token');
    if (!token || isDemoToken(token)) {
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

  const value = useMemo(() => ({ user, loading, demoMode, save, logout, enableDemoMode }), [user, loading, demoMode, save, logout, enableDemoMode]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
};
