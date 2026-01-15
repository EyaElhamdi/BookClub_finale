import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { AuthProvider, useAuth } from "./AuthContext";

function TestConsumer() {
  const { token, role, login, logout } = useAuth();
  return (
    <div>
      <div>token:{token || "null"}</div>
      <div>role:{role || "null"}</div>
      <button onClick={() => login("t1", "admin")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

test("AuthProvider sets and clears token/role", async () => {
  // ensure clean localStorage
  localStorage.clear();

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  expect(screen.getByText(/token:null/)).toBeInTheDocument();

  // perform login
  act(() => screen.getByText("login").click());
  await waitFor(() => expect(localStorage.getItem("token")).toBe("t1"));
  await waitFor(() => expect(localStorage.getItem("role")).toBe("admin"));

  // perform logout
  act(() => screen.getByText("logout").click());
  await waitFor(() => expect(localStorage.getItem("token")).toBeNull());
  await waitFor(() => expect(localStorage.getItem("role")).toBeNull());
});
