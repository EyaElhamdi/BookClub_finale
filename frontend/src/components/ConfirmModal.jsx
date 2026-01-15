import React, { useEffect, useRef } from "react";
import "../styles/ConfirmModal.css";

// Composant ConfirmModal : fenêtre modale pour confirmer une action
// Props :
//  - isOpen : booléen, indique si la modale doit s'afficher
//  - title : titre de la modale
//  - message : texte du message
//  - onConfirm : fonction appelée quand on clique sur "Confirmer"
//  - onCancel : fonction appelée quand on clique sur "Annuler"
export default function ConfirmModal({ isOpen, title = "Confirmer", message = "Êtes-vous sûr ?", onConfirm, onCancel }) {
  
  // 🔹 Référence sur le bouton "Confirmer" pour lui donner le focus automatiquement
  const confirmRef = useRef(null);

  // 🔹 Effet pour focus automatique sur le bouton "Confirmer" quand la modale s'ouvre
  useEffect(() => {
    if (isOpen && confirmRef.current) {
      confirmRef.current.focus(); // focus direct
    }
  }, [isOpen]); // se déclenche à chaque ouverture de la modale

  // 🔹 Si la modale n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  return (
    // Overlay de la modale
    <div className="cm-overlay" role="dialog" aria-modal="true">
      <div className="cm-box" role="document">
        {/* Titre de la modale */}
        <h3 className="cm-title">{title}</h3>
        {/* Message principal */}
        <p className="cm-message">{message}</p>

        {/* Boutons d'action */}
        <div className="cm-actions">
          {/* Bouton annuler */}
          <button className="cm-btn cm-cancel" onClick={onCancel}>Annuler</button>
          {/* Bouton confirmer avec focus automatique */}
          <button ref={confirmRef} className="cm-btn cm-confirm" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}
