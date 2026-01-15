import { render, screen } from '@testing-library/react';
import App from './App';

test('shows landing page when not authenticated', () => {
  // ensure no token
  localStorage.removeItem('token');
  render(<App />);
  // Landing contains the quote
  expect(screen.getByText(/There is more treasure in books/i)).toBeInTheDocument();
});

test('renders header with navigation when authenticated', () => {
  // simulate logged in user
  localStorage.setItem('token', 'fake-token');
  localStorage.setItem('role', 'user');
  render(<App />);
  const linkElement = screen.getByText(/accueil/i);
  expect(linkElement).toBeInTheDocument();
  // cleanup
  localStorage.removeItem('token');
  localStorage.removeItem('role');
});
