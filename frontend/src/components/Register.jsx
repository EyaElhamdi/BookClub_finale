import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Register.css";
import { useAuth } from "../contexts/AuthContext";
import useSafeTimeout from "../hooks/useSafeTimeout";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setSafeTimeout } = useSafeTimeout();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "Prénom requis";
    if (!form.lastName.trim()) err.lastName = "Nom requis";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      err.email = "Email invalide";
    if (!form.password) err.password = "Mot de passe requis";
    if (form.password !== form.confirmPassword)
      err.confirmPassword = "Les mots de passe ne correspondent pas";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setLoading(true);
    setServerMsg(null);

    try {
      const res = await api.post("/register", form);
      // update auth context (and localStorage via context)
      if (typeof login === "function") login(res.data.token, res.data.role || form.role);

      setServerMsg({ type: "success", text: res.data.message });

      setSafeTimeout(() => {
        navigate(res.data.role === "admin" ? "/admin" : "/profile");
      }, 1000);
    } catch (err) {
      setServerMsg({
        type: "error",
        text: err.response?.data?.message || "Erreur serveur",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2 className="register-title">Créer un compte</h2>

        <form className="register-form" onSubmit={handleSubmit} noValidate>

          {/* Prénom / Nom */}
          <div className="row">
            <div className="field">
              <input
                name="firstName"
                placeholder="Prénom"
                value={form.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <div className="err">{errors.firstName}</div>}
            </div>

            <div className="field">
              <input
                name="lastName"
                placeholder="Nom"
                value={form.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <div className="err">{errors.lastName}</div>}
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <div className="err">{errors.email}</div>}
          </div>

          {/* Adresse */}
          <div className="field">
            <input
              name="address"
              placeholder="Adresse"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          {/* Ville / État */}
          <div className="row">
            <div className="field">
              <input
                name="city"
                placeholder="Ville"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <input
                name="state"
                placeholder="État"
                value={form.state}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Mot de passe / Confirmation */}
          <div className="row">
            <div className="field">
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <div className="err">{errors.password}</div>}
            </div>

            <div className="field">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmer mot de passe"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <div className="err">{errors.confirmPassword}</div>
              )}
            </div>
          </div>

          {/* Rôle */}
          <div className="field">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="user">Utilisateur</option>
              <option value="creator">Créateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>

          {serverMsg && (
            <div className={`server-msg ${serverMsg.type}`}>
              {serverMsg.text}
            </div>
          )}
        </form>

        {/* 🔗 Lien login */}
        <div className="login-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}












