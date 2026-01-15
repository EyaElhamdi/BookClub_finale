// src/components/__tests__/Login.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../login";
import { AuthProvider } from "../../contexts/AuthContext";
import api from "../../services/api";
import { BrowserRouter } from "react-router-dom"; // wrapper
import "@testing-library/jest-dom";

jest.mock("../../services/api"); // on va mocker les appels axios (api.post)

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  BrowserRouter: ({ children }) => children,
  useNavigate: () => mockNavigate,
  Link: ({ children }) => children,
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

function renderLogin() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
}

test("validation: affiche erreurs si champs vides ou email invalide", async () => {
  renderLogin();

  const submit = screen.getByRole("button", { name: /se connecter/i });
  fireEvent.click(submit);

  expect(await screen.findByText("Email requis")).toBeInTheDocument();
  expect(screen.getByText("Mot de passe requis")).toBeInTheDocument();

  // entrer email invalide
  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "bademail" } });
  fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: "pwd" } });
  fireEvent.click(submit);

  expect(await screen.findByText("Email invalide")).toBeInTheDocument();
});

test("connexion réussie: stocke token et redirige", async () => {
  renderLogin();

  const token = "fake-jwt-token";
  api.post.mockResolvedValueOnce({ data: { token } });

  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "user@example.com" } });
  fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: "password123" } });

  const submit = screen.getByRole("button", { name: /se connecter/i });
  fireEvent.click(submit);

  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/login", {
    email: "user@example.com",
    password: "password123",
  }));

  // token sauvegardé
  expect(localStorage.getItem("token")).toBe(token);

  // redirection
  expect(mockNavigate).toHaveBeenCalledWith("/profile");
});

test("erreur 401: affiche message d'erreur serveur", async () => {
  renderLogin();

  // simulate 401 response
  const error = {
    response: { status: 401 },
  };
  api.post.mockRejectedValueOnce(error);

  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "user@example.com" } });
  fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: "badpassword" } });

  fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

  expect(await screen.findByText("Email ou mot de passe incorrect")).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBeNull();
});
