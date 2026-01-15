// src/components/EditProfile.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/EditProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    password: "",
  });

  const [photo, setPhoto] = useState(null);

  const { token, logout } = useAuth();

  // Charger le profil existant
  useEffect(() => {
    if (!token) return navigate("/login");

    api.get("/profile")
      .then((res) =>
        setForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
          address: res.data.address || "",
          city: res.data.city || "",
          state: res.data.state || "",
          password: "",
        })
      )
      .catch(() => {
        if (typeof logout === "function") logout();
        navigate("/login");
      });
  }, [navigate, token, logout]);

  // Gestion des changements d'input
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Gestion de la photo
  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto({ file, url });
  }

  // Sauvegarder les modifications
  function handleSave(e) {
    e.preventDefault();
    api.put("/profile", form)
      .then(() => {
        // Profil mis à jour, on navigue directement
        navigate("/profile");
      })
      .catch((err) => {
        console.error("Erreur API:", err.response ? err.response.data : err.message);
        // Optionnel : afficher un message discret dans la page
      });
  }

  return (
    <div className="edit-wrapper">
      <h1 className="edit-title">Modifier le Profil</h1>

      <form className="edit-card" onSubmit={handleSave}>
        <div className="photo-area">
          <div className="avatar">
            {photo ? (
              <img src={photo.url} alt="avatar" />
            ) : (
              <div className="avatar-placeholder">
                <svg
                  width="34"
                  height="34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z"
                    stroke="#fff"
                  />
                  <path
                    d="M3 20.5c0-3.6 4.9-6.5 9-6.5s9 2.9 9 6.5"
                    stroke="#fff"
                  />
                </svg>
              </div>
            )}
          </div>

          <label className="change-photo">
            Changer la photo
            <input type="file" accept="image/*" onChange={handlePhoto} />
          </label>
        </div>

        <div className="inputs">
          <div className="row two">
            <input
              name="firstName"
              placeholder="Prénom"
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              name="lastName"
              placeholder="Nom"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="address"
            placeholder="Adresse"
            value={form.address}
            onChange={handleChange}
          />

          <div className="row two">
            <input
              name="city"
              placeholder="Ville"
              value={form.city}
              onChange={handleChange}
            />
            <input
              name="state"
              placeholder="État"
              value={form.state}
              onChange={handleChange}
            />
          </div>

          <input
            name="password"
            placeholder="Nouveau mot de passe"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div className="actions">
          <button type="submit" className="btn save">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}





