import React, { useEffect, useRef } from "react";
import "../styles/ConfirmModal.css";

export default function ConfirmModal({ isOpen, title = "Confirmer", message = "Êtes-vous sûr ?", onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="cm-overlay" role="dialog" aria-modal="true">
      <div className="cm-box" role="document">
        <h3 className="cm-title">{title}</h3>
        <p className="cm-message">{message}</p>
        <div className="cm-actions">
          <button className="cm-btn cm-cancel" onClick={onCancel}>Annuler</button>
          <button ref={confirmRef} className="cm-btn cm-confirm" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}
