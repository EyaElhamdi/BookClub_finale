import React, { useState } from "react";
import { getImageUrl, SVG_PLACEHOLDER } from "../services/imageLoader";

export default function CoverCard({ book }) {
  const [src, setSrc] = useState(() => getImageUrl(book.image));

  const handleError = () => {
    if (src !== SVG_PLACEHOLDER) {
      console.warn(`[CoverCard] Image load failed, using placeholder for: ${book.title}`);
      setSrc(SVG_PLACEHOLDER);
    }
  };

  return (
    <div className="cover-card">
      <img src={src} alt={book.title} onError={handleError} />
      <div className="cover-meta">
        <div className="cover-title">{book.title}</div>
        <div className="cover-author">{book.author}</div>
      </div>
    </div>
  );
}
