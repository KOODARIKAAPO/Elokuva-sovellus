import request from 'supertest';
import app from '../src/index.js';
import pool from '../src/database.js';

const testUser = {
  username: 'review_testikayttaja',
  email: 'review_testi@kayttaja.com',
  password: 'Testi123!'
};

let token = null;
let createdReviewId = null;
const TMDB_ID = 99999999; // mielivaltainen testielokuva tunnus

beforeAll(async () => {
  // tarkistaa
  await pool.query('DELETE FROM account WHERE email = $1', [testUser.email]);
  await pool.query('DELETE FROM review WHERE tmdb_id = $1', [TMDB_ID]);

  // rekisteröi käyttäjän
  await request(app).post('/auth/register').send(testUser);
  const login = await request(app).post('/auth/login').send({ identifier: testUser.email, password: testUser.password });
  if (login.status === 200) token = login.body.token;
});

afterAll(async () => {

  await pool.query('DELETE FROM review WHERE tmdb_id = $1', [TMDB_ID]);
  await pool.query('DELETE FROM account WHERE email = $1', [testUser.email]);
  await pool.end();
});

describe('Reviews flow', () => {
  test('create review (requires auth)', async () => {
    if (!token) return;
    const res = await request(app)
      .post('/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ tmdb_id: TMDB_ID, rating: 4, review_text: 'Hyva elokuva' });

    expect([201, 409, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty('id');
      createdReviewId = res.body.id;
    }
  });

  test('get reviews by movie id', async () => {
    const res = await request(app).get(`/reviews?tmdb_id=${TMDB_ID}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('get user reviews (requires auth)', async () => {
    if (!token) return;
    const res = await request(app).get('/reviews/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('delete review (requires auth)', async () => {
    if (!token || !createdReviewId) return;
    const res = await request(app).delete(`/reviews/${createdReviewId}`).set('Authorization', `Bearer ${token}`);
    expect([200, 403, 404]).toContain(res.status);
  });
});
