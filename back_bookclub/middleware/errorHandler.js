// Fonction utilitaire pour gérer automatiquement les erreurs dans les fonctions async
export function asyncHandler(fn) {

  // On retourne une nouvelle fonction middleware compatible avec Express
  return async (req, res, next) => {
    try {
      // On exécute la fonction originale (le contrôleur)
      await fn(req, res, next);
    } catch (err) {
      // Si une erreur se produit → on l'envoie directement au middleware d'erreur
      next(err);
    }
  };
}


// Middleware global de gestion des erreurs
export default function errorHandler(err, req, res, next) {

  // Affiche l'erreur dans la console (utile pour le debug)
  // Si err.stack existe → affiche le stack trace, sinon affiche l'erreur brute
  console.error(err && err.stack ? err.stack : err);

  // On prend le status défini dans l'erreur, sinon 500 par défaut
  const status = err.status || 500;

  // On renvoie une réponse JSON propre au client
  res.status(status).json({
    message: err.message || 'Internal Server Error'
  });
}
