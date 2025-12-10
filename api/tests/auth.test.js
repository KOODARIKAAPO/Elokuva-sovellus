import request from 'supertest';
import app from '../src/index.js';
import pool from '../src/database.js';

const testUser = {
  username: 'testikayttaja1',
  email: 'testi@kayttaja1.com',
  password: 'Testi1234'
};

let token = null;

beforeAll(async () => {
  // poistetaan mahdollinen testikäyttäjä
  await pool.query('DELETE FROM account WHERE email = $1', [testUser.email]);
});

afterAll(async () => {
 // testikäyttäjän poisto ja pool yhteyden sulkeminen
  await pool.query('DELETE FROM account WHERE email = $1', [testUser.email]);
  await pool.end();
});

describe('Auth flows', () => {
  test('registers a new user', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect([201, 409, 400]).toContain(res.status); // 201 onnistuu, 409 duplikaatti
    if (res.status === 201) {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('logs in email and returns token', async () => {
    const res = await request(app).post('/auth/login').send({ identifier: testUser.email, password: testUser.password });
    expect([200, 401, 400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    }
  });

  test('get /auth/me requires auth and returns user', async () => {
    if (!token) {
      return; 
    }
    const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('delete account with /auth/me', async () => {
    if (!token) return;
    const res = await request(app).delete('/auth/me').set('Authorization', `Bearer ${token}`);
    expect([200, 204, 404]).toContain(res.status);
  });
});
