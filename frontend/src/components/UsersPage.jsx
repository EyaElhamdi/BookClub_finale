import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UsersPage.css";
import { useAuth } from "../contexts/AuthContext";
import ConfirmModal from "./ConfirmModal";
import api from "../services/api";

/* ---------- Navbar ---------- */
// Composant simple affichant un bouton de déconnexion
function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (typeof logout === "function") logout(); // Appelle la fonction de logout du contexte
    navigate("/login"); // Redirige vers la page de connexion
  };

  return (
    <nav className="navbar">
      <ul>
        <li onClick={handleLogout} style={{ cursor: "pointer" }}>
          🚪 Déconnexion
        </li>
      </ul>
    </nav>
  );
}

/* ---------- AddUserForm ---------- */
// Formulaire pour ajouter un nouvel utilisateur
function AddUserForm({ onAdd }) {
  const [firstName, setFirstName] = useState(""); // Prénom
  const [lastName, setLastName] = useState("");   // Nom
  const [email, setEmail] = useState("");         // Email
  const [role, setRole] = useState("user");       // Rôle (user / creator / admin)
  const [loading, setLoading] = useState(false);  // Indique si le formulaire est en cours de soumission

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (!firstName || !lastName || !email) {
      alert("Nom, prénom et email sont obligatoires !");
      return;
    }

    setLoading(true);

    try {
      // Appel à l'API pour créer un utilisateur
      const res = await api.post("/users", { firstName, lastName, email, password: "123456", role });
      const data = res.data;
      console.log("ADD USER RAW RESPONSE:", data);
      onAdd(data.user); // Met à jour la liste des utilisateurs dans UsersPage

      // Réinitialisation du formulaire
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("user");
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-user-form" onSubmit={handleSubmit}>
      <input type="text" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />
      <input type="text" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
      <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
        <option value="user">User</option>
        <option value="creator">Creator</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" disabled={loading}>{loading ? "Ajout en cours..." : "Ajouter"}</button>
    </form>
  );
}

/* ---------- SearchBar ---------- */
// Barre de recherche filtrant les utilisateurs
function SearchBar({ search, onSearch }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Recherche..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}

/* ---------- UserTable ---------- */
// Tableau affichant tous les utilisateurs avec options d'édition et suppression
function UserTable({ users, onDelete, onUpdate }) {
  const [pending, setPending] = React.useState(null); // Stocke l'ID d'un utilisateur en attente de suppression
  const [editing, setEditing] = React.useState(null); // Stocke l'utilisateur en cours d'édition

  // Change le rôle d'un utilisateur
  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/users/${id}`, { role: newRole });
      onUpdate(id, { role: newRole }); // Met à jour l'utilisateur localement
    } catch (err) {
      alert("Erreur mise à jour rôle : " + (err.response?.data?.message || err.message));
    }
  };

  const confirmDelete = (id) => setPending(id); // Déclenche l'ouverture du modal de confirmation
  const doDelete = () => { if (pending) { onDelete(pending); setPending(null); } }; // Supprime effectivement
  const cancelDelete = () => setPending(null); // Annule la suppression
  const openEdit = (user) => setEditing(user); // Ouvre la modal d'édition
  const closeEdit = () => setEditing(null); // Ferme la modal
  const saveEdit = async (id, patch) => { // Enregistre les modifications
    try {
      await api.put(`/users/${id}`, patch);
      onUpdate(id, patch);
      closeEdit();
    } catch (err) {
      alert('Erreur mise à jour: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="user-table">
      <table>
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty">Aucun utilisateur</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)}>
                    <option value="user">user</option>
                    <option value="creator">creator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <button className="delete-btn" onClick={() => confirmDelete(user._id)}>🗑️</button>
                  <button className="view-btn" style={{ marginLeft: 8 }} onClick={() => openEdit(user)}>✎</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal confirmation suppression */}
      {pending && (
        <ConfirmModal
          isOpen={!!pending}
          title="Supprimer l'utilisateur"
          message="Confirmez-vous la suppression de cet utilisateur ?"
          onConfirm={doDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Modal édition */}
      {editing && (
        <div className="edit-modal" role="dialog" aria-modal="true">
          <div className="edit-box">
            <h3>Modifier l'utilisateur — {editing.email}</h3>
            <EditUserForm user={editing} onCancel={closeEdit} onSave={saveEdit} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- EditUserForm ---------- */
// Formulaire pour modifier un utilisateur existant
function EditUserForm({ user, onCancel, onSave }) {
  const [form, setForm] = React.useState({ 
    firstName: user.firstName || '', 
    lastName: user.lastName || '', 
    email: user.email || '', 
    role: user.role || 'user', 
    password: '' 
  });
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(user._id, form);
    setLoading(false);
  };

  return (
    <form onSubmit={submit}>
      <div className="field"><input name="firstName" value={form.firstName} onChange={handleChange} /></div>
      <div className="field"><input name="lastName" value={form.lastName} onChange={handleChange} /></div>
      <div className="field"><input name="email" value={form.email} onChange={handleChange} /></div>
      <div className="field">
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">user</option>
          <option value="creator">creator</option>
          <option value="admin">admin</option>
        </select>
      </div>
      <div className="field"><input name="password" type="password" placeholder="Nouveau mot de passe (laisser vide pour conserver)" value={form.password} onChange={handleChange} /></div>
      <div style={{ marginTop: 8 }}>
        <button className="cm-btn cm-primary" type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        <button className="cm-btn cm-cancel" type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Annuler</button>
      </div>
    </form>
  );
}

/* ---------- UsersPage ---------- */
// Page principale affichant tous les composants précédents
export default function UsersPage() {
  const navigate = useNavigate();
  const { token, role: ctxRole } = useAuth(); // Récupère token et rôle de l'utilisateur
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // Redirige vers login si l'utilisateur n'est pas admin
  useEffect(() => {
    if (!ctxRole || ctxRole.toLowerCase() !== "admin") {
      navigate("/login");
    }
  }, [navigate, ctxRole]);

  // Fetch initial des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        alert("Erreur chargement : " + (err.response?.data?.message || err.message));
      }
    };
    if (token) fetchUsers();
  }, [token]);

  // Gestion des utilisateurs ajoutés, supprimés ou modifiés
  const handleAddUser = (user) => setUsers((prev) => [...prev, user]);
  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Erreur suppression: " + (err.response?.data?.message || err.message));
    }
  };
  const handleUpdateUser = (id, patch) => {
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...patch } : u)));
  };

  // Filtrage des utilisateurs selon la recherche
  const filteredUsers = users.filter((u) =>
    (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <section className="users-page">
          <h1>Gestion des utilisateurs 👥</h1>
          <AddUserForm onAdd={handleAddUser} />
          <SearchBar search={search} onSearch={setSearch} />
          <UserTable users={filteredUsers} onDelete={handleDeleteUser} onUpdate={handleUpdateUser} />
        </section>
      </main>
    </div>
  );
}
