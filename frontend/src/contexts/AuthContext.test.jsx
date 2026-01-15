import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { AuthProvider, useAuth } from "./AuthContext";

// Composant de test qui consomme le AuthContext
function TestConsumer() {
  const { token, role, login, logout } = useAuth(); // hook pour accéder au token/role et fonctions
  return (
    <div>
      {/* Affiche le token et le rôle */}
      <div>token:{token || "null"}</div>
      <div>role:{role || "null"}</div>

      {/* Boutons pour déclencher login et logout */}
      <button onClick={() => login("t1", "admin")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

test("AuthProvider sets and clears token/role", async () => {
  // On nettoie le localStorage pour être sûr de partir d'une session vide
  localStorage.clear();

  // On render le provider avec notre composant test
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  // Vérifie que le token initial est null
  expect(screen.getByText(/token:null/)).toBeInTheDocument();

  // Simule un clic sur le bouton login
  act(() => screen.getByText("login").click());

  // Attend que le localStorage ait été mis à jour après le login
  await waitFor(() => expect(localStorage.getItem("token")).toBe("t1"));
  await waitFor(() => expect(localStorage.getItem("role")).toBe("admin"));

  // Simule un clic sur le bouton logout
  act(() => screen.getByText("logout").click());

  // Vérifie que le localStorage est bien vidé après le logout
  await waitFor(() => expect(localStorage.getItem("token")).toBeNull());
  await waitFor(() => expect(localStorage.getItem("role")).toBeNull());
});
