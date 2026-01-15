import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ConfirmModal from "../ConfirmModal";

test("ConfirmModal focuses confirm button and calls handlers", () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  render(
    <ConfirmModal
      isOpen={true}
      title="Supprimer"
      message="Êtes-vous sûr ?"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );

  const confirmBtn = screen.getByText(/confirmer/i);
  expect(confirmBtn).toBeInTheDocument();

  // confirm button should receive focus
  expect(document.activeElement).toBe(confirmBtn);

  fireEvent.click(confirmBtn);
  expect(onConfirm).toHaveBeenCalledTimes(1);

  // reopen and cancel: cleanup the previous render to avoid duplicate modals
  cleanup();
  render(<ConfirmModal isOpen={true} onConfirm={onConfirm} onCancel={onCancel} />);
  const cancelBtn = screen.getByText(/annuler/i);
  fireEvent.click(cancelBtn);
  expect(onCancel).toHaveBeenCalledTimes(1);
});
