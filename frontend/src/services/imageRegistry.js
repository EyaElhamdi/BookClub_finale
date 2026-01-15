/**
 * Image Registry Configuration
 * Centralized management of all book cover images
 * Ensures reliable loading even if require() fails
 */

// Map of image filenames to their webpack-resolved paths
// If require() fails, these provide a fallback mechanism
export const IMAGE_REGISTRY = {
  // French Books
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

  // English Books
  "602662c_KnplFM1ut3a-e_tLsHzIB6cL.avif": {
    name: "1984",
    try: () => require("../assets/602662c_KnplFM1ut3a-e_tLsHzIB6cL.avif"),
  },

  // Arabic Books
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

/**
 * Safely load image from registry with guaranteed fallback
 */
export const safeLoadImage = (filename) => {
  if (!filename) return null;

  const entry = IMAGE_REGISTRY[filename];
  if (!entry) {
    console.warn(`[ImageRegistry] Unknown image: ${filename}`);
    return null;
  }

  try {
    const result = entry.try();
    // Webpack can return { default: url } or just the url
    return result?.default || result;
  } catch (e) {
    console.error(`[ImageRegistry] Failed to load ${filename} (${entry.name}):`, e.message);
    return null;
  }
};

/**
 * Preload all images at startup
 * Catches any loading issues early
 */
export const preloadAllImages = () => {
  console.log("[ImageRegistry] Preloading all book images...");
  let loaded = 0;
  let failed = 0;

  Object.entries(IMAGE_REGISTRY).forEach(([, entry]) => {
    try {
      const img = entry.try();
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

export default { IMAGE_REGISTRY, safeLoadImage, preloadAllImages };
