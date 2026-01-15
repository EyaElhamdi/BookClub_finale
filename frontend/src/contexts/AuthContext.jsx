import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
  });

  useEffect(() => {
    if (auth.token) localStorage.setItem("token", auth.token);
    else localStorage.removeItem("token");

    if (auth.role) localStorage.setItem("role", auth.role);
    else localStorage.removeItem("role");
  }, [auth]);

  const login = (token, role) => setAuth({ token, role });
  const logout = () => setAuth({ token: null, role: null });

  return (
    <AuthContext.Provider value={{ token: auth.token, role: auth.role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { token: null, role: null, login: () => {}, logout: () => {} };
  return ctx;
}
