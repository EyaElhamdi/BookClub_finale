import { useRef, useCallback, useEffect } from "react";

/**
 * Hook personnalisé pour gérer les setTimeout en toute sécurité.
 * Les timers sont automatiquement nettoyés lors du démontage du composant.
 */
export default function useSafeTimeout() {
  // On garde une référence à tous les timers actifs dans un Set
  const timers = useRef(new Set());

  /**
   * setSafeTimeout
   * Wrapper autour de setTimeout qui enregistre le timer dans le Set
   * et le supprime automatiquement une fois exécuté.
   * @param {Function} fn - Fonction à exécuter après le délai
   * @param {number} ms - Délai en millisecondes
   * @returns {number} - ID du timer
   */
  const setSafeTimeout = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      try {
        fn(); // Exécution de la fonction
      } finally {
        timers.current.delete(id); // Supprime le timer de la liste une fois terminé
      }
    }, ms);

    // Ajoute l’ID du timer au Set pour suivi
    timers.current.add(id);
    return id;
  }, []);

  /**
   * clearSafeTimeout
   * Permet d’annuler un timer avant son exécution et le retire du Set
   * @param {number} id - ID du timer à annuler
   */
  const clearSafeTimeout = useCallback((id) => {
    clearTimeout(id);
    timers.current.delete(id);
  }, []);

  /**
   * Nettoyage automatique à la destruction du composant
   * Tous les timers actifs sont annulés pour éviter les effets secondaires
   */
  useEffect(() => {
    return () => {
      for (const id of timers.current) clearTimeout(id);
      timers.current.clear(); // Vide le Set
    };
  }, []);

  // Retourne les fonctions pour être utilisées dans le composant
  return { setSafeTimeout, clearSafeTimeout };
}
