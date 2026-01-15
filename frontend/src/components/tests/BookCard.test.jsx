import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookCard from "../BookCard";
import axios from "axios";

jest.mock("axios");

const book = { _id: "b1", title: "Titre", author: "Auteur", image: "" };

test("clicking add favorite calls onAddFavorite", () => {
  const onAddFavorite = jest.fn();
  render(<BookCard book={book} favorites={[]} onAddFavorite={onAddFavorite} />);

  const favBtn = screen.getByText(/ajouter aux favoris/i);
  fireEvent.click(favBtn);
  expect(onAddFavorite).toHaveBeenCalledWith(book);
});

test("delete opens modal and confirms deletion", async () => {
  const onDelete = jest.fn();
  axios.delete.mockResolvedValueOnce({});

  render(<BookCard book={book} favorites={[]} onDelete={onDelete} />);

  const delBtn = screen.getByText(/supprimer/i);
  fireEvent.click(delBtn);

  // modal should be visible and confirm button present
  const confirm = await screen.findByText(/confirmer/i);
  fireEvent.click(confirm);

  await waitFor(() => expect(onDelete).toHaveBeenCalledWith("b1"));
  expect(axios.delete).toHaveBeenCalled();
});

test("removing favorite asks confirmation and calls onRemoveFavorite", async () => {
  const onRemoveFavorite = jest.fn();
  render(<BookCard book={book} favorites={[book]} onRemoveFavorite={onRemoveFavorite} />);

  const favBtn = screen.getByText(/retirer des favoris/i);
  fireEvent.click(favBtn);

  // modal should appear
  const confirm = await screen.findByText(/confirmer/i);
  fireEvent.click(confirm);

  await waitFor(() => expect(onRemoveFavorite).toHaveBeenCalledWith(book));
});

test("renders Arabic title with RTL direction when book has rtl flag", () => {
  const arBook = { _id: "ar_test", title: "الأمير الصغير", author: "أنطوان دو سانت إكسوبيري", image: "", language: "ar", rtl: true };
  render(<BookCard book={arBook} favorites={[]} />);
  const titleEl = screen.getByText(/الأمير الصغير/);
  const card = titleEl.closest('.book-card');
  expect(card).toBeTruthy();
  expect(card).toHaveAttribute('dir','rtl');
});
