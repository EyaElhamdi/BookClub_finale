import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Login.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roleSelect, setRoleSelect] = useState("user"); // décoratif

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email requis";
    else if (!emailRegex.test(email.trim())) e.email = "Email invalide";
    if (!password) e.password = "Mot de passe requis";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eErrors = validate();
    setErrors(eErrors);
    if (Object.keys(eErrors).length) return;

    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });
      const { token, role } = res.data;

      // persist and update context
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      if (typeof login === "function") login(token, role);

      role === "admin" ? navigate("/admin") : navigate("/profile");
    } catch (err) {
      setErrors({
        server:
          err.response?.data?.message ||
          "Email ou mot de passe incorrect",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Connexion</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}

          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}

          <label>Se connecter en tant que :</label>
          <select
            value={roleSelect}
            onChange={(e) => setRoleSelect(e.target.value)}
          >
            <option value="user">Utilisateur</option>
            <option value="creator">Créateur</option>
            <option value="admin">Administrateur</option>
          </select>

          {errors.server && (
            <div className="error-message">{errors.server}</div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* 🔗 Lien vers Register */}
        <p className="switch-link">
          Pas encore de compte ?{" "}
          <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}




















