import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  //
  //
  //
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authService
      .getMe()
      .then((me) => {
        if (!cancelled && me.role === 'admin') setUser(me);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const me = await authService.login(email, password);
    if (me.role !== 'admin') {
      await authService.logout();
      throw new Error('This account does not have manager/admin access.');
    }
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, checking, isAuthenticated: Boolean(user), login, logout }),
    [user, checking, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
