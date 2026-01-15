import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // navigation interne
import api from "../services/api"; // instance axios
import { useAuth } from "../contexts/AuthContext"; // contexte auth global
import "../styles/Login.css";

// Expression régulière simple pour vérifier le format de l'email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // fonction pour mettre à jour le contexte global

  // États pour stocker les inputs et erreurs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [roleSelect, setRoleSelect] = useState("user"); // juste décoratif ici

  // 🔹 Validation locale des champs
  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email requis";
    else if (!emailRegex.test(email.trim())) e.email = "Email invalide";
    if (!password) e.password = "Mot de passe requis";
    return e;
  };

  // 🔹 Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation locale
    const eErrors = validate();
    setErrors(eErrors);
    if (Object.keys(eErrors).length) return; // stop si erreurs

    setLoading(true); // indique que le login est en cours

    try {
      // Appel à l'API pour vérifier l'email et le mot de passe
      const res = await api.post("/login", { email, password });
      const { token, role } = res.data;

      // Persister le token et le rôle dans localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // Mettre à jour le contexte global pour que toute l'app sache que l'utilisateur est connecté
      if (typeof login === "function") login(token, role);

      // Redirection selon le rôle
      role === "admin" ? navigate("/admin") : navigate("/profile");
    } catch (err) {
      // Afficher l'erreur côté serveur
      setErrors({
        server:
          err.response?.data?.message ||
          "Email ou mot de passe incorrect",
      });
    } finally {
      setLoading(false); // fin du chargement
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Connexion</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* 🔹 Champ email */}
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}

          {/* 🔹 Champ mot de passe */}
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

          {/* 🔹 Sélecteur de rôle (optionnel, décoratif) */}
          <label>Se connecter en tant que :</label>
          <select
            value={roleSelect}
            onChange={(e) => setRoleSelect(e.target.value)}
          >
            <option value="user">Utilisateur</option>
            <option value="creator">Créateur</option>
            <option value="admin">Administrateur</option>
          </select>

          {/* 🔹 Affiche les erreurs côté serveur */}
          {errors.server && (
            <div className="error-message">{errors.server}</div>
          )}

          {/* 🔹 Bouton de soumission */}
          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* 🔹 Lien pour aller à la page Register */}
        <p className="switch-link">
          Pas encore de compte ?{" "}
          <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
