import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios"; // on utilise axios directement si api.js n'existe pas
import { useAuth } from "../contexts/AuthContext";
import ReviewSection from "./ReviewSection";
import ReadingStatus from "./ReadingStatus";
import "../styles/BookDetails.css";

export default function BookDetails({ favorites = [], setFavorites, onAddFavorite, onRemoveFavorite, isModal = false, onClose }) {
  const { id } = useParams();
  const location = useLocation();
  const initialBook = location.state && location.state.book;
  const [book, setBook] = useState(initialBook || null);
  const [expanded, setExpanded] = useState(false);
  const [showExcerpt, setShowExcerpt] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    title: '', 
    author: '', 
    rating: 0,
    image: '',
    teaser: '', 
    buyLink: '', 
    excerpt: '',
    year: '',
    pages: '',
    publisher: '',
    isbn: '',
    genres: '',
    longDescription: ''
  });
  const { role } = useAuth();

  useEffect(() => {
    let mounted = true;

    const fetchBook = async () => {
      try {
        // Ne pas fetcher les livres manuels (IDs commençant par "m")
        if (id && id.startsWith("m")) {
          if (mounted && initialBook) setBook(initialBook);
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/books/${id}`);
        if (mounted) setBook(res.data);
      } catch (err) {
        console.error("Erreur lors du fetch du livre :", err);
        if (mounted && !initialBook) setBook(null);
      }
    };

    // If we have an initial book (from location.state) show it immediately and still fetch in background
    if (!initialBook) fetchBook();
    else fetchBook();

    return () => (mounted = false);
  }, [id, initialBook]);

  if (!book) return <p style={{ textAlign: "center" }}>Chargement du livre...</p>;

  const longDesc = book.longDescription || book.description || "Pas de description disponible.";
  const short = longDesc.slice(0, 420);

  const teaser = book.teaser || (longDesc.slice(0, 160) + (longDesc.length > 160 ? '…' : ''));
  const characters = book.characters || [];
  const chapters = book.chapters || [];
  const excerpt = book.excerpt || book.sample || "Aucun extrait disponible.";

  const avgRating = book.rating || (book.reviews && book.reviews.length
    ? (book.reviews.reduce((a, b) => a + b.rating, 0) / book.reviews.length).toFixed(1)
    : "N/A"
  );

  const renderStars = (r) => {
    const n = Math.round(r);
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < n ? '#ffb3c9' : '#e6cbd2' }}>★</span>
    ));
  };

  const isFav = favorites.some((f) => f._id === book._id);

  const handleToggleFav = () => {
    if (isFav) {
      if (typeof onRemoveFavorite === "function") return onRemoveFavorite(book);
      if (setFavorites) setFavorites((prev) => prev.filter((f) => f._id !== book._id));
      return;
    }
    if (typeof onAddFavorite === "function") return onAddFavorite(book);
    if (setFavorites) setFavorites((prev = []) => [...prev, { _id: book._id, title: book.title, author: book.author, image: book.image }]);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        // fallback
        const el = document.createElement('textarea');
        el.value = window.location.href;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedMessage('Lien copié !');
      setTimeout(() => setCopiedMessage(''), 1800);
    } catch (err) {
      console.error('Copy failed', err);
      setCopiedMessage('Erreur lors de la copie');
      setTimeout(() => setCopiedMessage(''), 1800);
    }
  };

  const handleShare = async () => {
    const payload = { title: book.title, text: teaser, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch (err) {
        // user cancelled or error
      }
      return;
    }
    // fallback to copy
    handleCopyLink();
  };

  const downloadExcerpt = () => {
    const text = excerpt || "Aucun extrait disponible.";
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(book && (book.title || 'extrait')).replace(/[^a-z0-9_\- ]/gi, '')}_extrait.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const canEdit = !!(role === 'creator');

  const startEdit = () => {
    setEditForm({ 
      title: book.title || '', 
      author: book.author || '', 
      rating: book.rating || 0,
      image: book.image || '',
      teaser: book.teaser || '', 
      buyLink: book.buyLink || '', 
      excerpt: book.excerpt || '',
      year: book.year || '',
      pages: book.pages || '',
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      genres: (book.genres && book.genres.join(', ')) || '',
      longDescription: book.longDescription || ''
    });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Préparer les données: convertir genres string en array
      const dataToSend = {
        ...editForm,
        rating: editForm.rating ? parseFloat(editForm.rating) : 0,
        year: editForm.year ? parseInt(editForm.year) : null,
        pages: editForm.pages ? parseInt(editForm.pages) : null,
        genres: editForm.genres 
          ? editForm.genres.split(',').map(g => g.trim()).filter(g => g)
          : []
      };
      
      const res = await axios.put(`http://localhost:5000/api/books/${id}`, dataToSend, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setBook(res.data);
      setEditing(false);
      alert('Livre modifié avec succès!');
    } catch (err) {
      alert('Erreur lors de la mise à jour : ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="details-page large">
      <div className="details-grid">
        {isModal && (
          <div className="modal-grid">
            <div className="modal-cell cover-cell">
              {book?.image ? (
                <img className="cover" src={book.image} alt={book.title} />
              ) : (
                <div className="no-image">Aucune image</div>
              )}
            </div>

            <div className="modal-cell title-cell">
              <h2 className="modal-title">{book?.title || '—'}</h2>
              <div><strong>Auteur :</strong> {book?.author || '—'}</div>
              <div><strong>Année :</strong> {book?.year || '—'}</div>
            </div>

            {/* Left teaser box removed per request */}

            <div className="modal-cell characters-cell">
              <strong>Personnages</strong>
              {book && book.characters && book.characters.length ? (
                <ul>
                  {book.characters.map((c, i) => (
                    <li key={i}><strong>{c.name}</strong>{c.role ? ` — ${c.role}` : ''}{c.description ? `: ${c.description}` : ''}</li>
                  ))}
                </ul>
              ) : (
                <div>Aucun personnage listé.</div>
              )}
            </div>

            <div className="modal-cell buy-cell">
              <a className="buy-link modal-buy" href={book?.buyLink || '#'} target="_blank" rel="noreferrer">Acheter ce livre</a>
              {onClose && <button className="cm-btn cm-cancel modal-close-btn" onClick={onClose}>Fermer</button>}
            </div>
          </div>
        )}

        {!isModal && book?.image && <img className="cover" src={book.image} alt={book.title} />}

        <div className="details-meta">
          <h1>{book?.title}</h1>
          <div className="meta-top">
            <div className="author-block">
              <div className="author-name">{book?.author}</div>
              <div className="author-bio">{book?.authorBio}</div>
            </div>

            <div className="rating-block">
              <div className="rating-big">{avgRating}</div>
              <div className="stars">{renderStars(avgRating)}</div>
            </div>
          </div>

          <div className="meta-row">
            <span><strong>Éditeur :</strong> {book.publisher || "—"}</span>
            <span><strong>Année :</strong> {book.year || "—"}</span>
            <span><strong>Pages :</strong> {book.pages || "—"}</span>
          </div>

          <p className="isbn"><strong>ISBN :</strong> {book.isbn || "—"}</p>

          <div className="tags" style={{ marginTop: 12 }}>
            {(book.genres || []).map((g, i) => (
              <span className="tag" key={i}>{g}</span>
            ))}
          </div>

          <div className="description" style={{ marginTop: 18 }}>
            <p className="desc-text teaser">{teaser}</p>
            <p className="desc-text">
              {expanded ? longDesc : `${short}${longDesc.length > 420 ? '…' : ''}`}
            </p>
            {longDesc.length > 420 && (
              <button className="read-more" onClick={() => setExpanded(s => !s)}>
                {expanded ? 'Réduire' : 'Lire la suite'}
              </button>
            )}
            <div style={{ marginTop: 8 }}>
              <button className="secondary" onClick={() => setShowExcerpt(true)}>Lire un extrait</button>
              <button className="secondary" onClick={handleCopyLink}>Copier le lien</button>
              <button className="secondary" onClick={handleShare}>Partager</button>
              {copiedMessage && <span className="share-feedback">{copiedMessage}</span>}
            </div>
          </div>

          {characters.length > 0 && (
            <section className="characters">
              <h3>Personnages</h3>
              <ul>
                {characters.map((c, i) => (
                  <li key={i}><strong>{c.name}</strong>{c.role ? ` — ${c.role}` : ''}{c.description ? `: ${c.description}` : ''}</li>
                ))}
              </ul>
            </section>
          )}

          {chapters.length > 0 && (
            <section className="chapters">
              <h3>Chapitres</h3>
              <ol>
                {chapters.map((c, i) => (<li key={i}>{c}</li>))}
              </ol>
            </section>
          )}

          <section className="reviews">
            <ReadingStatus bookId={book._id} />
            <ReviewSection bookId={book._id} />
          </section>

          <div className="actions-row">
            <button className="primary" onClick={handleToggleFav}>{isFav ? "❤️Retirer des favoris" : "🤍Ajouter aux favoris"}</button>
            <a className="buy-link" href={book.buyLink || '#'} target="_blank" rel="noreferrer">Acheter</a>
            <Link to="/books" className="back-link">← Retour à la liste</Link>
            {canEdit && !editing && <button className="view-btn" style={{ marginLeft: 8 }} onClick={startEdit}>✎ Modifier</button>}
          </div>
        </div>
      </div>

      {showExcerpt && (
        <div className="sample-modal" role="dialog" aria-modal="true">
          <div className="sample-box">
            <h3>Extrait — {book.title}</h3>
            <pre className="excerpt-text">{excerpt}</pre>
            <div style={{ marginTop: 8 }}>
              <button className="cm-btn cm-cancel" onClick={() => setShowExcerpt(false)}>Fermer</button>
              <button className="cm-btn cm-primary" onClick={downloadExcerpt} style={{ marginLeft: 8 }}>Télécharger l'extrait</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="edit-modal-overlay" role="dialog" aria-modal="true" onClick={cancelEdit}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Modifier — {book.title}</h2>
              <button className="edit-modal-close" onClick={cancelEdit}>✕</button>
            </div>
            
            <form onSubmit={submitEdit} className="edit-form">
              {/* Ligne 1: Titre et Auteur */}
              <div className="form-row">
                <div className="form-group">
                  <label>Titre</label>
                  <input 
                    type="text"
                    name="title" 
                    value={editForm.title} 
                    onChange={handleEditChange}
                    placeholder="Titre du livre"
                  />
                </div>
                <div className="form-group">
                  <label>Auteur</label>
                  <input 
                    type="text"
                    name="author" 
                    value={editForm.author} 
                    onChange={handleEditChange}
                    placeholder="Nom de l'auteur"
                  />
                </div>
              </div>

              {/* Ligne 2: Année et Pages */}
              <div className="form-row">
                <div className="form-group">
                  <label>Année de publication</label>
                  <input 
                    type="number"
                    name="year" 
                    value={editForm.year} 
                    onChange={handleEditChange}
                    placeholder="2024"
                  />
                </div>
                <div className="form-group">
                  <label>Nombre de pages</label>
                  <input 
                    type="number"
                    name="pages" 
                    value={editForm.pages} 
                    onChange={handleEditChange}
                    placeholder="200"
                  />
                </div>
              </div>

              {/* Ligne 3: Éditeur et ISBN */}
              <div className="form-row">
                <div className="form-group">
                  <label>Éditeur</label>
                  <input 
                    type="text"
                    name="publisher" 
                    value={editForm.publisher} 
                    onChange={handleEditChange}
                    placeholder="Nom de l'éditeur"
                  />
                </div>
                <div className="form-group">
                  <label>ISBN</label>
                  <input 
                    type="text"
                    name="isbn" 
                    value={editForm.isbn} 
                    onChange={handleEditChange}
                    placeholder="ISBN"
                  />
                </div>
              </div>

              {/* Ligne 4: Note et Genres */}
              <div className="form-row">
                <div className="form-group">
                  <label>Note (/5)</label>
                  <input 
                    type="number"
                    name="rating" 
                    value={editForm.rating} 
                    onChange={handleEditChange}
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                  />
                </div>
                <div className="form-group">
                  <label>Genres (séparés par des virgules)</label>
                  <input 
                    type="text"
                    name="genres" 
                    value={editForm.genres} 
                    onChange={handleEditChange}
                    placeholder="Romance, Fiction, Science-fiction"
                  />
                </div>
              </div>

              {/* Ligne 5: Image et Lien d'achat */}
              <div className="form-row">
                <div className="form-group">
                  <label>URL de la couverture</label>
                  <input 
                    type="text"
                    name="image" 
                    value={editForm.image} 
                    onChange={handleEditChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="form-group">
                  <label>Lien d'achat</label>
                  <input 
                    type="url"
                    name="buyLink" 
                    value={editForm.buyLink} 
                    onChange={handleEditChange}
                    placeholder="https://amazon.com/..."
                  />
                </div>
              </div>

              {/* Ligne 6: Teaser */}
              <div className="form-group">
                <label>Teaser / Résumé court</label>
                <textarea 
                  name="teaser" 
                  value={editForm.teaser} 
                  onChange={handleEditChange}
                  placeholder="Une courte description du livre..."
                  rows={3}
                />
              </div>

              {/* Ligne 7: Description longue */}
              <div className="form-group">
                <label>Description longue</label>
                <textarea 
                  name="longDescription" 
                  value={editForm.longDescription} 
                  onChange={handleEditChange}
                  placeholder="Description complète du livre..."
                  rows={4}
                />
              </div>

              {/* Ligne 8: Extrait */}
              <div className="form-group">
                <label>Extrait / Aperçu du livre</label>
                <textarea 
                  name="excerpt" 
                  value={editForm.excerpt} 
                  onChange={handleEditChange}
                  placeholder="Un passage du livre..."
                  rows={5}
                />
              </div>

              {/* Boutons */}
              <div className="edit-form-actions">
                <button type="submit" className="btn-save">💾 Enregistrer les modifications</button>
                <button type="button" className="btn-cancel" onClick={cancelEdit}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



