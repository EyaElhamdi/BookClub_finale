/**
 * Image Loading Service
 * Handles robust image loading with webpack
 */

import React from 'react';

// SVG placeholder - fallback for missing images
export const SVG_PLACEHOLDER = 'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="480" viewBox="0 0 320 480">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f5bbc9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffd4e5;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" fill="#b4345c" font-family="Arial, sans-serif" font-weight="bold" font-size="48">📚</text>
      <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="#b4345c" font-family="Arial, sans-serif" font-size="14">Ajoutez une image</text>
    </svg>`
  );

// Pre-require all images at module load time
const PRELOADED_IMAGES = {
  "images.jpg": require("../assets/images.jpg"),
  "9782070360024_1_75_2.jpg": require("../assets/9782070360024_1_75_2.jpg"),
  "9782701161662_1_75.jpg": require("../assets/9782701161662_1_75.jpg"),
  "images1.jpg": require("../assets/images1.jpg"),
  "602662c_KnplFM1ut3a-e_tLsHzIB6cL.avif": require("../assets/602662c_KnplFM1ut3a-e_tLsHzIB6cL.avif"),
  "ara1.jfif": require("../assets/ara1.jfif"),
  "ara2.jfif": require("../assets/ara2.jfif"),
  "ara3.jfif": require("../assets/ara3.jfif"),
  "ara4.jfif": require("../assets/ara4.jfif"),
  "ara5.jpg": require("../assets/ara5.jpg"),
};

/**
 * Get image URL by filename
 * Returns webpack URL or SVG placeholder
 */
export const getImageUrl = (filename) => {
  if (!filename) return SVG_PLACEHOLDER;
  
  // Check if it's a string filename
  if (typeof filename === 'string') {
    const trimmed = filename.trim();
    
    // If it's already a full URL or path, return it
    if (trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    
    // Try to get from preloaded images
    const preloaded = PRELOADED_IMAGES[trimmed];
    if (preloaded) {
      return preloaded.default || preloaded;
    }
  }
  
  // If it's a webpack object with default export
  if (typeof filename === 'object' && filename?.default) {
    return filename.default;
  }
  
  return SVG_PLACEHOLDER;
};

/**
 * Hook for image loading with fallback
 */
export const useImageLoader = (initialImage) => {
  const [src, setSrc] = React.useState(() => getImageUrl(initialImage));

  const handleImageError = () => {
    if (src !== SVG_PLACEHOLDER) {
      setSrc(SVG_PLACEHOLDER);
    }
  };

  return { src, setSrc, handleImageError };
};

export default { getImageUrl, useImageLoader, SVG_PLACEHOLDER };
