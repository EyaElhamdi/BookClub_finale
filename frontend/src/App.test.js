import { render, screen } from '@testing-library/react';
import App from './App';

/* ---------- Test 1 ---------- */
/**
 * Vérifie que la page d'accueil ("landing page") s'affiche
 * lorsque l'utilisateur n'est pas authentifié
 */
test('shows landing page when not authenticated', () => {
  // Supprime le token pour simuler un utilisateur non connecté
  localStorage.removeItem('token');

  // On rend le composant principal de l'application
  render(<App />);

  // On s'attend à ce que la citation de la page d'accueil soit visible
  expect(
    screen.getByText(/There is more treasure in books/i)
  ).toBeInTheDocument();
});


/* ---------- Test 2 ---------- */
/**
 * Vérifie que l'en-tête avec navigation s'affiche
 * lorsque l'utilisateur est connecté
 */
test('renders header with navigation when authenticated', () => {
  // Simule un utilisateur connecté avec token et rôle
  localStorage.setItem('token', 'fake-token');
  localStorage.setItem('role', 'user');

  // Rendu de l'application
  render(<App />);

  // Vérifie que le lien vers la page d'accueil ("Accueil") est visible
  const linkElement = screen.getByText(/accueil/i);
  expect(linkElement).toBeInTheDocument();

  // Nettoyage : supprime les données simulées pour ne pas impacter d'autres tests
  localStorage.removeItem('token');
  localStorage.removeItem('role');
});
