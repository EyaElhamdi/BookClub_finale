/**
 * Image Registry Configuration
 * Gestion centralisée des couvertures de livres
 * Assure un chargement fiable même si require() échoue
 */

/* ---------- IMAGE_REGISTRY ---------- */
// Map des noms de fichiers vers leurs chemins Webpack et info
// Chaque entrée contient :
// - name : titre du livre
// - try : fonction qui tente de charger l'image avec require()
export const IMAGE_REGISTRY = {
  // Livres français
  "images.jpg": {
    name: "Le Petit Prince",
    try: () => require("../assets/images.jpg"),
  },
  "9782070360024_1_75_2.jpg": {
    name: "L'Étranger",
    try: () => require("../assets/9782070360024_1_75_2.jpg"),
  },
  "9782701161662_1_75.jpg": {
    name: "La Peste",
    try: () => require("../assets/9782701161662_1_75.jpg"),
  },
  "images1.jpg": {
    name: "Candide",
    try: () => require("../assets/images1.jpg"),
  },

  // Livres anglais
  "602662c_KnplFM1ut3a-e_tLsHzIB6cL.avif": {
    name: "1984",
    try: () => require("../assets/602662c_KnplFM1ut3a-e_tLsHzIB6cL.avif"),
  },

  // Livres arabes
  "ara1.jfif": {
    name: "ألف ليلة وليلة",
    try: () => require("../assets/ara1.jfif"),
  },
  "ara2.jfif": {
    name: "موسم الهجرة إلى الشمال",
    try: () => require("../assets/ara2.jfif"),
  },
  "ara3.jfif": {
    name: "الخبز الحافي",
    try: () => require("../assets/ara3.jfif"),
  },
  "ara4.jfif": {
    name: "رجال في الشمس",
    try: () => require("../assets/ara4.jfif"),
  },
  "ara5.jpg": {
    name: "ذاكرة الجسد",
    try: () => require("../assets/ara5.jpg"),
  },
};

/* ---------- safeLoadImage ---------- */
/**
 * Charge une image depuis le registre en toute sécurité
 * - filename : nom du fichier à charger
 * - Retourne l'URL Webpack si réussite, sinon null
 */
export const safeLoadImage = (filename) => {
  if (!filename) return null; // pas de nom fourni

  const entry = IMAGE_REGISTRY[filename];
  if (!entry) {
    console.warn(`[ImageRegistry] Unknown image: ${filename}`);
    return null;
  }

  try {
    const result = entry.try(); // tenter le require()
    // Webpack peut retourner { default: url } ou juste l'url
    return result?.default || result;
  } catch (e) {
    console.error(`[ImageRegistry] Failed to load ${filename} (${entry.name}):`, e.message);
    return null;
  }
};

/* ---------- preloadAllImages ---------- */
/**
 * Précharge toutes les images du registre au démarrage
 * Permet de détecter les erreurs tôt
 * Retourne un objet { loaded, failed }
 */
export const preloadAllImages = () => {
  console.log("[ImageRegistry] Preloading all book images...");
  let loaded = 0;
  let failed = 0;

  Object.entries(IMAGE_REGISTRY).forEach(([, entry]) => {
    try {
      const img = entry.try(); // tentative de chargement
      if (img) {
        loaded++;
        console.log(`  ✓ ${entry.name}`);
      } else {
        failed++;
        console.warn(`  ⚠ ${entry.name} - returned null`);
      }
    } catch (e) {
      failed++;
      console.error(`  ✗ ${entry.name} - ${e.message}`);
    }
  });

  console.log(`[ImageRegistry] Preload complete: ${loaded} loaded, ${failed} failed`);
  return { loaded, failed };
};

/* ---------- Export ---------- */
export default { IMAGE_REGISTRY, safeLoadImage, preloadAllImages };
