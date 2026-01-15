import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookDetails from "../BookDetails";
import axios from "axios";

// Mock d'axios pour intercepter toutes les requêtes HTTP
jest.mock("axios");

// Exemple de livre utilisé pour les tests
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

/* =========================
   Mock minimal de react-router-dom
   pour simuler useParams, Link, etc. dans les tests
========================= */
jest.mock("react-router-dom", () => ({
  __esModule: true,
  BrowserRouter: ({ children }) => children,
  MemoryRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  Link: ({ children }) => children,
  useParams: () => ({ id: "b1" }), // simule le paramètre id de l'URL
  useLocation: () => ({ pathname: '/', state: {} }),
}));

/* =========================
   Test 1 : rendu du teaser, personnages et modal d'extrait
========================= */
test("renders teaser and characters and opens excerpt modal", async () => {
  // Mock de la réponse HTTP pour récupérer le livre
  axios.get.mockResolvedValueOnce({ data: book });

  render(<BookDetails favorites={[]} setFavorites={() => {}} />);

  // Vérifie que le titre est affiché
  expect(await screen.findByText(book.title)).toBeInTheDocument();

  // Vérifie que le teaser est affiché
  expect(screen.getByText(/Un teaser accrocheur/i)).toBeInTheDocument();

  // Vérifie que la section "Personnages" est affichée
  expect(screen.getByText(/Personnages/i)).toBeInTheDocument();

  // Simule l'ouverture de la modal d'extrait
  fireEvent.click(screen.getByText(/Lire un extrait/i));

  // Vérifie que l'extrait s'affiche
  expect(await screen.findByText(/Extrait du livre/i)).toBeInTheDocument();

  // Ferme la modal
  fireEvent.click(screen.getByText(/Fermer/i));

  // Vérifie que la modal a disparu
  await waitFor(() => expect(screen.queryByText(/Extrait du livre/i)).not.toBeInTheDocument());
});

/* =========================
   Test 2 : copier le lien dans le presse-papier
========================= */
test("copy link and share fallback works", async () => {
  axios.get.mockResolvedValueOnce({ data: book });

  // Mock du presse-papier
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValueOnce() } });

  render(<BookDetails favorites={[]} setFavorites={() => {}} />);

  expect(await screen.findByText(book.title)).toBeInTheDocument();

  // Simule le clic sur "Copier le lien"
  fireEvent.click(screen.getByText(/Copier le lien/i));

  // Vérifie que navigator.clipboard.writeText a été appelé
  await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
});

/* =========================
   Test 3 : partage via navigator.share
========================= */
test("navigator.share used when available", async () => {
  axios.get.mockResolvedValueOnce({ data: book });

  // Mock de navigator.share
  const share = jest.fn().mockResolvedValueOnce();
  Object.assign(navigator, { share });

  render(<BookDetails favorites={[]} setFavorites={() => {}} />);

  expect(await screen.findByText(book.title)).toBeInTheDocument();

  // Simule le clic sur le bouton "Partager"
  fireEvent.click(screen.getByText(/Partager/i));

  // Vérifie que navigator.share a été appelé
  await waitFor(() => expect(share).toHaveBeenCalled());
});
