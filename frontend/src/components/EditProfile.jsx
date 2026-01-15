// src/components/EditProfile.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api"; // instance axios pour les requêtes
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/EditProfile.css";

export default function EditProfile() {
  const navigate = useNavigate(); // pour naviguer après sauvegarde ou déconnexion

  // 🔹 État pour le formulaire de profil
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    password: "",
  });

  // 🔹 État pour gérer l'aperçu de la photo
  const [photo, setPhoto] = useState(null);

  // 🔹 Récupération du token et fonction logout depuis le contexte Auth
  const { token, logout } = useAuth();

  // 🔹 useEffect pour charger le profil au montage
  useEffect(() => {
    // Si pas de token → redirection vers login
    if (!token) return navigate("/login");

    api.get("/profile") // Requête GET pour récupérer les infos du profil
      .then((res) =>
        setForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
          address: res.data.address || "",
          city: res.data.city || "",
          state: res.data.state || "",
          password: "", // jamais pré-remplir le mot de passe
        })
      )
      .catch(() => {
        // En cas d'erreur → logout et redirection
        if (typeof logout === "function") logout();
        navigate("/login");
      });
  }, [navigate, token, logout]);

  // 🔹 Gestion des changements de champs de formulaire
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // 🔹 Gestion du changement de photo
  function handlePhoto(e) {
    const file = e.target.files[0]; // récupérer le fichier
    if (!file) return;

    // Créer une URL temporaire pour afficher l'aperçu
    const url = URL.createObjectURL(file);
    setPhoto({ file, url });
  }

  // 🔹 Envoi des modifications au backend
  function handleSave(e) {
    e.preventDefault(); // empêcher le rechargement de page

    api.put("/profile", form) // PUT pour mettre à jour le profil
      .then(() => {
        // Rediriger vers la page profil après sauvegarde
        navigate("/profile");
      })
      .catch((err) => {
        console.error("Erreur API:", err.response ? err.response.data : err.message);
        // Optionnel : afficher un message utilisateur
      });
  }

  return (
    <div className="edit-wrapper">
      <h1 className="edit-title">Modifier le Profil</h1>

      <form className="edit-card" onSubmit={handleSave}>
        {/* Zone de photo */}
        <div className="photo-area">
          <div className="avatar">
            {photo ? (
              // Affichage de l'aperçu de la nouvelle photo
              <img src={photo.url} alt="avatar" />
            ) : (
              // Placeholder SVG si pas de photo
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

          {/* Bouton pour changer la photo */}
          <label className="change-photo">
            Changer la photo
            <input type="file" accept="image/*" onChange={handlePhoto} />
          </label>
        </div>

        {/* Champs du formulaire */}
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

        {/* Bouton de sauvegarde */}
        <div className="actions">
          <button type="submit" className="btn save">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}