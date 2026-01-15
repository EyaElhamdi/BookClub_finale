import axios from "axios";

// Création d'une instance Axios avec l'URL de base pour l'authentification
const api = axios.create({
  baseURL: "http://localhost:5000/auth", // URL de ton backend pour auth
  headers: {
    "Content-Type": "application/json", // envoi des données en JSON
  },
});

/**
 * Intercepteur de requête
 * Ajoute automatiquement le token stocké dans localStorage à chaque requête
 */
api.interceptors.request.use((config) => {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`; // Ajout du token dans l'en-tête
  }
  return config;
});

/**
 * Intercepteur de réponse
 * Gestion globale des erreurs 401/403 (non autorisé / accès refusé)
 * - Supprime le token et le rôle du localStorage
 * - Redirige vers la page de login pour ré-authentification
 */
api.interceptors.response.use(
  (res) => res, // si succès, retourne la réponse
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
      // Redirection forcée vers la page login
      try {
        if (typeof window !== "undefined") window.location.href = "/login";
      } catch (e) {
        console.warn("Redirect to /login failed", e);
      }
    }
    // Rejette la promesse pour que l'erreur soit gérée par le catch du composant
    return Promise.reject(err);
  }
);

export default api;
