import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('token', res.token);
    const userInfo = {
      id: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      targetRole: res.targetRole,
    };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(res.token);
    setUser(userInfo);
    return userInfo;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    localStorage.setItem('token', res.token);
    const userInfo = {
      id: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      targetRole: res.targetRole,
    };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(res.token);
    setUser(userInfo);
    return userInfo;
  };

  const updateProfile = async (profileData) => {
    const res = await authApi.updateProfile(profileData);
    setUser((prev) => ({ ...prev, ...profileData }));
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
