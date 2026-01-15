import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../server.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

let mongod;

/* =========================
   Avant tous les tests
   - Création d'une instance MongoDB en mémoire
   - Connexion Mongoose
========================= */
beforeAll(async () => {
  // Définir la clé JWT pour les tests si elle n'existe pas
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

  // Création d'une instance MongoMemoryServer
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Connexion Mongoose à la base en mémoire
  await mongoose.connect(uri);
});

/* =========================
   Après tous les tests
   - Déconnexion Mongoose
   - Arrêt de MongoMemoryServer
========================= */
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

/* =========================
   Avant chaque test
   - Nettoyage des collections User et AuditLog
========================= */
beforeEach(async () => {
  await User.deleteMany({});
  await AuditLog.deleteMany({});
});

/* =========================
   Test 1 : POST /auth/profile/generate-avatar
   - Vérifie que l'avatar est généré pour l'utilisateur
   - Vérifie que l'audit log est créé
========================= */
test('POST /auth/profile/generate-avatar sets avatar and creates audit log', async () => {
  // Création d'un utilisateur test
  const user = await User.create({ firstName: 'Jean', lastName: 'Dupont', email: 'j@d.test', password: 'pw' });

  // Génération d'un token JWT pour l'utilisateur
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  // Appel de la route pour générer l'avatar
  const res = await request(app)
    .post('/auth/profile/generate-avatar')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  // Vérifie que l'avatar est bien au format data URI SVG
  expect(res.body.avatar).toMatch(/^data:image\/svg\+xml;base64,/);

  // Vérifie que l'utilisateur a bien l'avatar en base
  const fresh = await User.findById(user._id);
  expect(fresh.avatar).toBeTruthy();

  // Vérifie qu'un audit log a été créé
  const audit = await AuditLog.findOne({ action: 'generate_avatar', targetId: user._id });
  expect(audit).toBeTruthy();
  expect(audit.actor.toString()).toBe(user._id.toString());
  expect(audit.meta && audit.meta.initials).toBe('JD');
});

/* =========================
   Test 2 : DELETE /auth/users/:id (admin)
   - Vérifie que l'admin peut supprimer un utilisateur
   - Vérifie que l'audit log est créé
========================= */
test('DELETE /auth/users/:id (admin) deletes user and creates audit log', async () => {
  // Création d'un utilisateur admin
  const admin = await User.create({ firstName: 'Admin', lastName: 'User', email: 'a@test', password: 'pw', role: 'admin' });

  // Création d'un utilisateur "victime" à supprimer
  const victim = await User.create({ firstName: 'Vict', lastName: 'Im', email: 'v@test', password: 'pw' });

  // Génération du token admin
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);

  // Appel de la route DELETE pour supprimer l'utilisateur
  const res = await request(app)
    .delete(`/auth/users/${victim._id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  // Vérifie que le message de réponse indique la suppression
  expect(res.body.message).toMatch(/supprim/);

  // Vérifie que l'utilisateur a bien été supprimé en base
  const removed = await User.findById(victim._id);
  expect(removed).toBeNull();

  // Vérifie qu'un audit log a été créé pour la suppression
  const audit = await AuditLog.findOne({ action: 'delete_user', targetId: victim._id });
  expect(audit).toBeTruthy();
  expect(audit.actor.toString()).toBe(admin._id.toString());
  expect(audit.meta && audit.meta.email).toBe('v@test');
});
