import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/buttons.css";
import "./theme.css";
import { BrowserRouter as Router } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);



