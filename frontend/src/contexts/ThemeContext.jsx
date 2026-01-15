import React, { createContext, useContext, useEffect, useState } from "react";

// Création du contexte pour le thème (light / dark)
const ThemeContext = createContext();

/* ---------- ThemeProvider ---------- */
export function ThemeProvider({ children }) {
  // State pour stocker le thème courant, avec récupération depuis localStorage
  const [theme, setTheme] = useState(() => {
    try {
      // Si un thème est déjà sauvegardé dans localStorage, on l'utilise, sinon "light"
      return localStorage.getItem("theme") || "light";
    } catch {
      // Si erreur (ex: private mode), fallback sur "light"
      return "light";
    }
  });

  // Effet pour appliquer le thème et le persister dans localStorage
  useEffect(() => {
    try {
      // Persistance dans localStorage
      localStorage.setItem("theme", theme);
    } catch (e) {
      // Ignore les erreurs d’écriture (mode privé etc.)
      console.warn("Could not persist theme:", e?.message || e);
    }

    // Appliquer la classe CSS sur le root (document.documentElement)
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("theme-dark");
    else root.classList.remove("theme-dark");
  }, [theme]);

  // Fonction pour basculer entre light et dark
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Fournit le contexte aux enfants
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ---------- Hook custom pour consommer le thème ---------- */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  // Si utilisé en dehors du provider, fournit des valeurs sûres par défaut
  if (!ctx) return { theme: "light", setTheme: () => {}, toggleTheme: () => {} };
  return ctx;
}

// Export du contexte pur (rarement utilisé directement)
export default ThemeContext;