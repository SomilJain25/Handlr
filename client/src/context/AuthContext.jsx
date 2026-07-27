import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('handlr_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const persistSession = ({ accessToken, refreshToken, user: authedUser }) => {
    localStorage.setItem('handlr_access_token', accessToken);
    localStorage.setItem('handlr_refresh_token', refreshToken);
    localStorage.setItem('handlr_user', JSON.stringify(authedUser));
    setUser(authedUser);
  };

  const logout = () => {
    localStorage.removeItem('handlr_access_token');
    localStorage.removeItem('handlr_refresh_token');
    localStorage.removeItem('handlr_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, persistSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
