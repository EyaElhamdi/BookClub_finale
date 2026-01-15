import React, { useState, useEffect, useRef } from 'react';
import '../styles/VideoCarousel.css';

export default function VideoCarousel({ videos = [], autoplay = true, interval = 6000 }) {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (autoplay && videos.length > 1) {
      timer.current = setInterval(() => setIndex(i => (i + 1) % videos.length), interval);
      return () => clearInterval(timer.current);
    }
    return () => {};
  }, [autoplay, videos.length, interval]);

  const go = (n) => {
    clearInterval(timer.current);
    setIndex(n < 0 ? videos.length - 1 : n % videos.length);
  };

  if (!videos || !videos.length) return null;

  return (
    <div className="video-carousel">
      <div className="video-frame">
        {videos.map((v, i) => (
          <video
            key={i}
            className={`vc-video ${i === index ? 'active' : ''}`}
            src={v.src}
            poster={v.poster}
            controls={false}
            muted
            loop
            playsInline
            autoPlay={i === index}
          />
        ))}
      </div>

      <div className="vc-controls">
        <button className="vc-btn" onClick={() => go(index - 1)} aria-label="Précédent">‹</button>
        <div className="vc-dots">
          {videos.map((_, i) => (
            <button key={i} className={`vc-dot ${i === index ? 'active' : ''}`} onClick={() => go(i)} aria-label={`Aller à ${i+1}`} />
          ))}
        </div>
        <button className="vc-btn" onClick={() => go(index + 1)} aria-label="Suivant">›</button>
      </div>
    </div>
  );
}
