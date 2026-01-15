import axios from "axios";

/* =======================
   API URLs
======================= */
const BASE_URL = "http://localhost:5000/api";
const BOOKS_API_URL = `${BASE_URL}/books`;
const FAVORITES_API_URL = `${BASE_URL}/favorites`;

/* =======================
   BOOKS
======================= */

// Récupérer tous les livres
export const getBooks = async () => {
  try {
    const { data } = await axios.get(BOOKS_API_URL);
    return data;
  } catch (error) {
    console.error("Erreur getBooks:", error.message);
    return [];
  }
};

// Ajouter un livre
export const addBook = async (book) => {
  try {
    const { data } = await axios.post(BOOKS_API_URL, book);
    return data;
  } catch (error) {
    console.error("Erreur addBook:", error.message);
    return null;
  }
};

// Supprimer un livre
export const deleteBook = async (id) => {
  try {
    const { data } = await axios.delete(`${BOOKS_API_URL}/${id}`);
    return data;
  } catch (error) {
    console.error("Erreur deleteBook:", error.message);
    return null;
  }
};

// Récupérer un livre par ID
export const getBookById = async (id) => {
  try {
    const { data } = await axios.get(`${BOOKS_API_URL}/${id}`);
    return data;
  } catch (error) {
    console.error("Erreur getBookById:", error.message);
    return null;
  }
};

// Mettre à jour un livre
export const updateBook = async (id, book) => {
  try {
    const { data } = await axios.put(`${BOOKS_API_URL}/${id}`, book);
    return data;
  } catch (error) {
    console.error("Erreur updateBook:", error.message);
    return null;
  }
};

/* =======================
   FAVORITES
======================= */

// Ajouter un favori
export const addFavorite = async (favorite) => {
  try {
    const { data } = await axios.post(FAVORITES_API_URL, favorite);
    return data;
  } catch (error) {
    console.error("Erreur addFavorite:", error.message);
    return null;
  }
};


