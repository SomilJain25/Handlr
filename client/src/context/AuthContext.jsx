import { createContext, useContext, useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
} from '../graphql/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  useEffect(() => {
    const stored = localStorage.getItem('handlr_user');
    if (stored) setUser(JSON.parse(stored));
    setInitializing(false);
  }, []);

  const persistSession = ({ accessToken, refreshToken, user: authedUser }) => {
    localStorage.setItem('handlr_access_token', accessToken);
    localStorage.setItem('handlr_refresh_token', refreshToken);
    localStorage.setItem('handlr_user', JSON.stringify(authedUser));
    setUser(authedUser);
  };

  const login = async (email, password) => {
    const { data } = await loginMutation({ variables: { input: { email, password } } });
    persistSession(data.login);
    return data.login.user;
  };

  const register = async ({ name, email, password, role }) => {
    const { data } = await registerMutation({
      variables: { input: { name, email, password, role } },
    });
    persistSession(data.register);
    return data.register.user;
  };

  const logout = async () => {
    try {
      await logoutMutation();
    } catch (err) {
      // Even if the server call fails (e.g. token already expired), clear locally.
    }
    localStorage.removeItem('handlr_access_token');
    localStorage.removeItem('handlr_refresh_token');
    localStorage.removeItem('handlr_user');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, register, logout, persistSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);