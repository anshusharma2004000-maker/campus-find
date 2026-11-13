import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('campusfind_user')); } catch { return null; } });
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!localStorage.getItem('campusfind_token')) { setLoading(false); return; } api.get('/auth/me').then(({ data }) => { setUser(data.user); localStorage.setItem('campusfind_user', JSON.stringify(data.user)); }).catch(() => logout()).finally(() => setLoading(false)); }, []);
  function save(data) { localStorage.setItem('campusfind_token', data.token); localStorage.setItem('campusfind_user', JSON.stringify(data.user)); setUser(data.user); }
  function logout() { localStorage.removeItem('campusfind_token'); localStorage.removeItem('campusfind_user'); setUser(null); }
  return <AuthContext.Provider value={{ user, loading, save, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
