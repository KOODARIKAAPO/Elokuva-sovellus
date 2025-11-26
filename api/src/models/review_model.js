import pool from '../database.js';

const ReviewModel = {
  async createReview(user_id, tmdb_id, rating, review_text) {
    const query = `
      INSERT INTO review (user_id, tmdb_id, rating, review_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [user_id, tmdb_id, rating, review_text];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async getUserReviews(user_id) {
    const query = `
      SELECT *
      FROM review
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  },

  async updateReview(id, rating, review_text) {
    const query = `
      UPDATE review
      SET rating = $1,
          review_text = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [rating, review_text, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteReview(id) {
    const query = `
      DELETE FROM review
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
};

export default ReviewModel;
