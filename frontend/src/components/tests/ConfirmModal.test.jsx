import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ConfirmModal from "../ConfirmModal";

/* =========================
   Test du composant ConfirmModal
   - Vérifie que le bouton "Confirmer" reçoit le focus
   - Vérifie que les callbacks onConfirm et onCancel sont appelés
========================= */
test("ConfirmModal focuses confirm button and calls handlers", () => {
  const onConfirm = jest.fn(); // mock pour la fonction de confirmation
  const onCancel = jest.fn();  // mock pour la fonction d'annulation

  // Render la modal ouverte
  render(
    <ConfirmModal
      isOpen={true}
      title="Supprimer"
      message="Êtes-vous sûr ?"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );

  // Récupère le bouton confirmer
  const confirmBtn = screen.getByText(/confirmer/i);
  expect(confirmBtn).toBeInTheDocument(); // Vérifie qu'il est présent

  // Vérifie que le bouton "Confirmer" reçoit le focus automatiquement
  expect(document.activeElement).toBe(confirmBtn);

  // Simule le clic sur le bouton "Confirmer"
  fireEvent.click(confirmBtn);
  expect(onConfirm).toHaveBeenCalledTimes(1); // Vérifie que la fonction a été appelée

  /* =========================
     Re-test pour le bouton "Annuler"
     - Nettoie le rendu précédent pour éviter les doublons
  ========================== */
  cleanup(); // supprime le rendu précédent
  render(<ConfirmModal isOpen={true} onConfirm={onConfirm} onCancel={onCancel} />);

  const cancelBtn = screen.getByText(/annuler/i);
  fireEvent.click(cancelBtn);

  // Vérifie que la fonction d'annulation a été appelée
  expect(onCancel).toHaveBeenCalledTimes(1);
});
