import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../server.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

let mongod;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  // clear db
  await User.deleteMany({});
  await AuditLog.deleteMany({});
});

test('POST /auth/profile/generate-avatar sets avatar and creates audit log', async () => {
  const user = await User.create({ firstName: 'Jean', lastName: 'Dupont', email: 'j@d.test', password: 'pw' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  const res = await request(app)
    .post('/auth/profile/generate-avatar')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  expect(res.body.avatar).toMatch(/^data:image\/svg\+xml;base64,/);

  const fresh = await User.findById(user._id);
  expect(fresh.avatar).toBeTruthy();

  const audit = await AuditLog.findOne({ action: 'generate_avatar', targetId: user._id });
  expect(audit).toBeTruthy();
  expect(audit.actor.toString()).toBe(user._id.toString());
  expect(audit.meta && audit.meta.initials).toBe('JD');
});

test('DELETE /auth/users/:id (admin) deletes user and creates audit log', async () => {
  const admin = await User.create({ firstName: 'Admin', lastName: 'User', email: 'a@test', password: 'pw', role: 'admin' });
  const victim = await User.create({ firstName: 'Vict', lastName: 'Im', email: 'v@test', password: 'pw' });
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);

  const res = await request(app)
    .delete(`/auth/users/${victim._id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  expect(res.body.message).toMatch(/supprim/);

  const removed = await User.findById(victim._id);
  expect(removed).toBeNull();

  const audit = await AuditLog.findOne({ action: 'delete_user', targetId: victim._id });
  expect(audit).toBeTruthy();
  expect(audit.actor.toString()).toBe(admin._id.toString());
  expect(audit.meta && audit.meta.email).toBe('v@test');
});
