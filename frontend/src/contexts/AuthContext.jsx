import React, { createContext, useContext, useEffect, useState } from "react";

// Création du contexte AuthContext
// Permet de partager les infos d'authentification (token + rôle) dans toute l'application
const AuthContext = createContext(null);

/* ---------- Provider pour AuthContext ---------- */
export function AuthProvider({ children }) {
  // État local pour stocker le token et le rôle de l'utilisateur
  // On initialise depuis localStorage pour garder la session après refresh
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"), // récupère le token si existant
    role: localStorage.getItem("role"),   // récupère le rôle si existant
  });

  // useEffect pour synchroniser l'état avec le localStorage
  useEffect(() => {
    if (auth.token) localStorage.setItem("token", auth.token);
    else localStorage.removeItem("token"); // supprime si null

    if (auth.role) localStorage.setItem("role", auth.role);
    else localStorage.removeItem("role"); // supprime si null
  }, [auth]); // Se déclenche à chaque changement de auth

  // Fonction pour connecter l'utilisateur
  // Met à jour l'état avec le token et le rôle
  const login = (token, role) => setAuth({ token, role });

  // Fonction pour déconnecter l'utilisateur
  // Remet à null le token et le rôle
  const logout = () => setAuth({ token: null, role: null });

  // Fournir le contexte aux enfants
  return (
    <AuthContext.Provider value={{ token: auth.token, role: auth.role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---------- Hook personnalisé pour utiliser AuthContext ---------- */
export function useAuth() {
  const ctx = useContext(AuthContext);
  // Si contexte non défini (hors provider), retourner valeurs par défaut
  if (!ctx) return { token: null, role: null, login: () => {}, logout: () => {} };
  return ctx;
}
