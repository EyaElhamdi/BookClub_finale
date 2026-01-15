import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookDetails from "../BookDetails";
import axios from "axios";

jest.mock("axios");

const book = {
  _id: "b1",
  title: "Le Grand Roman",
  author: "Auteur Exemple",
  image: "",
  longDescription: "Ceci est une longue description qui explique tout sur le livre...",
  teaser: "Un teaser accrocheur.",
  characters: [{ name: "Jean", role: "Protagoniste" }, { name: "Marie" }],
  chapters: ["Chapitre 1", "Chapitre 2"],
  excerpt: "Extrait du livre...",
  buyLink: "https://example.com/book/b1",
  rating: 4,
  reviews: [{ user: "Paul", rating: 4, text: "Bien" }]
};

jest.mock("react-router-dom", () => ({
  __esModule: true,
  BrowserRouter: ({ children }) => children,
  MemoryRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  Link: ({ children }) => children,
  useParams: () => ({ id: "b1" }),
  useLocation: () => ({ pathname: '/', state: {} }),
}));

test("renders teaser and characters and opens excerpt modal", async () => {
  axios.get.mockResolvedValueOnce({ data: book });

  render(<BookDetails favorites={[]} setFavorites={() => {}} />);

  expect(await screen.findByText(book.title)).toBeInTheDocument();
  expect(screen.getByText(/Un teaser accrocheur/i)).toBeInTheDocument();
  expect(screen.getByText(/Personnages/i)).toBeInTheDocument();

  // open excerpt
  fireEvent.click(screen.getByText(/Lire un extrait/i));
  expect(await screen.findByText(/Extrait du livre/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Fermer/i));
  await waitFor(() => expect(screen.queryByText(/Extrait du livre/i)).not.toBeInTheDocument());
});

test("copy link and share fallback works", async () => {
  axios.get.mockResolvedValueOnce({ data: book });

  // mock clipboard
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValueOnce() } });

  render(<BookDetails favorites={[]} setFavorites={() => {}} />);

  expect(await screen.findByText(book.title)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Copier le lien/i));
  await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
});

test("navigator.share used when available", async () => {
  axios.get.mockResolvedValueOnce({ data: book });
  const share = jest.fn().mockResolvedValueOnce();
  Object.assign(navigator, { share });

  render(<BookDetails favorites={[]} setFavorites={() => {}} />);
  expect(await screen.findByText(book.title)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Partager/i));
  await waitFor(() => expect(share).toHaveBeenCalled());
});
// The earlier tests cover rendering and excerpt modal; avoid duplicate declarations
