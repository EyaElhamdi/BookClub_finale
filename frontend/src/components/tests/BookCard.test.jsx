import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookCard from "../BookCard";
import axios from "axios";

// Mock axios pour intercepter les requêtes HTTP
jest.mock("axios");

// Exemple de livre utilisé dans les tests
const book = { _id: "b1", title: "Titre", author: "Auteur", image: "" };

/* =========================
   Test 1 : Ajouter aux favoris
   - Vérifie que le callback onAddFavorite est appelé avec le livre correct
========================= */
test("clicking add favorite calls onAddFavorite", () => {
  const onAddFavorite = jest.fn(); // mock de fonction
  render(<BookCard book={book} favorites={[]} onAddFavorite={onAddFavorite} />);

  // Cherche le bouton "Ajouter aux favoris"
  const favBtn = screen.getByText(/ajouter aux favoris/i);

  // Simule le clic
  fireEvent.click(favBtn);

  // Vérifie que la fonction a été appelée avec le bon livre
  expect(onAddFavorite).toHaveBeenCalledWith(book);
});

/* =========================
   Test 2 : Supprimer un livre
   - Vérifie que le clic ouvre la modal et que la suppression est confirmée
   - Vérifie que axios.delete est appelé
========================= */
test("delete opens modal and confirms deletion", async () => {
  const onDelete = jest.fn();
  axios.delete.mockResolvedValueOnce({}); // mock de la réponse HTTP

  render(<BookCard book={book} favorites={[]} onDelete={onDelete} />);

  // Clic sur le bouton supprimer
  const delBtn = screen.getByText(/supprimer/i);
  fireEvent.click(delBtn);

  // La modal doit apparaître et le bouton confirmer doit être présent
  const confirm = await screen.findByText(/confirmer/i);
  fireEvent.click(confirm);

  // Vérifie que le callback onDelete est appelé avec l'id correct
  await waitFor(() => expect(onDelete).toHaveBeenCalledWith("b1"));

  // Vérifie que axios.delete a été appelé pour la requête HTTP
  expect(axios.delete).toHaveBeenCalled();
});

/* =========================
   Test 3 : Retirer des favoris
   - Vérifie que le clic sur "Retirer des favoris" ouvre la modal et appelle onRemoveFavorite
========================= */
test("removing favorite asks confirmation and calls onRemoveFavorite", async () => {
  const onRemoveFavorite = jest.fn();

  render(<BookCard book={book} favorites={[book]} onRemoveFavorite={onRemoveFavorite} />);

  // Clic sur le bouton "Retirer des favoris"
  const favBtn = screen.getByText(/retirer des favoris/i);
  fireEvent.click(favBtn);

  // La modal doit apparaître
  const confirm = await screen.findByText(/confirmer/i);
  fireEvent.click(confirm);

  // Vérifie que la fonction onRemoveFavorite est appelée avec le livre correct
  await waitFor(() => expect(onRemoveFavorite).toHaveBeenCalledWith(book));
});

/* =========================
   Test 4 : Livre en arabe (RTL)
   - Vérifie que le titre en arabe est rendu correctement
   - Vérifie que la carte a l'attribut dir="rtl"
========================= */
test("renders Arabic title with RTL direction when book has rtl flag", () => {
  const arBook = {
    _id: "ar_test",
    title: "الأمير الصغير",
    author: "أنطوان دو سانت إكسوبيري",
    image: "",
    language: "ar",
    rtl: true
  };

  render(<BookCard book={arBook} favorites={[]} />);

  // Cherche le titre arabe
  const titleEl = screen.getByText(/الأمير الصغير/);

  // Trouve l'élément parent qui représente la carte
  const card = titleEl.closest('.book-card');

  expect(card).toBeTruthy();             // Vérifie que la carte existe
  expect(card).toHaveAttribute('dir','rtl'); // Vérifie que le sens du texte est RTL
});
